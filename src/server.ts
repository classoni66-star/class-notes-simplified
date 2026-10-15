import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

// ─────────────────────────────────────────────────────────
// CLASSONI API ROUTES
// These run BEFORE the frontend. If a request hits /api/*,
// we handle it here. Otherwise, we pass through to the app.
// ─────────────────────────────────────────────────────────
async function handleApi(request: Request, env: any): Promise<Response | null> {
  const url = new URL(request.url);

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // Health check
  if (url.pathname === "/api/health") {
    return new Response(
      JSON.stringify({
        status: "alive",
        models: ["DeepSeek-V4.1-Flash", "Kokoro-82M"],
      }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  // DeepSeek test
  if (url.pathname === "/api/test-deepseek" && request.method === "POST") {
    try {
      const body: any = await request.json().catch(() => ({}));
      const topic = body.topic || "general studies";
      const r = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + env.DEEPINFRA_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V4.1-Flash",
          messages: [
            { role: "user", content: "Say exactly: Classoni is alive. Topic: " + topic },
          ],
        }),
      });
      const data = await r.json();
      return new Response(JSON.stringify(data), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }

  // Kokoro test
  if (url.pathname === "/api/test-kokoro" && request.method === "POST") {
    try {
      const body: any = await request.json().catch(() => ({}));
      const text = body.text || "Hello, this is Classoni.";
      const r = await fetch("https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + env.DEEPINFRA_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voice: "am_liam",
          speed: 0.85,
          output_format: "mp3",
          return_timestamps: true,
        }),
      });
      const data = await r.json();
      return new Response(JSON.stringify(data), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }

  return null; // Not an API route — pass through to the frontend
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// "{"unhandled":true,"message":"HTTPError"}" — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: any, ctx: unknown) {
    // 1. Handle Classoni API routes first
    const apiResponse = await handleApi(request, env);
    if (apiResponse) return apiResponse;

    // 2. Otherwise, hand off to the TanStack Start frontend
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
