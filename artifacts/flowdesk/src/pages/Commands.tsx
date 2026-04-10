import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Terminal,
  Plus,
  Search,
  Play,
  Trash2,
  Edit2,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
} from "lucide-react";
import {
  useListCommands,
  useCreateCommand,
  useExecuteCommand,
  useDeleteCommand,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["All", "Productivity", "Development", "System", "Clipboard", "Writing", "Security"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string; label: string }> = {
    active: { bg: "hsl(168,72%,52%,0.12)", dot: "hsl(168,72%,52%)", label: "Active" },
    inactive: { bg: "hsl(var(--muted))", dot: "hsl(var(--muted-foreground))", label: "Inactive" },
    draft: { bg: "hsl(38,85%,60%,0.12)", dot: "hsl(38,85%,60%)", label: "Draft" },
  };
  const s = map[status] ?? map.inactive;
  return (
    <span
      className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: s.bg, color: s.dot }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function ExecuteButton({ id, name }: { id: string; name: string }) {
  const { toast } = useToast();
  const mutation = useExecuteCommand();
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    try {
      const result = await mutation.mutateAsync({ id });
      if (result.status === "success") {
        toast({ title: `Executed: ${name}`, description: `Completed in ${result.executionTime}ms` });
      } else {
        toast({ title: `Failed: ${name}`, description: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Execution failed", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={run}
      disabled={running}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
      style={{
        background: running ? "hsl(243,75%,65%,0.25)" : "hsl(243,75%,65%,0.15)",
        color: "hsl(243,75%,65%)",
        border: "1px solid hsl(243,75%,65%,0.2)",
        boxShadow: running ? "0 0 12px hsl(243,75%,65%,0.2)" : "none",
      }}
    >
      {running ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-3 h-3 border-2 rounded-full border-t-transparent"
          style={{ borderColor: "hsl(243,75%,65%)", borderTopColor: "transparent" }}
        />
      ) : (
        <Play size={11} />
      )}
      {running ? "Running..." : "Run"}
    </motion.button>
  );
}

function NewCommandModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const mutation = useCreateCommand();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "General",
    shortcut: "",
    script: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    try {
      await mutation.mutateAsync({ data: { ...form, tags: [] } });
      toast({ title: "Command created", description: form.name });
      onClose();
      setForm({ name: "", description: "", category: "General", shortcut: "", script: "" });
    } catch {
      toast({ title: "Failed to create command", variant: "destructive" });
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
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="pointer-events-auto w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--card-border))",
                boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
              >
                <h3 className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>
                  New Command
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg cursor-pointer transition-colors"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={submit} className="p-5 space-y-4">
                {[
                  { key: "name", label: "Name *", placeholder: "Screenshot to Clipboard" },
                  { key: "description", label: "Description", placeholder: "What does this command do?" },
                  { key: "shortcut", label: "Keyboard Shortcut", placeholder: "Cmd+Shift+S" },
                  { key: "script", label: "Script", placeholder: "echo hello" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {label}
                    </label>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                      style={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--input))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none cursor-pointer"
                      style={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--input))",
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      {["General", "Productivity", "Development", "System", "Clipboard", "Writing", "Security"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "hsl(var(--muted-foreground))" }} />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                    style={{
                      background: "hsl(var(--secondary))",
                      color: "hsl(var(--secondary-foreground))",
                    }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={mutation.isPending}
                    className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all"
                    style={{
                      background: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                    }}
                  >
                    {mutation.isPending ? "Creating..." : "Create Command"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Commands() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const { data: commands = [], isLoading, refetch } = useListCommands(
    { search: search || undefined, category: category !== "All" ? category : undefined },
  );

  const deleteMutation = useDeleteCommand();

  async function handleDelete(id: string, name: string) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Command deleted", description: name });
      refetch();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  function formatTime(ts?: string) {
    if (!ts) return "Never";
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
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
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ color: "hsl(var(--foreground))", letterSpacing: "-0.02em" }}
            >
              Command Center
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              {commands.length} commands configured
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 0 20px hsl(var(--primary) / 0.25)",
            }}
          >
            <Plus size={15} />
            New Command
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div
            className="flex items-center gap-2 flex-1 px-3.5 py-2.5 rounded-xl"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
          >
            <Search size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "hsl(var(--foreground))" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="cursor-pointer" style={{ color: "hsl(var(--muted-foreground))" }}>
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                style={{
                  background: category === cat ? "hsl(243,75%,65%,0.15)" : "hsl(var(--card))",
                  color: category === cat ? "hsl(243,75%,65%)" : "hsl(var(--muted-foreground))",
                  border: `1px solid ${category === cat ? "hsl(243,75%,65%,0.25)" : "hsl(var(--card-border))"}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Commands grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-5 animate-pulse"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl" style={{ background: "hsl(var(--muted))" }} />
                  <div className="w-16 h-5 rounded-full" style={{ background: "hsl(var(--muted))" }} />
                </div>
                <div className="space-y-2">
                  <div className="h-4 rounded w-3/4" style={{ background: "hsl(var(--muted))" }} />
                  <div className="h-3 rounded w-full" style={{ background: "hsl(var(--muted))" }} />
                  <div className="h-3 rounded w-2/3" style={{ background: "hsl(var(--muted))" }} />
                </div>
              </div>
            ))}
          </div>
        ) : commands.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))" }}
            >
              <Terminal size={28} style={{ color: "hsl(var(--muted-foreground))" }} />
            </div>
            <div className="text-center">
              <p className="font-semibold mb-1" style={{ color: "hsl(var(--foreground))" }}>No commands found</p>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {search ? `No results for "${search}"` : "Create your first command to get started"}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                <Plus size={14} />
                Create Command
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {commands.map((cmd, i) => (
                <motion.div
                  key={cmd.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="rounded-xl p-5 group relative overflow-hidden"
                  style={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--card-border))",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "radial-gradient(circle at 30% 30%, hsl(243,75%,65%,0.04) 0%, transparent 60%)",
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "hsl(243,75%,65%,0.12)" }}
                      >
                        <Terminal size={16} style={{ color: "hsl(243,75%,65%)" }} />
                      </div>
                      <StatusBadge status={cmd.status} />
                    </div>

                    <h3
                      className="font-semibold text-sm mb-1 truncate"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      {cmd.name}
                    </h3>
                    {cmd.description && (
                      <p
                        className="text-xs mb-3 line-clamp-2"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        {cmd.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <span className="flex items-center gap-1">
                        <Zap size={10} />
                        {cmd.executionCount} runs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(cmd.lastExecuted)}
                      </span>
                      {cmd.shortcut && (
                        <kbd
                          className="ml-auto px-1.5 py-0.5 rounded text-xs font-mono"
                          style={{
                            background: "hsl(var(--muted))",
                            color: "hsl(var(--muted-foreground))",
                            border: "1px solid hsl(var(--border))",
                          }}
                        >
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <ExecuteButton id={cmd.id} name={cmd.name} />
                      <button
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        style={{
                          color: "hsl(var(--muted-foreground))",
                          background: "hsl(var(--muted))",
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(cmd.id, cmd.name)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer ml-auto"
                        style={{ color: "hsl(0,72%,51%,0.7)", background: "hsl(0,72%,51%,0.08)" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <NewCommandModal open={showModal} onClose={() => { setShowModal(false); refetch(); }} />
    </motion.div>
  );
}
