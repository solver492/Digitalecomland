import { Router } from "express";
import { deleteOne, insertOne, selectRows, updateOne } from "../lib/data";
import { requireAdmin } from "../middlewares/auth";
import {
  rowValue,
  toBoolean,
  toId,
  toNumber,
  toStringValue,
  type SupabaseRow,
} from "../lib/supabase";
import { mapProduct } from "./products";

const router = Router();
router.use(requireAdmin);

function productWriteData(body: SupabaseRow, partial = false): SupabaseRow {
  const aliases: Record<string, string[]> = {
    name: ["name", "title"],
    category: ["category", "category_name"],
    image_url: ["imageUrl", "image_url", "image", "cover_url"],
    wholesale_price: ["wholesalePrice", "wholesale_price", "purchase_price", "cost_price"],
    suggested_price: ["suggestedPrice", "suggested_price", "sale_price", "selling_price"],
    affiliate_margin: ["affiliateMargin", "affiliate_margin", "margin"],
    description: ["description", "short_description"],
    delivery_cost: ["deliveryCost", "delivery_cost", "shipping_cost"],
    in_stock: ["inStock", "in_stock", "active"],
    supplier_id: ["supplierId", "supplier_id"],
  };
  const data: SupabaseRow = {};
  for (const [field, keys] of Object.entries(aliases)) {
    if (partial && !keys.some((key) => body[key] !== undefined)) continue;
    const value = rowValue(body, ...keys);
    data[field] = field.endsWith("_price") || field === "affiliate_margin" || field === "delivery_cost"
      ? toNumber(value)
      : field === "in_stock"
        ? toBoolean(value, true)
        : value ?? (field === "supplier_id" ? null : "");
  }
  return data;
}

function mapCategory(row: SupabaseRow) {
  return {
    id: toId(row.id),
    key: toStringValue(rowValue(row, "key", "slug")),
    labelFr: toStringValue(rowValue(row, "label_fr", "labelFr", "name")),
    labelAr: toStringValue(rowValue(row, "label_ar", "labelAr")),
    icon: toStringValue(row.icon, "📦"),
    active: toBoolean(row.active, true),
  };
}

function mapSupplier(row: SupabaseRow) {
  return {
    id: toId(row.id),
    name: toStringValue(row.name),
    phone: toStringValue(row.phone),
    email: toStringValue(row.email),
    address: toStringValue(row.address),
    city: toStringValue(row.city),
    category: toStringValue(row.category),
    notes: toStringValue(row.notes),
    products: Array.isArray(row.products) ? row.products : [],
    active: toBoolean(row.active, true),
    createdAt: toStringValue(rowValue(row, "created_at", "createdAt")),
  };
}

function mapAgency(row: SupabaseRow) {
  return {
    id: toId(row.id),
    name: toStringValue(row.name),
    phone: toStringValue(row.phone),
    email: toStringValue(row.email),
    wilayasCovered: Array.isArray(row.wilayas_covered) ? row.wilayas_covered : [],
    pricePerKg: toNumber(rowValue(row, "price_per_kg", "pricePerKg")),
    deliveryDelay: toStringValue(rowValue(row, "delivery_delay", "deliveryDelay")),
    trackingUrl: toStringValue(rowValue(row, "tracking_url", "trackingUrl")),
    notes: toStringValue(row.notes),
    active: toBoolean(row.active, true),
    createdAt: toStringValue(rowValue(row, "created_at", "createdAt")),
  };
}

function mapAffiliate(row: SupabaseRow, orders: SupabaseRow[]) {
  const id = toStringValue(row.id);
  const owned = orders.filter((order) => String(rowValue(order, "user_id", "affiliate_id") ?? "") === id);
  const delivered = owned.filter((order) => rowValue(order, "status") === "LIVREE");
  return {
    id: toId(row.id),
    fullName: toStringValue(rowValue(row, "full_name", "fullName")),
    phone: toStringValue(row.phone),
    email: toStringValue(row.email),
    city: toStringValue(row.city),
    brandName: toStringValue(rowValue(row, "brand_name", "brandName")),
    joinedAt: toStringValue(rowValue(row, "created_at", "joined_at")),
    totalOrders: owned.length,
    totalDelivered: delivered.length,
    totalEarned: delivered.reduce((sum, order) => sum + toNumber(rowValue(order, "net_margin", "profit")), 0),
    status: toStringValue(row.status, "active") as "active" | "blocked" | "pending",
    bankName: (rowValue(row, "bank_name", "bankName") as string | null) ?? null,
    ribNumber: (rowValue(row, "rib_number", "ribNumber") as string | null) ?? null,
  };
}

