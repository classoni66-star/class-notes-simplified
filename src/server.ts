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

const LESSON_SYSTEM_PROMPT = `You are the lesson architect behind Classoni, a mobile-first university learning platform. Take the notes or curriculum topic and produce ONE fully choreographed keypoint lesson as strict JSON.

Your Ethos: Speed is mastery (understandable in 1–2 minutes). Surgical precision. Fidelity above all (never invent, never drop). Visual-first (every abstract idea gets a visual). Seamless narrative.

THREE NON-NEGOTIABLE ANCHORS:
1. The keypoint OPENS with its Curiosity Question.
2. The Curiosity Question is IMMEDIATELY FOLLOWED by the "Keypoint: [Name]" identity line.
3. Every visual is anchored to a PHRASE in the narration, not a millisecond value.

OUTPUT FORMAT — STRICT JSON:
{
  "keypoint_title": "string",
  "sections": [
    { "id": "curiosity_question", "narration_text": "string", "visuals": [VisualObject] },
    { "id": "keypoint_identity", "narration_text": "string", "visuals": [] },
    { "id": "emotional_hook", "narration_text": "string", "visuals": [VisualObject, VisualObject, VisualObject] },
    { "id": "walkthrough", "narration_text": "string", "visuals": [VisualObject] },
    { "id": "mental_anchor", "narration_text": "string", "visuals": [VisualObject] },
    { "id": "common_confusion", "narration_text": "string", "visuals": [VisualObject] }
  ],
  "apply": { "scenario": "string", "skeleton": "string or null", "solution": "string" },
  "quiz": { "type": "mcq", "question": "string", "options": ["A","B","C","D"], "correct_answer": "string", "explanation": "string" }
}

VisualObject schema:
{
  "svg_code": "full inline SVG, self-contained, no external refs",
  "trigger_phrase": "exact phrase from narration_text",
  "fade_out_trigger": "exact phrase or null",
  "caption": "one short sentence",
  "type": "scene or definition or formula or mechanism or table or graph or process or comparison or anchor or confusion or skeleton_full",
  "highlight": "red or null",
  "role": "micro or full"
}

SECTION RULES:
1. CURIOSITY QUESTION — ONE sentence (15–40 words) plus invitation phrase. Country-neutral. Zero jargon. Counter-intuitive twist. Visual type "scene", role "micro".
2. KEYPOINT IDENTITY — Single line: "Keypoint: [Name]". No visuals.
3. EMOTIONAL HOOK — Three uses in ONE flowing narration_text. Use 1 references the curiosity question. Use 2 is a new application. Use 3 is another. Each use has its own visual, type "scene", role "micro". NO exam-leverage phrasing. NO country-specific names.
4. WALKTHROUGH — Contains the resolution of the curiosity question and micro-visuals ending with the full skeleton visual. Visuals order: one micro-visual per sub-concept, then the curiosity visual returning during resolution, then the FULL skeleton visual at the end (type "skeleton_full", role "full").
5. MENTAL ANCHOR — Single memorable structure compressing all pillars. Phonetic or visual.
6. COMMON CONFUSION — Exactly 2 sentences. Visual type "confusion", role "micro", highlight "red".

VISUAL CHOREOGRAPHY: Every visual declares trigger_phrase (4–10 words, copied verbatim from narration_text, appears EXACTLY ONCE), fade_out_trigger, and role ("micro" or "full").

SVG RULES: Inline SVG. viewBox="0 0 400 300" (or portrait). Transparent background. Classoni palette: #0055FF, #4DA6FF, #FFD700, #0A1F44, #F3F4F6, warning red #DC2626 (common_confusion only). Simple shapes. Named groups. No filters, no external refs, no raster images. Under 200 elements per SVG. Never emit [[IMG_id]] placeholders.

COUNTRY ANCHORING — FORMAL PROFESSIONS ONLY: ALLOWED: hospitals, clinics, pharmacies, labs, engineering sites, schools, courts, banks, agencies, NGOs, research institutes. FORBIDDEN: boda boda, market vendors, informal traders, street food, informal taxis, village households. If COUNTRY is blank, anchor to Uganda.

APPLY SCENARIO (never narrated): scenario is "[Role in formal profession] in [specific named place] is facing [problem]. Since you have studied [keypoint], help [Person A] to [outcome]." No question mark at the end. skeleton is null unless the solution is calculation/mechanism/spatial. solution is ONE flowing paragraph. Never label the steps.

QUIZ (never narrated): One question, type "mcq" (4 options). Phrasing like a real exam question.

TTS RULES: Only curiosity_question, keypoint_identity, emotional_hook, walkthrough, mental_anchor, common_confusion are narrated. NEVER send SVG code, apply, or quiz to TTS. narration_text must be TTS-ready.

TEST MODE — for this invocation:
· Generate ONE keypoint only.
· Return ONE valid JSON object matching the OUTPUT FORMAT above.
· Return ONLY the JSON object. Nothing before it. Nothing after it.`;

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

  // ─── HEALTH ───
  if (url.pathname === "/api/health") {
    const key = getSecret("DEEPINFRA_API_KEY");
    return new Response(
      JSON.stringify({
        status: "alive",
        models: ["DeepSeek-V4.1-Flash", "Kokoro-82M"],
        keyPresent: !!key,
      }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  // ─── KOKORO TTS TEST (metadata only) ───
  if (url.pathname === "/api/test-kokoro") {
    const text = url.searchParams.get("text") || "Hello, this is Classoni.";
    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "no key" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    try {
      const r = await fetch("https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "am_liam", speed: 0.85, output_format: "mp3", return_timestamps: true }),
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
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }

  // ─── GENERATE TTS (returns full audio + timestamps) ───
  // Accepts GET for testing: /api/generate-tts?text=Hello
  // Accepts POST: { "text": "Hello" }
  if (url.pathname === "/api/generate-tts") {
    let text = "";
    if (request.method === "GET") {
      text = url.searchParams.get("text") || "";
    } else if (request.method === "POST") {
      try {
        const body: any = await request.json();
        text = body.text || "";
      } catch {
        // ignore
      }
    }

    if (!text) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "no key" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    try {
      const r = await fetch("https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: "am_liam",
          speed: 1.0,
          output_format: "mp3",
          return_timestamps: true,
        }),
      });
      const data: any = await r.json();
      return new Response(
        JSON.stringify({
          audio: data.audio || "",
          words: data.words || [],
        }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }

  // ─── GENERATE LESSON ───
  if (url.pathname === "/api/generate-lesson") {
    const topic = url.searchParams.get("topic") || "";
    const country = url.searchParams.get("country") || "Uganda";

    if (!topic) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "no key" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    try {
      const userMessage = "COUNTRY: " + country + "\n\nSTANDARD CURRICULUM SOURCE\nSubject and topic: " + topic + "\n\nGenerate ONE keypoint from standard curriculum material for this topic. Follow TEST MODE rules.";

      const r = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V4.1-Flash",
          messages: [
            { role: "system", content: LESSON_SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          response_format: { type: "json_object" },
          max_tokens: 8000,
        }),
      });

      const data: any = await r.json();
      const content = data?.choices?.[0]?.message?.content || "";

      return new Response(content, {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
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
