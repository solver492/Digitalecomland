import { Router } from "express";
import { store } from "../lib/mem-store";
import { RequestWithdrawalBody } from "@workspace/api-zod";

const router = Router();
const MINIMUM_WITHDRAWAL = 1000;

function computeBalance() {
  let withdrawable = 0;
  let pending = 0;
  let totalEarned = 0;

  for (const o of store.orders) {
    if (o.status === "LIVREE") {
      withdrawable += o.netMargin;
      totalEarned += o.netMargin;
    } else if (["CONFIRMEE", "EN_COURS_LIVRAISON"].includes(o.status)) {
      pending += o.netMargin;
    }
  }

  for (const w of store.withdrawals) {
    if (w.status === "PAYE" || w.status === "EN_TRAITEMENT") {
      withdrawable -= w.amount;
    }
  }

  return { withdrawable: Math.max(0, withdrawable), pending, totalEarned };
}

router.get("/wallet/balance", (req, res): void => {
  const { withdrawable, pending, totalEarned } = computeBalance();
  res.json({
    withdrawableBalance: withdrawable,
    pendingBalance: pending,
    totalEarned,
    minimumWithdrawal: MINIMUM_WITHDRAWAL,
  });
});

router.get("/wallet/withdrawals", (req, res): void => {
  const sorted = [...store.withdrawals].sort(
    (a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
  );
  res.json(sorted);
});

router.post("/wallet/withdrawals", (req, res): void => {
  const parsed = RequestWithdrawalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { withdrawable } = computeBalance();

  if (withdrawable < MINIMUM_WITHDRAWAL) {
    res.status(400).json({ error: `Solde insuffisant. Minimum: ${MINIMUM_WITHDRAWAL} DZD` });
    return;
  }

  if (parsed.data.amount > withdrawable) {
    res.status(400).json({ error: `Montant supérieur au solde disponible (${withdrawable} DZD)` });
    return;
  }

  const withdrawal = {
    id: store._nextId.withdrawals++,
    amount: parsed.data.amount,
    status: "EN_TRAITEMENT",
    bankName: parsed.data.bankName ?? null,
    ribNumber: parsed.data.ribNumber ?? null,
    requestedAt: new Date().toISOString(),
    paidAt: null,
  };

  store.withdrawals.push(withdrawal);
  res.status(201).json(withdrawal);
});

export default router;
