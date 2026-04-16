import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, BarChart3, Brain, Music, Shield } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get Started — MoodMap" },
      { name: "description", content: "Set up MoodMap and learn how to track your moods effectively." },
      { property: "og:title", content: "Get Started — MoodMap" },
      { property: "og:description", content: "Set up MoodMap and learn how to track your moods." },
    ],
  }),
  component: OnboardingPage,
});

const steps = [
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Track Your Mood",
    description: "Log how you feel daily with a simple 1–10 scale, journal entries, and voice notes.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Brain,
    emoji: "🧠",
    title: "AI-Powered Insights",
    description: "Our AI analyzes your entries to detect emotions and uncover hidden patterns.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Music,
    emoji: "🎵",
    title: "Personalized Recommendations",
    description: "Get mood-based playlists, activities, and self-care tips tailored to you.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Shield,
    emoji: "🔒",
    title: "Private & Secure",
    description: "Your data is encrypted and completely private. You're in full control.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      navigate({ to: "/auth" });
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const step = steps[currentStep];

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-8">
      {/* Skip */}
      <div className="flex justify-end">
        <Link
          to="/auth"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <div className={`mb-8 flex h-28 w-28 items-center justify-center rounded-3xl ${step.bg}`}>
              <span className="text-6xl">{step.emoji}</span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {step.title}
            </h2>
            <p className="mt-3 max-w-sm text-base text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentStep
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30"
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3">
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border text-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl"
        >
          {isLast ? "Let's Go!" : "Next"}
          {!isLast && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
