import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  image: z.string().min(100).max(6_000_000), // data URL
});

const PROMPT = `Convierte esta fotografía en una foto de perfil profesional tipo carnet, manteniendo exactamente la misma persona y sus rasgos, edad, piel, pelo y vestimenta reconocibles.
- Sustituye el fondo por blanco liso uniforme.
- Encuadre centrado de retrato: cabeza y hombros, mirada al frente, formato cuadrado.
- Corrige la iluminación (luz suave de estudio), la nitidez y el tono de piel de forma natural.
- Expresión neutra, serena y amable, sin exagerar.
No cambies la identidad de la persona ni añadas objetos, textos ni marcas de agua.`;

export const enhancePhoto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Falta la clave de IA");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Demasiadas peticiones. Inténtalo en un minuto.");
      if (res.status === 402) throw new Error("No quedan créditos de IA para mejorar la foto.");
      throw new Error(`No se pudo generar la foto: ${body.slice(0, 160)}`);
    }

    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("La IA no devolvió ninguna foto.");
    return { image: `data:image/png;base64,${b64}` };
  });
