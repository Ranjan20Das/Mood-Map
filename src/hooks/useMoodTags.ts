import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MoodTag {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  is_default: boolean;
}

export function useMoodTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState<MoodTag[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchTags = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("mood_tags")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });
    if (error) {
      console.error("Failed to fetch tags:", error);
      return;
    }
    setTags((data ?? []) as MoodTag[]);
  }, []);

  useEffect(() => {
    if (!user) {
      setTags([]);
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    fetchTags(user.id).finally(() => setIsLoaded(true));
  }, [user, fetchTags]);

  const addTag = useCallback(
    async (name: string, color?: string, icon?: string) => {
      if (!user) throw new Error("Not signed in");
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) throw new Error("Tag name required");
      const { data, error } = await supabase
        .from("mood_tags")
        .insert({ user_id: user.id, name: trimmed, color: color ?? null, icon: icon ?? null })
        .select()
        .single();
      if (error) throw error;
      setTags((prev) => [...prev, data as MoodTag].sort((a, b) => a.name.localeCompare(b.name)));
      return data as MoodTag;
    },
    [user]
  );

  const deleteTag = useCallback(
    async (id: string) => {
      if (!user) return;
      const { error } = await supabase.from("mood_tags").delete().eq("id", id);
      if (error) {
        console.error(error);
        return;
      }
      setTags((prev) => prev.filter((t) => t.id !== id));
    },
    [user]
  );

  return { tags, isLoaded, addTag, deleteTag };
}
