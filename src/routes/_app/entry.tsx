import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/entry")({
  head: () => ({
    meta: [
      { title: "Log Mood — MoodMap" },
      { name: "description", content: "Log your current mood with a scale, journal, and voice recording." },
      { property: "og:title", content: "Log Mood — MoodMap" },
      { property: "og:description", content: "Record how you're feeling right now." },
    ],
  }),
  component: EntryPage,
});

function EntryPage() {
  return (
    <div className="px-4 py-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">How are you feeling?</h2>
      <p className="mt-1 text-sm text-muted-foreground">Rate your mood and add a note</p>
      <div className="mt-8 rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Mood entry form coming in Phase 2</p>
      </div>
    </div>
  );
}
