import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, productsTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  GetOrderParams,
  UpdateOrderStatusParams,
  CreateOrderBody,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";

const router = Router();

function serializeOrder(o: typeof ordersTable.$inferSelect) {
  return {
    ...o,
    salePriceAffiliate: Number(o.salePriceAffiliate),
    wholesalePrice: Number(o.wholesalePrice),
    deliveryCost: Number(o.deliveryCost),
    netMargin: Number(o.netMargin),
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const queryParsed = ListOrdersQueryParams.safeParse(req.query);
  const { status, search } = queryParsed.success ? queryParsed.data : {};

  let rows = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);

  if (status) {
    rows = rows.filter((o) => o.status === status);
  }
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(
      (o) =>
        o.customerPhone.includes(s) ||
        String(o.id).includes(s) ||
        o.customerFirstName.toLowerCase().includes(s) ||
        o.customerLastName.toLowerCase().includes(s)
    );
  }

  res.json(rows.map(serializeOrder));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    productId,
    customerFirstName,
    customerLastName,
    customerPhone,
    city,
    fullAddress,
    salePriceAffiliate,
    deliveryNote,
  } = parsed.data;

  // Look up product
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) {
    res.status(400).json({ error: "Product not found" });
    return;
  }

  const wholesale = Number(product.wholesalePrice);
  const delivery = Number(product.deliveryCost);
  const netMargin = salePriceAffiliate - wholesale - delivery;

  const [created] = await db
    .insert(ordersTable)
    .values({
      productId,
      productName: product.name,
      productImage: product.imageUrl,
      customerFirstName,
      customerLastName,
      customerPhone,
      city,
      fullAddress,
      salePriceAffiliate: String(salePriceAffiliate),
      wholesalePrice: product.wholesalePrice,
      deliveryCost: product.deliveryCost,
      netMargin: String(netMargin),
      status: "NOUVELLE",
      deliveryNote: deliveryNote ?? null,
    })
    .returning();

  res.status(201).json(serializeOrder(created));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(updated));
});

export default router;
