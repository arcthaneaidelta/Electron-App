import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull().default("dark"),
  language: text("language").notNull().default("en"),
  notifications: boolean("notifications").notNull().default(true),
  autoStart: boolean("auto_start").notNull().default(false),
  minimizeToTray: boolean("minimize_to_tray").notNull().default(true),
  showInDock: boolean("show_in_dock").notNull().default(true),
  globalShortcutEnabled: boolean("global_shortcut_enabled").notNull().default(true),
  clipboardHistoryLimit: integer("clipboard_history_limit").notNull().default(100),
  defaultCategory: text("default_category").notNull().default("General"),
  analyticsEnabled: boolean("analytics_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
