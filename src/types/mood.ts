export interface MoodEntry {
  id: string;
  date: string; // ISO date string
  mood: number; // 1-10
  journal: string;
  tags: string[];
  voiceNote?: string; // base64 or blob URL
  createdAt: string;
}

export const MOOD_LABELS: Record<number, string> = {
  1: "Awful",
  2: "Terrible",
  3: "Bad",
  4: "Down",
  5: "Meh",
  6: "Okay",
  7: "Good",
  8: "Great",
  9: "Amazing",
  10: "Fantastic",
};

export const MOOD_EMOJIS: Record<number, string> = {
  1: "😢",
  2: "😞",
  3: "😟",
  4: "😔",
  5: "😐",
  6: "🙂",
  7: "😊",
  8: "😄",
  9: "🤩",
  10: "🥳",
};

export const MOOD_COLORS: Record<string, string> = {
  great: "var(--mood-great)",
  good: "var(--mood-good)",
  okay: "var(--mood-okay)",
  low: "var(--mood-low)",
  bad: "var(--mood-bad)",
};

export function getMoodCategory(mood: number): "great" | "good" | "okay" | "low" | "bad" {
  if (mood >= 9) return "great";
  if (mood >= 7) return "good";
  if (mood >= 5) return "okay";
  if (mood >= 3) return "low";
  return "bad";
}

export function getMoodColorClass(mood: number): string {
  const cat = getMoodCategory(mood);
  const map: Record<string, string> = {
    great: "bg-mood-great",
    good: "bg-mood-good",
    okay: "bg-mood-okay",
    low: "bg-mood-low",
    bad: "bg-mood-bad",
  };
  return map[cat];
}

export function getMoodTextColorClass(mood: number): string {
  const cat = getMoodCategory(mood);
  const map: Record<string, string> = {
    great: "text-mood-great",
    good: "text-mood-good",
    okay: "text-mood-okay",
    low: "text-mood-low",
    bad: "text-mood-bad",
  };
  return map[cat];
}

export const DEFAULT_TAGS = [
  "Work", "Family", "Health", "Exercise", "Social",
  "Sleep", "Stress", "Gratitude", "Creative", "Nature",
  "Travel", "Food", "Learning", "Music", "Meditation",
];
