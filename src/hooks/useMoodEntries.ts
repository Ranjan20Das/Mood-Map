import { useState, useEffect, useCallback } from "react";
import type { MoodEntry } from "@/types/mood";

const STORAGE_KEY = "moodmap_entries";

function loadEntries(): MoodEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: MoodEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useMoodEntries() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
    setIsLoaded(true);
  }, []);

  const addEntry = useCallback((entry: Omit<MoodEntry, "id" | "createdAt">) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => {
      const updated = [newEntry, ...prev];
      saveEntries(updated);
      return updated;
    });
    return newEntry;
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEntries(updated);
      return updated;
    });
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<MoodEntry>) => {
    setEntries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveEntries(updated);
      return updated;
    });
  }, []);

  const getEntriesByDate = useCallback(
    (date: string) => entries.filter((e) => e.date === date),
    [entries]
  );

  const getEntriesInRange = useCallback(
    (start: string, end: string) =>
      entries.filter((e) => e.date >= start && e.date <= end),
    [entries]
  );

  const getRecentEntries = useCallback(
    (count: number) => entries.slice(0, count),
    [entries]
  );

  const getAverageMood = useCallback(
    (days: number) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      const recent = entries.filter((e) => e.date >= cutoffStr);
      if (recent.length === 0) return null;
      return recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
    },
    [entries]
  );

  return {
    entries,
    isLoaded,
    addEntry,
    deleteEntry,
    updateEntry,
    getEntriesByDate,
    getEntriesInRange,
    getRecentEntries,
    getAverageMood,
  };
}
