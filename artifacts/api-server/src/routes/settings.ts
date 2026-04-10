import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable, shortcutsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody, UpdateShortcutsBody } from "@workspace/api-zod";

const router = Router();

async function getOrCreateSettings() {
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created;
}

router.get("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      theme: settings.theme,
      language: settings.language,
      notifications: settings.notifications,
      autoStart: settings.autoStart,
      minimizeToTray: settings.minimizeToTray,
      showInDock: settings.showInDock,
      globalShortcutEnabled: settings.globalShortcutEnabled,
      clipboardHistoryLimit: settings.clipboardHistoryLimit,
      defaultCategory: settings.defaultCategory,
      analyticsEnabled: settings.analyticsEnabled,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const body = UpdateSettingsBody.parse(req.body);
    const settings = await getOrCreateSettings();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.notifications !== undefined) updateData.notifications = body.notifications;
    if (body.autoStart !== undefined) updateData.autoStart = body.autoStart;
    if (body.minimizeToTray !== undefined) updateData.minimizeToTray = body.minimizeToTray;
    if (body.showInDock !== undefined) updateData.showInDock = body.showInDock;
    if (body.globalShortcutEnabled !== undefined) updateData.globalShortcutEnabled = body.globalShortcutEnabled;
    if (body.clipboardHistoryLimit !== undefined) updateData.clipboardHistoryLimit = body.clipboardHistoryLimit;
    if (body.defaultCategory !== undefined) updateData.defaultCategory = body.defaultCategory;
    if (body.analyticsEnabled !== undefined) updateData.analyticsEnabled = body.analyticsEnabled;

    const [updated] = await db
      .update(settingsTable)
      .set(updateData)
      .where(eq(settingsTable.id, settings.id))
      .returning();

    res.json({
      theme: updated.theme,
      language: updated.language,
      notifications: updated.notifications,
      autoStart: updated.autoStart,
      minimizeToTray: updated.minimizeToTray,
      showInDock: updated.showInDock,
      globalShortcutEnabled: updated.globalShortcutEnabled,
      clipboardHistoryLimit: updated.clipboardHistoryLimit,
      defaultCategory: updated.defaultCategory,
      analyticsEnabled: updated.analyticsEnabled,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/shortcuts", async (req, res) => {
  try {
    const shortcuts = await db.select().from(shortcutsTable);
    res.json(
      shortcuts.map((s) => ({
        ...s,
        id: String(s.id),
        createdAt: undefined,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list shortcuts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/shortcuts", async (req, res) => {
  try {
    const body = UpdateShortcutsBody.parse(req.body);
    const updated = [];
    for (const item of body) {
      const [s] = await db
        .update(shortcutsTable)
        .set({ keys: item.keys, enabled: item.enabled })
        .where(eq(shortcutsTable.id, parseInt(item.id)))
        .returning();
      if (s) {
        updated.push({ ...s, id: String(s.id), createdAt: undefined });
      }
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update shortcuts");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
