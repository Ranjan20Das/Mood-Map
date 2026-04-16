import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to MoodMap" },
      { name: "description", content: "Track and improve your emotional well-being with AI-powered mood analysis and visual insights." },
      { property: "og:title", content: "Welcome to MoodMap" },
      { property: "og:description", content: "Track and improve your emotional well-being with AI-powered mood analysis." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {/* Logo / Brand */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10">
          <span className="text-5xl">🧭</span>
        </div>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Mood<span className="text-primary">Map</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Navigate your emotions.<br />
          Understand your mind.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-xs space-y-3"
      >
        <Link
          to="/onboarding"
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          Get Started
        </Link>
        <Link
          to="/auth"
          className="flex h-12 w-full items-center justify-center rounded-2xl border border-border text-base font-medium text-foreground transition-colors hover:bg-muted"
        >
          I already have an account
        </Link>
      </motion.div>

      {/* Credit */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 text-xs text-muted-foreground"
      >
        Built with 💜 for your well-being
      </motion.p>
    </div>
  );
}
