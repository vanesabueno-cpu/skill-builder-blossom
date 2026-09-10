import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  keywords: z.string().min(2).max(200),
  kind: z.enum(["perfil", "cualidades", "experiencia"]),
  lang: z.string().default("es"),
});

const MODELS = ["claude-sonnet-4-6", "claude-sonnet-4-5", "claude-3-5-sonnet-latest"];

const NAMES: Record<string, string> = { es: "español", fr: "francés", en: "inglés", ar: "árabe" };

const GOAL: Record<string, string> = {
  perfil: "un párrafo de presentación personal para la cabecera del currículum",
  cualidades: "un párrafo breve que describa sus cualidades personales y cómo las aplica en el trabajo",
  experiencia: "un párrafo breve que convierta su experiencia en el hogar y su vida diaria en competencias laborales",
};

export const writeCvText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) throw new Error("Falta la clave de IA");

    const lang = NAMES[data.lang.slice(0, 2)] ?? "español";
    const prompt = `Escribe en ${lang} ${GOAL[data.kind]}, para una persona sin experiencia laboral formal que busca su primer empleo.
Usa SOLO estas palabras clave como base: ${data.keywords}.
Reglas: 2 o 3 frases, máximo 55 palabras, tono cálido, cercano y profesional, primera persona, lenguaje muy sencillo, sin inventar empresas, títulos ni fechas, sin comillas ni introducciones.
Devuelve únicamente el párrafo.`;

    let lastError = "";
    for (const model of MODELS) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ model, max_tokens: 400, messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.ok) {
        lastError = await res.text();
        continue;
      }
      const json = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (json.content?.find((b) => b.type === "text")?.text ?? "").trim();
      if (!text) {
        lastError = "respuesta vacía";
        continue;
      }
      return { text };
    }
    throw new Error(`No se pudo redactar: ${lastError.slice(0, 200)}`);
  });
