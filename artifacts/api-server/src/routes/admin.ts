import { Router } from "express";
import { store } from "../lib/mem-store";
import type { Product, Supplier, DeliveryAgency, Affiliate, Category } from "../lib/mem-store";

const router = Router();

// ============================================================
// ADMIN — PRODUCTS CRUD
// ============================================================

router.post("/admin/products", (req, res): void => {
  const body = req.body as Partial<Product>;
  if (!body.name || !body.category) {
    res.status(400).json({ error: "name and category required" });
    return;
  }
  const product: Product = {
    id: store._nextId.products++,
    name: body.name,
    category: body.category,
    imageUrl: body.imageUrl ?? "",
    wholesalePrice: body.wholesalePrice ?? 0,
    suggestedPrice: body.suggestedPrice ?? 0,
    affiliateMargin: body.affiliateMargin ?? 0,
    description: body.description ?? "",
    deliveryCost: body.deliveryCost ?? 0,
    inStock: body.inStock ?? true,
    detail: body.detail,
  };
  store.products.push(product);
  res.status(201).json(product);
});

router.patch("/admin/products/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  store.products[idx] = { ...store.products[idx], ...req.body, id };
  res.json(store.products[idx]);
});

router.delete("/admin/products/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  store.products.splice(idx, 1);
  res.status(204).end();
});

// ============================================================
// ADMIN — CATEGORIES CRUD
// ============================================================

router.get("/admin/categories", (_req, res): void => {
  res.json(store.categories);
});

router.post("/admin/categories", (req, res): void => {
  const body = req.body as Partial<Category>;
  if (!body.key || !body.labelFr) {
    res.status(400).json({ error: "key and labelFr required" });
    return;
  }
  const cat: Category = {
    id: store._nextId.categories++,
    key: body.key,
    labelFr: body.labelFr,
    labelAr: body.labelAr ?? "",
    icon: body.icon ?? "📦",
    active: body.active ?? true,
  };
  store.categories.push(cat);
  res.status(201).json(cat);
});

router.patch("/admin/categories/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  const idx = store.categories.findIndex((c) => c.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  store.categories[idx] = { ...store.categories[idx], ...req.body, id };
  res.json(store.categories[idx]);
});

router.delete("/admin/categories/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  const idx = store.categories.findIndex((c) => c.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  store.categories.splice(idx, 1);
  res.status(204).end();
});

// ============================================================
// ADMIN — SUPPLIERS CRUD
// ============================================================

router.get("/admin/suppliers", (_req, res): void => {
  res.json(store.suppliers);
});

router.post("/admin/suppliers", (req, res): void => {
  const body = req.body as Partial<Supplier>;
  if (!body.name) { res.status(400).json({ error: "name required" }); return; }
  const supplier: Supplier = {
    id: store._nextId.suppliers++,
    name: body.name,
    phone: body.phone ?? "",
    email: body.email ?? "",
    address: body.address ?? "",
    city: body.city ?? "",
    category: body.category ?? "",
    notes: body.notes ?? "",
    products: body.products ?? [],
    active: body.active ?? true,
    createdAt: new Date().toISOString(),
  };
  store.suppliers.push(supplier);
  res.status(201).json(supplier);
});

router.patch("/admin/suppliers/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  const idx = store.suppliers.findIndex((s) => s.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  store.suppliers[idx] = { ...store.suppliers[idx], ...req.body, id };
  res.json(store.suppliers[idx]);
});

router.delete("/admin/suppliers/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  const idx = store.suppliers.findIndex((s) => s.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  store.suppliers.splice(idx, 1);
  res.status(204).end();
});

// ============================================================
// ADMIN — DELIVERY AGENCIES CRUD
// ============================================================

router.get("/admin/delivery-agencies", (_req, res): void => {
  res.json(store.deliveryAgencies);
});

router.post("/admin/delivery-agencies", (req, res): void => {
  const body = req.body as Partial<DeliveryAgency>;
  if (!body.name) { res.status(400).json({ error: "name required" }); return; }
  const agency: DeliveryAgency = {
    id: store._nextId.deliveryAgencies++,
    name: body.name,
    phone: body.phone ?? "",
    email: body.email ?? "",
    wilayasCovered: body.wilayasCovered ?? [],
    pricePerKg: body.pricePerKg ?? 0,
    deliveryDelay: body.deliveryDelay ?? "",
    trackingUrl: body.trackingUrl ?? "",
    notes: body.notes ?? "",
    active: body.active ?? true,
    createdAt: new Date().toISOString(),
  };
  store.deliveryAgencies.push(agency);
  res.status(201).json(agency);
});

router.patch("/admin/delivery-agencies/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  const idx = store.deliveryAgencies.findIndex((a) => a.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  store.deliveryAgencies[idx] = { ...store.deliveryAgencies[idx], ...req.body, id };
  res.json(store.deliveryAgencies[idx]);
});

router.delete("/admin/delivery-agencies/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  const idx = store.deliveryAgencies.findIndex((a) => a.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  store.deliveryAgencies.splice(idx, 1);
  res.status(204).end();
});

// ============================================================
// ADMIN — AFFILIATES
// ============================================================

router.get("/admin/affiliates", (_req, res): void => {
  res.json(store.affiliates);
});

router.patch("/admin/affiliates/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  const idx = store.affiliates.findIndex((a) => a.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  store.affiliates[idx] = { ...store.affiliates[idx], ...req.body, id };
  res.json(store.affiliates[idx]);
});

// ============================================================
// ADMIN — STATS
// ============================================================

router.get("/admin/stats", (_req, res): void => {
  const orders = store.orders;
  const totalRevenue = orders
    .filter((o) => o.status === "LIVREE")
    .reduce((s, o) => s + o.netMargin, 0);
  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.status === "LIVREE").length;
  const returned  = orders.filter((o) => o.status === "RETOURNEE").length;
  const pending   = orders.filter((o) => ["NOUVELLE", "CONFIRMEE", "EN_COURS_LIVRAISON"].includes(o.status)).length;
  const activeAffiliates = store.affiliates.filter((a) => a.status === "active").length;
  const totalAffiliates  = store.affiliates.length;
  const totalProducts = store.products.length;
  const inStockProducts = store.products.filter((p) => p.inStock).length;

  res.json({
    totalRevenue,
    totalOrders,
    delivered,
    returned,
    pending,
    activeAffiliates,
    totalAffiliates,
    totalProducts,
    inStockProducts,
    deliveryRate: delivered ? Math.round((delivered / (delivered + returned)) * 100) : 0,
  });
});

export default router;
