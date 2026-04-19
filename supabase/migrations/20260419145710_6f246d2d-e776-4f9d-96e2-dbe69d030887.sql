-- Add AI analysis columns to mood_entries
ALTER TABLE public.mood_entries
  ADD COLUMN IF NOT EXISTS ai_emotions text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_sentiment numeric(3,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_themes text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_summary text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_analyzed_at timestamptz DEFAULT NULL;

-- Table to cache personalized recommendations + bad-day alerts
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL, -- 'recommendations' | 'bad_day_alert'
  payload jsonb NOT NULL,
  based_on_entry_ids uuid[] DEFAULT NULL,
  avg_mood numeric(4,2) DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON public.ai_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON public.ai_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON public.ai_recommendations FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ai_recs_user_kind_created
  ON public.ai_recommendations(user_id, kind, created_at DESC);
