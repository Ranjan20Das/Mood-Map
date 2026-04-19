// Tests for the analyze-mood edge function.
// Mocks the Lovable AI Gateway and Supabase auth/REST calls so the test runs offline.
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const FUNCTION_URL = "http://localhost:8000/analyze-mood";

interface MockState {
  aiCalls: number;
  dbUpdates: number;
  lastBody: unknown;
}

function installMockFetch(state: MockState, opts: { aiOk?: boolean; aiStatus?: number } = {}) {
  const original = globalThis.fetch;
  globalThis.fetch = async (input: string | Request | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();

    // Lovable AI Gateway
    if (url.includes("ai.gateway.lovable.dev")) {
      state.aiCalls++;
      state.lastBody = init?.body ? JSON.parse(init.body as string) : null;
      if (opts.aiOk === false) {
        return new Response("AI down", { status: opts.aiStatus ?? 500 });
      }
      return new Response(
        JSON.stringify({
          choices: [{
            message: {
              tool_calls: [{
                function: {
                  arguments: JSON.stringify({
                    emotions: ["calm", "hopeful"],
                    sentiment: 0.6,
                    themes: ["self-care"],
                    summary: "It sounds like a steady, hopeful day.",
                  }),
                },
              }],
            },
          }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Supabase auth.getUser
    if (url.includes("/auth/v1/user")) {
      return new Response(JSON.stringify({ id: "user-1", email: "t@test.dev" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // Supabase REST update on mood_entries
    if (url.includes("/rest/v1/mood_entries")) {
      state.dbUpdates++;
      return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return original(input as RequestInfo, init);
  };
  return () => { globalThis.fetch = original; };
}

async function loadHandler() {
  // Capture the handler registered via Deno.serve
  let captured: ((req: Request) => Response | Promise<Response>) | null = null;
  const origServe = Deno.serve;
  // @ts-ignore — override for capture
  Deno.serve = (handler: (req: Request) => Response | Promise<Response>) => {
    captured = handler;
    return { finished: Promise.resolve(), shutdown: async () => {} } as unknown as ReturnType<typeof Deno.serve>;
  };
  await import(`../analyze-mood/index.ts?t=${Date.now()}`);
  Deno.serve = origServe;
  if (!captured) throw new Error("Handler not registered");
  return captured;
}

Deno.test("analyze-mood: rejects unauthenticated requests", async () => {
  Deno.env.set("LOVABLE_API_KEY", "test-key");
  Deno.env.set("SUPABASE_URL", "http://localhost");
  Deno.env.set("SUPABASE_PUBLISHABLE_KEY", "anon");

  const handler = await loadHandler();
  const res = await handler(new Request(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entryId: "x", mood: 5 }),
  }));
  assertEquals(res.status, 401);
});

Deno.test("analyze-mood: returns analysis on success", async () => {
  Deno.env.set("LOVABLE_API_KEY", "test-key");
  Deno.env.set("SUPABASE_URL", "http://localhost");
  Deno.env.set("SUPABASE_PUBLISHABLE_KEY", "anon");
  const state: MockState = { aiCalls: 0, dbUpdates: 0, lastBody: null };
  const restore = installMockFetch(state);

  try {
    const handler = await loadHandler();
    const res = await handler(new Request(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer fake" },
      body: JSON.stringify({ entryId: "entry-1", mood: 7, journal: "Felt good", tags: ["work"] }),
    }));
    assertEquals(res.status, 200);
    const body = await res.json();
    assertExists(body.summary);
    assertEquals(body.emotions.length > 0, true);
    assertEquals(state.aiCalls, 1);
    assertEquals(state.dbUpdates >= 1, true);
  } finally {
    restore();
  }
});

Deno.test("analyze-mood: surfaces 429 from gateway", async () => {
  Deno.env.set("LOVABLE_API_KEY", "test-key");
  const state: MockState = { aiCalls: 0, dbUpdates: 0, lastBody: null };
  const restore = installMockFetch(state, { aiOk: false, aiStatus: 429 });
  try {
    const handler = await loadHandler();
    const res = await handler(new Request(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer fake" },
      body: JSON.stringify({ entryId: "entry-1", mood: 5 }),
    }));
    assertEquals(res.status, 429);
  } finally {
    restore();
  }
});

Deno.test("analyze-mood: handles CORS preflight", async () => {
  const handler = await loadHandler();
  const res = await handler(new Request(FUNCTION_URL, { method: "OPTIONS" }));
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
});
