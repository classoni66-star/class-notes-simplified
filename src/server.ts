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

function stripDataUrl(audio: string): string {
  if (!audio) return "";
  const idx = audio.indexOf("base64,");
  if (idx !== -1) return audio.slice(idx + 7);
  return audio;
}

function b64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s+/g, "");
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const sub = bytes.subarray(i, i + CHUNK);
    bin += String.fromCharCode.apply(null, Array.from(sub));
  }
  return btoa(bin);
}

// Compute the real duration of an MP3 file from its header + size
function mp3DurationSeconds(bytes: Uint8Array): number {
  let offset = 0;
  // Skip ID3v2 tag if present
  if (bytes.length >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const size =
      ((bytes[6] & 0x7f) << 21) |
      ((bytes[7] & 0x7f) << 14) |
      ((bytes[8] & 0x7f) << 7) |
      (bytes[9] & 0x7f);
    offset = 10 + size;
  }
  // Find first MP3 frame sync
  while (offset < bytes.length - 1) {
    if (bytes[offset] === 0xff && (bytes[offset + 1] & 0xe0) === 0xe0) break;
    offset++;
  }
  if (offset >= bytes.length - 4) return 0;

  const b1 = bytes[offset + 1];
  const b2 = bytes[offset + 2];
  const mpegVersion = (b1 >> 3) & 0x03;
  const layer = (b1 >> 1) & 0x03;
  const bitrateIndex = (b2 >> 4) & 0x0f;
  const sampleRateIndex = (b2 >> 2) & 0x03;

  const bitratesV1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const bitratesV2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
  const sampleRatesV1 = [44100, 48000, 32000, 0];
  const sampleRatesV2 = [22050, 24000, 16000, 0];

  let bitrate = 0;
  let sampleRate = 0;
  if (mpegVersion === 3) {
    bitrate = bitratesV1L3[bitrateIndex] || 128;
    sampleRate = sampleRatesV1[sampleRateIndex] || 44100;
  } else {
    bitrate = bitratesV2L3[bitrateIndex] || 32;
    sampleRate = sampleRatesV2[sampleRateIndex] || 24000;
  }
  if (bitrate === 0 || sampleRate === 0) return 0;

  // CBR estimate: duration = (total_bytes - header) * 8 / (bitrate_kbps * 1000)
  const dataBytes = bytes.length - offset;
  return (dataBytes * 8) / (bitrate * 1000);
}

const LESSON_SYSTEM_PROMPT = `You are the lesson architect behind Classoni, a mobile-first university learning platform. Take the notes or curriculum topic and produce ONE fully choreographed keypoint lesson as strict JSON.

Your Ethos: Speed is mastery (1–2 minutes). Surgical precision. Fidelity above all. Visual-first. Seamless narrative.

THREE NON-NEGOTIABLE ANCHORS:
1. The keypoint OPENS with its Curiosity Question.
2. The Curiosity Question is IMMEDIATELY FOLLOWED by "Keypoint: [Name]".
3. Every visual is anchored to a PHRASE in the narration.

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
  "svg_code": "full inline SVG, self-contained",
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
3. EMOTIONAL HOOK — Three uses in ONE flowing narration_text. Each has its own visual, type "scene", role "micro".
4. WALKTHROUGH — Contains the resolution and micro-visuals ending with the full skeleton visual (type "skeleton_full", role "full").
5. MENTAL ANCHOR — Single memorable structure. Phonetic or visual.
6. COMMON CONFUSION — Exactly 2 sentences. Visual type "confusion", role "micro", highlight "red".

VISUAL CHOREOGRAPHY: Every visual declares trigger_phrase (4–10 words, verbatim), fade_out_trigger, and role.

SVG RULES: Inline. viewBox="0 0 400 300". Transparent. Palette: #0055FF, #4DA6FF, #FFD700, #0A1F44, #F3F4F6, red #DC2626. Simple shapes. No filters, no external refs, no raster. Under 200 elements.

COUNTRY ANCHORING — FORMAL PROFESSIONS ONLY: hospitals, clinics, pharmacies, labs, engineering sites, schools, courts, banks, agencies, NGOs, research institutes. FORBIDDEN: informal-economy settings. If COUNTRY is blank, anchor to Uganda.

APPLY SCENARIO (never narrated): "[Role in formal profession] in [named place] is facing [problem]. Since you have studied [keypoint], help [Person A] to [outcome]."

QUIZ (never narrated): One "mcq" question with 4 options.

TTS RULES: Only the 6 section ids are narrated.

TEST MODE: Generate ONE keypoint only. Return ONE JSON object. Nothing before or after.`;

