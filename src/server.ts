if (url.pathname === "/api/test-kokoro") {
  const text = url.searchParams.get("text") || "Hello, this is Classoni. Let us learn together.";
  const key = getSecret("DEEPINFRA_API_KEY");
  if (!key) {
    return new Response(
      JSON.stringify({ error: "DEEPINFRA_API_KEY secret is not set" }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
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
