import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { MOOD_EMOJIS } from "@/types/mood";
import type { AnalyticsStats } from "@/hooks/useAnalytics";

function StatCard({ label, value, emoji, icon }: { label: string; value: string; emoji?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 text-center">
      <div className="flex items-center justify-center gap-1.5">
        {emoji && <span aria-hidden="true" className="text-lg">{emoji}</span>}
        {icon}
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function AnalyticsOverview({ stats }: { stats: AnalyticsStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3"
      role="list"
      aria-label="Mood overview"
    >
      <StatCard label="Average Mood" value={stats.avg.toFixed(1)} emoji={MOOD_EMOJIS[Math.round(stats.avg)]} />
      <StatCard
        label="Trend"
        value={stats.trend > 0 ? `+${stats.trend.toFixed(1)}` : stats.trend.toFixed(1)}
        icon={
          stats.trend > 0.3 ? (
            <TrendingUp className="h-4 w-4 text-secondary" aria-label="Upward trend" />
          ) : stats.trend < -0.3 ? (
            <TrendingDown className="h-4 w-4 text-destructive" aria-label="Downward trend" />
          ) : (
            <Minus className="h-4 w-4 text-muted-foreground" aria-label="Steady" />
          )
        }
      />
      <StatCard label="Highest" value={`${stats.highest}/10`} emoji={MOOD_EMOJIS[stats.highest]} />
      <StatCard label="Entries" value={String(stats.total)} icon={<Calendar className="h-4 w-4 text-primary" aria-hidden="true" />} />
    </motion.div>
  );
}
