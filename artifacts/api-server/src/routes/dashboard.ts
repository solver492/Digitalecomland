import { Router } from "express";
import { store } from "../lib/mem-store";

const router = Router();

router.get("/dashboard/stats", (req, res): void => {
  const orders = store.orders;
  const withdrawals = store.withdrawals;

  let withdrawable = 0;
  let pending = 0;
  let totalEarned = 0;

  for (const o of orders) {
    if (o.status === "LIVREE") {
      withdrawable += o.netMargin;
      totalEarned += o.netMargin;
    } else if (["CONFIRMEE", "EN_COURS_LIVRAISON"].includes(o.status)) {
      pending += o.netMargin;
    }
  }

  for (const w of withdrawals) {
    if (w.status === "PAYE" || w.status === "EN_TRAITEMENT") {
      withdrawable -= w.amount;
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const newOrdersToday = orders.filter(
    (o) => o.createdAt.split("T")[0] === today
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