// Products
router.post("/admin/products", async (req, res): Promise<void> => {
  const body = req.body as SupabaseRow;
  if (!body.name || !body.category) {
    res.status(400).json({ error: "name and category required" });
    return;
  }
  try {
    const row = await insertOne("products", productWriteData(body));
    res.status(201).json(mapProduct(row));
  } catch {
    res.status(503).json({ error: "Product service unavailable" });
  }
});

router.patch("/admin/products/:id", async (req, res): Promise<void> => {
  try {
    const row = await updateOne("products", "id", String(req.params.id), productWriteData(req.body as SupabaseRow, true));
    res.json(mapProduct(row));
  } catch {
    res.status(404).json({ error: "Product not found" });
  }
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  try {
    await deleteOne("products", "id", String(req.params.id));
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Product not found" });
  }
});

// Categories
router.get("/admin/categories", async (_req, res): Promise<void> => {
  try { res.json((await selectRows("categories")).map(mapCategory)); }
  catch { res.status(503).json({ error: "Category service unavailable" }); }
});

router.post("/admin/categories", async (req, res): Promise<void> => {
  const body = req.body as SupabaseRow;
  if (!body.key || !body.labelFr) { res.status(400).json({ error: "key and labelFr required" }); return; }
  try {
    const row = await insertOne("categories", {
      key: body.key,
      label_fr: body.labelFr,
      label_ar: body.labelAr ?? "",
      icon: body.icon ?? "📦",
      active: body.active ?? true,
    });
    res.status(201).json(mapCategory(row));
  } catch { res.status(503).json({ error: "Category service unavailable" }); }
});

router.patch("/admin/categories/:id", async (req, res): Promise<void> => {
  try {
    const body = req.body as SupabaseRow;
    const row = await updateOne("categories", "id", String(req.params.id), {
      ...(body.key === undefined ? {} : { key: body.key }),
      ...(body.labelFr === undefined ? {} : { label_fr: body.labelFr }),
      ...(body.labelAr === undefined ? {} : { label_ar: body.labelAr }),
      ...(body.icon === undefined ? {} : { icon: body.icon }),
      ...(body.active === undefined ? {} : { active: body.active }),
    });
    res.json(mapCategory(row));
  } catch { res.status(404).json({ error: "Category not found" }); }
});

router.delete("/admin/categories/:id", async (req, res): Promise<void> => {
  try { await deleteOne("categories", "id", String(req.params.id)); res.status(204).end(); }
  catch { res.status(404).json({ error: "Category not found" }); }
});

// Suppliers
router.get("/admin/suppliers", async (_req, res): Promise<void> => {
  try { res.json((await selectRows("suppliers")).map(mapSupplier)); }
  catch { res.status(503).json({ error: "Supplier service unavailable" }); }
});

router.post("/admin/suppliers", async (req, res): Promise<void> => {
  const body = req.body as SupabaseRow;
  if (!body.name) { res.status(400).json({ error: "name required" }); return; }
  try {
    const row = await insertOne("suppliers", {
      name: body.name,
      phone: body.phone ?? "",
      email: body.email ?? "",
      address: body.address ?? "",
      city: body.city ?? "",
      category: body.category ?? "",
      notes: body.notes ?? "",
      products: body.products ?? [],
      active: body.active ?? true,
    });
    res.status(201).json(mapSupplier(row));
  } catch { res.status(503).json({ error: "Supplier service unavailable" }); }
});

