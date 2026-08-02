import { Router } from "express";
import { like, or, eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  GetProductParams,
  ListProductsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/products", async (req, res): Promise<void> => {
  const queryParsed = ListProductsQueryParams.safeParse(req.query);
  const { search, category } = queryParsed.success ? queryParsed.data : {};

  const rows = await db.select().from(productsTable);

  let filtered = rows;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
    );
  }
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  res.json(
    filtered.map((p) => ({
      ...p,
      wholesalePrice: Number(p.wholesalePrice),
      suggestedPrice: Number(p.suggestedPrice),
      affiliateMargin: Number(p.affiliateMargin),
      deliveryCost: Number(p.deliveryCost),
    }))
  );
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({
    ...product,
    wholesalePrice: Number(product.wholesalePrice),
    suggestedPrice: Number(product.suggestedPrice),
    affiliateMargin: Number(product.affiliateMargin),
    deliveryCost: Number(product.deliveryCost),
  });
});

export default router;
