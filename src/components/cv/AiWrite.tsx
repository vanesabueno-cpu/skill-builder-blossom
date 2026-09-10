import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "./ClayButton";
import { writeCvText } from "@/lib/ai-write.functions";

type Kind = "perfil" | "cualidades" | "experiencia";

export function AiWrite({
  kind,
  lang,
  hint,
  onWritten,
}: {
  kind: Kind;
  lang: string;
  hint?: string;
  onWritten: (text: string) => void;
}) {
  const write = useServerFn(writeCvText);
  const [open, setOpen] = useState(false);
  const [words, setWords] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (words.trim().length < 3) {
      toast.info("Escribe 3 palabras, por ejemplo: responsable, puntual, cocina");
      return;
    }
    setBusy(true);
    try {
      const { text } = await write({ data: { keywords: words.trim(), kind, lang } });
      onWritten(text);
      setOpen(false);
      setWords("");
      toast.success("Listo. Puedes cambiar el texto a mano.");
    } catch {
      toast.error("Ahora mismo no se puede redactar. Inténtalo en un momento.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="clay clay-press inline-flex items-center gap-2 rounded-2xl border-2 border-gold bg-card px-4 py-2 text-sm font-bold"
      >
        <Sparkles size={18} /> ✨ Ayúdame a redactarlo
      </button>

      {open && (
        <div className="clay mt-3 rounded-3xl border-2 border-gold bg-secondary p-4">
          <p className="text-sm font-bold">Escribe solo 3 palabras sobre ti</p>
          <p className="mb-2 text-xs text-muted-foreground">{hint ?? "Por ejemplo: responsable, puntual, cocina"}</p>
          <input
            className="clay w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-base"
            value={words}
            placeholder="responsable, puntual, cocina"
            onChange={(e) => setWords(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <ClayButton tone="gold" onClick={generate} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Crear texto
            </ClayButton>
            <ClayButton tone="cream" onClick={() => setOpen(false)}>
              Cerrar
            </ClayButton>
          </div>
        </div>
      )}
    </div>
  );
}