router.patch("/admin/suppliers/:id", async (req, res): Promise<void> => {
  try {
    const body = req.body as SupabaseRow;
    const row = await updateOne("suppliers", "id", String(req.params.id), {
      ...(body.name === undefined ? {} : { name: body.name }),
      ...(body.phone === undefined ? {} : { phone: body.phone }),
      ...(body.email === undefined ? {} : { email: body.email }),
      ...(body.address === undefined ? {} : { address: body.address }),
      ...(body.city === undefined ? {} : { city: body.city }),
      ...(body.category === undefined ? {} : { category: body.category }),
      ...(body.notes === undefined ? {} : { notes: body.notes }),
      ...(body.products === undefined ? {} : { products: body.products }),
      ...(body.active === undefined ? {} : { active: body.active }),
    });
    res.json(mapSupplier(row));
  } catch { res.status(404).json({ error: "Supplier not found" }); }
});

router.delete("/admin/suppliers/:id", async (req, res): Promise<void> => {
  try { await deleteOne("suppliers", "id", String(req.params.id)); res.status(204).end(); }
  catch { res.status(404).json({ error: "Supplier not found" }); }
});

// Delivery agencies are persisted in their own table; no process-local fallback.
router.get("/admin/delivery-agencies", async (_req, res): Promise<void> => {
  try { res.json((await selectRows("delivery_agencies")).map(mapAgency)); }
  catch { res.status(503).json({ error: "Delivery agency service unavailable" }); }
});

router.post("/admin/delivery-agencies", async (req, res): Promise<void> => {
  const body = req.body as SupabaseRow;
  if (!body.name) { res.status(400).json({ error: "name required" }); return; }
  try {
    const row = await insertOne("delivery_agencies", {
      name: body.name,
      phone: body.phone ?? "",
      email: body.email ?? "",
      wilayas_covered: body.wilayasCovered ?? [],
      price_per_kg: body.pricePerKg ?? 0,
      delivery_delay: body.deliveryDelay ?? "",
      tracking_url: body.trackingUrl ?? "",
      notes: body.notes ?? "",
      active: body.active ?? true,
    });
    res.status(201).json(mapAgency(row));
  } catch { res.status(503).json({ error: "Delivery agency service unavailable" }); }
});

router.patch("/admin/delivery-agencies/:id", async (req, res): Promise<void> => {
  try {
    const body = req.body as SupabaseRow;
    const row = await updateOne("delivery_agencies", "id", String(req.params.id), {
      ...(body.name === undefined ? {} : { name: body.name }),
      ...(body.phone === undefined ? {} : { phone: body.phone }),
      ...(body.email === undefined ? {} : { email: body.email }),
      ...(body.wilayasCovered === undefined ? {} : { wilayas_covered: body.wilayasCovered }),
      ...(body.pricePerKg === undefined ? {} : { price_per_kg: body.pricePerKg }),
      ...(body.deliveryDelay === undefined ? {} : { delivery_delay: body.deliveryDelay }),
      ...(body.trackingUrl === undefined ? {} : { tracking_url: body.trackingUrl }),
      ...(body.notes === undefined ? {} : { notes: body.notes }),
      ...(body.active === undefined ? {} : { active: body.active }),
    });
    res.json(mapAgency(row));
  } catch { res.status(404).json({ error: "Delivery agency not found" }); }
});

router.delete("/admin/delivery-agencies/:id", async (req, res): Promise<void> => {
  try { await deleteOne("delivery_agencies", "id", String(req.params.id)); res.status(204).end(); }
  catch { res.status(404).json({ error: "Delivery agency not found" }); }
});

// Affiliates are profiles with derived order totals.
router.get("/admin/affiliates", async (_req, res): Promise<void> => {
  try {
    const [profiles, orders] = await Promise.all([selectRows("profiles"), selectRows("orders")]);
    res.json(profiles.filter((profile) => rowValue(profile, "role") !== "admin").map((profile) => mapAffiliate(profile, orders)));
  } catch { res.status(503).json({ error: "Affiliate service unavailable" }); }
});

