import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shortcutsTable = pgTable("shortcuts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  keys: text("keys").notNull(),
  action: text("action").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  category: text("category").notNull().default("General"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertShortcutSchema = createInsertSchema(shortcutsTable).omit({ id: true, createdAt: true });
export type InsertShortcut = z.infer<typeof insertShortcutSchema>;
export type Shortcut = typeof shortcutsTable.$inferSelect;
