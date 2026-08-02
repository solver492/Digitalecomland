import { Router } from "express";
import { db, ordersTable } from "@workspace/db";

const router = Router();

router.get("/analytics/summary", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable);

  const totalDelivered = orders.filter((o) => o.status === "LIVREE").length;
  const totalReturned = orders.filter((o) => o.status === "RETOURNEE").length;
  const shipped = orders.filter(
    (o) =>
      o.status === "LIVREE" ||
      o.status === "RETOURNEE" ||
      o.status === "EN_COURS_LIVRAISON"
  ).length;

  const totalShipped = shipped || 1;
  const deliveryRate = Math.round((totalDelivered / totalShipped) * 100);
  const returnRate = Math.round((totalReturned / totalShipped) * 100);

  res.json({
    deliveryRate,
    returnRate,
    totalDelivered,
    totalReturned,
    totalShipped: shipped,
  });
});

router.get("/analytics/profits-chart", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable);

  // Build daily aggregates for the last 30 days
  const now = new Date();
  const result: Record<string, { profit: number; orders: number }> = {};

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result[key] = { profit: 0, orders: 0 };
  }

  for (const o of orders) {
    if (o.status === "LIVREE") {
      const key = o.createdAt.toISOString().split("T")[0];
      if (result[key] !== undefined) {
        result[key].profit += Number(o.netMargin);
        result[key].orders += 1;
      }
    }
  }

  const chart = Object.entries(result).map(([date, { profit, orders }]) => ({
    date,
    profit: Math.round(profit),
    orders,
  }));

  res.json(chart);
});

router.get("/analytics/top-cities", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable);

  const cityMap: Record<string, { revenue: number; orders: number }> = {};

  for (const o of orders) {
    if (o.status === "LIVREE") {
      if (!cityMap[o.city]) cityMap[o.city] = { revenue: 0, orders: 0 };
      cityMap[o.city].revenue += Number(o.netMargin);
      cityMap[o.city].orders += 1;
    }
  }

  const result = Object.entries(cityMap)
    .map(([city, { revenue, orders }]) => ({
      city,
      revenue: Math.round(revenue),
      orders,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  res.json(result);
});

router.get("/analytics/top-products", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable);

  const productMap: Record<
    number,
    { productName: string; sales: number; revenue: number }
  > = {};

  for (const o of orders) {
    if (o.status === "LIVREE") {
      if (!productMap[o.productId]) {
        productMap[o.productId] = {
          productName: o.productName,
          sales: 0,
          revenue: 0,
        };
      }
      productMap[o.productId].sales += 1;
      productMap[o.productId].revenue += Number(o.netMargin);
    }
  }

  const result = Object.entries(productMap)
    .map(([productId, { productName, sales, revenue }]) => ({
      productId: Number(productId),
      productName,
      sales,
      revenue: Math.round(revenue),
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  res.json(result);
});

export default router;
