import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { AIRecommendations, MoodEntry } from "@/types/mood";

interface AnalysisResult {
  emotions: string[];
  sentiment: number;
  themes: string[];
  summary: string;
}

export function useAnalyzeMood() {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const analyze = useCallback(async (entry: MoodEntry): Promise<AnalysisResult | null> => {
    if (entry.id.startsWith("local-")) {
      toast.error("Sync this entry online before analyzing");
      return null;
    }
    setAnalyzingId(entry.id);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-mood", {
        body: {
          entryId: entry.id,
          mood: entry.mood,
          journal: entry.journal,
          tags: entry.tags,
        },
      });
      if (error) {
        const ctx = (error as { context?: { status?: number } }).context;
        if (ctx?.status === 429) toast.error("AI is busy. Try again in a moment.");
        else if (ctx?.status === 402) toast.error("AI credits exhausted — top up in Workspace settings.");
        else toast.error(error.message || "Analysis failed");
        return null;
      }
      toast.success("Insight ready ✨");
      return data as AnalysisResult;
    } finally {
      setAnalyzingId(null);
    }
  }, []);

  return { analyze, analyzingId };
}

interface CachedRecommendations {
  payload: AIRecommendations;
  avg_mood: number | null;
  created_at: string;
}

interface CachedAlert {
  payload: { triggered: boolean; reason: string; coping_tips: string[] };
  created_at: string;
}

export function useRecommendations() {
  const { user } = useAuth();
  const [recs, setRecs] = useState<CachedRecommendations | null>(null);
  const [alert, setAlert] = useState<CachedAlert | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadCached = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [recRes, alertRes] = await Promise.all([
      supabase
        .from("ai_recommendations")
        .select("payload, avg_mood, created_at")
        .eq("user_id", user.id)
        .eq("kind", "recommendations")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("ai_recommendations")
        .select("payload, created_at")
        .eq("user_id", user.id)
        .eq("kind", "bad_day_alert")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (recRes.data) {
      setRecs({
        payload: recRes.data.payload as unknown as AIRecommendations,
        avg_mood: recRes.data.avg_mood as number | null,
        created_at: recRes.data.created_at as string,
      });
    }
    if (alertRes.data) {
      setAlert({
        payload: alertRes.data.payload as unknown as CachedAlert["payload"],
        created_at: alertRes.data.created_at as string,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadCached();
  }, [loadCached]);

  const generate = useCallback(async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recommendations", { body: {} });
      if (error) {
        const ctx = (error as { context?: { status?: number } }).context;
        if (ctx?.status === 429) toast.error("AI is busy. Try again in a moment.");
        else if (ctx?.status === 402) toast.error("AI credits exhausted — top up in Workspace settings.");
        else toast.error(error.message || "Could not generate recommendations");
        return;
      }
      toast.success("Fresh recommendations ready ✨");
      await loadCached();
      return data;
    } finally {
      setGenerating(false);
    }
  }, [loadCached]);

  return { recs, alert, loading, generating, generate, refresh: loadCached };
}
