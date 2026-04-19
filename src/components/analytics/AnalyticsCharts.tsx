import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getMoodColorClass } from "@/types/mood";
import type { AnalyticsStats } from "@/hooks/useAnalytics";
import { DAYS } from "@/hooks/useAnalytics";

export function WeeklyTrendChart({ stats }: { stats: AnalyticsStats }) {
  if (stats.weeklyData.length <= 1) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border bg-card p-5"
      aria-labelledby="weekly-trend-heading"
    >
      <h3 id="weekly-trend-heading" className="mb-4 font-heading text-sm font-semibold text-foreground">Weekly Trend</h3>
      <div className="flex items-end gap-1 h-32" role="img" aria-label={`Weekly mood averages, latest: ${stats.weeklyData[stats.weeklyData.length - 1].avg.toFixed(1)} out of 10`}>
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
    </motion.section>
  );
}

export function DayOfWeekChart({ stats }: { stats: AnalyticsStats }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border bg-card p-5"
      aria-labelledby="dow-heading"
    >
      <h3 id="dow-heading" className="mb-4 font-heading text-sm font-semibold text-foreground">By Day of Week</h3>
      <div className="flex items-end gap-1.5 h-24" role="img" aria-label="Average mood by day of the week">
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
    </motion.section>
  );
}

export function MoodBreakdown({ stats }: { stats: AnalyticsStats }) {
  const colorMap: Record<string, string> = {
    great: "bg-mood-great", good: "bg-mood-good", okay: "bg-mood-okay",
    low: "bg-mood-low", bad: "bg-mood-bad",
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border bg-card p-5 space-y-3"
      aria-labelledby="breakdown-heading"
    >
      <h3 id="breakdown-heading" className="font-heading text-sm font-semibold text-foreground">Mood Breakdown</h3>
      {(["great", "good", "okay", "low", "bad"] as const).map((cat) => {
        const count = stats.cats[cat];
        const pct = (count / stats.total) * 100;
        return (
          <div key={cat} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="capitalize text-foreground">{cat}</span>
              <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
            </div>
            <div className="h-2 rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${cat}: ${pct.toFixed(0)} percent`}>
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
    </motion.section>
  );
}

export function TopTags({ stats }: { stats: AnalyticsStats }) {
  if (stats.topTags.length === 0) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl border bg-card p-5"
      aria-labelledby="tags-heading"
    >
      <h3 id="tags-heading" className="mb-3 font-heading text-sm font-semibold text-foreground">Top Tags</h3>
      <ul className="space-y-2">
        {stats.topTags.map(([tag, count]) => (
          <li key={tag} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{tag}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{count}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

export function InsightsCard({ stats }: { stats: AnalyticsStats }) {
  const insights: string[] = [];
  if (stats.trend > 0.5) insights.push("Your mood is trending upward! Keep it up 🚀");
  else if (stats.trend < -0.5) insights.push("Your mood has been dipping — consider some extra self-care 💜");

  const bestDay = stats.dayAvgs.reduce((a, b) => (b.avg > a.avg && b.count > 0 ? b : a), stats.dayAvgs[0]);
  const worstDay = stats.dayAvgs.reduce((a, b) => (b.avg < a.avg && b.count > 0 ? b : a), stats.dayAvgs[0]);
  if (bestDay.count > 0) insights.push(`Your best day is usually ${DAYS[bestDay.day]} (avg ${bestDay.avg.toFixed(1)})`);
  if (worstDay.count > 0 && worstDay.day !== bestDay.day)
    insights.push(`${DAYS[worstDay.day]} tends to be tougher (avg ${worstDay.avg.toFixed(1)})`);
  if (stats.topTags.length > 0)
    insights.push(`Your most logged tag is "${stats.topTags[0][0]}" — it seems important to you`);
  if (insights.length === 0) insights.push("Keep logging to unlock personalized insights!");

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border bg-accent/5 p-5 space-y-2"
      aria-labelledby="insights-heading"
    >
      <h3 id="insights-heading" className="font-heading text-sm font-semibold text-foreground">💡 Insights</h3>
      <ul className="space-y-1.5">
        {insights.map((text, i) => (
          <li key={i} className="text-sm text-muted-foreground leading-relaxed">• {text}</li>
        ))}
      </ul>
    </motion.section>
  );
}