router.patch("/admin/affiliates/:id", async (req, res): Promise<void> => {
  try {
    const body = req.body as SupabaseRow;
    const row = await updateOne("profiles", "id", String(req.params.id), {
      ...(body.fullName === undefined ? {} : { full_name: body.fullName }),
      ...(body.phone === undefined ? {} : { phone: body.phone }),
      ...(body.email === undefined ? {} : { email: body.email }),
      ...(body.city === undefined ? {} : { city: body.city }),
      ...(body.brandName === undefined ? {} : { brand_name: body.brandName }),
      ...(body.status === undefined ? {} : { status: body.status }),
    });
    const orders = await selectRows("orders");
    res.json(mapAffiliate(row, orders));
  } catch { res.status(404).json({ error: "Affiliate not found" }); }
});

// Stats are calculated from persistent Supabase rows.
router.get("/admin/stats", async (_req, res): Promise<void> => {
  try {
    const [orders, profiles, products] = await Promise.all([
      selectRows("orders"),
      selectRows("profiles"),
      selectRows("products"),
    ]);
    const delivered = orders.filter((order) => rowValue(order, "status") === "LIVREE").length;
    const returned = orders.filter((order) => rowValue(order, "status") === "RETOURNEE").length;
    const totalAffiliates = profiles.filter((profile) => rowValue(profile, "role") !== "admin").length;
    const inStockProducts = products.filter((product) => toBoolean(rowValue(product, "in_stock", "active"), true)).length;
    res.json({
      totalRevenue: orders.filter((order) => rowValue(order, "status") === "LIVREE")
        .reduce((sum, order) => sum + toNumber(rowValue(order, "net_margin", "profit")), 0),
      totalOrders: orders.length,
      delivered,
      returned,
      pending: orders.filter((order) => ["NOUVELLE", "CONFIRMEE", "EN_COURS_LIVRAISON"].includes(toStringValue(rowValue(order, "status")))).length,
      activeAffiliates: profiles.filter((profile) => rowValue(profile, "role") !== "admin" && rowValue(profile, "status") !== "blocked").length,
      totalAffiliates,
      totalProducts: products.length,
      inStockProducts,
      deliveryRate: delivered + returned ? Math.round((delivered / (delivered + returned)) * 100) : 0,
    });
  } catch { res.status(503).json({ error: "Admin statistics unavailable" }); }
});

function mapMedia(row: SupabaseRow) {
  return {
    id: toId(row.id),
    productId: toId(row.product_id),
    publicUrl: toStringValue(row.public_url),
    storagePath: toStringValue(row.storage_path),
    altText: toStringValue(row.alt_text),
    sortOrder: toNumber(row.sort_order),
  };
}

router.get("/admin/product-media", async (req, res): Promise<void> => {
  try {
    const rows = await selectRows("product_media");
    const productId = req.query.productId ? String(req.query.productId) : null;
    res.json(rows.filter((row) => !productId || String(row.product_id) === productId).map(mapMedia));
  } catch { res.status(503).json({ error: "Product media service unavailable" }); }
});

router.post("/admin/product-media", async (req, res): Promise<void> => {
  const body = req.body as SupabaseRow;
  if (!body.productId || (!body.publicUrl && !body.storagePath)) {
    res.status(400).json({ error: "productId and publicUrl or storagePath required" });
    return;
  }
  try {
    const row = await insertOne("product_media", {
      product_id: body.productId,
      public_url: body.publicUrl ?? null,
      storage_path: body.storagePath ?? null,
      alt_text: body.altText ?? "",
      sort_order: body.sortOrder ?? 0,
    });
    res.status(201).json(mapMedia(row));
  } catch { res.status(503).json({ error: "Product media service unavailable" }); }
});

router.delete("/admin/product-media/:id", async (req, res): Promise<void> => {
  try { await deleteOne("product_media", "id", String(req.params.id)); res.status(204).end(); }
  catch { res.status(404).json({ error: "Product media not found" }); }
});

function mapTelegramMessage(row: SupabaseRow) {
  return {
    id: toStringValue(row.id),
    telegramMessageId: toStringValue(row.telegram_message_id),
    supplierId: row.supplier_id == null ? null : toId(row.supplier_id),
    payload: row.payload ?? {},
    status: toStringValue(row.status, "received"),
    error: row.error == null ? null : toStringValue(row.error),
    receivedAt: toStringValue(row.received_at),
    processedAt: row.processed_at == null ? null : toStringValue(row.processed_at),
  };
}

