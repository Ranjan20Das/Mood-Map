import { createFileRoute } from "@tanstack/react-router";

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

function HeatmapPage() {
  return (
    <div className="px-4 py-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">Mood Heatmap</h2>
      <p className="mt-1 text-sm text-muted-foreground">Visualize your emotional patterns</p>
      <div className="mt-8 rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Heatmap visualization coming in Phase 2</p>
      </div>
    </div>
  );
}
