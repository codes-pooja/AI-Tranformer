
import { GoogleGenAI } from "@google/genai";

function buildInstructions(mode, target, tone) {
  const base =
    "You are a helpful writing assistant. Be clear, consistent, and easy to understand. Do not add extra commentary.";

  if (mode === "summarize") {
    return `${base} Summarize the given text into a maximum of 5 bullet points.`;
  }

  if (mode === "rewrite") {
    return `${base} Rewrite the given text in a ${tone || "Simple"} tone. Preserve the original meaning.`;
  }

  if (mode === "translate") {
    return `${base} Translate the given text into ${target || "Tamil"}. Do not change names or product names.`;
  }

  throw new Error("Invalid mode");
}

export async function POST(req) {
  try {
    const { input, mode, tone, target } = await req.json();

    const cleanedInput =
      typeof input === "string" ? input.trim() : "";

    if (!cleanedInput) {
      return Response.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!["summarize", "rewrite", "translate"].includes(mode)) {
      return Response.json(
        { error: "Invalid mode" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in .env.local");
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents:
        buildInstructions(mode, target, tone) +
        "\n\nText to transform:\n" +
        cleanedInput
    });

    return Response.json({
      output: result.text || ""
    });

  } catch (err) {
    console.error("Gemini API error:", err);

    return Response.json(
      { error: err.message || "Gemini request failed" },
      { status: 500 }
    );
  }
}
