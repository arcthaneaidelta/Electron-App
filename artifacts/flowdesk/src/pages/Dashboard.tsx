import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Terminal,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  useGetDashboardStats,
  useGetDashboardActivity,
  useGetDashboardChartData,
} from "@workspace/api-client-react";

function CountUp({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps = 40;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setValue(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{value.toLocaleString()}</>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
  index,
}: {
  icon: typeof Terminal;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  index: number;
}) {
  const isNumeric = typeof value === "number";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="rounded-xl p-5 relative overflow-hidden group cursor-default"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--card-border))",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${color}08 0%, transparent 70%)`,
        }}
      />
      <div className="relative flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <TrendingUp size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
      </div>
      <div className="relative">
        <p
          className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: "hsl(var(--foreground))", letterSpacing: "-0.02em" }}
        >
          {isNumeric ? <CountUp target={value as number} /> : value}
        </p>
        <p className="text-sm font-medium mb-0.5" style={{ color: "hsl(var(--foreground))" }}>
          {label}
        </p>
        {subtitle && (
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ActivityBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: "hsl(168,72%,52%,0.15)", text: "hsl(168,72%,52%)" },
    error: { bg: "hsl(0,72%,51%,0.15)", text: "hsl(0,72%,51%)" },
    warning: { bg: "hsl(38,85%,60%,0.15)", text: "hsl(38,85%,60%)" },
    info: { bg: "hsl(243,75%,65%,0.15)", text: "hsl(243,75%,65%)" },
  };
  const c = colors[status] ?? colors.info;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
      style={{ background: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5 animate-pulse"
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
    >
      <div className="w-9 h-9 rounded-lg mb-4" style={{ background: "hsl(var(--muted))" }} />
      <div className="h-7 w-16 rounded mb-2" style={{ background: "hsl(var(--muted))" }} />
      <div className="h-4 w-24 rounded" style={{ background: "hsl(var(--muted))" }} />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: "hsl(var(--popover))",
        border: "1px solid hsl(var(--popover-border))",
        boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
      }}
    >
      <p className="font-medium mb-2" style={{ color: "hsl(var(--foreground))" }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: i === 0 ? "hsl(243,75%,65%)" : "hsl(0,72%,51%)" }}
          />
          <span style={{ color: "hsl(var(--muted-foreground))" }}>{p.name}:</span>
          <span style={{ color: "hsl(var(--foreground))" }} className="font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity = [], isLoading: activityLoading } = useGetDashboardActivity({ limit: 8 });
  const { data: chartData = [] } = useGetDashboardChartData();

  const statCards = stats
    ? [
        { icon: Terminal, label: "Total Commands", value: stats.totalCommands, subtitle: `${stats.activeWorkflows} active workflows`, color: "hsl(243,75%,65%)" },
        { icon: Zap, label: "Executions Today", value: stats.executionsToday, subtitle: `${stats.executionsThisWeek} this week`, color: "hsl(168,72%,52%)" },
        { icon: CheckCircle, label: "Success Rate", value: `${stats.successRate}%`, subtitle: "Last 30 days", color: "hsl(168,72%,52%)" },
        { icon: Clock, label: "Avg Execution", value: `${stats.avgExecutionTime}ms`, subtitle: "Mean response time", color: "hsl(38,85%,60%)" },
      ]
    : [];

  function formatTime(ts: string) {
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex-1 overflow-auto"
    >
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-7"
        >
          <h1
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: "hsl(var(--foreground))", letterSpacing: "-0.02em" }}
          >
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            System overview and recent activity
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : statCards.map((s, i) => <StatCard key={i} {...s} index={i} />)}
        </div>

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="lg:col-span-2 rounded-xl p-5"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--card-border))",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2
                  className="font-semibold text-sm"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Execution Activity
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Last 14 days
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: "hsl(243,75%,65%)" }} />
                  Executions
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: "hsl(0,72%,51%)" }} />
                  Errors
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="execGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(243,75%,65%)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(243,75%,65%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0,72%,51%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(0,72%,51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="executions"
                  name="Executions"
                  stroke="hsl(243,75%,65%)"
                  strokeWidth={2}
                  fill="url(#execGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(243,75%,65%)", strokeWidth: 0 }}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  name="Errors"
                  stroke="hsl(0,72%,51%)"
                  strokeWidth={1.5}
                  fill="url(#errGrad)"
                  dot={false}
                  activeDot={{ r: 3, fill: "hsl(0,72%,51%)", strokeWidth: 0 }}
                  isAnimationActive={true}
                  animationDuration={1400}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-xl p-5 flex flex-col"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--card-border))",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>
                Recent Activity
              </h2>
              <Activity size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
            </div>

            <div className="flex-1 space-y-1 overflow-auto">
              {activityLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 animate-pulse">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: "hsl(var(--muted))" }} />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 rounded w-3/4" style={{ background: "hsl(var(--muted))" }} />
                        <div className="h-2.5 rounded w-1/2" style={{ background: "hsl(var(--muted))" }} />
                      </div>
                    </div>
                  ))
                : activity.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className="flex items-start gap-3 py-2.5 group"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background:
                            item.status === "success"
                              ? "hsl(168,72%,52%,0.12)"
                              : item.status === "error"
                              ? "hsl(0,72%,51%,0.12)"
                              : "hsl(38,85%,60%,0.12)",
                        }}
                      >
                        {item.status === "success" ? (
                          <CheckCircle size={12} style={{ color: "hsl(168,72%,52%)" }} />
                        ) : item.status === "error" ? (
                          <AlertCircle size={12} style={{ color: "hsl(0,72%,51%)" }} />
                        ) : (
                          <Zap size={12} style={{ color: "hsl(38,85%,60%)" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium truncate"
                          style={{ color: "hsl(var(--foreground))" }}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {formatTime(item.timestamp)}
                        </p>
                      </div>
                      <ActivityBadge status={item.status} />
                    </motion.div>
                  ))}
            </div>

            <div className="pt-3 mt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <button
                className="flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
                style={{ color: "hsl(var(--primary))" }}
                onClick={() => (window.location.href = "/history")}
              >
                View all activity
                <ArrowRight size={11} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
