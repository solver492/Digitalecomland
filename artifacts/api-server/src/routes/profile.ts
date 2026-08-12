import { Router } from "express";
import { store } from "../lib/mem-store";
import { UpdateProfileBody } from "@workspace/api-zod";

const router = Router();

router.get("/profile", (req, res): void => {
  res.json(store.profile);
});

router.patch("/profile", (req, res): void => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  store.profile = {
    ...store.profile,
    fullName: parsed.data.fullName ?? store.profile.fullName,
    phone: parsed.data.phone ?? store.profile.phone,
    email: parsed.data.email ?? store.profile.email,
    city: parsed.data.city ?? store.profile.city,
    brandName: parsed.data.brandName ?? store.profile.brandName,
    bankName: parsed.data.bankName ?? store.profile.bankName,
    ribNumber: parsed.data.ribNumber ?? store.profile.ribNumber,
    paymentMethod: parsed.data.paymentMethod ?? store.profile.paymentMethod,
  };

  res.json(store.profile);
});

export default router;
