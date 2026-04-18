import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  reminder_enabled: boolean;
  reminder_time: string; // HH:MM:SS
  notifications_enabled: boolean;
  week_start_day: number; // 0=Sun, 1=Mon
  default_tags: string[];
  language: string;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchPreferences = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch preferences:", error);
      return;
    }

    if (!data) {
      // Backfill for users created before the preferences table existed
      const { data: created, error: insertErr } = await supabase
        .from("user_preferences")
        .insert({ user_id: userId })
        .select()
        .single();
      if (insertErr) {
        console.error("Failed to create preferences:", insertErr);
        return;
      }
      setPreferences(created as UserPreferences);
      return;
    }
    setPreferences(data as UserPreferences);
  }, []);

  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    fetchPreferences(user.id).finally(() => setIsLoaded(true));
  }, [user, fetchPreferences]);

  const updatePreferences = useCallback(
    async (updates: Partial<Omit<UserPreferences, "id" | "user_id">>) => {
      if (!user || !preferences) return;
      const { data, error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) {
        console.error("Failed to update preferences:", error);
        return;
      }
      setPreferences(data as UserPreferences);
    },
    [user, preferences]
  );

  return { preferences, isLoaded, updatePreferences };
}
