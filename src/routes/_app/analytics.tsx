import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from "lucide-react";
import { useMoodEntries } from "@/hooks/useMoodEntries";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils";
import { MOOD_EMOJIS, getMoodColorClass, getMoodCategory } from "@/types/mood";
import type { MoodEntry } from "@/types/mood";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — MoodMap" },
      { name: "description", content: "View your mood trends, charts, and emotional insights over time." },
      { property: "og:title", content: "Analytics — MoodMap" },
      { property: "og:description", content: "Discover your mood patterns and emotional trends." },
    ],
  }),
  component: AnalyticsPage,
});

type Period = "7d" | "30d" | "90d" | "all";

function AnalyticsPage() {
  const hydrated = useHydrated();
  const { entries } = useMoodEntries();
  const [period, setPeriod] = useState<Period>("30d");

  const stats = useMemo(() => {
    if (!hydrated || entries.length === 0) return null;

    const now = new Date();
    const cutoff = new Date();
    if (period === "7d") cutoff.setDate(now.getDate() - 7);
    else if (period === "30d") cutoff.setDate(now.getDate() - 30);
    else if (period === "90d") cutoff.setDate(now.getDate() - 90);
    else cutoff.setFullYear(2000);

    const cutoffStr = cutoff.toISOString().split("T")[0];
    const filtered = entries.filter((e) => e.date >= cutoffStr);
    if (filtered.length === 0) return null;

    const avg = filtered.reduce((s, e) => s + e.mood, 0) / filtered.length;
    const moods = filtered.map((e) => e.mood);
    const highest = Math.max(...moods);
    const lowest = Math.min(...moods);

    // Trend: compare first half to second half
    const mid = Math.floor(filtered.length / 2);
    const firstHalf = filtered.slice(mid);
    const secondHalf = filtered.slice(0, mid);
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((s, e) => s + e.mood, 0) / firstHalf.length : avg;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((s, e) => s + e.mood, 0) / secondHalf.length : avg;
    const trend = secondAvg - firstAvg;

    // Most common tags
    const tagCounts: Record<string, number> = {};
    filtered.forEach((e) => e.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Day of week breakdown
    const dayMoods: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    filtered.forEach((e) => {
      const day = new Date(e.date).getDay();
      dayMoods[day].push(e.mood);
    });
    const dayAvgs = Object.entries(dayMoods).map(([day, moods]) => ({
      day: Number(day),
      avg: moods.length > 0 ? moods.reduce((s, m) => s + m, 0) / moods.length : 0,
      count: moods.length,
    }));

    // Category breakdown
    const cats: Record<string, number> = { great: 0, good: 0, okay: 0, low: 0, bad: 0 };
    filtered.forEach((e) => { cats[getMoodCategory(e.mood)]++; });

    // Weekly chart data (last N weeks)
    const weeklyData = getWeeklyData(filtered);

    return { avg, highest, lowest, trend, total: filtered.length, topTags, dayAvgs, cats, weeklyData };
  }, [entries, period, hydrated]);

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold text-foreground">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your emotional insights at a glance</p>
      </motion.div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {([["7d", "7 Days"], ["30d", "30 Days"], ["90d", "90 Days"], ["all", "All"]] as [Period, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                period === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {label}
            </button>
          )
        )}
      </div>

      {!hydrated || !stats ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {hydrated ? "No entries in this period. Start logging!" : "Loading..."}
          </p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Average Mood" value={stats.avg.toFixed(1)} emoji={MOOD_EMOJIS[Math.round(stats.avg)]} />
            <StatCard
              label="Trend"
              value={stats.trend > 0 ? `+${stats.trend.toFixed(1)}` : stats.trend.toFixed(1)}
              icon={
                stats.trend > 0.3 ? (
                  <TrendingUp className="h-4 w-4 text-secondary" />
                ) : stats.trend < -0.3 ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )
              }
            />
            <StatCard label="Highest" value={`${stats.highest}/10`} emoji={MOOD_EMOJIS[stats.highest]} />
            <StatCard label="Entries" value={String(stats.total)} icon={<Calendar className="h-4 w-4 text-primary" />} />
          </div>

          {/* Weekly Mood Chart */}
          {stats.weeklyData.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border bg-card p-5"
            >
              <h3 className="mb-4 font-heading text-sm font-semibold text-foreground">Weekly Trend</h3>
              <div className="flex items-end gap-1 h-32">
                {stats.weeklyData.map((week, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{week.avg.toFixed(1)}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(week.avg / 10) * 100}%` }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className={cn("w-full rounded-t-md min-h-[4px]", getMoodColorClass(Math.round(week.avg)))}
                    />
                    <span className="text-[9px] text-muted-foreground">{week.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Day of Week */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border bg-card p-5"
          >
            <h3 className="mb-4 font-heading text-sm font-semibold text-foreground">By Day of Week</h3>
            <div className="flex items-end gap-1.5 h-24">
              {stats.dayAvgs.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: d.avg > 0 ? `${(d.avg / 10) * 100}%` : "4px" }}
                    transition={{ duration: 0.4, delay: d.day * 0.05 }}
                    className={cn(
                      "w-full rounded-t-md min-h-[4px]",
                      d.avg > 0 ? getMoodColorClass(Math.round(d.avg)) : "bg-muted/40"
                    )}
                  />
                  <span className="text-[10px] text-muted-foreground">{DAYS[d.day]}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mood Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border bg-card p-5 space-y-3"
          >
            <h3 className="font-heading text-sm font-semibold text-foreground">Mood Breakdown</h3>
            {(["great", "good", "okay", "low", "bad"] as const).map((cat) => {
              const count = stats.cats[cat];
              const pct = (count / stats.total) * 100;
              const colorMap: Record<string, string> = {
                great: "bg-mood-great", good: "bg-mood-good", okay: "bg-mood-okay",
                low: "bg-mood-low", bad: "bg-mood-bad",
              };
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize text-foreground">{cat}</span>
                    <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn("h-2 rounded-full", colorMap[cat])}
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Top Tags */}
          {stats.topTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border bg-card p-5"
            >
              <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">Top Tags</h3>
              <div className="space-y-2">
                {stats.topTags.map(([tag, count]) => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{tag}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border bg-accent/5 p-5 space-y-2"
          >
            <h3 className="font-heading text-sm font-semibold text-foreground">💡 Insights</h3>
            <InsightsList stats={stats} days={DAYS} />
          </motion.div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, emoji, icon }: { label: string; value: string; emoji?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 text-center">
      <div className="flex items-center justify-center gap-1.5">
        {emoji && <span className="text-lg">{emoji}</span>}
        {icon}
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InsightsList({ stats, days }: { stats: any; days: string[] }) {
  const insights: string[] = [];

  if (stats.trend > 0.5) insights.push("Your mood is trending upward! Keep it up 🚀");
  else if (stats.trend < -0.5) insights.push("Your mood has been dipping — consider some extra self-care 💜");

  const bestDay = stats.dayAvgs.reduce((a: any, b: any) => (b.avg > a.avg && b.count > 0 ? b : a), stats.dayAvgs[0]);
  const worstDay = stats.dayAvgs.reduce((a: any, b: any) => (b.avg < a.avg && b.count > 0 ? b : a), stats.dayAvgs[0]);
  if (bestDay.count > 0) insights.push(`Your best day is usually ${days[bestDay.day]} (avg ${bestDay.avg.toFixed(1)})`);
  if (worstDay.count > 0 && worstDay.day !== bestDay.day)
    insights.push(`${days[worstDay.day]} tends to be tougher (avg ${worstDay.avg.toFixed(1)})`);

  if (stats.topTags.length > 0)
    insights.push(`Your most logged tag is "${stats.topTags[0][0]}" — it seems important to you`);

  if (insights.length === 0) insights.push("Keep logging to unlock personalized insights!");

  return (
    <ul className="space-y-1.5">
      {insights.map((text, i) => (
        <li key={i} className="text-sm text-muted-foreground leading-relaxed">• {text}</li>
      ))}
    </ul>
  );
}

function getWeeklyData(entries: MoodEntry[]) {
  const weeks: Record<string, { total: number; count: number }> = {};
  entries.forEach((e) => {
    const d = new Date(e.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    if (!weeks[key]) weeks[key] = { total: 0, count: 0 };
    weeks[key].total += e.mood;
    weeks[key].count++;
  });

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([key, { total, count }]) => ({
      label: new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      avg: total / count,
    }));
}
