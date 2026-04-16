import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Smile, TrendingUp, Lightbulb } from "lucide-react";

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

function DashboardPage() {
  return (
    <div className="px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Good morning 👋
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">How are you feeling today?</p>
      </motion.div>

      <div className="mt-6 grid gap-4">
        {/* Quick Mood Log Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Smile className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground">Log Your Mood</h3>
              <p className="text-xs text-muted-foreground">Tap to record how you feel right now</p>
            </div>
          </div>
        </motion.div>

        {/* Heatmap Preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground">Mood Trends</h3>
              <p className="text-xs text-muted-foreground">Your mood heatmap will appear here</p>
            </div>
          </div>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground">Daily Tip</h3>
              <p className="text-xs text-muted-foreground">Take 3 deep breaths to center yourself</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
