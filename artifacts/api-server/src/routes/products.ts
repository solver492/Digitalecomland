import { Router } from "express";
import { store } from "../lib/mem-store";
import { ListProductsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/products", (req, res): void => {
  const queryParsed = ListProductsQueryParams.safeParse(req.query);
  const { search, category } = queryParsed.success ? queryParsed.data : {};

  let filtered = store.products;

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

  res.json(filtered);
});

router.get("/products/:id", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const product = store.products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

export default router;
