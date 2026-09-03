import { bigint, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pgTable } from "drizzle-orm/pg-core";

export const productMediaTable = pgTable("product_media", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  productId: bigint("product_id", { mode: "number" }).notNull(),
  publicUrl: text("public_url"),
  storagePath: text("storage_path"),
  altText: text("alt_text").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductMediaSchema = createInsertSchema(productMediaTable).omit({ id: true, createdAt: true });
export type InsertProductMedia = z.infer<typeof insertProductMediaSchema>;
export type ProductMedia = typeof productMediaTable.$inferSelect;