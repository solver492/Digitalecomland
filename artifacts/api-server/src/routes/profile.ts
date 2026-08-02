import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, profileTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";

const router = Router();

router.get("/profile", async (req, res): Promise<void> => {
  const rows = await db.select().from(profileTable);

  if (rows.length === 0) {
    res.json({
      id: 1,
      fullName: "Ahmed Benali",
      phone: "0661234567",
      email: "ahmed.benali@gmail.com",
      city: "Casablanca",
      brandName: "ShopMaroc Pro",
      bankName: null,
      ribNumber: null,
      paymentMethod: null,
    });
    return;
  }

  res.json(rows[0]);
});

router.patch("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db.select().from(profileTable);

  if (rows.length === 0) {
    const [created] = await db
      .insert(profileTable)
      .values({
        fullName: parsed.data.fullName ?? "Ahmed Benali",
        phone: parsed.data.phone ?? "0661234567",
        email: parsed.data.email ?? "ahmed@example.com",
        city: parsed.data.city ?? "Casablanca",
        brandName: parsed.data.brandName ?? "Ma Boutique",
        bankName: parsed.data.bankName ?? null,
        ribNumber: parsed.data.ribNumber ?? null,
        paymentMethod: parsed.data.paymentMethod ?? null,
      })
      .returning();
    res.json(created);
    return;
  }

  const existing = rows[0];
  const [updated] = await db
    .update(profileTable)
    .set({
      fullName: parsed.data.fullName ?? existing.fullName,
      phone: parsed.data.phone ?? existing.phone,
      email: parsed.data.email ?? existing.email,
      city: parsed.data.city ?? existing.city,
      brandName: parsed.data.brandName ?? existing.brandName,
      bankName: parsed.data.bankName ?? existing.bankName,
      ribNumber: parsed.data.ribNumber ?? existing.ribNumber,
      paymentMethod: parsed.data.paymentMethod ?? existing.paymentMethod,
    })
    .where(eq(profileTable.id, existing.id))
    .returning();

  res.json(updated);
});

export default router;
