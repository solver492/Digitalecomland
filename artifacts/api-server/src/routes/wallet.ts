import { Router } from "express";
import { db, ordersTable, withdrawalsTable } from "@workspace/db";
import { RequestWithdrawalBody } from "@workspace/api-zod";

const router = Router();

const MINIMUM_WITHDRAWAL = 100;

async function computeWithdrawableBalance(): Promise<{
  withdrawable: number;
  pending: number;
  totalEarned: number;
}> {
  const orders = await db.select().from(ordersTable);

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

  // Subtract paid/processing withdrawals
  const withdrawals = await db.select().from(withdrawalsTable);
  for (const w of withdrawals) {
    if (w.status === "PAYE" || w.status === "EN_TRAITEMENT") {
      withdrawable -= Number(w.amount);
    }
  }

  return { withdrawable: Math.max(0, withdrawable), pending, totalEarned };
}

router.get("/wallet/balance", async (req, res): Promise<void> => {
  const { withdrawable, pending, totalEarned } = await computeWithdrawableBalance();

  res.json({
    withdrawableBalance: withdrawable,
    pendingBalance: pending,
    totalEarned,
    minimumWithdrawal: MINIMUM_WITHDRAWAL,
  });
});

router.get("/wallet/withdrawals", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(withdrawalsTable)
    .orderBy(withdrawalsTable.requestedAt);

  res.json(
    rows.map((w) => ({
      ...w,
      amount: Number(w.amount),
      requestedAt: w.requestedAt.toISOString(),
      paidAt: w.paidAt ? w.paidAt.toISOString() : null,
    }))
  );
});

router.post("/wallet/withdrawals", async (req, res): Promise<void> => {
  const parsed = RequestWithdrawalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { withdrawable } = await computeWithdrawableBalance();

  if (withdrawable < MINIMUM_WITHDRAWAL) {
    res
      .status(400)
      .json({ error: `Solde insuffisant. Minimum: ${MINIMUM_WITHDRAWAL} DZD` });
    return;
  }

  if (parsed.data.amount > withdrawable) {
    res
      .status(400)
      .json({ error: `Montant supérieur au solde disponible (${withdrawable} DZD)` });
    return;
  }

  const [created] = await db
    .insert(withdrawalsTable)
    .values({
      amount: String(parsed.data.amount),
      status: "EN_TRAITEMENT",
    })
    .returning();

  res.status(201).json({
    ...created,
    amount: Number(created.amount),
    requestedAt: created.requestedAt.toISOString(),
    paidAt: null,
  });
});

export default router;
