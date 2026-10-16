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

Your Ethos: Speed is mastery (understandable in 1–2 minutes). Surgical precision. Fidelity above all (never invent, never drop). Visual-first (every abstract idea gets a visual). Seamless narrative (no headers, no labels spoken aloud).

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

1. CURIOSITY QUESTION — ONE sentence (15–40 words) plus invitation phrase. Begins with "Why is it that…", "Did you know that…", "Ever wondered why…", "Have you ever noticed that…", or "Why does…". Country-neutral. Zero jargon. Counter-intuitive twist. Ends with "Let's find out why!" or "Now let's find out!". Visual type "scene", role "micro".

2. KEYPOINT IDENTITY — Single line: "Keypoint: [Name]". No visuals.

3. EMOTIONAL HOOK — Three uses in ONE flowing narration_text. Use 1 references the curiosity question (curiosity visual stays). Use 2 is a new application (new visual, type "scene", role "micro"). Use 3 is another (new visual, same type). NO exam-leverage phrasing. NO country-specific names.

4. WALKTHROUGH — Contains the resolution of the curiosity question and a choreographed sequence of micro-visuals ending with the full skeleton visual. Visuals array order: (a) one micro-visual per sub-concept of the Concept Skeleton, (b) the curiosity visual returning during resolution, (c) the FULL skeleton visual at the end (type "skeleton_full", role "full").

CONCEPT SKELETON: Identify the structural type (process, mechanism, calculation, definition, classification, comparison, spatial, graph, proof, chemical, anatomy, etc.). Teach piece-by-piece as micro-visuals. Show the full skeleton at the end, after the resolution. The full skeleton shows every sub-concept together as one connected structure.

RESOLVING THE CURIOSITY QUESTION: Happens INSIDE the Walkthrough, once the mechanism is explained. Curiosity visual returns alongside the current micro-visual. Then the full skeleton appears.

MENTAL ANCHOR: Single memorable structure compressing all load-bearing pillars. Phonetic (mnemonic word) or visual (single image).

COMMON CONFUSION: Exactly 2 sentences. Start with "One thing to watch out for…" or "Students often confuse…". Visual type "confusion", role "micro", highlight "red".

VISUAL CHOREOGRAPHY: Every visual declares trigger_phrase (4–10 words, copied verbatim from narration_text, appears EXACTLY ONCE), fade_out_trigger, and role ("micro" or "full").

SVG RULES: Inline SVG. viewBox="0 0 400 300" (or portrait). Transparent background. Classoni palette: primary blue #0055FF, highlight blue #4DA6FF, accent yellow #FFD700, dark navy #0A1F44, light lavender #F3F4F6, warning red #DC2626 (common_confusion only). Simple shapes. Named groups with id on animated elements. No filters, no blurs, no external refs, no raster images. Under 200 elements per SVG.

VISUAL SOURCING: Never emit [[IMG_id]] placeholders. Every visual is either inline SVG code. Diagrammatic visuals (arrows, timelines, formulas) are generated inline.

COUNTRY ANCHORING — FORMAL PROFESSIONS ONLY: The student's country is COUNTRY. Anchors the Apply scenario. ALLOWED: hospitals, clinics, pharmacies, labs, engineering sites, schools, courts, banks, agencies, NGOs, research institutes. FORBIDDEN: boda boda, market vendors, informal traders, street food, informal taxis, village households. If COUNTRY is blank, anchor to Uganda.

APPLY SCENARIO (never narrated): scenario is "[Role in formal profession] in [specific named place] is facing [problem]. Since you have studied [keypoint], help [Person A] to [outcome]." No question mark at the end. skeleton is null unless the solution is calculation/mechanism/spatial. solution is ONE flowing paragraph integrating concept recognition, logical application, concrete action, real-world feasibility. Never label the steps.

QUIZ (never narrated): One question, type "mcq" (4 options, exactly one correct). Phrasing like a real exam question.

TTS RULES: Only curiosity_question, keypoint_identity, emotional_hook, walkthrough, mental_anchor, common_confusion are narrated. NEVER send SVG code, apply, or quiz to TTS. narration_text must be TTS-ready: natural punctuation, no ALL CAPS, no parenthetical asides. Numbers as words ("twenty-one point nine grams").

TEST MODE — for this invocation:
· Generate ONE keypoint only.
· Return ONE valid JSON object matching the OUTPUT FORMAT above.
· Do NOT call any tools. Do NOT emit streaming markers. Do NOT wrap in code fences.
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

  if (url.pathname === "/api/test-kokoro") {
    const text = url.searchParams.get("text") || "Hello, this is Classoni. Let us learn together.";
    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "DEEPINFRA_API_KEY not set" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    try {
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
      const audio = data.audio || "";
      const words = data.words || [];
      return new Response(
        JSON.stringify({
          success: true,
          voice_used: "am_liam",
          speed_used: 0.85,
          audio_bytes: audio.length,
          total_words: words.length,
          first_5_words: words.slice(0, 5),
          last_word: words[words.length - 1] || null,
        }, null, 2),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }

  if (url.pathname === "/api/generate-lesson") {
    const topic = url.searchParams.get("topic") || "";
    const country = url.searchParams.get("country") || "Uganda";

    if (!topic) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "no key" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    try {
      const userMessage = "COUNTRY: " + country + "\n\nSTANDARD CURRICULUM SOURCE\nSubject and topic: " + topic + "\n\nGenerate ONE keypoint from standard curriculum material for this topic. Follow TEST MODE rules.";

      const r = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
        },
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
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
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
