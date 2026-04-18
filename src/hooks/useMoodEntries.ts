import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import {
  queueEntry,
  getQueuedEntries,
  removeQueuedEntry,
  type PendingEntry,
} from "@/lib/offline-queue";
import type { MoodEntry } from "@/types/mood";
import { toast } from "sonner";

const LEGACY_STORAGE_KEY = "moodmap_entries";
const MIGRATION_FLAG_KEY = "moodmap_migrated_v1";

interface DbRow {
  id: string;
  user_id: string;
  mood: number;
  journal: string | null;
  tags: string[] | null;
  voice_url: string | null;
  entry_date: string;
  created_at: string;
}

function rowToEntry(row: DbRow): MoodEntry {
  return {
    id: row.id,
    date: row.entry_date,
    mood: row.mood,
    journal: row.journal ?? "",
    tags: row.tags ?? [],
    voiceNote: row.voice_url ?? undefined,
    createdAt: row.created_at,
  };
}

function pendingToEntry(p: PendingEntry): MoodEntry {
  return {
    id: p.id,
    date: p.entry_date,
    mood: p.mood,
    journal: p.journal ?? "",
    tags: p.tags,
    voiceNote: p.voice_url ?? undefined,
    createdAt: p.created_at,
  };
}

function localId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useMoodEntries() {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchEntries = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to fetch mood entries:", error);
      return [];
    }
    return (data ?? []).map(rowToEntry);
  }, []);

  const refreshPending = useCallback(async (userId: string): Promise<MoodEntry[]> => {
    const queued = await getQueuedEntries(userId);
    setPendingCount(queued.length);
    return queued.map(pendingToEntry);
  }, []);

  const syncQueue = useCallback(async (userId: string) => {
    const queued = await getQueuedEntries(userId);
    if (queued.length === 0) return 0;
    let synced = 0;
    for (const item of queued) {
      const { error } = await supabase.from("mood_entries").insert({
        user_id: item.user_id,
        mood: item.mood,
        journal: item.journal,
        tags: item.tags,
        voice_url: item.voice_url,
        entry_date: item.entry_date,
      });
      if (!error) {
        await removeQueuedEntry(item.id);
        synced++;
      } else {
        console.error("Failed to sync entry:", error);
      }
    }
    return synced;
  }, []);

  // Migrate localStorage entries to Supabase once per user
  const migrateLegacy = useCallback(async (userId: string) => {
    if (typeof window === "undefined") return;
    const flagKey = `${MIGRATION_FLAG_KEY}_${userId}`;
    if (localStorage.getItem(flagKey)) return;
    try {
      const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(flagKey, "1");
        return;
      }
      const legacy: MoodEntry[] = JSON.parse(raw);
      if (!Array.isArray(legacy) || legacy.length === 0) {
        localStorage.setItem(flagKey, "1");
        return;
      }
      const rows = legacy.map((e) => ({
        user_id: userId,
        mood: e.mood,
        journal: e.journal || null,
        tags: e.tags ?? [],
        voice_url: e.voiceNote ?? null,
        entry_date: e.date,
      }));
      const { error } = await supabase.from("mood_entries").insert(rows);
      if (!error) {
        localStorage.setItem(flagKey, "1");
      }
    } catch (err) {
      console.error("Migration failed:", err);
    }
  }, []);

  // Load entries + pending queue + realtime
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setPendingCount(0);
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    (async () => {
      if (isOnline) {
        await migrateLegacy(user.id);
        const synced = await syncQueue(user.id);
        if (synced > 0) toast.success(`Synced ${synced} offline ${synced === 1 ? "entry" : "entries"}`);
      }
      const remote = await fetchEntries(user.id);
      const pending = await refreshPending(user.id);
      setEntries([...pending, ...remote]);
      setIsLoaded(true);
    })();

    if (!isOnline) return;

    // Realtime sync across devices/tabs
    const channel = supabase
      .channel(`mood_entries:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mood_entries", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newEntry = rowToEntry(payload.new as DbRow);
            setEntries((prev) => (prev.some((e) => e.id === newEntry.id) ? prev : [newEntry, ...prev]));
          } else if (payload.eventType === "UPDATE") {
            const updated = rowToEntry(payload.new as DbRow);
            setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
          } else if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string })?.id;
            if (oldId) setEntries((prev) => prev.filter((e) => e.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOnline, fetchEntries, migrateLegacy, syncQueue, refreshPending]);

  const addEntry = useCallback(
    async (entry: Omit<MoodEntry, "id" | "createdAt">) => {
      if (!user) throw new Error("Not signed in");

      // Offline → queue
      if (!isOnline) {
        const pending: PendingEntry = {
          id: localId(),
          user_id: user.id,
          mood: entry.mood,
          journal: entry.journal || null,
          tags: entry.tags ?? [],
          voice_url: entry.voiceNote ?? null,
          entry_date: entry.date,
          created_at: new Date().toISOString(),
        };
        await queueEntry(pending);
        const newEntry = pendingToEntry(pending);
        setEntries((prev) => [newEntry, ...prev]);
        setPendingCount((c) => c + 1);
        toast.success("Saved offline — will sync when online");
        return newEntry;
      }

      const { data, error } = await supabase
        .from("mood_entries")
        .insert({
          user_id: user.id,
          mood: entry.mood,
          journal: entry.journal || null,
          tags: entry.tags ?? [],
          voice_url: entry.voiceNote ?? null,
          entry_date: entry.date,
        })
        .select()
        .single();
      if (error || !data) throw error ?? new Error("Insert failed");
      const newEntry = rowToEntry(data as DbRow);
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    [user, isOnline]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!user) return;
      // Local-only entry
      if (id.startsWith("local-")) {
        await removeQueuedEntry(id);
        setEntries((prev) => prev.filter((e) => e.id !== id));
        setPendingCount((c) => Math.max(0, c - 1));
        return;
      }
      const { error } = await supabase.from("mood_entries").delete().eq("id", id);
      if (error) {
        console.error(error);
        return;
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
    },
    [user]
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<MoodEntry>) => {
      if (!user) return;
      if (id.startsWith("local-")) {
        // Update local pending entry in IDB
        const queued = await getQueuedEntries(user.id);
        const item = queued.find((q) => q.id === id);
        if (item) {
          const merged: PendingEntry = {
            ...item,
            mood: updates.mood ?? item.mood,
            journal: updates.journal ?? item.journal,
            tags: updates.tags ?? item.tags,
            voice_url: updates.voiceNote ?? item.voice_url,
            entry_date: updates.date ?? item.entry_date,
          };
          await queueEntry(merged);
          setEntries((prev) => prev.map((e) => (e.id === id ? pendingToEntry(merged) : e)));
        }
        return;
      }
      const dbUpdates: {
        mood?: number;
        journal?: string | null;
        tags?: string[];
        voice_url?: string | null;
        entry_date?: string;
      } = {};
      if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
      if (updates.journal !== undefined) dbUpdates.journal = updates.journal || null;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.voiceNote !== undefined) dbUpdates.voice_url = updates.voiceNote ?? null;
      if (updates.date !== undefined) dbUpdates.entry_date = updates.date;

      const { error } = await supabase.from("mood_entries").update(dbUpdates).eq("id", id);
      if (error) {
        console.error(error);
        return;
      }
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    },
    [user]
  );

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
    isOnline,
    pendingCount,
    addEntry,
    deleteEntry,
    updateEntry,
    getEntriesByDate,
    getEntriesInRange,
    getRecentEntries,
    getAverageMood,
  };
}
