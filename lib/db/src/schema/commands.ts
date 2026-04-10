import { pgTable, text, serial, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const commandStatusEnum = pgEnum("command_status", ["active", "inactive", "draft"]);

export const commandsTable = pgTable("commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("General"),
  trigger: text("trigger"),
  script: text("script"),
  shortcut: text("shortcut"),
  status: commandStatusEnum("status").notNull().default("active"),
  executionCount: integer("execution_count").notNull().default(0),
  lastExecuted: timestamp("last_executed"),
  avgExecutionTime: real("avg_execution_time").default(0),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCommandSchema = createInsertSchema(commandsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCommand = z.infer<typeof insertCommandSchema>;
export type Command = typeof commandsTable.$inferSelect;
