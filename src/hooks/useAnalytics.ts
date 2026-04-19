import { useMemo } from "react";
import { getMoodCategory } from "@/types/mood";
import type { MoodEntry } from "@/types/mood";

export type Period = "7d" | "30d" | "90d" | "all";

export interface AnalyticsStats {
  avg: number;
  highest: number;
  lowest: number;
  trend: number;
  total: number;
  topTags: [string, number][];
  dayAvgs: { day: number; avg: number; count: number }[];
  cats: Record<"great" | "good" | "okay" | "low" | "bad", number>;
  weeklyData: { label: string; avg: number }[];
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

export function useAnalytics(entries: MoodEntry[], period: Period, enabled: boolean): AnalyticsStats | null {
  return useMemo<AnalyticsStats | null>(() => {
    if (!enabled || entries.length === 0) return null;

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

    const mid = Math.floor(filtered.length / 2);
    const firstHalf = filtered.slice(mid);
    const secondHalf = filtered.slice(0, mid);
    const firstAvg = firstHalf.length ? firstHalf.reduce((s, e) => s + e.mood, 0) / firstHalf.length : avg;
    const secondAvg = secondHalf.length ? secondHalf.reduce((s, e) => s + e.mood, 0) / secondHalf.length : avg;
    const trend = secondAvg - firstAvg;

    const tagCounts: Record<string, number> = {};
    filtered.forEach((e) => e.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5) as [string, number][];

    const dayMoods: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    filtered.forEach((e) => {
      dayMoods[new Date(e.date).getDay()].push(e.mood);
    });
    const dayAvgs = Object.entries(dayMoods).map(([day, ms]) => ({
      day: Number(day),
      avg: ms.length ? ms.reduce((s, m) => s + m, 0) / ms.length : 0,
      count: ms.length,
    }));

    const cats: AnalyticsStats["cats"] = { great: 0, good: 0, okay: 0, low: 0, bad: 0 };
    filtered.forEach((e) => { cats[getMoodCategory(e.mood)]++; });

    const weeklyData = getWeeklyData(filtered);

    return { avg, highest, lowest, trend, total: filtered.length, topTags, dayAvgs, cats, weeklyData };
  }, [entries, period, enabled]);
}

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
