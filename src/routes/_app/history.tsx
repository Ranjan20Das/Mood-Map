import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Edit3, X, ChevronDown } from "lucide-react";
import { useMoodEntries } from "@/hooks/useMoodEntries";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils";
import { MOOD_EMOJIS, MOOD_LABELS, getMoodColorClass, DEFAULT_TAGS } from "@/types/mood";
import type { MoodEntry } from "@/types/mood";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/history")({
  head: () => ({
    meta: [
      { title: "History — MoodMap" },
      { name: "description", content: "Browse, search, and manage all your past mood entries." },
      { property: "og:title", content: "History — MoodMap" },
      { property: "og:description", content: "View and manage your mood history." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const hydrated = useHydrated();
  const { entries, deleteEntry, updateEntry } = useMoodEntries();
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [moodFilter, setMoodFilter] = useState<"all" | "high" | "mid" | "low">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editJournal, setEditJournal] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  const filtered = useMemo(() => {
    if (!hydrated) return [];
    let result = entries;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.journal.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          e.date.includes(q)
      );
    }

    if (tagFilter) {
      result = result.filter((e) => e.tags.includes(tagFilter));
    }

    if (moodFilter === "high") result = result.filter((e) => e.mood >= 7);
    else if (moodFilter === "mid") result = result.filter((e) => e.mood >= 4 && e.mood <= 6);
    else if (moodFilter === "low") result = result.filter((e) => e.mood <= 3);

    return result;
  }, [entries, searchQuery, tagFilter, moodFilter, hydrated]);

  const visible = filtered.slice(0, visibleCount);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    toast.success("Entry deleted");
  };

  const startEdit = (entry: MoodEntry) => {
    setEditingId(entry.id);
    setEditJournal(entry.journal);
  };

  const saveEdit = (id: string) => {
    updateEntry(id, { journal: editJournal });
    setEditingId(null);
    toast.success("Entry updated");
  };

  // Collect all used tags for filter
  const usedTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [entries]);

  return (
    <div className="px-4 py-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold text-foreground">History</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {hydrated ? `${entries.length} total entries` : "Loading..."}
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries..."
          className="h-10 w-full rounded-xl border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-1 text-xs font-medium text-primary"
      >
        Filters
        <ChevronDown className={cn("h-3 w-3 transition-transform", showFilters && "rotate-180")} />
      </button>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            {/* Mood Filter */}
            <div className="flex gap-2">
              {([["all", "All"], ["high", "High (7-10)"], ["mid", "Mid (4-6)"], ["low", "Low (1-3)"]] as const).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setMoodFilter(key)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all",
                      moodFilter === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            {/* Tag Filter */}
            {usedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tagFilter && (
                  <button
                    onClick={() => setTagFilter(null)}
                    className="flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-[11px] font-medium"
                  >
                    {tagFilter} <X className="h-3 w-3" />
                  </button>
                )}
                {usedTags
                  .filter((t) => t !== tagFilter)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTagFilter(tag)}
                      className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted/80"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {(searchQuery || tagFilter || moodFilter !== "all") && (
        <p className="text-xs text-muted-foreground">{filtered.length} results</p>
      )}

      {/* Entry List */}
      {!hydrated ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {entries.length === 0 ? "No entries yet" : "No entries match your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="rounded-2xl border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl",
                    getMoodColorClass(entry.mood),
                    "bg-opacity-20"
                  )}
                >
                  {MOOD_EMOJIS[entry.mood]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {MOOD_LABELS[entry.mood]} · {entry.mood}/10
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(entry.date)}
                    </span>
                  </div>

                  {editingId === entry.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editJournal}
                        onChange={(e) => setEditJournal(e.target.value)}
                        className="w-full rounded-xl border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        rows={3}
                        maxLength={2000}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(entry.id)}
                          className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    entry.journal && (
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {entry.journal}
                      </p>
                    )
                  )}

                  {entry.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {editingId !== entry.id && (
                <div className="mt-3 flex justify-end gap-2 border-t pt-2">
                  <button
                    onClick={() => startEdit(entry)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}

          {/* Load More */}
          {visibleCount < filtered.length && (
            <button
              onClick={() => setVisibleCount((c) => c + 20)}
              className="w-full rounded-xl border bg-card py-3 text-sm font-medium text-primary hover:bg-muted transition-colors"
            >
              Load More ({filtered.length - visibleCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
