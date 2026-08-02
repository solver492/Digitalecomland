import { Router } from "express";
import { db, ordersTable, withdrawalsTable } from "@workspace/db";

const router = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable);
  const withdrawals = await db.select().from(withdrawalsTable);

  let withdrawable = 0;
  let pending = 0;
  let totalEarned = 0;

  for (const o of orders) {
    const margin = Number(o.netMargin);
    if (o.status === "LIVREE") {
      withdrawable += margin;
      totalEarned += margin;
    } else if (["CONFIRMEE", "EN_COURS_LIVRAISON"].includes(o.status)) {
      pending += margin;
    }
  }

  for (const w of withdrawals) {
    if (w.status === "PAYE" || w.status === "EN_TRAITEMENT") {
      withdrawable -= Number(w.amount);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const newOrdersToday = orders.filter(
    (o) => o.createdAt.toISOString().split("T")[0] === today
  ).length;

  res.json({
    withdrawableBalance: Math.max(0, withdrawable),
    pendingBalance: pending,
    totalEarned,
    totalOrders: orders.length,
    newOrdersToday,
  });
});

export default router;