async function handleApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // ─── HEALTH ───
  if (url.pathname === "/api/health") {
    const key = getSecret("DEEPINFRA_API_KEY");
    return json({ status: "alive", keyPresent: !!key });
  }

  // ─── DIAGNOSTIC: VOICE NAMES ───
  if (url.pathname === "/api/debug-voice") {
    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) return json({ error: "no key" }, 500);

    const results: any[] = [];
    // Try several parameter names
    for (const paramName of ["voice", "preset_voice", "speaker", "voice_id"]) {
      const payload: any = {
        text: "Testing voice parameter",
        speed: 1.0,
        output_format: "mp3",
        return_timestamps: false,
      };
      payload[paramName] = "am_liam";

      try {
        const r = await fetch(
          "https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        const data: any = await r.json();
        results.push({
          param_used: paramName,
          status: r.status,
          response_keys: Object.keys(data).slice(0, 12),
          audio_bytes: (data.audio || "").length,
        });
      } catch (err) {
        results.push({
          param_used: paramName,
          status: "error",
          error: String(err).slice(0, 100),
        });
      }
    }
    return json({ results });
  }

  // ─── DIAGNOSTIC: KOKORO RAW ───
  if (url.pathname === "/api/debug-kokoro2") {
    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) return json({ error: "no key" }, 500);

    const r = await fetch(
      "https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Hello world",
          preset_voice: "am_liam",
          speed: 1.0,
          output_format: "mp3",
          return_timestamps: true,
        }),
      }
    );
    const data: any = await r.json();
    const audioBytes = stripDataUrl(data.audio || "").length;
    return json({
      response_keys: Object.keys(data),
      words_count: (data.words || []).length,
      last_word_end: data.words?.[data.words.length - 1]?.end,
      audio_data_url_bytes: (data.audio || "").length,
      audio_raw_b64_bytes: audioBytes,
      first_word: data.words?.[0],
    });
  }

  // ─── GENERATE FULL AUDIO — continuous ───
  if (url.pathname === "/api/generate-full-audio" && request.method === "POST") {
    const body: any = await request.json();
    const sections = body.sections || [];
    if (!Array.isArray(sections) || sections.length === 0) {
      return json({ error: "sections array is required" }, 400);
    }

    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) return json({ error: "no key" }, 500);

    const allBytes: Uint8Array[] = [];
    const allWords: any[] = [];
    const sectionBoundaries: any[] = [];
    const errors: string[] = [];
    let cumulativeOffset = 0;
    let wordId = 0;
    const SECTION_GAP = 0.4;
    const CHUNK_SIZE = 40;

    for (let si = 0; si < sections.length; si++) {
      const section = sections[si];
      const text = (section.narration_text || "").trim();
      if (!text) {
        sectionBoundaries.push({ id: section.id, start: cumulativeOffset, end: cumulativeOffset });
        continue;
      }

      const wordsInSection = text.split(/\s+/).filter(Boolean);
      const chunks: string[] = [];
      for (let i = 0; i < wordsInSection.length; i += CHUNK_SIZE) {
        chunks.push(wordsInSection.slice(i, i + CHUNK_SIZE).join(" "));
      }

      const sectionStart = cumulativeOffset;

      for (let ci = 0; ci < chunks.length; ci++) {
        try {
          const r = await fetch(
            "https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M",
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + key,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: chunks[ci],
                preset_voice: "am_liam",
                speed: 1.0,
                output_format: "mp3",
                return_timestamps: true,
              }),
            }
          );

          if (!r.ok) {
            errors.push(`sec ${si} chunk ${ci} HTTP ${r.status}`);
            continue;
          }

          const data: any = await r.json();
          const audioRaw = data.audio || "";
          if (!audioRaw || audioRaw.length < 100) {
            errors.push(`sec ${si} chunk ${ci} no audio`);
            continue;
          }

          const chunkBytes = b64ToBytes(stripDataUrl(audioRaw));
          allBytes.push(chunkBytes);

          // Measure the actual chunk duration from MP3 bytes
          const measuredDuration = mp3DurationSeconds(chunkBytes);

          // Kokoro's word timings are relative to chunk start (already include lead silence)
          for (const w of data.words || []) {
            allWords.push({
              id: wordId++,
              start: w.start + cumulativeOffset,
              end: w.end + cumulativeOffset,
              text: w.text,
              section: si,
            });
          }

          // Advance cumulative offset by the ACTUAL chunk duration
          const lastWordEnd = (data.words || []).length
            ? data.words[data.words.length - 1].end
            : 0;
          const advance = Math.max(measuredDuration, lastWordEnd + 0.5);
          cumulativeOffset += advance;
        } catch (err) {
          errors.push(`sec ${si} chunk ${ci}: ${String(err).slice(0, 100)}`);
        }
      }

      sectionBoundaries.push({
        id: section.id,
        start: sectionStart,
        end: cumulativeOffset,
      });
      cumulativeOffset += SECTION_GAP;
    }

    if (allBytes.length === 0) {
      return json({ error: "All chunks failed", details: errors }, 500);
    }

    const totalLen = allBytes.reduce((s, b) => s + b.length, 0);
    const merged = new Uint8Array(totalLen);
    let pos = 0;
    for (const b of allBytes) {
      merged.set(b, pos);
      pos += b.length;
    }

    return json({
      audio: "data:audio/mpeg;base64," + bytesToB64(merged),
      words: allWords,
      sectionBoundaries,
      totalChunks: allBytes.length,
      estimatedDuration: cumulativeOffset,
      errors: errors.length ? errors : undefined,
    });
  }

  // ─── LEGACY: single-section TTS ───
  if (url.pathname === "/api/generate-tts") {
    let text = "";
    if (request.method === "GET") text = url.searchParams.get("text") || "";
    else if (request.method === "POST") {
      try {
        const body: any = await request.json();
        text = body.text || "";
      } catch {}
    }
    if (!text) return json({ error: "text is required" }, 400);
    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) return json({ error: "no key" }, 500);

    const words = text.split(/\s+/).filter(Boolean);
    const CHUNK_SIZE = 40;
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += CHUNK_SIZE)
      chunks.push(words.slice(i, i + CHUNK_SIZE).join(" "));

    const allBytes: Uint8Array[] = [];
    const allWords: any[] = [];
    const errors: string[] = [];
    let cumulativeOffset = 0;
    let wordId = 0;

    for (let ci = 0; ci < chunks.length; ci++) {
      try {
        const r = await fetch(
          "https://api.deepinfra.com/v1/inference/hexgrad/Kokoro-82M",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: chunks[ci],
              preset_voice: "am_liam",
              speed: 1.0,
              output_format: "mp3",
              return_timestamps: true,
            }),
          }
        );
        if (!r.ok) {
          errors.push(`chunk ${ci} HTTP ${r.status}`);
          continue;
        }
        const data: any = await r.json();
        const audioRaw = data.audio || "";
        if (!audioRaw || audioRaw.length < 100) {
          errors.push(`chunk ${ci} no audio`);
          continue;
        }
        const chunkBytes = b64ToBytes(stripDataUrl(audioRaw));
        allBytes.push(chunkBytes);

        const measuredDuration = mp3DurationSeconds(chunkBytes);
        for (const w of data.words || []) {
          allWords.push({
            id: wordId++,
            start: w.start + cumulativeOffset,
            end: w.end + cumulativeOffset,
            text: w.text,
          });
        }
        const lastWordEnd = (data.words || []).length
          ? data.words[data.words.length - 1].end
          : 0;
        cumulativeOffset += Math.max(measuredDuration, lastWordEnd + 0.5);
      } catch (err) {
        errors.push(`chunk ${ci}: ${String(err).slice(0, 100)}`);
      }
    }

    if (allBytes.length === 0)
      return json({ error: "All chunks failed", details: errors }, 500);

    const totalLen = allBytes.reduce((s, b) => s + b.length, 0);
    const merged = new Uint8Array(totalLen);
    let pos = 0;
    for (const b of allBytes) {
      merged.set(b, pos);
      pos += b.length;
    }

    return json({
      audio: "data:audio/mpeg;base64," + bytesToB64(merged),
      words: allWords,
      chunks_used: allBytes.length,
      chunks_failed: errors.length,
    });
  }

  // ─── GENERATE LESSON ───
  if (url.pathname === "/api/generate-lesson") {
    const topic = url.searchParams.get("topic") || "";
    const country = url.searchParams.get("country") || "Uganda";
    if (!topic) return json({ error: "topic is required" }, 400);
    const key = getSecret("DEEPINFRA_API_KEY");
    if (!key) return json({ error: "no key" }, 500);

    try {
      const userMessage =
        "COUNTRY: " + country +
        "\n\nSTANDARD CURRICULUM SOURCE\nSubject and topic: " + topic +
        "\n\nGenerate ONE keypoint from standard curriculum material for this topic. Follow TEST MODE rules.";

      const r = await fetch(
        "https://api.deepinfra.com/v1/openai/chat/completions",
        {
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
        }
      );
      const data: any = await r.json();
      const content = data?.choices?.[0]?.message?.content || "";
      return new Response(content, {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (err) {
      return json({ error: String(err) }, 500);
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
