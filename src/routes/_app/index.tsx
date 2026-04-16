import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Smile, TrendingUp, Lightbulb, PenLine } from "lucide-react";
import { useMoodEntries } from "@/hooks/useMoodEntries";
import { MoodHeatmapMini } from "@/components/mood/MoodHeatmapMini";
import { RecentEntries } from "@/components/mood/RecentEntries";
import { MOOD_EMOJIS } from "@/types/mood";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MoodMap" },
      { name: "description", content: "Your daily mood overview, recent entries, and personalized wellness tips." },
      { property: "og:title", content: "Dashboard — MoodMap" },
      { property: "og:description", content: "Your daily mood overview and wellness insights." },
    ],
  }),
  component: DashboardPage,
});

const TIPS = [
  "Take 3 deep breaths to center yourself 🧘",
  "Go for a 10-minute walk in nature 🌿",
  "Write down 3 things you're grateful for 📝",
  "Listen to your favorite song and really feel it 🎵",
  "Call or text someone you care about 💜",
  "Drink a glass of water and stretch your body 💧",
];

function DashboardPage() {
  const { entries, isLoaded, getRecentEntries, getAverageMood } = useMoodEntries();
  const recent = getRecentEntries(5);
  const avgMood = getAverageMood(7);
  const todayTip = TIPS[new Date().getDate() % TIPS.length];

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-4 py-6 space-y-6">
      <Toaster position="top-center" />

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="font-heading text-2xl font-bold text-foreground">
          {greeting} 👋
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoaded && entries.length > 0
            ? `You've logged ${entries.length} mood${entries.length !== 1 ? "s" : ""}`
            : "Start tracking to see your patterns"}
        </p>
      </motion.div>

      {/* Quick Log CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Link
          to="/entry"
          className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <PenLine className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-sm font-semibold text-foreground">
              Log Your Mood
            </h3>
            <p className="text-xs text-muted-foreground">How are you feeling right now?</p>
          </div>
          <span className="text-2xl">
            {avgMood ? MOOD_EMOJIS[Math.round(avgMood)] : "😊"}
          </span>
        </Link>
      </motion.div>

      {/* Weekly Average */}
      {avgMood !== null && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-4 rounded-2xl border bg-card p-5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
            <TrendingUp className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">
              Weekly Average
            </h3>
            <p className="text-xs text-muted-foreground">
              {avgMood.toFixed(1)}/10 over the last 7 days
            </p>
          </div>
        </motion.div>
      )}

      {/* Heatmap Preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-2xl border bg-card p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Mood Map
          </h3>
          <Link
            to="/heatmap"
            className="text-xs font-medium text-primary hover:underline"
          >
            View Full Map
          </Link>
        </div>
        <MoodHeatmapMini entries={entries} />
      </motion.div>

      {/* Daily Tip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border bg-accent/5 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            <Lightbulb className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">Daily Tip</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{todayTip}</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Entries */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">
          Recent Entries
        </h3>
        <RecentEntries entries={recent} />
      </motion.div>
    </div>
  );
}
