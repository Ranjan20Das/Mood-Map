import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getMoodColorClass } from "@/types/mood";
import type { MoodEntry } from "@/types/mood";

interface MoodHeatmapMiniProps {
  entries: MoodEntry[];
}

export function MoodHeatmapMini({ entries }: MoodHeatmapMiniProps) {
  const days = useMemo(() => {
    const today = new Date();
    const grid: { date: string; mood: number | null }[] = [];
    // Last 35 days (5 weeks)
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = entries.find((e) => e.date === dateStr);
      grid.push({ date: dateStr, mood: entry?.mood ?? null });
    }
    return grid;
  }, [entries]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div
            key={day.date}
            className={cn(
              "aspect-square rounded-sm transition-colors",
              day.mood
                ? cn(getMoodColorClass(day.mood), "opacity-80")
                : "bg-muted/50"
            )}
            title={day.mood ? `${day.date}: ${day.mood}/10` : day.date}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Low</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-mood-bad opacity-80" />
        <div className="h-2.5 w-2.5 rounded-sm bg-mood-low opacity-80" />
        <div className="h-2.5 w-2.5 rounded-sm bg-mood-okay opacity-80" />
        <div className="h-2.5 w-2.5 rounded-sm bg-mood-good opacity-80" />
        <div className="h-2.5 w-2.5 rounded-sm bg-mood-great opacity-80" />
        <span>High</span>
      </div>
    </div>
  );
}
