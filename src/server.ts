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

const LESSON_SYSTEM_PROMPT = `You are the master lesson architect behind Classoni. Your goal is to teach with REAL CLARITY, using micro-bits. Do not dump information. You don't truly know it until you can explain it.

Take the notes or curriculum topic and break it down into ALL the essential Keypoints. 

RULES:
1. NEVER write walls of text. Keep summaries to 1 sentence. Keep audio segments to short, conversational sentences.
2. Scenarios MUST use formal professions in Uganda (e.g., hospital, bank, lab, court, engineering site). NEVER use informal economy (boda bodas, market vendors).
3. For each micro-step, provide a "visual_search_query" using only 1 or 2 simple words (e.g., "blood cells", "survey form", "microscope").

You MUST return a valid JSON object. Do not use markdown backticks. Return ONLY the raw JSON object starting with { and ending with }.

{
  "topic": "The Main Subject",
  "keypoints": [
    {
      "keypoint_number": 1,
      "keypoint_title": "Main Keypoint Name",
      "micro_steps": [
        {
          "step_number": 1,
          "micro_step_title": "Micro Concept 1",
          "visual_search_query": "simple words",
          "summary_text": "One clear sentence summarizing this micro-bit.",
          "visual_skeleton_text": "• Core definition\\n• Key characteristic\\n• The underlying logic",
          "audio_segments": ["Short sentence to narrate.", "Another short sentence."],
          "explain_context": "The core pillars the student must mention."
        }
      ],
      "apply": {
        "title": "Application in a formal profession",
        "scenario": "A real-world scenario in a Ugandan hospital/bank/lab.",
        "solution": "The solution."
      },
      "quiz": {
        "title": "Exam Question",
        "type": "mcq",
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "A",
        "explanation": "Why A is correct."
      }
    }
  ]
}`;

async function getVisualImage(query: string): Promise<string> {
  const cleanQuery = encodeURIComponent((query || "education").trim().replace(/[^a-zA-Z0-9 ]/g, ""));
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); 

    const res = await fetch(`https://api.openverse.org/v1/images/?q=${cleanQuery}&page_size=1&mature=false`, {
      headers: { "User-Agent": "ClassoniApp/1.0" },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: any = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].thumbnail || data.results[0].url;
      }
    }
  } catch (e) {
    console.error("Openverse failed:", e);
  }
  
  return `https://placehold.co/600x400/F3F4F6/0A1F44?text=${cleanQuery.replace(/%20/g, '+')}`;
}

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

  if (url.pathname === "/api/generate-lesson" && request.method === "POST") {
    try {
      const body: any = await request.json();
      const topic = body.topic || "General Studies";
      let notes = body.notes || "";

      if (notes.length > 3000) {
        notes = notes.slice(0, 3000) + "\n...[Text truncated]...";
      }

      const key = getSecret("DEEPINFRA_API_KEY");
      if (!key) return json({ error: "API key missing" }, 500);

      let userMessage = "";
      if (notes.trim().length > 10) {
        userMessage = `STUDENT'S NOTES:\n${notes}\n\nExtract all keypoints and generate the JSON.`;
      } else {
        userMessage = `STANDARD CURRICULUM SOURCE\nSubject and topic: ${topic}\n\nGenerate all keypoints in the JSON format.`;
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
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!r.ok) {
        const errText = await r.text();
        return json({ error: "DeepInfra rejected: " + errText.slice(0, 150) }, 500);
      }

      const data: any = await r.json();
      let content = data?.choices?.[0]?.message?.content || "";

      content = content.trim();
      if (content.startsWith("```json")) content = content.slice(7);
      else if (content.startsWith("```")) content = content.slice(3);
      if (content.endsWith("```")) content = content.slice(0, -3);
      content = content.trim();

      const startIdx = content.indexOf("{");
      const endIdx = content.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        content = content.slice(startIdx, endIdx + 1);
      }

      let parsed: any;
      try {
        parsed = JSON.parse(content);
        if (!parsed.keypoints || !Array.isArray(parsed.keypoints) || parsed.keypoints.length === 0) {
          return json({ error: "AI returned JSON without keypoints. Raw: " + content.slice(0, 100) }, 500);
        }
      } catch (e) {
        return json({ error: "AI returned invalid JSON format. Raw: " + content.slice(0, 100) }, 500);
      }

      // Attach Images to EVERY micro-step in EVERY keypoint
      if (parsed.keypoints && Array.isArray(parsed.keypoints)) {
        for (const kp of parsed.keypoints) {
          if (kp.micro_steps && Array.isArray(kp.micro_steps)) {
            kp.micro_steps = await Promise.all(
              kp.micro_steps.map(async (step: any) => {
                const query = step.visual_search_query || step.micro_step_title || topic;
                const imgUrl = await getVisualImage(query);
                return { ...step, visual_image_url: imgUrl };
              })
            );
          }
        }
      }

      return new Response(JSON.stringify(parsed), { headers: { ...GLOBAL_CORS, "Content-Type": "application/json" } });
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
        status: 500, headers: { ...GLOBAL_CORS, "Content-Type": "application/json" },
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      return new Response(renderErrorPage(), {
        status: 500, headers: { ...GLOBAL_CORS, "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
