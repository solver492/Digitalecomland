import { Router } from "express";
import { store } from "../lib/mem-store";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/orders", (req, res): void => {
  const queryParsed = ListOrdersQueryParams.safeParse(req.query);
  const { status, search } = queryParsed.success ? queryParsed.data : {};

  let rows = [...store.orders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (status) rows = rows.filter((o) => o.status === status);
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

  res.json(rows);
});

router.post("/orders", (req, res): void => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    productId, customerFirstName, customerLastName, customerPhone,
    city, fullAddress, salePriceAffiliate, deliveryNote,
  } = parsed.data;

  const product = store.products.find((p) => p.id === productId);
  if (!product) {
    res.status(400).json({ error: "Product not found" });
    return;
  }

  const netMargin = salePriceAffiliate - product.wholesalePrice - product.deliveryCost;

  const order = {
    id: store._nextId.orders++,
    productId,
    productName: product.name,
    productImage: product.imageUrl,
    customerFirstName,
    customerLastName,
    customerPhone,
    city,
    fullAddress,
    salePriceAffiliate,
    wholesalePrice: product.wholesalePrice,
    deliveryCost: product.deliveryCost,
    netMargin,
    status: "NOUVELLE",
    deliveryNote: deliveryNote ?? null,
    createdAt: new Date().toISOString(),
  };

  store.orders.push(order);
  res.status(201).json(order);
});

router.get("/orders/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const order = store.orders.find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(order);
});

router.patch("/orders/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const idx = store.orders.findIndex((o) => o.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  store.orders[idx] = { ...store.orders[idx], status: parsed.data.status };
  res.json(store.orders[idx]);
});

export default router;
