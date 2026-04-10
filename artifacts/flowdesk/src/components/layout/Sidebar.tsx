import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Terminal,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Moon,
  Sun,
} from "lucide-react";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  shortcut: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", shortcut: "1" },
  { icon: Terminal, label: "Command Center", path: "/commands", shortcut: "2" },
  { icon: History, label: "History", path: "/history", shortcut: "3" },
  { icon: Settings, label: "Settings", path: "/settings", shortcut: "," },
];

interface SidebarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Sidebar({ isDark, onToggleTheme }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full flex-shrink-0 overflow-hidden"
      style={{
        background: "hsl(var(--sidebar))",
        borderRight: "1px solid hsl(var(--sidebar-border))",
      }}
    >
      {/* Header */}
      <div className="flex items-center h-14 px-3 flex-shrink-0" style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, hsl(243,75%,65%) 0%, hsl(280,70%,62%) 100%)",
              boxShadow: "0 0 12px hsl(243,75%,65%,0.3)",
            }}
          >
            <Zap size={13} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-semibold text-sm tracking-tight whitespace-nowrap overflow-hidden"
                style={{ color: "hsl(var(--sidebar-foreground))", letterSpacing: "-0.01em" }}
              >
                FlowDesk
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-hidden">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          return (
            <Link key={item.path} href={item.path}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors relative group"
                style={{
                  background: isActive ? "hsl(var(--sidebar-primary) / 0.12)" : "transparent",
                  color: isActive ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground))",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "hsl(var(--sidebar-primary))" }}
                  />
                )}
                <item.icon size={16} className="flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && !isActive && (
                  <span
                    className="ml-auto text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    ⌘{item.shortcut}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 space-y-0.5 flex-shrink-0" style={{ borderTop: "1px solid hsl(var(--sidebar-border))", paddingTop: "8px" }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleTheme}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg w-full transition-colors cursor-pointer"
          style={{ color: "hsl(var(--sidebar-foreground))" }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="text-sm"
              >
                {isDark ? "Light mode" : "Dark mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2.5 py-1.5"
            >
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                v1.0.0 — Professional
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-14 -right-3 w-6 h-6 rounded-full flex items-center justify-center border cursor-pointer z-10"
        style={{
          background: "hsl(var(--sidebar))",
          borderColor: "hsl(var(--sidebar-border))",
          color: "hsl(var(--muted-foreground))",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
      </motion.button>
    </motion.aside>
  );
}
