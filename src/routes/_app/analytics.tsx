import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useMoodEntries } from "@/hooks/useMoodEntries";
import { useHydrated } from "@/hooks/useHydrated";
import { useAnalytics, type Period } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import {
  WeeklyTrendChart,
  DayOfWeekChart,
  MoodBreakdown,
  TopTags,
  InsightsCard,
} from "@/components/analytics/AnalyticsCharts";

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

const PERIODS: [Period, string][] = [
  ["7d", "7 Days"], ["30d", "30 Days"], ["90d", "90 Days"], ["all", "All"],
];

function AnalyticsPage() {
  const hydrated = useHydrated();
  const { entries } = useMoodEntries();
  const [period, setPeriod] = useState<Period>("30d");
  const stats = useAnalytics(entries, period, hydrated);

  return (
    <div className="px-4 py-6 space-y-6">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold text-foreground">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your emotional insights at a glance</p>
      </motion.header>

      <div role="tablist" aria-label="Time period" className="flex gap-2">
        {PERIODS.map(([key, label]) => {
          const active = period === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setPeriod(key)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {!hydrated || !stats ? (
        <div className="rounded-2xl border bg-card p-8 text-center" role="status" aria-live="polite">
          <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">
            {hydrated ? "No entries in this period. Start logging!" : "Loading…"}
          </p>
        </div>
      ) : (
        <>
          <AnalyticsOverview stats={stats} />
          <WeeklyTrendChart stats={stats} />
          <DayOfWeekChart stats={stats} />
          <MoodBreakdown stats={stats} />
          <TopTags stats={stats} />
          <InsightsCard stats={stats} />
        </>
      )}
    </div>
  );
}
