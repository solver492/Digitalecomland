import { Router } from "express";
import { RequestWithdrawalBody } from "@workspace/api-zod";
import { insertOne, selectOne, selectRows } from "../lib/data";
import { ownsRow, rowValue, toId, toNumber, toStringValue, type SupabaseRow } from "../lib/supabase";

const router = Router();
const MINIMUM_WITHDRAWAL = 1000;

function mapWithdrawal(row: SupabaseRow) {
  return {
    id: toId(row.id),
    amount: toNumber(row.amount),
    status: toStringValue(row.status, "EN_TRAITEMENT"),
    bankName: (rowValue(row, "bank_name", "bankName") as string | null) ?? null,
    ribNumber: (rowValue(row, "rib_number", "ribNumber") as string | null) ?? null,
    requestedAt: toStringValue(rowValue(row, "requested_at", "created_at")),
    paidAt: (rowValue(row, "paid_at") as string | null) ?? null,
  };
}

async function userRows(table: string, userId: string) {
  return (await selectRows(table)).filter((row) => ownsRow(row, userId));
}

async function getBalance(userId: string) {
  const [orderRows, withdrawalRows] = await Promise.all([userRows("orders", userId), userRows("withdrawals", userId)]);
  let withdrawable = 0;
  let pending = 0;
  let totalEarned = 0;
  for (const row of orderRows) {
    const margin = toNumber(rowValue(row, "net_margin", "profit"));
    if (row.status === "LIVREE") {
      withdrawable += margin;
      totalEarned += margin;
    } else if (["CONFIRMEE", "EN_COURS_LIVRAISON"].includes(toStringValue(row.status))) {
      pending += margin;
    }
  }
  for (const row of withdrawalRows) {
    if (["PAYE", "EN_TRAITEMENT"].includes(toStringValue(row.status))) withdrawable -= toNumber(row.amount);
  }
  return { withdrawable: Math.max(0, withdrawable), pending, totalEarned };
}

router.get("/wallet/balance", async (req, res): Promise<void> => {
  try {
    const totals = await getBalance(req.user!.id);
    res.json({
      withdrawableBalance: totals.withdrawable,
      pendingBalance: totals.pending,
      totalEarned: totals.totalEarned,
      minimumWithdrawal: MINIMUM_WITHDRAWAL,
    });
  } catch {
    res.status(503).json({ error: "Wallet service unavailable" });
  }
});

router.get("/wallet/withdrawals", async (req, res): Promise<void> => {
  try {
    const rows = await userRows("withdrawals", req.user!.id);
    rows.sort((a, b) =>
      new Date(toStringValue(rowValue(b, "requested_at", "created_at"))).getTime() -
      new Date(toStringValue(rowValue(a, "requested_at", "created_at"))).getTime(),
    );
    res.json(rows.map(mapWithdrawal));
  } catch {
    res.status(503).json({ error: "Wallet service unavailable" });
  }
});

router.post("/wallet/withdrawals", async (req, res): Promise<void> => {
  const parsed = RequestWithdrawalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid withdrawal data" });
    return;
  }
  try {
    const totals = await getBalance(req.user!.id);
    if (totals.withdrawable < MINIMUM_WITHDRAWAL) {
      res.status(400).json({ error: `Solde insuffisant. Minimum: ${MINIMUM_WITHDRAWAL} DZD` });
      return;
    }
    if (parsed.data.amount > totals.withdrawable) {
      res.status(400).json({ error: `Montant supérieur au solde disponible (${totals.withdrawable} DZD)` });
      return;
    }
    const profile = await selectOne("profiles", "id", req.user!.id);
    const row = await insertOne("withdrawals", {
      user_id: req.user!.id,
      amount: parsed.data.amount,
      status: "EN_TRAITEMENT",
      bank_name: rowValue(profile ?? {}, "bank_name", "bankName") ?? null,
      rib_number: rowValue(profile ?? {}, "rib_number", "ribNumber") ?? null,
    });
    res.status(201).json(mapWithdrawal(row));
  } catch {
    res.status(503).json({ error: "Wallet service unavailable" });
  }
});

export default router;