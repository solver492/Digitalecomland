import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const withdrawalsTable = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("EN_TRAITEMENT"),
  bankName: text("bank_name"),
  ribNumber: text("rib_number"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const insertWithdrawalSchema = createInsertSchema(withdrawalsTable).omit({ id: true, requestedAt: true });
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawalsTable.$inferSelect;
