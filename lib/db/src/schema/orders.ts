import { pgTable, text, serial, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  productId: numeric("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image").notNull(),
  customerFirstName: text("customer_first_name").notNull(),
  customerLastName: text("customer_last_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  city: text("city").notNull(),
  fullAddress: text("full_address").notNull(),
  salePriceAffiliate: numeric("sale_price_affiliate", { precision: 10, scale: 2 }).notNull(),
  wholesalePrice: numeric("wholesale_price", { precision: 10, scale: 2 }).notNull(),
  deliveryCost: numeric("delivery_cost", { precision: 10, scale: 2 }).notNull(),
  netMargin: numeric("net_margin", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("NOUVELLE"),
  deliveryNote: text("delivery_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
