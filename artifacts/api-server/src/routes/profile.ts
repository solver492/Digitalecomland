import { Router } from "express";
import { UpdateProfileBody } from "@workspace/api-zod";
import { insertOne, selectOne, updateOne } from "../lib/data";
import { requireSupabase, rowValue, toId, toStringValue, type SupabaseRow } from "../lib/supabase";

const router = Router();

function mapProfile(row: SupabaseRow) {
  return {
    id: toId(row.id),
    fullName: toStringValue(rowValue(row, "full_name", "fullName")),
    phone: toStringValue(row.phone),
    email: toStringValue(row.email),
    city: toStringValue(row.city),
    brandName: toStringValue(rowValue(row, "brand_name", "brandName")),
    bankName: rowValue(row, "bank_name", "bankName") as string | null,
    ribNumber: rowValue(row, "rib_number", "ribNumber") as string | null,
    paymentMethod: rowValue(row, "payment_method", "paymentMethod") as string | null,
    role: row.role === "admin" ? "admin" : "affiliate",
  };
}

async function getOrCreateProfile(userId: string, email: string | undefined): Promise<SupabaseRow> {
  const existing = await selectOne("profiles", "id", userId);
  if (existing) return existing;
  return insertOne("profiles", {
    id: userId,
    full_name: "",
    phone: "",
    email: email ?? "",
    city: "",
    brand_name: "",
    bank_name: null,
    rib_number: null,
    payment_method: null,
    role: "affiliate",
  });
}

router.get("/profile", async (req, res): Promise<void> => {
  try {
    const profile = await getOrCreateProfile(req.user!.id, req.user!.email);
    res.json(mapProfile(profile));
  } catch {
    res.status(503).json({ error: "Profile service unavailable" });
  }
});

router.patch("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid profile data" });
    return;
  }
  try {
    await getOrCreateProfile(req.user!.id, req.user!.email);
    const data = parsed.data;
    const updated = await updateOne("profiles", "id", req.user!.id, {
      ...(data.fullName !== undefined ? { full_name: data.fullName } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.brandName !== undefined ? { brand_name: data.brandName } : {}),
      ...(data.bankName !== undefined ? { bank_name: data.bankName } : {}),
      ...(data.ribNumber !== undefined ? { rib_number: data.ribNumber } : {}),
      ...(data.paymentMethod !== undefined ? { payment_method: data.paymentMethod } : {}),
      updated_at: new Date().toISOString(),
    });
    res.json(mapProfile(updated));
  } catch {
    res.status(503).json({ error: "Profile service unavailable" });
  }
});

export default router;