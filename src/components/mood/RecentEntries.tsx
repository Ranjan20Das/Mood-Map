import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { MOOD_EMOJIS, getMoodColorClass } from "@/types/mood";
import type { MoodEntry } from "@/types/mood";
import { motion } from "framer-motion";

interface RecentEntriesProps {
  entries: MoodEntry[];
}

export function RecentEntries({ entries }: RecentEntriesProps) {
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

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const date = new Date(entry.date);
        const dayLabel = isToday(entry.date)
          ? "Today"
          : isYesterday(entry.date)
            ? "Yesterday"
            : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-xl border bg-card p-3"
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl text-lg",
                getMoodColorClass(entry.mood),
                "bg-opacity-20"
              )}
            >
              {MOOD_EMOJIS[entry.mood]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {entry.mood}/10
                </span>
                <span className="text-[11px] text-muted-foreground">{dayLabel}</span>
              </div>
              {entry.journal && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {entry.journal}
                </p>
              )}
              {entry.tags.length > 0 && (
                <div className="mt-1 flex gap-1">
                  {entry.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {entry.tags.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{entry.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
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
