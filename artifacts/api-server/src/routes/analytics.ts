import { Router } from "express";
import { selectRows } from "../lib/data";
import { ownsRow, rowValue, toNumber, toStringValue, type SupabaseRow } from "../lib/supabase";

const router = Router();

async function ordersForUser(userId: string): Promise<SupabaseRow[]> {
  return (await selectRows("orders")).filter((row) => ownsRow(row, userId));
}

router.get("/analytics/summary", async (req, res): Promise<void> => {
  try {
    const orders = await ordersForUser(req.user!.id);
    const totalDelivered = orders.filter((row) => row.status === "LIVREE").length;
    const totalReturned = orders.filter((row) => row.status === "RETOURNEE").length;
    const totalShipped = orders.filter((row) =>
      ["LIVREE", "RETOURNEE", "EN_COURS_LIVRAISON"].includes(toStringValue(row.status)),
    ).length;
    const denominator = totalShipped || 1;
    res.json({
      deliveryRate: Math.round((totalDelivered / denominator) * 100),
      returnRate: Math.round((totalReturned / denominator) * 100),
      totalDelivered,
      totalReturned,
      totalShipped,
    });
  } catch {
    res.status(503).json({ error: "Analytics service unavailable" });
  }
});

router.get("/analytics/profits-chart", async (req, res): Promise<void> => {
  try {
    const orders = await ordersForUser(req.user!.id);
    const now = new Date();
    const result: Record<string, { profit: number; orders: number }> = {};
    for (let i = 29; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      result[date.toISOString().split("T")[0]] = { profit: 0, orders: 0 };
    }
    for (const row of orders) {
      if (row.status !== "LIVREE") continue;
      const key = toStringValue(rowValue(row, "created_at", "date")).split("T")[0];
      if (result[key]) {
        result[key].profit += toNumber(rowValue(row, "net_margin", "profit"));
        result[key].orders += 1;
      }
    }
    res.json(Object.entries(result).map(([date, value]) => ({
      date,
      profit: Math.round(value.profit),
      orders: value.orders,
    })));
  } catch {
    res.status(503).json({ error: "Analytics service unavailable" });
  }
});

router.get("/analytics/top-cities", async (req, res): Promise<void> => {
  try {
    const cityMap: Record<string, { revenue: number; orders: number }> = {};
    for (const row of await ordersForUser(req.user!.id)) {
      if (row.status !== "LIVREE") continue;
      const city = toStringValue(row.city, "Unknown");
      cityMap[city] ??= { revenue: 0, orders: 0 };
      cityMap[city].revenue += toNumber(rowValue(row, "net_margin", "profit"));
      cityMap[city].orders += 1;
    }
    res.json(Object.entries(cityMap)
      .map(([city, value]) => ({ city, revenue: Math.round(value.revenue), orders: value.orders }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10));
  } catch {
    res.status(503).json({ error: "Analytics service unavailable" });
  }
});

router.get("/analytics/top-products", async (req, res): Promise<void> => {
  try {
    const productMap: Record<string, { productName: string; sales: number; revenue: number }> = {};
    for (const row of await ordersForUser(req.user!.id)) {
      if (row.status !== "LIVREE") continue;
      const productId = String(rowValue(row, "product_id", "productId") ?? "");
      productMap[productId] ??= {
        productName: toStringValue(rowValue(row, "product_name", "productName")),
        sales: 0,
        revenue: 0,
      };
      productMap[productId].sales += 1;
      productMap[productId].revenue += toNumber(rowValue(row, "net_margin", "profit"));
    }
    res.json(Object.entries(productMap)
      .map(([productId, value]) => ({ productId: Number(productId), ...value, revenue: Math.round(value.revenue) }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10));
  } catch {
    res.status(503).json({ error: "Analytics service unavailable" });
  }
});

export default router;