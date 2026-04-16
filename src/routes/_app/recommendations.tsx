import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/recommendations")({
  head: () => ({
    meta: [
      { title: "For You — MoodMap" },
      { name: "description", content: "Personalized music playlists and activity suggestions based on your mood." },
      { property: "og:title", content: "For You — MoodMap" },
      { property: "og:description", content: "Mood-based playlists and activity recommendations." },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  return (
    <div className="px-4 py-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">For You</h2>
      <p className="mt-1 text-sm text-muted-foreground">Personalized recommendations</p>
      <div className="mt-8 rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Music & activity suggestions coming in Phase 7</p>
      </div>
    </div>
  );
}
