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

const LESSON_SYSTEM_PROMPT = `You are the lesson architect behind Classoni. Take the notes or curriculum topic and produce ONE keypoint broken into micro-concepts as strict JSON.

You MUST return a valid JSON object. Do NOT return an empty object like {}. You MUST populate the "micro_steps" array with at least 2 steps.

OUTPUT FORMAT — STRICT JSON:
{
  "keypoint_title": "String",
  "location_indicator": "1.1",
  "micro_steps": [
    {
      "step_number": 1,
      "micro_step_title": "String (e.g., 'Particles Never Sit Still')",
      "visual_skeleton_text": "String (A short, punchy bulleted list. Use \\n for line breaks. DO NOT GENERATE SVG CODE.)",
      "audio_segments": ["String", "String"], 
      "explain_context": "String (The core marking pillars the student must mention)"
    },
    {
      "step_number": 2,
      "micro_step_title": "String",
      "visual_skeleton_text": "String",
      "audio_segments": ["String", "String"], 
      "explain_context": "String"
    }
  ],
  "apply": {
    "title": "String",
    "scenario": "String",
    "solution": "String"
  },
  "quiz": {
    "title": "String",
    "type": "mcq",
    "question": "String",
    "options": ["A","B","C","D"],
    "correct_answer": "String",
    "explanation": "String"
  }
}

TEST MODE: Return ONE JSON object. Nothing before or after.`;

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
    return json({ status: "alive" });
  }

  // ─── GENERATE LESSON ───
  if (url.pathname === "/api/generate-lesson" && request.method === "POST") {
    try {
      const body: any = await request.json();
      const topic = body.topic || "General Studies";
      const notes = body.notes || "";

      const key = getSecret("DEEPINFRA_API_KEY");
      if (!key) return json({ error: "API key missing" }, 500);

      // If notes exist, we tell the AI to use them. If not, standard curriculum.
      let userMessage = "";
      if (notes.trim().length > 10) {
        userMessage = `STUDENT'S NOTES:\n${notes}\n\nExtract the core keypoints from these specific notes and generate the lesson. Ensure micro_steps is populated.`;
      } else {
        userMessage = `STANDARD CURRICULUM SOURCE\nSubject and topic: ${topic}\n\nGenerate ONE keypoint. Ensure micro_steps is populated.`;
      }

      const r = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V4-Flash-0731",
          messages: [
            { role: "system", content: LESSON_SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          response_format: { type: "json_object" },
          max_tokens: 4000,
        }),
      });

      if (!r.ok) {
        const errText = await r.text();
        return json({ error: "DeepInfra rejected: " + errText.slice(0, 150) }, 500);
      }

      const data: any = await r.json();
      let content = data?.choices?.[0]?.message?.content || "";

      // Strip markdown if the AI adds it
      content = content.trim();
      if (content.startsWith("```json")) content = content.slice(7);
      else if (content.startsWith("```")) content = content.slice(3);
      if (content.endsWith("```")) content = content.slice(0, -3);
      content = content.trim();

      // Validate the JSON structure before sending to frontend
      try {
        const parsed = JSON.parse(content);
        if (!parsed.micro_steps || !Array.isArray(parsed.micro_steps) || parsed.micro_steps.length === 0) {
          return json({ error: "AI returned malformed data. Missing micro_steps. Raw: " + content.slice(0, 100) }, 500);
        }
      } catch (e) {
        return json({ error: "AI returned invalid JSON." }, 500);
      }

      return new Response(content, { headers: { ...GLOBAL_CORS, "Content-Type": "application/json" } });
    } catch (err) {
      return json({ error: "Worker crashed: " + String(err) }, 500);
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
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: any, ctx: unknown) {
    CF_ENV = env;
    try {
      const apiResponse = await handleApi(request);
      if (apiResponse) return apiResponse;
    } catch (apiErr) {
      return new Response(JSON.stringify({ error: "API routing failed: " + String(apiErr) }), {
        status: 500,
        headers: { ...GLOBAL_CORS, "Content-Type": "application/json" },
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { ...GLOBAL_CORS, "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
