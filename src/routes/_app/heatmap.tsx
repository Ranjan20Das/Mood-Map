import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMoodEntries } from "@/hooks/useMoodEntries";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils";
import { getMoodColorClass, MOOD_EMOJIS, getMoodCategory } from "@/types/mood";
import type { MoodEntry } from "@/types/mood";

export const Route = createFileRoute("/_app/heatmap")({
  head: () => ({
    meta: [
      { title: "Mood Heatmap — MoodMap" },
      { name: "description", content: "Visualize your mood patterns with a GitHub-style heatmap calendar." },
      { property: "og:title", content: "Mood Heatmap — MoodMap" },
      { property: "og:description", content: "See your mood patterns on a visual calendar." },
    ],
  }),
  component: HeatmapPage,
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function HeatmapPage() {
  const { entries } = useMoodEntries();
  const [monthOffset, setMonthOffset] = useState(0);

  const { year, month, grid, stats } = useMemo(() => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const y = target.getFullYear();
    const m = target.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const firstDayOfWeek = (new Date(y, m, 1).getDay() + 6) % 7; // Mon=0

    const entryMap = new Map<string, MoodEntry>();
    entries.forEach((e) => entryMap.set(e.date, e));

    const grid: { date: string; day: number; mood: number | null; inMonth: boolean }[] = [];

    // Padding for start of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push({ date: "", day: 0, mood: null, inMonth: false });
    }

    let totalMood = 0;
    let loggedDays = 0;
    const catCounts: Record<string, number> = { great: 0, good: 0, okay: 0, low: 0, bad: 0 };

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const entry = entryMap.get(dateStr);
      const mood = entry?.mood ?? null;

      if (mood !== null) {
        totalMood += mood;
        loggedDays++;
        catCounts[getMoodCategory(mood)]++;
      }

      grid.push({ date: dateStr, day: d, mood, inMonth: true });
    }

    return {
      year: y,
      month: m,
      grid,
      stats: {
        avgMood: loggedDays > 0 ? totalMood / loggedDays : null,
        loggedDays,
        totalDays: daysInMonth,
        catCounts,
      },
    };
  }, [entries, monthOffset]);

  const monthName = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isCurrentMonth = monthOffset === 0;

  return (
    <div className="px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="font-heading text-2xl font-bold text-foreground">Mood Heatmap</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your emotional patterns over time</p>
      </motion.div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonthOffset((o) => o - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border text-foreground hover:bg-muted"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-heading text-base font-semibold text-foreground">{monthName}</h3>
        <button
          onClick={() => setMonthOffset((o) => o + 1)}
          disabled={isCurrentMonth}
          className="flex h-10 w-10 items-center justify-center rounded-xl border text-foreground hover:bg-muted disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <motion.div
        key={monthOffset}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border bg-card p-4"
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell, i) => (
            <div
              key={i}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-lg text-xs transition-all",
                !cell.inMonth && "invisible",
                cell.inMonth && cell.mood
                  ? cn(getMoodColorClass(cell.mood), "text-white font-medium shadow-sm")
                  : cell.inMonth
                    ? "bg-muted/40 text-muted-foreground"
                    : ""
              )}
              title={
                cell.mood
                  ? `${cell.date}: ${cell.mood}/10 ${MOOD_EMOJIS[cell.mood]}`
                  : cell.date
              }
            >
              {cell.inMonth && cell.day}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-1">
          <div className="h-4 w-4 rounded bg-mood-bad" />
          <div className="h-4 w-4 rounded bg-mood-low" />
          <div className="h-4 w-4 rounded bg-mood-okay" />
          <div className="h-4 w-4 rounded bg-mood-good" />
          <div className="h-4 w-4 rounded bg-mood-great" />
        </div>
        <span>High</span>
        <div className="ml-2 h-4 w-4 rounded bg-muted/40" />
        <span>No data</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {stats.avgMood !== null ? stats.avgMood.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Avg. Mood</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {stats.loggedDays}/{stats.totalDays}
          </p>
          <p className="text-xs text-muted-foreground">Days Logged</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.loggedDays > 0 && (
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <h4 className="font-heading text-sm font-semibold text-foreground">Breakdown</h4>
          {(["great", "good", "okay", "low", "bad"] as const).map((cat) => {
            const count = stats.catCounts[cat];
            const pct = stats.loggedDays > 0 ? (count / stats.loggedDays) * 100 : 0;
            const colorMap: Record<string, string> = {
              great: "bg-mood-great",
              good: "bg-mood-good",
              okay: "bg-mood-okay",
              low: "bg-mood-low",
              bad: "bg-mood-bad",
            };
            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize text-foreground">{cat}</span>
                  <span className="text-muted-foreground">
                    {count} day{count !== 1 ? "s" : ""} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={cn("h-2 rounded-full", colorMap[cat])}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
