import { Router } from "express";
import { selectRows } from "../lib/data";
import { ownsRow, rowValue, toNumber, toStringValue, type SupabaseRow } from "../lib/supabase";

const router = Router();

function balance(orders: SupabaseRow[], withdrawals: SupabaseRow[]) {
  let withdrawable = 0;
  let pending = 0;
  let totalEarned = 0;
  for (const row of orders) {
    const margin = toNumber(rowValue(row, "net_margin", "profit"));
    if (row.status === "LIVREE") {
      withdrawable += margin;
      totalEarned += margin;
    } else if (["CONFIRMEE", "EN_COURS_LIVRAISON"].includes(toStringValue(row.status))) {
      pending += margin;
    }
  }
  for (const row of withdrawals) {
    if (["PAYE", "EN_TRAITEMENT"].includes(toStringValue(row.status))) {
      withdrawable -= toNumber(row.amount);
    }
  }
  return { withdrawable: Math.max(0, withdrawable), pending, totalEarned };
}

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  try {
    const [orderRows, withdrawalRows] = await Promise.all([selectRows("orders"), selectRows("withdrawals")]);
    const orders = orderRows.filter((row) => ownsRow(row, req.user!.id));
    const withdrawals = withdrawalRows.filter((row) => ownsRow(row, req.user!.id));
    const totals = balance(orders, withdrawals);
    const today = new Date().toISOString().split("T")[0];
    const newOrdersToday = orders.filter((row) => toStringValue(rowValue(row, "created_at", "date")).startsWith(today)).length;
    res.json({
      withdrawableBalance: totals.withdrawable,
      pendingBalance: totals.pending,
      totalEarned: totals.totalEarned,
      totalOrders: orders.length,
      newOrdersToday,
    });
  } catch {
    res.status(503).json({ error: "Dashboard service unavailable" });
  }
});

export default router;