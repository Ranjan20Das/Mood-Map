import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Music, Activity, AlertTriangle, RefreshCw } from "lucide-react";
import { useRecommendations } from "@/hooks/useAI";

export const Route = createFileRoute("/_app/recommendations")({
  head: () => ({
    meta: [
      { title: "For You — MoodMap" },
      { name: "description", content: "AI-curated activities, music vibes, and supportive tips based on your recent moods." },
      { property: "og:title", content: "For You — MoodMap" },
      { property: "og:description", content: "Personalized mood-based recommendations." },
    ],
  }),
  component: RecommendationsPage,
});

const CATEGORY_EMOJI: Record<string, string> = {
  movement: "🏃", mindfulness: "🧘", social: "💬", creative: "🎨",
  rest: "😴", nature: "🌿", growth: "🌱",
};

const MOOD_LABEL: Record<string, { label: string; color: string }> = {
  thriving: { label: "Thriving", color: "text-mood-great" },
  steady: { label: "Steady", color: "text-mood-good" },
  mixed: { label: "Mixed", color: "text-mood-okay" },
  low: { label: "Low", color: "text-mood-low" },
  struggling: { label: "Struggling", color: "text-mood-bad" },
};

function RecommendationsPage() {
  const { recs, alert, loading, generating, generate } = useRecommendations();

  const lastUpdated = recs?.created_at
    ? new Date(recs.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div className="px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold text-foreground">For You</h2>
        <p className="mt-1 text-sm text-muted-foreground">AI-curated suggestions from your recent moods</p>
      </motion.div>

      <AnimatePresence>
        {alert?.payload?.triggered && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="flex-1">
                <h3 className="font-heading text-sm font-semibold text-foreground">A tougher stretch</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{alert.payload.reason}</p>
                {alert.payload.coping_tips?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {alert.payload.coping_tips.map((tip, i) => (
                      <li key={i} className="text-xs text-foreground leading-relaxed">• {tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={generate}
        disabled={generating}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
      >
        {generating ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</>
        ) : recs ? (
          <><RefreshCw className="h-4 w-4" /> Refresh recommendations</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Generate recommendations</>
        )}
      </button>

      {loading && !recs && (
        <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      )}

      {!loading && !recs && (
        <div className="rounded-2xl border bg-card p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">
            Tap above to generate your first set of personalized suggestions.
          </p>
        </div>
      )}

      {recs && (
        <motion.div
          key={recs.created_at}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wide ${MOOD_LABEL[recs.payload.overall_mood]?.color ?? "text-muted-foreground"}`}>
                {MOOD_LABEL[recs.payload.overall_mood]?.label ?? recs.payload.overall_mood}
              </span>
              {recs.avg_mood !== null && (
                <span className="text-[11px] text-muted-foreground">avg {Number(recs.avg_mood).toFixed(1)}/10</span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{recs.payload.message}</p>
            {lastUpdated && <p className="mt-2 text-[10px] text-muted-foreground">Updated {lastUpdated}</p>}
          </div>

          {recs.payload.activities?.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-secondary" />
                <h3 className="font-heading text-sm font-semibold text-foreground">Activities</h3>
              </div>
              <div className="space-y-2">
                {recs.payload.activities.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border bg-card p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg shrink-0">{CATEGORY_EMOJI[a.category] ?? "✨"}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-foreground">{a.title}</h4>
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            {a.duration_min} min
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {recs.payload.music?.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-1.5">
                <Music className="h-4 w-4 text-accent" />
                <h3 className="font-heading text-sm font-semibold text-foreground">Music vibes</h3>
              </div>
              <div className="space-y-2">
                {recs.payload.music.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border bg-card p-3"
                  >
                    <h4 className="text-sm font-medium text-foreground">{m.vibe}</h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{m.description}</p>
                    {m.example_artists?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {m.example_artists.map((artist) => (
                          <span
                            key={artist}
                            className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent-foreground"
                          >
                            {artist}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <p className="text-center text-[10px] text-muted-foreground">
            AI suggestions are not medical advice. If you're in crisis, please reach out to a trusted person or local helpline.
          </p>
        </motion.div>
      )}
    </div>
  );
}
