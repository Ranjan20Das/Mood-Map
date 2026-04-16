import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/selfcare")({
  head: () => ({
    meta: [
      { title: "Self-Care — MoodMap" },
      { name: "description", content: "Curated wellness tips, favorites, and crisis resources for your well-being." },
      { property: "og:title", content: "Self-Care — MoodMap" },
      { property: "og:description", content: "Wellness tips and self-care resources." },
    ],
  }),
  component: SelfCarePage,
});

function SelfCarePage() {
  return (
    <div className="px-4 py-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">Self-Care</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tips and resources for your well-being</p>
      <div className="mt-8 rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Self-care library coming in Phase 3</p>
      </div>
    </div>
  );
}
