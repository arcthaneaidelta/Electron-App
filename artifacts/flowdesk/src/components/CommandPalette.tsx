import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Search, Terminal, LayoutDashboard, History, Settings, ArrowRight, Zap } from "lucide-react";
import { useListCommands, useExecuteCommand } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const navActions = [
  { icon: LayoutDashboard, label: "Go to Dashboard", path: "/dashboard" },
  { icon: Terminal, label: "Go to Command Center", path: "/commands" },
  { icon: History, label: "Go to History", path: "/history" },
  { icon: Settings, label: "Go to Settings", path: "/settings" },
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: commands = [] } = useListCommands(
    { search: query },
    { query: { enabled: open } }
  );

  const executeMutation = useExecuteCommand();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredNav = navActions.filter((a) =>
    query ? a.label.toLowerCase().includes(query.toLowerCase()) : true
  );

  const filteredCommands = commands.filter((c) =>
    query ? c.name.toLowerCase().includes(query.toLowerCase()) : true
  ).slice(0, 6);

  function handleNavAction(path: string) {
    navigate(path);
    onClose();
  }

  async function handleRunCommand(id: string, name: string) {
    try {
      await executeMutation.mutateAsync({ id });
      toast({ title: `Executing: ${name}`, description: "Command is running..." });
      onClose();
    } catch {
      toast({ title: "Execution failed", variant: "destructive" });
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
              className="pointer-events-auto w-full max-w-xl mx-4 rounded-2xl overflow-hidden"
              style={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--popover-border))",
                boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px hsl(243,75%,65%,0.1)",
              }}
            >
              {/* Search */}
              <div
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
              >
                <Search size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands, navigate pages..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "hsl(var(--foreground))" }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") onClose();
                  }}
                />
                <kbd
                  className="text-xs px-1.5 py-0.5 rounded-md"
                  style={{
                    background: "hsl(var(--muted))",
                    color: "hsl(var(--muted-foreground))",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  Esc
                </kbd>
              </div>

              {/* Results */}
              <div className="py-2 max-h-80 overflow-y-auto">
                {filteredNav.length > 0 && (
                  <div>
                    <p
                      className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      Navigation
                    </p>
                    {filteredNav.map((item) => (
                      <motion.button
                        key={item.path}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavAction(item.path)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors cursor-pointer"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        <item.icon size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
                        <span>{item.label}</span>
                        <ArrowRight size={12} className="ml-auto" style={{ color: "hsl(var(--muted-foreground))" }} />
                      </motion.button>
                    ))}
                  </div>
                )}

                {filteredCommands.length > 0 && (
                  <div className={filteredNav.length > 0 ? "mt-2" : ""}>
                    <p
                      className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      Commands
                    </p>
                    {filteredCommands.map((cmd) => (
                      <motion.button
                        key={cmd.id}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRunCommand(cmd.id, cmd.name)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors cursor-pointer"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        <Zap size={14} style={{ color: "hsl(243,75%,65%)" }} />
                        <span>{cmd.name}</span>
                        <span
                          className="ml-auto text-xs"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          Run
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {!filteredNav.length && !filteredCommands.length && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                      No results for "{query}"
                    </p>
                  </div>
                )}
              </div>

              <div
                className="flex items-center justify-between px-4 py-2.5 text-xs"
                style={{
                  borderTop: "1px solid hsl(var(--border))",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <span>Press Enter to select</span>
                <span>Cmd+K to toggle</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
