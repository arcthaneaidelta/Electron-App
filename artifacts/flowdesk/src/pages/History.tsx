import { motion } from "framer-motion";
import { useState } from "react";
import { Search, CheckCircle, AlertCircle, AlertTriangle, Clock, Filter, X } from "lucide-react";
import { useListHistory, useGetHistorySummary } from "@workspace/api-client-react";

function SummaryChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{ background: `${color}10`, border: `1px solid ${color}22` }}
    >
      <span className="text-lg font-bold" style={{ color }}>
        {value.toLocaleString()}
      </span>
      <span className="text-xs" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  success: { bg: "hsl(168,72%,52%,0.12)", text: "hsl(168,72%,52%)", icon: CheckCircle },
  error: { bg: "hsl(0,72%,51%,0.12)", text: "hsl(0,72%,51%)", icon: AlertCircle },
  warning: { bg: "hsl(38,85%,60%,0.12)", text: "hsl(38,85%,60%)", icon: AlertTriangle },
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual",
  shortcut: "Shortcut",
  schedule: "Schedule",
  api: "API",
};

export default function History() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: summary } = useGetHistorySummary();
  const { data, isLoading } = useListHistory({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function formatTime(ts: string) {
    const d = new Date(ts);
    return d.toLocaleString("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDuration(ms: number) {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex-1 overflow-auto"
    >
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: "hsl(var(--foreground))", letterSpacing: "-0.02em" }}
          >
            History
          </h1>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Complete execution log and audit trail
          </p>
        </div>

        {/* Summary chips */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex flex-wrap gap-3 mb-6"
          >
            <SummaryChip label="Total" value={summary.totalExecutions} color="hsl(243,75%,65%)" />
            <SummaryChip label="Success" value={summary.successCount} color="hsl(168,72%,52%)" />
            <SummaryChip label="Errors" value={summary.errorCount} color="hsl(0,72%,51%)" />
            <SummaryChip label="Warnings" value={summary.warningCount} color="hsl(38,85%,60%)" />
            {summary.mostUsedCommand && summary.mostUsedCommand !== "None" && (
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
              >
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Most used:</span>
                <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>
                  {summary.mostUsedCommand}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div
            className="flex items-center gap-2 flex-1 px-3.5 py-2.5 rounded-xl"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
          >
            <Search size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by command name..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "hsl(var(--foreground))" }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="cursor-pointer" style={{ color: "hsl(var(--muted-foreground))" }}>
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} style={{ color: "hsl(var(--muted-foreground))" }} />
            {["", "success", "error", "warning"].map((s) => (
              <button
                key={s || "all"}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all capitalize"
                style={{
                  background: statusFilter === s ? "hsl(243,75%,65%,0.15)" : "hsl(var(--card))",
                  color: statusFilter === s ? "hsl(243,75%,65%)" : "hsl(var(--muted-foreground))",
                  border: `1px solid ${statusFilter === s ? "hsl(243,75%,65%,0.25)" : "hsl(var(--card-border))"}`,
                }}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="relative"
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 animate-pulse"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: "hsl(var(--muted))" }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 rounded w-1/3" style={{ background: "hsl(var(--muted))" }} />
                      <div className="h-3 rounded w-1/4" style={{ background: "hsl(var(--muted))" }} />
                    </div>
                    <div className="w-14 h-5 rounded-full" style={{ background: "hsl(var(--muted))" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
              >
                <Clock size={24} style={{ color: "hsl(var(--muted-foreground))" }} />
              </div>
              <p className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>No history found</p>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {search || statusFilter ? "Try adjusting your filters" : "Execute commands to see history here"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, i) => {
                const sc = STATUS_COLORS[entry.status] ?? STATUS_COLORS.success;
                const Icon = sc.icon;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                    className="rounded-xl px-4 py-3.5 group transition-colors cursor-default"
                    style={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--card-border))",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: sc.bg }}
                      >
                        <Icon size={14} style={{ color: sc.text }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: "hsl(var(--foreground))" }}
                          >
                            {entry.commandName ?? entry.type}
                          </p>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              background: "hsl(var(--muted))",
                              color: "hsl(var(--muted-foreground))",
                            }}
                          >
                            {TRIGGER_LABELS[entry.triggeredBy] ?? entry.triggeredBy}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {entry.output?.substring(0, 80) || entry.error?.substring(0, 80) || ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDuration(entry.executionTime)}
                        </span>
                        <span className="hidden sm:block">{formatTime(entry.timestamp)}</span>
                        <span
                          className="px-2 py-0.5 rounded-full capitalize font-medium"
                          style={{ background: sc.bg, color: sc.text }}
                        >
                          {entry.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all disabled:opacity-40"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", color: "hsl(var(--foreground))" }}
                >
                  Previous
                </button>
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all disabled:opacity-40"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", color: "hsl(var(--foreground))" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
