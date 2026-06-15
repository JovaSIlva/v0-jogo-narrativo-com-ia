import { NextResponse } from "next/server";

export const maxDuration = 30;

// DALL-E 2 tem limite de 1000 chars. Garantir que o prompt não ultrapasse.
function truncatePrompt(prompt: string, maxLength = 950): string {
  if (prompt.length <= maxLength) return prompt;
  return prompt.substring(0, maxLength).trim();
}

// Sanitiza termos que a política de conteúdo do DALL-E pode rejeitar
function sanitizePrompt(prompt: string): string {
  const replacements: [RegExp, string][] = [
    [/\bdark gothic horror\b/gi, "dark atmospheric"],
    [/\bspooky\b/gi, "eerie"],
    [/\bhorror\b/gi, "mysterious"],
    [/\bgore\b/gi, "dramatic"],
    [/\bblood\b/gi, "crimson mist"],
    [/\bdead\b/gi, "still"],
    [/\bcorpse\b/gi, "figure"],
  ];
  return replacements.reduce((p, [from, to]) => p.replace(from, to), prompt);
}

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const isOpenRouter = apiKey.startsWith("sk-or-");

  // Se for chave OpenRouter, não temos como gerar imagens
  if (isOpenRouter) {
    return NextResponse.json(
      { error: "Image generation requires an OpenAI API key (not OpenRouter)" },
      { status: 400 }
    );
  }

  const cleanPrompt = truncatePrompt(sanitizePrompt(prompt));

  console.log("[generate-image] Prompt enviado para DALL-E:", cleanPrompt.substring(0, 100) + "...");

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: cleanPrompt,
        n: 1,
        size: "1024x1024",
        quality: "low",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: {} }));
      const openAiMessage = errorBody?.error?.message || "unknown error";
      console.error(`[generate-image] OpenAI error ${response.status}:`, openAiMessage);

      // Retornar o erro real para o cliente poder logar
      return NextResponse.json(
        { error: openAiMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    const item = data.data?.[0];

    // gpt-image-1 retorna b64_json; dall-e-3 retorna url
    const imageUrl = item?.url ?? (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);

    if (!imageUrl) {
      console.error("[generate-image] Resposta inesperada da OpenAI:", JSON.stringify(data).substring(0, 200));
      return NextResponse.json({ error: "No image in response" }, { status: 500 });
    }

    console.log("[generate-image] Imagem gerada com sucesso");
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("[generate-image] Unexpected error:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
