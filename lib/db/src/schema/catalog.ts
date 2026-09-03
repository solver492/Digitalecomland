import { bigint, boolean, jsonb, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const suppliersTable = pgTable("suppliers", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  category: text("category").notNull().default(""),
  notes: text("notes").notNull().default(""),
  products: jsonb("products").notNull().default([]),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categoriesTable = pgTable("categories", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  key: text("key").notNull(),
  labelFr: text("label_fr").notNull(),
  labelAr: text("label_ar").notNull().default(""),
  icon: text("icon").notNull().default("📦"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deliveryAgenciesTable = pgTable("delivery_agencies", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  wilayasCovered: jsonb("wilayas_covered").notNull().default([]),
  pricePerKg: numeric("price_per_kg", { precision: 10, scale: 2 }).notNull().default("0"),
  deliveryDelay: text("delivery_delay").notNull().default(""),
  trackingUrl: text("tracking_url").notNull().default(""),
  notes: text("notes").notNull().default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true });
export const insertDeliveryAgencySchema = createInsertSchema(deliveryAgenciesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliersTable.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;
export type InsertDeliveryAgency = z.infer<typeof insertDeliveryAgencySchema>;
export type DeliveryAgency = typeof deliveryAgenciesTable.$inferSelect;