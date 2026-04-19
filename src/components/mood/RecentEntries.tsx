import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOOD_EMOJIS, getMoodColorClass } from "@/types/mood";
import type { MoodEntry } from "@/types/mood";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeMood } from "@/hooks/useAI";

interface RecentEntriesProps {
  entries: MoodEntry[];
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  const { analyze, analyzingId } = useAnalyzeMood();
  const [localAi, setLocalAi] = useState<Record<string, MoodEntry>>({});

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">No entries yet. Start tracking!</p>
        <Link
          to="/entry"
          className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Log Your First Mood
        </Link>
      </div>
    );
  }

  const handleAnalyze = async (entry: MoodEntry) => {
    const res = await analyze(entry);
    if (res) {
      setLocalAi((p) => ({
        ...p,
        [entry.id]: {
          ...entry,
          aiEmotions: res.emotions,
          aiSentiment: res.sentiment,
          aiThemes: res.themes,
          aiSummary: res.summary,
          aiAnalyzedAt: new Date().toISOString(),
        },
      }));
    }
  };

  return (
    <div className="space-y-2">
      {entries.map((raw, i) => {
        const entry = localAi[raw.id] ?? raw;
        const date = new Date(entry.date);
        const dayLabel = isToday(entry.date)
          ? "Today"
          : isYesterday(entry.date)
            ? "Yesterday"
            : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const hasAi = Boolean(entry.aiSummary);
        const isAnalyzing = analyzingId === entry.id;
        const isLocal = entry.id.startsWith("local-");

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-xl border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-lg",
                  getMoodColorClass(entry.mood),
                  "bg-opacity-20",
                )}
              >
                {MOOD_EMOJIS[entry.mood]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{entry.mood}/10</span>
                  <span className="text-[11px] text-muted-foreground">{dayLabel}</span>
                </div>
                {entry.journal && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{entry.journal}</p>
                )}
                {entry.tags.length > 0 && (
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {entry.tags.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{entry.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              {!hasAi && !isLocal && (
                <button
                  onClick={() => handleAnalyze(entry)}
                  disabled={isAnalyzing}
                  className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 text-[11px] font-medium text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
                  aria-label="Analyze with AI"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {isAnalyzing ? "…" : "AI"}
                </button>
              )}
            </div>

            <AnimatePresence>
              {hasAi && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden rounded-lg border-l-2 border-primary/40 bg-primary/5 px-3 py-2"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    <Sparkles className="h-3 w-3" />
                    AI insight
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground">{entry.aiSummary}</p>
                  {(entry.aiEmotions?.length || entry.aiThemes?.length) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.aiEmotions?.slice(0, 4).map((e) => (
                        <span
                          key={`e-${e}`}
                          className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] text-secondary-foreground"
                        >
                          {e}
                        </span>
                      ))}
                      {entry.aiThemes?.slice(0, 3).map((t) => (
                        <span
                          key={`t-${t}`}
                          className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().split("T")[0];
}

function isYesterday(dateStr: string) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return dateStr === y.toISOString().split("T")[0];
}
