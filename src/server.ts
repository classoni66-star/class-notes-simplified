import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let CF_ENV: any = undefined;

const GLOBAL_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function getSecret(name: string): string | undefined {
  if (CF_ENV && CF_ENV[name]) return CF_ENV[name];
  const g: any = globalThis as any;
  if (g && g.env && g.env[name]) return g.env[name];
  if (g && g.process && g.process.env && g.process.env[name]) return g.process.env[name];
  return undefined;
}

function stripDataUrl(audio: string): string {
  if (!audio) return "";
  const idx = audio.indexOf("base64,");
  if (idx !== -1) return audio.slice(idx + 7);
  return audio;
}

const LESSON_SYSTEM_PROMPT = `You are the lesson architect behind Classoni. Take the notes or curriculum topic and produce ONE fully choreographed keypoint lesson as strict JSON.

OUTPUT FORMAT — STRICT JSON:
{
  "keypoint_title": "string",
  "sections": [
    { "id": "curiosity_question", "narration_text": "string", "visuals": [] },
    { "id": "keypoint_identity", "narration_text": "string", "visuals": [] },
    { "id": "emotional_hook", "narration_text": "string", "visuals": [] },
    { "id": "walkthrough", "narration_text": "string", "visuals": [] },
    { "id": "mental_anchor", "narration_text": "string", "visuals": [] },
    { "id": "common_confusion", "narration_text": "string", "visuals": [] }
  ],
  "apply": { "scenario": "string", "skeleton": "string or null", "solution": "string" },
  "quiz": { "type": "mcq", "question": "string", "options": ["A","B","C","D"], "correct_answer": "string", "explanation": "string" }
}

TEST MODE: Generate ONE keypoint only. Return ONE JSON object.`;

async function handleApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...GLOBAL_CORS, "Content-Type": "application/json" },
    });

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: GLOBAL_CORS });
  }

  if (url.pathname === "/api/health") {
    const key = getSecret("DEEPINFRA_API_KEY");
    return json({ status: "alive", keyPresent: !!key });
  }

  // ─── GENERATE LESSON (TEXT ONLY, NO AUDIO) ───
  if (url.pathname === "/api/generate-lesson") {
    try {
      const topic = url.searchParams.get("topic") || "";
      if (!topic) return json({ error: "topic is required" }, 400);
      
      const key = getSecret("DEEPINFRA_API_KEY");
      if (!key) return json({ error: "DeepInfra API key is missing" }, 500);

      const userMessage = "STANDARD CURRICULUM SOURCE\nSubject and topic: " + topic + "\n\nGenerate ONE keypoint.";

      const r = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V4-Flash",
          messages: [
            { role: "system", content: LESSON_SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          response_format: { type: "json_object" },
          max_tokens: 4000,
        }),
      });

      if (!r.ok) {
        const rawText = await r.text();
        return json({ error: "DeepInfra rejected: " + rawText.slice(0, 200) }, 500);
      }

      const data: any = await r.json();
      let content = data?.choices?.[0]?.message?.content || "";

      content = content.trim();
      if (content.startsWith("```json")) content = content.slice(7);
      else if (content.startsWith("```")) content = content.slice(3);
      if (content.endsWith("```")) content = content.slice(0, -3);
      content = content.trim();

      return new Response(content, { headers: { ...GLOBAL_CORS, "Content-Type": "application/json" } });
    } catch (err) {
      return json({ error: "Worker crashed: " + String(err) }, 500);
    }
  }

  // ─── GENERATE AUDIO (ONE CHUNK AT A TIME) ───
  if (url.pathname === "/api/generate-audio" && request.method === "POST") {
    try {
      const body: any = await request.json();
      const text = body.text || "";
      if (!text) return json({ error: "text is required" }, 400);

      const key = getSecret("DEEPINFRA_API_KEY");
      if (!key) return json({ error: "no key" }, 500);

      const r = await fetch("https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          preset_voice: "am_liam",
          speed: 1.0,
          output_format: "mp3",
          return_timestamps: true,
        }),
      });

      if (!r.ok) return json({ error: "Kokoro failed with status " + r.status }, 500);
      
      const data: any = await r.json();
      if (!data.audio) return json({ error: "No audio returned" }, 500);

      return json({
        audio: "data:audio/mpeg;base64," + stripDataUrl(data.audio),
        words: data.words || []
      });
    } catch (err) {
      return json({ error: "Audio crashed: " + String(err) }, 500);
    }
  }

  return null;
}

let serverEntryPromise: Promise<ServerEntry> | undefined;
async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then((m) => (m.default ?? m) as ServerEntry);
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
  return new Response(renderErrorPage(), { status: 500, headers: { "content-type": "text/html; charset=utf-8" } });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch { return false; }
}

export default {
  async fetch(request: Request, env: any, ctx: unknown) {
    CF_ENV = env;
    try {
      const apiResponse = await handleApi(request);
      if (apiResponse) return apiResponse;
    } catch (apiErr) {
      return new Response(JSON.stringify({ error: "API routing failed: " + String(apiErr) }), {
        status: 500, headers: { ...GLOBAL_CORS, "Content-Type": "application/json" }
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      return new Response(renderErrorPage(), { status: 500, headers: { ...GLOBAL_CORS, "content-type": "text/html; charset=utf-8" } });
    }
  },
};
