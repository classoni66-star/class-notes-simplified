
export default {
  async fetch(request, env) {
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
      return new Response(
        JSON.stringify({ status: "alive", models: ["DeepSeek-V4.1-Flash", "Kokoro-82M"] }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    if (url.pathname === "/api/test-deepseek" && request.method === "POST") {
      const body = await request.json();
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
            { role: "user", content: "Say exactly: Classoni is alive. Topic: " + topic }
          ],
        }),
      });
      const data = await r.json();
      return new Response(JSON.stringify(data), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/test-kokoro" && request.method === "POST") {
      const body = await request.json();
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
    }

    return new Response("Not found", { status: 404, headers: cors });
  },
};
