import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Search, Phone, ExternalLink, Bookmark, BookmarkCheck, Sparkles,
  Brain, Leaf, Moon as MoonIcon, Dumbbell, Music, Coffee, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";

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

type Category = "all" | "mindfulness" | "physical" | "social" | "creative" | "rest";

interface Tip {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, "all">;
  emoji: string;
  duration?: string;
}

const TIPS: Tip[] = [
  { id: "1", title: "Box Breathing", description: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times to calm your nervous system.", category: "mindfulness", emoji: "🧘", duration: "5 min" },
  { id: "2", title: "Gratitude Journal", description: "Write down 3 specific things you're grateful for today. Be as detailed as possible.", category: "mindfulness", emoji: "📝", duration: "5 min" },
  { id: "3", title: "Body Scan Meditation", description: "Lie down and slowly focus attention on each body part, from toes to head, releasing tension.", category: "mindfulness", emoji: "🧠", duration: "10 min" },
  { id: "4", title: "5-4-3-2-1 Grounding", description: "Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.", category: "mindfulness", emoji: "🌿", duration: "3 min" },
  { id: "5", title: "Walk in Nature", description: "Take a 15-minute walk outside. Focus on the sounds, smells, and sights around you.", category: "physical", emoji: "🌳", duration: "15 min" },
  { id: "6", title: "Stretch Break", description: "Do 5 minutes of gentle stretching. Focus on neck, shoulders, and back.", category: "physical", emoji: "🤸", duration: "5 min" },
  { id: "7", title: "Dance It Out", description: "Put on your favorite upbeat song and dance freely for the duration. No judgment!", category: "physical", emoji: "💃", duration: "4 min" },
  { id: "8", title: "Cold Water Splash", description: "Splash cold water on your face to activate the dive reflex and reduce anxiety.", category: "physical", emoji: "💧", duration: "1 min" },
  { id: "9", title: "Call a Friend", description: "Reach out to someone you care about. Even a short chat can boost your mood.", category: "social", emoji: "📱", duration: "10 min" },
  { id: "10", title: "Write a Kind Note", description: "Send a thoughtful message to someone you appreciate. Kindness is a two-way mood booster.", category: "social", emoji: "💌", duration: "5 min" },
  { id: "11", title: "Cook Something New", description: "Try a simple new recipe. The focus and creativity of cooking is meditative.", category: "creative", emoji: "🍳", duration: "30 min" },
  { id: "12", title: "Doodle or Sketch", description: "Draw anything — no skill required. Focus on the process, not the result.", category: "creative", emoji: "🎨", duration: "10 min" },
  { id: "13", title: "Listen to Calming Music", description: "Put on ambient or instrumental music. Close your eyes and just listen.", category: "rest", emoji: "🎵", duration: "10 min" },
  { id: "14", title: "Digital Detox Hour", description: "Put your phone away for one hour. Read, nap, or just sit quietly.", category: "rest", emoji: "📵", duration: "60 min" },
  { id: "15", title: "Power Nap", description: "Set a 20-minute timer and rest. Even closing your eyes without sleeping helps.", category: "rest", emoji: "😴", duration: "20 min" },
  { id: "16", title: "Progressive Muscle Relaxation", description: "Tense each muscle group for 5s then release. Work from feet to face.", category: "rest", emoji: "🌙", duration: "10 min" },
];

const CRISIS_RESOURCES = [
  { name: "National Suicide Prevention Lifeline", number: "988", description: "24/7 crisis support" },
  { name: "Crisis Text Line", number: "Text HOME to 741741", description: "Free text-based crisis counseling" },
  { name: "SAMHSA Helpline", number: "1-800-662-4357", description: "Substance abuse & mental health" },
  { name: "International Association for Suicide Prevention", number: "https://www.iasp.info/resources/Crisis_Centres/", description: "Find help worldwide" },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  mindfulness: <Brain className="h-4 w-4" />,
  physical: <Dumbbell className="h-4 w-4" />,
  social: <Users className="h-4 w-4" />,
  creative: <Sparkles className="h-4 w-4" />,
  rest: <MoonIcon className="h-4 w-4" />,
};

function SelfCarePage() {
  const hydrated = useHydrated();
  const [category, setCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      const saved = localStorage.getItem("moodmap_selfcare_favorites");
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("moodmap_selfcare_favorites", JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = TIPS;
    if (category !== "all") result = result.filter((t) => t.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [category, searchQuery]);

  const favoriteTips = TIPS.filter((t) => favorites.has(t.id));

  return (
    <div className="px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold text-foreground">Self-Care</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tips and resources for your well-being</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search self-care tips..."
          className="h-10 w-full rounded-xl border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {([
          ["all", "All", <Heart className="h-3.5 w-3.5" key="all" />],
          ["mindfulness", "Mindfulness", <Brain className="h-3.5 w-3.5" key="mind" />],
          ["physical", "Physical", <Dumbbell className="h-3.5 w-3.5" key="phys" />],
          ["social", "Social", <Users className="h-3.5 w-3.5" key="soc" />],
          ["creative", "Creative", <Sparkles className="h-3.5 w-3.5" key="cre" />],
          ["rest", "Rest", <MoonIcon className="h-3.5 w-3.5" key="rest" />],
        ] as [Category, string, React.ReactNode][]).map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
              category === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Favorites */}
      {favoriteTips.length > 0 && category === "all" && !searchQuery && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h3 className="mb-2 font-heading text-sm font-semibold text-foreground">⭐ Your Favorites</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {favoriteTips.map((tip) => (
              <div
                key={tip.id}
                className="flex w-48 shrink-0 flex-col rounded-2xl border bg-card p-4"
              >
                <span className="text-2xl">{tip.emoji}</span>
                <h4 className="mt-2 text-sm font-semibold text-foreground">{tip.title}</h4>
                {tip.duration && (
                  <span className="mt-1 text-[10px] text-muted-foreground">{tip.duration}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No tips match your search</p>
          </div>
        ) : (
          filtered.map((tip, i) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="rounded-2xl border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tip.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{tip.title}</h4>
                    <span className="flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {CATEGORY_ICONS[tip.category]} {tip.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
                  {tip.duration && (
                    <span className="mt-1.5 inline-block text-[10px] text-muted-foreground/70">⏱ {tip.duration}</span>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(tip.id)}
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={favorites.has(tip.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  {favorites.has(tip.id) ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Crisis Resources */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="mb-2 font-heading text-sm font-semibold text-foreground">🆘 Crisis Resources</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          If you or someone you know is in crisis, please reach out for help.
        </p>
        <div className="space-y-2">
          {CRISIS_RESOURCES.map((resource) => (
            <div
              key={resource.name}
              className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
            >
              <Phone className="h-5 w-5 shrink-0 text-destructive" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{resource.name}</p>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
                <p className="mt-0.5 text-xs font-semibold text-destructive">{resource.number}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
