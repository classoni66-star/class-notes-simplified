import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let CF_ENV: any = undefined;

function getSecret(name: string): string | undefined {
  if (CF_ENV && CF_ENV[name]) return CF_ENV[name];
  const g: any = globalThis as any;
  if (g && g.env && g.env[name]) return g.env[name];
  if (g && g.process && g.process.env && g.process.env[name]) return g.process.env[name];
  return undefined;
}

async function handleApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (url.pathname === "/api/health") {
    const topic = url.searchParams.get("topic") || "general studies";
    const key = getSecret("DEEPINFRA_API_KEY");
    let deepseekResult: any;
    if (!key) {
      deepseekResult = { error: "DEEPINFRA_API_KEY secret is not set on this worker" };
    } else {
      try {
        const r = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-V4.1-Flash",
            messages: [
              { role: "user", content: "Say exactly: Classoni is alive. Topic: " + topic },
            ],
          }),
        });
        deepseekResult = await r.json();
      } catch (err) {
        deepseekResult = { error: String(err) };
      }
    }

    return new Response(
      JSON.stringify({
        status: "alive",
        models: ["DeepSeek-V4.1-Flash", "Kokoro-82M"],
        keyPresent: !!key,
        deepseek: deepseekResult,
      }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  return null;
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

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.indexOf("application/json") !== -1) return response;
  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;
  console.error(consumeLastCapturedError() || new Error("h3 swallowed SSR error: " + body));
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
    CF_ENV = env;
    const apiResponse = await handleApi(request);
    if (apiResponse) return apiResponse;

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
if (url.pathname === "/api/test-kokoro") {
  const text = url.searchParams.get("text") || "Hello, this is Classoni.";
  const key = getSecret("DEEPINFRA_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: "no key" }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const r = await fetch("https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
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
  const data: any = await r.json();
  return new Response(
    JSON.stringify({
      success: true,
      audio_bytes: (data.audio || "").length,
      total_words: (data.words || []).length,
      first_5_words: (data.words || []).slice(0, 5),
    }, null, 2),
    { headers: { ...cors, "Content-Type": "application/json" } }
  );
    }
