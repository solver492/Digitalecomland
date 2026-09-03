import { pgTable, text, bigint, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  wholesalePrice: numeric("wholesale_price", { precision: 10, scale: 2 }).notNull().default("0"),
  suggestedPrice: numeric("suggested_price", { precision: 10, scale: 2 }).notNull().default("0"),
  affiliateMargin: numeric("affiliate_margin", { precision: 10, scale: 2 }).notNull().default("0"),
  description: text("description").notNull().default(""),
  deliveryCost: numeric("delivery_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  inStock: boolean("in_stock").notNull().default(true),
  supplierId: bigint("supplier_id", { mode: "number" }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
