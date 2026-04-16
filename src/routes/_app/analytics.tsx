import { createFileRoute } from "@tanstack/react-router";

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

function AnalyticsPage() {
  return (
    <div className="px-4 py-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">Analytics</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your emotional insights at a glance</p>
      <div className="mt-8 rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Charts and trends coming in Phase 3</p>
      </div>
    </div>
  );
}
