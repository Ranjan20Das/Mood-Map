import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — MoodMap" },
      { name: "description", content: "Sign in or create your MoodMap account to start tracking your mood." },
      { property: "og:title", content: "Sign In — MoodMap" },
      { property: "og:description", content: "Sign in or create your MoodMap account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-3xl">🧭</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your journey</p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-center text-sm text-muted-foreground">
            Authentication will be implemented in Phase 4
          </p>
        </div>
      </div>
    </div>
  );
}
