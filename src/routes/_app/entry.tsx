import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { MoodScale } from "@/components/mood/MoodScale";
import { TagSelector } from "@/components/mood/TagSelector";
import { VoiceRecorder } from "@/components/mood/VoiceRecorder";
import { useMoodEntries } from "@/hooks/useMoodEntries";
import { useHydrated } from "@/hooks/useHydrated";
import { toast } from "sonner";

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
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { addEntry } = useMoodEntries();

  const [mood, setMood] = useState(5);
  const [journal, setJournal] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [voiceNote, setVoiceNote] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    const today = new Date().toISOString().split("T")[0];
    addEntry({ date: today, mood, journal, tags, voiceNote });

    setTimeout(() => {
      toast.success("Mood logged! 🎉", {
        description: `You're feeling ${mood}/10 today`,
      });
      navigate({ to: "/" });
    }, 300);
  };

  const dateLabel = hydrated
    ? new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            How are you feeling?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{dateLabel}</p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <MoodScale value={mood} onChange={setMood} />
        </div>

        <div className="space-y-2">
          <label htmlFor="journal" className="text-sm font-medium text-foreground">
            Journal
          </label>
          <textarea
            id="journal"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="What's on your mind? Write freely..."
            className="min-h-[120px] w-full resize-none rounded-2xl border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={2000}
          />
          <p className="text-right text-[10px] text-muted-foreground">
            {journal.length}/2000
          </p>
        </div>

        <VoiceRecorder onRecordingComplete={setVoiceNote} />
        <TagSelector selected={tags} onChange={setTags} />

        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          whileTap={{ scale: 0.97 }}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all disabled:opacity-60"
        >
          {isSaving ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              Saved!
            </motion.div>
          ) : (
            "Save Entry"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
