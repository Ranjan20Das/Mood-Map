import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/history")({
  head: () => ({
    meta: [
      { title: "History — MoodMap" },
      { name: "description", content: "Browse, search, and manage all your past mood entries." },
      { property: "og:title", content: "History — MoodMap" },
      { property: "og:description", content: "View and manage your mood history." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="px-4 py-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">History</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your past mood entries</p>
      <div className="mt-8 rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Entry history coming in Phase 3</p>
      </div>
    </div>
  );
}
