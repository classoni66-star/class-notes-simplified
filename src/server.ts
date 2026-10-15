import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { env as cfEnv } from "cloudflare:workers";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

// Cloudflare provides env via this import — TanStack Start's wrapper
// doesn't forward the function parameter reliably.
function getSecret(name: string): string | undefined {
  try {
    // Try the imported env first (Cloudflare Workers native pattern)
    if (cfEnv && (cfEnv as any)[name]) return (cfEnv as any)[name];
  } catch {
    // ignore
  }
  // Fallbacks in case Cloudflare injects them elsewhere
  const g: any = globalThis as any;
  if (g?.env?.[name]) return g.env[name];
  if (g?.process?.env?.[name]) return g.process.env[name];
  return undefined;
}

async function handleApi(request: Request, _env: any): Promise<Response | null> {
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
    const apiResponse = await handleApi(request, env);
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
