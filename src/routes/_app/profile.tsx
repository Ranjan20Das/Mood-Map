import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — MoodMap" },
      { name: "description", content: "Manage your profile, preferences, privacy settings, and data exports." },
      { property: "og:title", content: "Profile — MoodMap" },
      { property: "og:description", content: "Your profile and settings." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="px-4 py-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your account and settings</p>
      <div className="mt-8 rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Profile & settings coming in Phase 3</p>
      </div>
    </div>
  );
}
