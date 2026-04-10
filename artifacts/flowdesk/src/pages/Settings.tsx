import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Save, Keyboard, Bell, Globe, Shield, Monitor } from "lucide-react";
import { useGetSettings, useUpdateSettings, useListShortcuts, useUpdateShortcuts } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5.5 rounded-full flex-shrink-0 cursor-pointer focus:outline-none"
      style={{
        background: checked ? "hsl(243,75%,65%)" : "hsl(var(--muted))",
        width: 40,
        height: 22,
        boxShadow: checked ? "0 0 10px hsl(243,75%,65%,0.35)" : "none",
        transition: "background 0.2s, box-shadow 0.2s",
      }}
      aria-checked={checked}
      role="switch"
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 18 : 0 }}
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
      />
    </motion.button>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Globe; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "hsl(243,75%,65%,0.12)" }}
        >
          <Icon size={14} style={{ color: "hsl(243,75%,65%)" }} />
        </div>
        <h2 className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>{title}</h2>
      </div>
      <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
        {children}
      </div>
    </motion.div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{label}</p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const { data: settings, refetch: refetchSettings } = useGetSettings();
  const { data: shortcuts = [], refetch: refetchShortcuts } = useListShortcuts();
  const updateSettings = useUpdateSettings();
  const updateShortcuts = useUpdateShortcuts();

  const [localSettings, setLocalSettings] = useState({
    notifications: true,
    autoStart: false,
    minimizeToTray: true,
    showInDock: true,
    globalShortcutEnabled: true,
    analyticsEnabled: false,
    clipboardHistoryLimit: 100,
    theme: "dark",
    language: "en",
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        notifications: settings.notifications,
        autoStart: settings.autoStart ?? false,
        minimizeToTray: settings.minimizeToTray ?? true,
        showInDock: settings.showInDock ?? true,
        globalShortcutEnabled: settings.globalShortcutEnabled,
        analyticsEnabled: settings.analyticsEnabled ?? false,
        clipboardHistoryLimit: settings.clipboardHistoryLimit ?? 100,
        theme: settings.theme,
        language: settings.language ?? "en",
      });
    }
  }, [settings]);

  async function saveSettings() {
    try {
      await updateSettings.mutateAsync({ data: localSettings });
      toast({ title: "Settings saved", description: "Your preferences have been updated." });
      refetchSettings();
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  }

  async function toggleShortcut(id: string, enabled: boolean, keys: string) {
    try {
      await updateShortcuts.mutateAsync({
        data: [{ id, keys, enabled }],
      });
      refetchShortcuts();
      toast({ title: enabled ? "Shortcut enabled" : "Shortcut disabled" });
    } catch {
      toast({ title: "Failed to update shortcut", variant: "destructive" });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex-1 overflow-auto"
    >
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ color: "hsl(var(--foreground))", letterSpacing: "-0.02em" }}
            >
              Settings
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Configure your FlowDesk experience
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={saveSettings}
            disabled={updateSettings.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 0 20px hsl(var(--primary) / 0.2)",
            }}
          >
            <Save size={14} />
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>

        <div className="space-y-4">
          {/* General */}
          <Section title="General" icon={Globe}>
            <SettingRow label="Theme" description="Choose your preferred color scheme">
              <div className="flex items-center gap-1.5">
                {["dark", "light", "system"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setLocalSettings((s) => ({ ...s, theme: t }))}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer capitalize transition-all"
                    style={{
                      background: localSettings.theme === t ? "hsl(243,75%,65%,0.15)" : "hsl(var(--muted))",
                      color: localSettings.theme === t ? "hsl(243,75%,65%)" : "hsl(var(--muted-foreground))",
                      border: `1px solid ${localSettings.theme === t ? "hsl(243,75%,65%,0.3)" : "transparent"}`,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Language" description="Application display language">
              <select
                value={localSettings.language}
                onChange={(e) => setLocalSettings((s) => ({ ...s, language: e.target.value }))}
                className="px-3 py-1.5 rounded-lg text-sm outline-none cursor-pointer"
                style={{
                  background: "hsl(var(--muted))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="es">Spanish</option>
              </select>
            </SettingRow>
            <SettingRow label="Clipboard History Limit" description="Maximum number of clipboard items to keep">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localSettings.clipboardHistoryLimit}
                  onChange={(e) => setLocalSettings((s) => ({ ...s, clipboardHistoryLimit: parseInt(e.target.value) || 100 }))}
                  className="w-20 px-3 py-1.5 rounded-lg text-sm text-center outline-none"
                  style={{
                    background: "hsl(var(--muted))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  min={10}
                  max={1000}
                />
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>items</span>
              </div>
            </SettingRow>
          </Section>

          {/* System */}
          <Section title="System Integration" icon={Monitor}>
            <SettingRow label="Launch at startup" description="Start FlowDesk automatically when your computer boots">
              <Toggle checked={localSettings.autoStart} onChange={(v) => setLocalSettings((s) => ({ ...s, autoStart: v }))} />
            </SettingRow>
            <SettingRow label="Minimize to system tray" description="Keep FlowDesk running in the background">
              <Toggle checked={localSettings.minimizeToTray} onChange={(v) => setLocalSettings((s) => ({ ...s, minimizeToTray: v }))} />
            </SettingRow>
            <SettingRow label="Show in dock" description="Display FlowDesk icon in the application dock">
              <Toggle checked={localSettings.showInDock} onChange={(v) => setLocalSettings((s) => ({ ...s, showInDock: v }))} />
            </SettingRow>
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon={Bell}>
            <SettingRow label="Enable notifications" description="Receive alerts for command executions and system events">
              <Toggle checked={localSettings.notifications} onChange={(v) => setLocalSettings((s) => ({ ...s, notifications: v }))} />
            </SettingRow>
          </Section>

          {/* Shortcuts */}
          <Section title="Keyboard Shortcuts" icon={Keyboard}>
            {shortcuts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>No shortcuts configured</p>
              </div>
            ) : (
              shortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between px-5 py-3.5 gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{shortcut.name}</p>
                    {shortcut.description && (
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{shortcut.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <kbd
                      className="px-2.5 py-1 rounded-lg text-xs font-mono"
                      style={{
                        background: "hsl(var(--muted))",
                        color: "hsl(var(--foreground))",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "inset 0 -1px 0 hsl(var(--border))",
                      }}
                    >
                      {shortcut.keys}
                    </kbd>
                    <Toggle
                      checked={shortcut.enabled}
                      onChange={(v) => toggleShortcut(shortcut.id, v, shortcut.keys)}
                    />
                  </div>
                </div>
              ))
            )}
          </Section>

          {/* Privacy */}
          <Section title="Privacy & Security" icon={Shield}>
            <SettingRow label="Global keyboard shortcut" description="Allow FlowDesk to listen for global shortcuts system-wide">
              <Toggle checked={localSettings.globalShortcutEnabled} onChange={(v) => setLocalSettings((s) => ({ ...s, globalShortcutEnabled: v }))} />
            </SettingRow>
            <SettingRow label="Analytics" description="Help improve FlowDesk by sharing anonymous usage data">
              <Toggle checked={localSettings.analyticsEnabled} onChange={(v) => setLocalSettings((s) => ({ ...s, analyticsEnabled: v }))} />
            </SettingRow>
          </Section>

          {/* App info */}
          <div
            className="rounded-xl px-5 py-4 flex items-center justify-between"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>FlowDesk Professional</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Version 1.0.0 — Build 2026.04</p>
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: "hsl(168,72%,52%,0.12)", color: "hsl(168,72%,52%)" }}
            >
              Up to date
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
