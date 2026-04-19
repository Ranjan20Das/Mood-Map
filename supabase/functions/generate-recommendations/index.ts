// Edge function: generate personalized recommendations + bad-day alert
// based on the user's recent mood entries.
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
    name: "record_recommendations",
    description: "Return personalized, evidence-informed wellness recommendations.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        overall_mood: {
          type: "string",
          enum: ["thriving", "steady", "mixed", "low", "struggling"],
        },
        message: {
          type: "string",
          description: "1-2 sentence empathetic reflection of the user's recent state (max 220 chars).",
        },
        activities: {
          type: "array",
          description: "3-5 actionable activity suggestions tailored to the user's pattern.",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              duration_min: { type: "number" },
              category: {
                type: "string",
                enum: ["movement", "mindfulness", "social", "creative", "rest", "nature", "growth"],
              },
            },
            required: ["title", "description", "duration_min", "category"],
          },
        },
        music: {
          type: "array",
          description: "2-3 music vibe suggestions (genre, energy, example artists). No links.",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              vibe: { type: "string" },
              description: { type: "string" },
              example_artists: { type: "array", items: { type: "string" } },
            },
            required: ["vibe", "description", "example_artists"],
          },
        },
        bad_day_alert: {
          type: "object",
          additionalProperties: false,
          properties: {
            triggered: { type: "boolean" },
            reason: { type: "string", description: "Short explanation if triggered, else empty string." },
            coping_tips: {
              type: "array",
              description: "If triggered, 3 immediate coping tips. Else empty array.",
              items: { type: "string" },
            },
          },
          required: ["triggered", "reason", "coping_tips"],
        },
      },
      required: ["overall_mood", "message", "activities", "music", "bad_day_alert"],
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

    // Pull last 14 days of entries
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const { data: entries, error: fetchErr } = await supabase
      .from("mood_entries")
      .select("id, mood, journal, tags, entry_date, ai_emotions, ai_themes")
      .eq("user_id", user.id)
      .gte("entry_date", cutoffStr)
      .order("entry_date", { ascending: false })
      .limit(30);

    if (fetchErr) {
      console.error("Fetch entries failed", fetchErr);
      return new Response(JSON.stringify({ error: "Failed to load entries" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ error: "Log at least one mood entry to get personalized recommendations." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const avg = entries.reduce((s, e) => s + e.mood, 0) / entries.length;
    const summary = entries.slice(0, 10).map((e) => {
      const parts = [`${e.entry_date}: ${e.mood}/10`];
      if (e.tags?.length) parts.push(`tags=${e.tags.join("|")}`);
      if (e.ai_emotions?.length) parts.push(`emotions=${e.ai_emotions.join("|")}`);
      if (e.journal) parts.push(`note="${String(e.journal).slice(0, 140)}"`);
      return parts.join(" ");
    }).join("\n");

    const userText = `Recent ${entries.length} entries (avg ${avg.toFixed(1)}/10):\n${summary}`;

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
              "You are a warm, evidence-informed wellness coach. Generate personalized activity, music vibe, and (if needed) bad-day coping suggestions from a user's recent mood log. Trigger bad_day_alert ONLY if average mood is < 4 OR multiple entries show distress. Never give medical advice. If serious distress is detected, encourage talking to a trusted person or local helpline.",
          },
          { role: "user", content: userText },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "record_recommendations" } },
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
      return new Response(JSON.stringify({ error: "AI returned no recommendations" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);

    const entryIds = entries.map((e) => e.id);

    // Save recommendations
    await supabase.from("ai_recommendations").insert({
      user_id: user.id,
      kind: "recommendations",
      payload: parsed,
      based_on_entry_ids: entryIds,
      avg_mood: Number(avg.toFixed(2)),
    });

    // Save bad-day alert separately if triggered
    if (parsed.bad_day_alert?.triggered) {
      await supabase.from("ai_recommendations").insert({
        user_id: user.id,
        kind: "bad_day_alert",
        payload: parsed.bad_day_alert,
        based_on_entry_ids: entryIds,
        avg_mood: Number(avg.toFixed(2)),
      });
    }

    return new Response(JSON.stringify({ recommendations: parsed, avg_mood: Number(avg.toFixed(2)) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recommendations error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
