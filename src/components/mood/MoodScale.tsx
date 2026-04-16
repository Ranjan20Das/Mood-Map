import { cn } from "@/lib/utils";
import { MOOD_EMOJIS, MOOD_LABELS, getMoodColorClass } from "@/types/mood";
import { motion } from "framer-motion";

interface MoodScaleProps {
  value: number;
  onChange: (value: number) => void;
}

export function MoodScale({ value, onChange }: MoodScaleProps) {
  return (
    <div className="space-y-4">
      {/* Current mood display */}
      <div className="text-center">
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl"
        >
          {MOOD_EMOJIS[value]}
        </motion.div>
        <motion.p
          key={`label-${value}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 font-heading text-lg font-semibold text-foreground"
        >
          {MOOD_LABELS[value]}
        </motion.p>
        <p className="text-sm text-muted-foreground">{value} / 10</p>
      </div>

      {/* Scale slider */}
      <div className="px-2">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mood-slider w-full"
          aria-label="Mood scale from 1 to 10"
        />
        <div className="mt-1 flex justify-between px-0.5 text-[10px] text-muted-foreground">
          <span>Awful</span>
          <span>Fantastic</span>
        </div>
      </div>

      {/* Quick select dots */}
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "h-8 w-8 rounded-full text-xs font-medium transition-all",
              n === value
                ? cn(getMoodColorClass(n), "text-white scale-110 shadow-md")
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            aria-label={`Set mood to ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
