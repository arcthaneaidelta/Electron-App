import { pgTable, text, serial, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const historyStatusEnum = pgEnum("history_status", ["success", "error", "warning"]);
export const historyTriggerEnum = pgEnum("history_trigger", ["manual", "shortcut", "schedule", "api"]);

export const historyTable = pgTable("history", {
  id: serial("id").primaryKey(),
  commandId: integer("command_id"),
  commandName: text("command_name"),
  type: text("type").notNull().default("command_executed"),
  status: historyStatusEnum("status").notNull().default("success"),
  output: text("output"),
  error: text("error"),
  executionTime: real("execution_time").notNull().default(0),
  triggeredBy: historyTriggerEnum("triggered_by").notNull().default("manual"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertHistorySchema = createInsertSchema(historyTable).omit({ id: true });
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof historyTable.$inferSelect;
