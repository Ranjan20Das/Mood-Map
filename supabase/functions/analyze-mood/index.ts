// Edge function: analyze a single mood entry with AI
// Input: { entryId, mood, journal, tags }
// Output: { emotions, sentiment, themes, summary }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "openai/gpt-5-mini";

const TOOL = {
  type: "function" as const,
  function: {
    name: "record_emotion_analysis",
    description: "Record the structured emotion analysis of a mood journal entry.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        emotions: {
          type: "array",
          description: "1-4 primary emotions detected (e.g. anxious, hopeful, frustrated)",
          items: { type: "string" },
        },
        sentiment: {
          type: "number",
          description: "Sentiment from -1.0 (very negative) to 1.0 (very positive)",
        },
        themes: {
          type: "array",
          description: "1-4 short topic themes (e.g. work stress, relationships, sleep)",
          items: { type: "string" },
        },
        summary: {
          type: "string",
          description: "One supportive sentence (max 160 chars) reflecting back what the user expressed.",
        },
      },
      required: ["emotions", "sentiment", "themes", "summary"],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { entryId, mood, journal, tags } = await req.json();
    if (!entryId || typeof mood !== "number") {
      return new Response(JSON.stringify({ error: "Missing entryId or mood" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userText = [
      `Mood rating: ${mood}/10`,
      tags?.length ? `Tags: ${tags.join(", ")}` : null,
      journal ? `Journal: ${journal}` : "Journal: (no text written)",
    ].filter(Boolean).join("\n");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a compassionate, non-clinical emotional wellness assistant. Analyze a single mood journal entry and return structured data via the provided tool. Be empathetic, never diagnostic. Keep summary supportive and brief.",
          },
          { role: "user", content: userText },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "record_emotion_analysis" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error", aiResp.status, txt);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI returned no analysis" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    const sentiment = Math.max(-1, Math.min(1, Number(parsed.sentiment ?? 0)));

    // Persist to mood_entries (RLS ensures user owns it)
    const { error: updateErr } = await supabase
      .from("mood_entries")
      .update({
        ai_emotions: parsed.emotions ?? [],
        ai_sentiment: sentiment,
        ai_themes: parsed.themes ?? [],
        ai_summary: parsed.summary ?? null,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (updateErr) {
      console.error("DB update failed", updateErr);
      return new Response(JSON.stringify({ error: "Failed to save analysis" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        emotions: parsed.emotions,
        sentiment,
        themes: parsed.themes,
        summary: parsed.summary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("analyze-mood error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
