import { Router } from "express";
import { ListOrdersQueryParams, CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { insertOne, selectRows, selectOne, updateOne } from "../lib/data";
import { requireAdmin } from "../middlewares/auth";
import {
  ownsRow,
  rowValue,
  toId,
  toNumber,
  toStringValue,
  type SupabaseRow,
} from "../lib/supabase";

const router = Router();

function mapOrder(row: SupabaseRow) {
  return {
    id: toId(row.id),
    productId: toId(rowValue(row, "product_id", "productId")),
    productName: toStringValue(rowValue(row, "product_name", "productName")),
    productImage: toStringValue(rowValue(row, "product_image", "productImage", "image_url")),
    customerFirstName: toStringValue(rowValue(row, "customer_first_name", "customerFirstName")),
    customerLastName: toStringValue(rowValue(row, "customer_last_name", "customerLastName")),
    customerPhone: toStringValue(rowValue(row, "customer_phone", "customerPhone")),
    city: toStringValue(row.city),
    fullAddress: toStringValue(rowValue(row, "full_address", "fullAddress", "address")),
    salePriceAffiliate: toNumber(rowValue(row, "sale_price_affiliate", "sale_price")),
    wholesalePrice: toNumber(rowValue(row, "wholesale_price", "purchase_price")),
    deliveryCost: toNumber(rowValue(row, "delivery_cost", "shipping_cost")),
    netMargin: toNumber(rowValue(row, "net_margin", "profit")),
    status: toStringValue(row.status, "NOUVELLE"),
    deliveryNote: (rowValue(row, "delivery_note", "deliveryNote") as string | null) ?? null,
    createdAt: toStringValue(rowValue(row, "created_at", "date")),
  };
}

async function currentUserOrders(userId: string, includeAll = false): Promise<SupabaseRow[]> {
  const rows = await selectRows("orders");
  return includeAll ? rows : rows.filter((row) => ownsRow(row, userId));
}

router.get("/orders", async (req, res): Promise<void> => {
  try {
    const queryParsed = ListOrdersQueryParams.safeParse(req.query);
    const { status, search } = queryParsed.success ? queryParsed.data : {};
    let rows = await currentUserOrders(req.user!.id, req.profileRole === "admin");
    if (status) rows = rows.filter((row) => row.status === status);
    if (search) {
      const term = search.toLowerCase();
      rows = rows.filter((row) =>
        `${rowValue(row, "customer_phone", "customerPhone") ?? ""} ${rowValue(row, "id") ?? ""} ${
          rowValue(row, "customer_first_name", "customerFirstName") ?? ""
        } ${rowValue(row, "customer_last_name", "customerLastName") ?? ""}`.toLowerCase().includes(term),
      );
    }
    rows.sort((a, b) =>
      new Date(toStringValue(rowValue(b, "created_at", "date"))).getTime() -
      new Date(toStringValue(rowValue(a, "created_at", "date"))).getTime(),
    );
    res.json(rows.map(mapOrder));
  } catch {
    res.status(503).json({ error: "Order service unavailable" });
  }
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order data" });
    return;
  }
  try {
    const product = await selectOne("products", "id", String(parsed.data.productId));
    if (!product) {
      res.status(400).json({ error: "Product not found" });
      return;
    }
    const wholesalePrice = toNumber(rowValue(product, "wholesale_price", "purchase_price", "cost_price"));
    const deliveryCost = toNumber(rowValue(product, "delivery_cost", "shipping_cost"));
    const productName = toStringValue(rowValue(product, "name", "title"));
    const productImage = toStringValue(rowValue(product, "image_url", "image", "cover_url"));
    const row = await insertOne("orders", {
      user_id: req.user!.id,
      product_id: parsed.data.productId,
      product_name: productName,
      product_image: productImage,
      customer_first_name: parsed.data.customerFirstName,
      customer_last_name: parsed.data.customerLastName,
      customer_phone: parsed.data.customerPhone,
      city: parsed.data.city,
      full_address: parsed.data.fullAddress,
      sale_price_affiliate: parsed.data.salePriceAffiliate,
      wholesale_price: wholesalePrice,
      delivery_cost: deliveryCost,
      net_margin: parsed.data.salePriceAffiliate - wholesalePrice - deliveryCost,
      status: "NOUVELLE",
      delivery_note: parsed.data.deliveryNote ?? null,
    });
    res.status(201).json(mapOrder(row));
  } catch {
    res.status(503).json({ error: "Order service unavailable" });
  }
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  try {
    const row = await selectOne("orders", "id", req.params.id);
    if (!row || (!ownsRow(row, req.user!.id) && req.profileRole !== "admin")) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(mapOrder(row));
  } catch {
    res.status(503).json({ error: "Order service unavailable" });
  }
});

router.patch("/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order status" });
    return;
  }
  try {
    const row = await updateOne("orders", "id", String(req.params.id), { status: parsed.data.status });
    res.json(mapOrder(row));
  } catch {
    res.status(404).json({ error: "Order not found" });
  }
});

export default router;