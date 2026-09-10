import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Check, ImageIcon, Loader2, RotateCcw, Sparkles, ZoomIn } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ClayButton } from "./ClayButton";
import { enhancePhoto } from "@/lib/ai-photo.functions";

type Bg = "suave" | "blanco" | "teal" | "crema";

const BGS: Record<Bg, { label: string; from: string; to: string; swatch: string }> = {
  suave: { label: "Gris estudio", from: "#F2F2F2", to: "#C9C9C9", swatch: "#D6D6D6" },
  blanco: { label: "Blanco", from: "#FFFFFF", to: "#EDEDED", swatch: "#FFFFFF" },
  teal: { label: "Verde azulado", from: "#2E8B7F", to: "#134F48", swatch: "#16665D" },
  crema: { label: "Crema", from: "#F7F1E6", to: "#E2D4BC", swatch: "#EBDCC3" },
};

const OUT = 640;

export function PhotoStudio({ photo, onChange }: { photo: string | null; onChange: (p: string | null) => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [bg, setBg] = useState<Bg>("suave");
  const [busy, setBusy] = useState(false);
  const [pro, setPro] = useState<{ before: string; after: string } | null>(null);
  const [proBusy, setProBusy] = useState(false);
  const enhance = useServerFn(enhancePhoto);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pickFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      imgRef.current = null;
      setReady(0);
      setZoom(1);
      setDx(0);
      setDy(0);
      setSrc(String(reader.result));
    };
    reader.onerror = () => setSrc(null);
    reader.readAsDataURL(file);
  };

  // 1) Carga la imagen y calcula el encuadre automático. No dibuja aquí:
  //    el dibujado ocurre siempre en el efecto de abajo, cuando el canvas ya existe.
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = new Image();
    img.onload = async () => {
      if (cancelled) return;
      imgRef.current = img;
      let z = 1;
      let ox = 0;
      let oy = 0.18;
      try {
        const FD = (
          window as unknown as {
            FaceDetector?: new (o: object) => { detect: (i: unknown) => Promise<{ boundingBox: DOMRectReadOnly }[]> };
          }
        ).FaceDetector;
        if (FD) {
          const faces = await new FD({ fastMode: true, maxDetectedFaces: 1 }).detect(img);
          const face = faces[0]?.boundingBox;
          if (face && !cancelled) {
            const side = Math.min(img.width, img.height);
            const cx = face.x + face.width / 2;
            const cy = face.y + face.height * 0.55;
            z = Math.min(2.6, Math.max(1, side / (face.height * 2.6)));
            ox = ((img.width / 2 - cx) / side) * 2;
            oy = ((img.height / 2 - cy) / side) * 2;
          }
        }
      } catch {
        /* sin detección de caras: encuadre por defecto */
      }
      if (cancelled) return;
      setZoom(z);
      setDx(ox);
      setDy(oy);
      setReady((n) => n + 1);
    };
    img.onerror = () => {
      if (!cancelled) setSrc(null);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.width) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = OUT;
    canvas.height = OUT;

    const theme = BGS[bg];
    const grad = ctx.createLinearGradient(0, 0, OUT, OUT);
    grad.addColorStop(0, theme.from);
    grad.addColorStop(1, theme.to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, OUT, OUT);

    const side = Math.min(img.width, img.height) / zoom;
    const sx = (img.width - side) / 2 - (dx * side) / 2;
    const sy = (img.height - side) / 2 - (dy * side) / 2;
    ctx.filter = "contrast(1.06) saturate(1.05) brightness(1.03)";
    ctx.drawImage(img, sx, sy, side, side, 0, 0, OUT, OUT);
    ctx.filter = "none";

    const vig = ctx.createRadialGradient(OUT / 2, OUT * 0.45, OUT * 0.28, OUT / 2, OUT / 2, OUT * 0.72);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, OUT, OUT);
  }, [bg, zoom, dx, dy]);

  // 2) Dibuja siempre después del render (canvas montado + imagen lista).
  useEffect(() => {
    draw();
  }, [draw, ready, src]);

  const confirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    draw();
    onChange(canvas.toDataURL("image/jpeg", 0.92));
    imgRef.current = null;
    setSrc(null);
    setBusy(false);
  };

  const inputProps = {
    type: "file" as const,
    accept: "image/*",
    className: "hidden",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) pickFile(f);
      e.target.value = "";
    },
  };

  return (
    <div>
      {photo && !src && (
        <div className="mb-5">
          <div className="flex items-center gap-4">
            <img src={photo} alt="Tu foto elegida" className="clay h-28 w-28 rounded-2xl object-cover" />
            <div>
              <p className="font-bold">✅ Foto lista</p>
              <button
                onClick={() => {
                  setPro(null);
                  onChange(null);
                }}
                className="mt-1 text-sm font-semibold text-accent underline"
              >
                Quitar foto
              </button>
            </div>
          </div>

          <div className="clay mt-4 rounded-3xl border-2 border-gold bg-secondary p-4">
            <p className="text-sm font-bold">✨ Foto de perfil profesional</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Fondo blanco, encuadre de cabeza y hombros, luz y color corregidos y expresión serena.
            </p>

            {pro && (
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs font-bold">Antes</p>
                  <img src={pro.before} alt="Foto original" className="clay w-full rounded-2xl object-cover" />
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold">Después</p>
                  <img src={pro.after} alt="Foto profesional generada" className="clay w-full rounded-2xl object-cover" />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <ClayButton tone="gold" onClick={() => void makePro()} disabled={proBusy}>
                {proBusy ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}{" "}
                {pro ? "Volver a intentar" : "Generar foto profesional"}
              </ClayButton>
              {pro && (
                <>
                  <ClayButton
                    tone="teal"
                    onClick={() => {
                      onChange(pro.after);
                      setPro(null);
                      toast.success("Foto profesional aplicada");
                    }}
                    disabled={proBusy}
                  >
                    <Check size={18} /> Usar la nueva
                  </ClayButton>
                  <ClayButton
                    tone="cream"
                    onClick={() => {
                      onChange(pro.before);
                      setPro(null);
                    }}
                    disabled={proBusy}
                  >
                    <RotateCcw size={18} /> Dejar la original
                  </ClayButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {!src && (
        <div className="flex flex-wrap gap-3">
          <label className="clay clay-press inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-berry px-5 py-3 text-base font-bold text-berry-foreground">
            <Camera size={22} /> Hacer foto
            <input {...inputProps} capture="user" />
          </label>
          <label className="clay clay-press inline-flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-border bg-card px-5 py-3 text-base font-bold">
            <ImageIcon size={22} /> Subir imagen
            <input {...inputProps} />
          </label>
        </div>
      )}

      {src && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="clay h-64 w-64 rounded-3xl bg-muted" />
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-bold">
              <ZoomIn size={16} /> Acercar
            </p>
            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-sm font-bold">↔️ Mover</p>
              <input type="range" min={-1} max={1} step={0.02} value={dx} onChange={(e) => setDx(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">↕️ Subir / bajar</p>
              <input type="range" min={-1} max={1} step={0.02} value={dy} onChange={(e) => setDy(Number(e.target.value))} className="w-full" />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold">🎨 Fondo profesional</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BGS) as Bg[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setBg(k)}
                  className={`clay-press flex items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-semibold ${bg === k ? "border-primary bg-secondary" : "border-border bg-card"}`}
                >
                  <span className="h-5 w-5 rounded-full border border-border" style={{ background: BGS[k].swatch }} />
                  {BGS[k].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <ClayButton tone="teal" onClick={confirm} disabled={busy}>
              <Check size={20} /> Usar esta foto
            </ClayButton>
            <ClayButton
              tone="cream"
              onClick={() => {
                imgRef.current = null;
                setSrc(null);
              }}
            >
              <RotateCcw size={18} /> Cancelar
            </ClayButton>
          </div>
        </div>
      )}
    </div>
  );
}
