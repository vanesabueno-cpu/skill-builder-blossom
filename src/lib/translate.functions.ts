import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  texts: z.array(z.string()).min(1).max(30),
  sourceLang: z.string().default("auto"),
  targetLang: z.string().default("es"),
});

const MODELS = ["claude-sonnet-4-6", "claude-sonnet-4-5", "claude-3-5-sonnet-latest"];

const NAMES: Record<string, string> = {
  es: "español",
  fr: "francés",
  en: "inglés",
  ar: "árabe",
};

const nameOf = (code: string) => NAMES[code.slice(0, 2)] ?? "el idioma original";

export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) throw new Error("Falta la clave de traducción");

    const from = nameOf(data.sourceLang);
    const to = nameOf(data.targetLang);

    const numbered = data.texts.map((t, i) => `${i + 1}. ${t.replace(/\n/g, " ⏎ ")}`).join("\n");
    const prompt = `Traduce a ${to} los siguientes textos escritos o dictados en ${from}. Adáptalos a un tono profesional, claro y natural, apto para un currículum. Mantén el mismo número de líneas y el mismo orden. Devuelve SOLO las líneas numeradas con la traducción, sin comentarios.\n\n${numbered}`;

    let lastError = "";
    for (const model of MODELS) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.ok) {
        lastError = await res.text();
        continue;
      }
      const json = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = json.content?.find((b) => b.type === "text")?.text ?? "";
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(/^\d+[.)]\s*/, "").replace(/ ⏎ /g, "\n"));
      const out = data.texts.map((original, i) => lines[i] ?? original);
      return { translations: out };
    }
    throw new Error(`No se pudo traducir: ${lastError.slice(0, 200)}`);
  });
