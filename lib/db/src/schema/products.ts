import { pgTable, text, serial, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  wholesalePrice: numeric("wholesale_price", { precision: 10, scale: 2 }).notNull(),
  suggestedPrice: numeric("suggested_price", { precision: 10, scale: 2 }).notNull(),
  affiliateMargin: numeric("affiliate_margin", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  deliveryCost: numeric("delivery_cost", { precision: 10, scale: 2 }).notNull(),
  inStock: boolean("in_stock").notNull().default(true),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