router.get("/admin/telegram-messages", async (_req, res): Promise<void> => {
  try { res.json((await selectRows("telegram_messages")).map(mapTelegramMessage)); }
  catch { res.status(503).json({ error: "Telegram message service unavailable" }); }
});

router.post("/admin/telegram-messages", async (req, res): Promise<void> => {
  const body = req.body as SupabaseRow;
  if (!body.payload) { res.status(400).json({ error: "payload required" }); return; }
  try {
    const row = await insertOne("telegram_messages", {
      telegram_message_id: body.telegramMessageId ?? null,
      supplier_id: body.supplierId ?? null,
      payload: body.payload,
      status: body.status ?? "received",
      error: body.error ?? null,
    });
    res.status(201).json(mapTelegramMessage(row));
  } catch { res.status(503).json({ error: "Telegram message service unavailable" }); }
});

router.patch("/admin/telegram-messages/:id", async (req, res): Promise<void> => {
  try {
    const body = req.body as SupabaseRow;
    const row = await updateOne("telegram_messages", "id", String(req.params.id), {
      ...(body.status === undefined ? {} : { status: body.status }),
      ...(body.error === undefined ? {} : { error: body.error }),
      ...(body.processedAt === undefined ? {} : { processed_at: body.processedAt }),
    });
    res.json(mapTelegramMessage(row));
  } catch { res.status(404).json({ error: "Telegram message not found" }); }
});

function mapSocialPublication(row: SupabaseRow) {
  return {
    id: toStringValue(row.id),
    productId: row.product_id == null ? null : toId(row.product_id),
    platform: toStringValue(row.platform),
    destination: row.destination == null ? null : toStringValue(row.destination),
    content: toStringValue(row.content),
    status: toStringValue(row.status, "draft"),
    externalPostId: row.external_post_id == null ? null : toStringValue(row.external_post_id),
    scheduledAt: row.scheduled_at == null ? null : toStringValue(row.scheduled_at),
    publishedAt: row.published_at == null ? null : toStringValue(row.published_at),
    error: row.error == null ? null : toStringValue(row.error),
  };
}

router.get("/admin/social-publications", async (_req, res): Promise<void> => {
  try { res.json((await selectRows("social_publications")).map(mapSocialPublication)); }
  catch { res.status(503).json({ error: "Social publication service unavailable" }); }
});

router.post("/admin/social-publications", async (req, res): Promise<void> => {
  const body = req.body as SupabaseRow;
  if (!body.platform) { res.status(400).json({ error: "platform required" }); return; }
  try {
    const row = await insertOne("social_publications", {
      product_id: body.productId ?? null,
      platform: body.platform,
      destination: body.destination ?? null,
      content: body.content ?? "",
      status: body.status ?? "draft",
      scheduled_at: body.scheduledAt ?? null,
    });
    res.status(201).json(mapSocialPublication(row));
  } catch { res.status(503).json({ error: "Social publication service unavailable" }); }
});

router.patch("/admin/social-publications/:id", async (req, res): Promise<void> => {
  try {
    const body = req.body as SupabaseRow;
    const row = await updateOne("social_publications", "id", String(req.params.id), {
      ...(body.productId === undefined ? {} : { product_id: body.productId }),
      ...(body.destination === undefined ? {} : { destination: body.destination }),
      ...(body.content === undefined ? {} : { content: body.content }),
      ...(body.status === undefined ? {} : { status: body.status }),
      ...(body.externalPostId === undefined ? {} : { external_post_id: body.externalPostId }),
      ...(body.scheduledAt === undefined ? {} : { scheduled_at: body.scheduledAt }),
      ...(body.publishedAt === undefined ? {} : { published_at: body.publishedAt }),
      ...(body.error === undefined ? {} : { error: body.error }),
    });
    res.json(mapSocialPublication(row));
  } catch { res.status(404).json({ error: "Social publication not found" }); }
});

router.delete("/admin/social-publications/:id", async (req, res): Promise<void> => {
  try { await deleteOne("social_publications", "id", String(req.params.id)); res.status(204).end(); }
  catch { res.status(404).json({ error: "Social publication not found" }); }
});

export default router;