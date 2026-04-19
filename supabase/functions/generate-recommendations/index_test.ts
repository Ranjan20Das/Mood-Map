// Tests for the generate-recommendations edge function.
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const FUNCTION_URL = "http://localhost:8000/generate-recommendations";

interface MockState {
  aiCalls: number;
  inserts: number;
  entriesReturned: number;
}

function installMockFetch(state: MockState, opts: { entries?: number; aiStatus?: number } = {}) {
  const entries = opts.entries ?? 5;
  const original = globalThis.fetch;
  globalThis.fetch = async (input: string | Request | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();

    if (url.includes("ai.gateway.lovable.dev")) {
      state.aiCalls++;
      if (opts.aiStatus && opts.aiStatus !== 200) {
        return new Response("err", { status: opts.aiStatus });
      }
      return new Response(JSON.stringify({
        choices: [{
          message: {
            tool_calls: [{
              function: {
                arguments: JSON.stringify({
                  overall_mood: "steady",
                  message: "You're holding a steady rhythm.",
                  activities: [{ title: "Walk", description: "10 min walk", duration_min: 10, category: "movement" }],
                  music: [{ vibe: "lo-fi", description: "calm beats", example_artists: ["Nujabes"] }],
                  bad_day_alert: { triggered: false, reason: "", coping_tips: [] },
                }),
              },
            }],
          },
        }],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (url.includes("/auth/v1/user")) {
      return new Response(JSON.stringify({ id: "user-1" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/rest/v1/mood_entries")) {
      state.entriesReturned = entries;
      const rows = Array.from({ length: entries }, (_, i) => ({
        id: `e-${i}`, mood: 6, journal: "ok", tags: ["work"], entry_date: "2026-04-19",
        ai_emotions: null, ai_themes: null,
      }));
      return new Response(JSON.stringify(rows), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/rest/v1/ai_recommendations")) {
      state.inserts++;
      return new Response("[]", { status: 201 });
    }

    return original(input as RequestInfo, init);
  };
  return () => { globalThis.fetch = original; };
}

type Handler = (req: Request) => Response | Promise<Response>;

async function loadHandler(): Promise<Handler> {
  let captured: Handler | null = null;
  const origServe = Deno.serve;
  // @ts-ignore — override
  Deno.serve = (handler: Handler) => {
    captured = handler;
    return { finished: Promise.resolve(), shutdown: async () => {} } as unknown as ReturnType<typeof Deno.serve>;
  };
  await import(`../generate-recommendations/index.ts?t=${Date.now()}`);
  Deno.serve = origServe;
  if (!captured) throw new Error("Handler not registered");
  return captured as Handler;
}

Deno.test({ name: "generate-recommendations: 401 without auth", sanitizeResources: false, sanitizeOps: false, fn: async () => {
  Deno.env.set("LOVABLE_API_KEY", "test-key");
  Deno.env.set("SUPABASE_URL", "http://localhost");
  Deno.env.set("SUPABASE_PUBLISHABLE_KEY", "anon");
  const handler = await loadHandler();
  const res = await handler(new Request(FUNCTION_URL, { method: "POST", body: "{}" }));
  assertEquals(res.status, 401);
} });

Deno.test({ name: "generate-recommendations: 400 when no entries", sanitizeResources: false, sanitizeOps: false, fn: async () => {
  const state: MockState = { aiCalls: 0, inserts: 0, entriesReturned: 0 };
  const restore = installMockFetch(state, { entries: 0 });
  try {
    const handler = await loadHandler();
    const res = await handler(new Request(FUNCTION_URL, {
      method: "POST",
      headers: { Authorization: "Bearer fake", "Content-Type": "application/json" },
      body: "{}",
    }));
    assertEquals(res.status, 400);
    assertEquals(state.aiCalls, 0);
  } finally {
    restore();
  }
} });

Deno.test({ name: "generate-recommendations: returns recommendations and persists", sanitizeResources: false, sanitizeOps: false, fn: async () => {
  const state: MockState = { aiCalls: 0, inserts: 0, entriesReturned: 0 };
  const restore = installMockFetch(state, { entries: 5 });
  try {
    const handler = await loadHandler();
    const res = await handler(new Request(FUNCTION_URL, {
      method: "POST",
      headers: { Authorization: "Bearer fake", "Content-Type": "application/json" },
      body: "{}",
    }));
    assertEquals(res.status, 200);
    const body = await res.json();
    assertExists(body.recommendations);
    assertEquals(body.recommendations.activities.length > 0, true);
    assertEquals(state.aiCalls, 1);
    assertEquals(state.inserts >= 1, true);
  } finally {
    restore();
  }
} });
