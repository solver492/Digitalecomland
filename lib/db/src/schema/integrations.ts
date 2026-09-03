import { jsonb, bigint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pgTable } from "drizzle-orm/pg-core";

export const telegramMessagesTable = pgTable("telegram_messages", {
  id: uuid("id").primaryKey(),
  telegramMessageId: text("telegram_message_id"),
  supplierId: bigint("supplier_id", { mode: "number" }),
  payload: jsonb("payload").notNull().default({}),
  status: text("status").notNull().default("received"),
  error: text("error"),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const socialPublicationsTable = pgTable("social_publications", {
  id: uuid("id").primaryKey(),
  productId: bigint("product_id", { mode: "number" }),
  platform: text("platform").notNull(),
  destination: text("destination"),
  content: text("content").notNull().default(""),
  status: text("status").notNull().default("draft"),
  externalPostId: text("external_post_id"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTelegramMessageSchema = createInsertSchema(telegramMessagesTable).omit({ id: true, receivedAt: true });
export const insertSocialPublicationSchema = createInsertSchema(socialPublicationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTelegramMessage = z.infer<typeof insertTelegramMessageSchema>;
export type TelegramMessage = typeof telegramMessagesTable.$inferSelect;
export type InsertSocialPublication = z.infer<typeof insertSocialPublicationSchema>;
export type SocialPublication = typeof socialPublicationsTable.$inferSelect;