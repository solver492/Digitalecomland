import { Router } from "express";
import { ListProductsQueryParams } from "@workspace/api-zod";
import { selectRows, selectOne } from "../lib/data";
import { rowValue, toBoolean, toId, toNumber, toStringValue, type SupabaseRow } from "../lib/supabase";

const router = Router();

function mapProduct(row: SupabaseRow) {
  const wholesalePrice = toNumber(rowValue(row, "wholesale_price", "purchase_price", "cost_price"));
  const suggestedPrice = toNumber(rowValue(row, "suggested_price", "sale_price", "selling_price"));
  const deliveryCost = toNumber(rowValue(row, "delivery_cost", "shipping_cost"));
  return {
    id: toId(row.id),
    name: toStringValue(rowValue(row, "name", "title")),
    category: toStringValue(rowValue(row, "category", "category_name")),
    imageUrl: toStringValue(rowValue(row, "image_url", "image", "cover_url")),
    wholesalePrice,
    suggestedPrice,
    affiliateMargin: toNumber(rowValue(row, "affiliate_margin", "margin"), suggestedPrice - wholesalePrice - deliveryCost),
    description: toStringValue(rowValue(row, "description", "short_description")),
    deliveryCost,
    inStock: toBoolean(rowValue(row, "in_stock", "active"), true),
    supplierId: rowValue(row, "supplier_id") ?? null,
    createdAt: rowValue(row, "created_at") ?? null,
    sourceTelegram: rowValue(row, "source_telegram", "telegram_message_id") ?? null,
  };
}

router.get("/products", async (req, res): Promise<void> => {
  try {
    const queryParsed = ListProductsQueryParams.safeParse(req.query);
    const { search, category } = queryParsed.success ? queryParsed.data : {};
    let rows = await selectRows("products");
    if (search) {
      const term = search.toLowerCase();
      rows = rows.filter((row) => {
        const text = `${rowValue(row, "name", "title") ?? ""} ${rowValue(row, "description") ?? ""}`.toLowerCase();
        return text.includes(term);
      });
    }
    if (category) rows = rows.filter((row) => rowValue(row, "category", "category_name") === category);
    res.json(rows.map(mapProduct));
  } catch {
    res.status(503).json({ error: "Product service unavailable" });
  }
});

router.get("/products/:id", async (req, res): Promise<void> => {
  try {
    const row = await selectOne("products", "id", req.params.id);
    if (!row) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const product = mapProduct(row);
    const { data: media, error } = await (await import("../lib/supabase")).requireSupabase()
      .from("product_media")
      .select("*")
      .eq("product_id", req.params.id)
      .order("created_at", { ascending: true });
    const mediaRows = !error && Array.isArray(media) ? (media as SupabaseRow[]) : [];
    const images = mediaRows
      .map((item) => toStringValue(rowValue(item, "public_url", "url", "storage_path")))
      .filter(Boolean);
    res.json({
      ...product,
      detail: images.length ? { images, longDescription: product.description, benefits: [] } : undefined,
    });
  } catch {
    res.status(503).json({ error: "Product service unavailable" });
  }
});

export default router;