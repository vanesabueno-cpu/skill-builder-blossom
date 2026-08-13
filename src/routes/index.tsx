import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Download,
  Languages,
  Link2,
  Loader2,
  Printer,
  RotateCcw,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { ClayButton } from "@/components/cv/ClayButton";
import { CvDocument } from "@/components/cv/CvDocument";
import { PhotoStudio } from "@/components/cv/PhotoStudio";
import { exportNodeToPdf } from "@/lib/cv-pdf";
import { clearProgress, loadProgress, saveProgress } from "@/lib/cv-storage";
import { createCvShare } from "@/lib/cv-share.functions";
import { translateTexts } from "@/lib/translate.functions";
import {
  EDU_LEVELS,
  LANGS,
  QUALITIES,
  SECTORS,
  TEMPLATES,
  emptyCv,
  type CvData,
  type Education,
  type LangCode,
  type TemplateId,
} from "@/lib/cv-types";

import heroImg from "@/assets/clay-hero.png";
import iconDatos from "@/assets/clay-datos.png";
import iconEstudios from "@/assets/clay-estudios.png";
import iconCualidades from "@/assets/clay-cualidades.png";
import iconExperiencia from "@/assets/clay-experiencia.png";
import iconFoto from "@/assets/clay-foto.png";
import iconCv from "@/assets/clay-cv.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mi CV, mi historia · Currículum fácil con imágenes" },
      {
        name: "description",
        content:
          "Crea tu currículum paso a paso con botones de imágenes, aunque no tengas estudios ni experiencia laboral. Traducción al español, foto profesional y PDF listo para entregar.",
      },
      { property: "og:title", content: "Mi CV, mi historia" },
      {
        property: "og:description",
        content: "Convierte tu experiencia en casa y tus cualidades en un currículum profesional en 7 pasos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Wizard,
});

const STEPS = [
  { label: "Bienvenida", icon: heroImg },
  { label: "Tus datos", icon: iconDatos },
  { label: "Estudios", icon: iconEstudios },
  { label: "Cualidades", icon: iconCualidades },
  { label: "Experiencia", icon: iconExperiencia },
  { label: "Tu foto", icon: iconFoto },
  { label: "Tu CV", icon: iconCv },
];

const CHIP_TONES = ["bg-primary", "bg-accent", "bg-berry", "bg-gold", "bg-leaf", "bg-sky"];

function Field({
  label,
  emoji,
  value,
  onChange,
  placeholder,
  multiline,
  dir,
}: {
  label: string;
  emoji: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  dir?: "rtl" | "ltr";
}) {
  const cls =
    "clay w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-base outline-none focus:border-primary";
  return (
    <div className="mb-5">
      <label className="mb-2 flex items-center gap-2 text-base font-bold">
        <span aria-hidden className="text-xl">
          {emoji}
        </span>
        {label}
      </label>
      {multiline ? (
        <textarea dir={dir} rows={4} className={cls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input dir={dir} className={cls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function Wizard() {
  const [step, setStep] = useState(0);
  const [cv, setCv] = useState<CvData>(emptyCv);
  const [resume, setResume] = useState<{ step: number; data: CvData; savedAt: string } | null>(null);
  const [exportCv, setExportCv] = useState<CvData | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const translate = useServerFn(translateTexts);
  const share = useServerFn(createCvShare);

  useEffect(() => {
    const saved = loadProgress();
    if (saved && saved.data.nombre) setResume(saved);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => saveProgress(cv, step), 400);
    return () => clearTimeout(t);
  }, [cv, step]);

  const set = <K extends keyof CvData>(key: K, value: CvData[K]) => setCv((p) => ({ ...p, [key]: value }));
  const toggle = (key: "qualities" | "sectors", id: string, max?: number) =>
    setCv((p) => {
      const list = p[key];
      const next = list.includes(id) ? list.filter((x) => x !== id) : max && list.length >= max ? list : [...list, id];
      return { ...p, [key]: next };
    });
  const updateEdu = (i: number, patch: Partial<Education>) =>
    setCv((p) => ({ ...p, education: p.education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) }));

  const rtl = cv.lang === "ar-SA" ? ("rtl" as const) : ("ltr" as const);
  const canNext = step === 1 ? cv.nombre.trim().length > 0 : step === 3 ? cv.qualities.length > 0 : true;
  const fileName = useMemo(() => `CV-${(cv.nombre || "mi-cv").replace(/\s+/g, "-")}.pdf`, [cv.nombre]);

  const renderAndExport = async (data: CvData, name: string) => {
    setExportCv(data);
    await new Promise((r) => setTimeout(r, 400));
    const node = printRef.current;
    if (!node) return;
    await exportNodeToPdf(node, name);
    setExportCv(null);
  };

  const downloadPdf = async () => {
    setWorking("pdf");
    try {
      await renderAndExport(cv, fileName);
      toast.success("PDF descargado");
    } catch {
      toast.error("No se pudo crear el PDF. Prueba con «Imprimir».");
    } finally {
      setWorking(null);
    }
  };

  const buildTranslated = async (): Promise<CvData> => {
    const eduTitles = cv.education.map((e) => e.titulo);
    const texts = [cv.bio, cv.experience, ...eduTitles].map((t) => t || "-");
    const { translations } = await translate({ data: { texts, sourceLang: cv.lang } });
    return {
      ...cv,
      bio: cv.bio ? (translations[0] ?? cv.bio) : "",
      experience: cv.experience ? (translations[1] ?? cv.experience) : "",
      education: cv.education.map((e, i) => ({ ...e, titulo: e.titulo ? (translations[2 + i] ?? e.titulo) : "" })),
    };
  };

  const downloadTranslated = async () => {
    setWorking("es");
    try {
      const translated = await buildTranslated();
      await renderAndExport(translated, fileName.replace(".pdf", "-ES.pdf"));
      toast.success("PDF en español descargado");
    } catch {
      toast.error("La traducción no está disponible ahora mismo.");
    } finally {
      setWorking(null);
    }
  };

  const makeShareLink = async () => {
    setWorking("share");
    try {
      const { token } = await share({ data: { payload: cv as unknown as Record<string, unknown> } });
      const url = `${window.location.origin}/cv/${token}`;
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Enlace copiado. Ya puedes enviarlo.");
      } catch {
        toast.success("Enlace creado.");
      }
    } catch {
      toast.error("No se pudo crear el enlace.");
    } finally {
      setWorking(null);
    }
  };

  return (
    <main className="min-h-screen pb-24">
      {/* Guardado / retomar */}
      {resume && (
        <div className="no-print mx-auto max-w-3xl px-5 pt-5">
          <div className="clay flex flex-wrap items-center gap-3 rounded-3xl border-2 border-gold bg-card p-4">
            <span className="text-2xl">💾</span>
            <p className="flex-1 text-base font-semibold">Tienes un currículum a medias en este dispositivo.</p>
            <ClayButton
              tone="gold"
              onClick={() => {
                setCv(resume.data);
                setStep(resume.step);
                setResume(null);
              }}
            >
              Continuar
            </ClayButton>
            <ClayButton
              tone="cream"
              onClick={() => {
                clearProgress();
                setResume(null);
              }}
            >
              Empezar de cero
            </ClayButton>
          </div>
        </div>
      )}

      <header className="no-print mx-auto max-w-3xl px-5 pt-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Taller de empleabilidad</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">Mi CV, mi historia</h1>
        <p className="mt-2 text-lg text-muted-foreground">Toca las imágenes. Cada paso construye tu currículum.</p>
      </header>

      {/* Pasos con imágenes */}
      <nav className="no-print mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2 px-5">
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setStep(i)}
            title={s.label}
            aria-label={s.label}
            className={`clay clay-press flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${
              i === step ? "border-primary bg-secondary" : i < step ? "border-gold bg-card" : "border-border bg-card opacity-70"
            }`}
          >
            <img src={s.icon} alt="" width={64} height={64} loading="lazy" className="h-11 w-11 object-contain" />
          </button>
        ))}
      </nav>

      <section className="mx-auto mt-6 max-w-3xl px-5">
        <div className="no-print clay rounded-[2rem] border-2 border-border bg-card p-6 sm:p-8">
          {step === 0 && (
            <div className="text-center">
              <img src={heroImg} alt="Mujer sosteniendo su currículum" width={768} height={768} className="mx-auto h-56 w-56 object-contain" />
              <h2 className="display text-2xl">¡Hola! Vamos a hacer tu currículum</h2>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                No hace falta tener estudios ni haber trabajado fuera de casa. Lo que sabes hacer también cuenta.
              </p>
              <p className="mt-6 text-base font-bold">Elige tu idioma</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => set("lang", l.code as LangCode)}
                    dir={l.code === "ar-SA" ? "rtl" : "ltr"}
                    className={`clay clay-press rounded-2xl border-2 px-5 py-3 text-lg font-bold ${
                      cv.lang === l.code ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                🎤 Puedes dictar con el micrófono del teclado de tu móvil. Al final podrás descargar tu CV también traducido al
                español.
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="display mb-1 text-2xl">📇 Tus datos</h2>
              <p className="mb-6 text-muted-foreground">Así te podrán llamar las empresas.</p>
              <Field label="Nombre completo" emoji="🙋‍♀️" value={cv.nombre} onChange={(v) => set("nombre", v)} placeholder="Escribe tu nombre" dir={rtl} />
              <Field label="Teléfono" emoji="📞" value={cv.telefono} onChange={(v) => set("telefono", v)} placeholder="612 345 678" />
              <Field label="Correo electrónico" emoji="✉️" value={cv.email} onChange={(v) => set("email", v)} placeholder="tunombre@correo.com" />
              <Field label="Ciudad" emoji="📍" value={cv.ciudad} onChange={(v) => set("ciudad", v)} placeholder="Motril" dir={rtl} />
              <Field
                label="Preséntate en una frase"
                emoji="😊"
                multiline
                dir={rtl}
                value={cv.bio}
                onChange={(v) => set("bio", v)}
                placeholder="Persona responsable, con ganas de aprender y trabajar en equipo"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="display mb-1 text-2xl">🎓 Estudios</h2>
              <p className="mb-6 text-muted-foreground">Aunque sean de tu país o sin título oficial. Si no tienes, no pasa nada.</p>
              {cv.education.map((edu, i) => (
                <div key={i} className="mb-4 rounded-3xl border-2 border-dashed border-border p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {EDU_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => updateEdu(i, { nivel: lvl })}
                        className={`clay-press rounded-full border-2 px-3 py-2 text-sm font-semibold ${
                          edu.nivel === lvl ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      dir={rtl}
                      className="clay rounded-2xl border-2 border-border bg-card px-4 py-3"
                      placeholder="Título o especialidad"
                      value={edu.titulo}
                      onChange={(e) => updateEdu(i, { titulo: e.target.value })}
                    />
                    <input
                      className="clay rounded-2xl border-2 border-border bg-card px-4 py-3"
                      placeholder="Año (aprox.)"
                      value={edu.anio}
                      onChange={(e) => updateEdu(i, { anio: e.target.value })}
                    />
                  </div>
                  <input
                    dir={rtl}
                    className="clay mt-3 w-full rounded-2xl border-2 border-border bg-card px-4 py-3"
                    placeholder="Centro o país"
                    value={edu.lugar}
                    onChange={(e) => updateEdu(i, { lugar: e.target.value })}
                  />
                  {cv.education.length > 1 && (
                    <button
                      onClick={() => set("education", cv.education.filter((_, idx) => idx !== i))}
                      className="mt-3 text-sm font-bold text-accent underline"
                    >
                      Quitar este estudio
                    </button>
                  )}
                </div>
              ))}
              <ClayButton
                tone="cream"
                onClick={() => set("education", [...cv.education, { nivel: EDU_LEVELS[0] as string, titulo: "", lugar: "", anio: "" }])}
              >
                ➕ Añadir otro estudio
              </ClayButton>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="display mb-1 text-2xl">🌟 Tus cualidades</h2>
              <p className="mb-6 text-muted-foreground">Toca hasta 8 imágenes que hablen de ti.</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {QUALITIES.map((q, i) => {
                  const on = cv.qualities.includes(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => toggle("qualities", q.id, 8)}
                      className={`clay clay-press flex flex-col items-center gap-2 rounded-3xl border-2 p-3 text-center ${
                        on ? `${CHIP_TONES[i % CHIP_TONES.length]} border-transparent text-primary-foreground` : "border-border bg-card"
                      }`}
                    >
                      <span className="text-3xl">{q.emoji}</span>
                      <span className="text-xs font-bold leading-tight">{q.label}</span>
                      {on && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{cv.qualities.length} / 8 elegidas</p>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="display mb-1 text-2xl">💼 Tu experiencia</h2>
              <p className="mb-6 text-muted-foreground">Cuidar, cocinar, limpiar o coser en casa también es experiencia.</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {SECTORS.map((s, i) => {
                  const on = cv.sectors.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggle("sectors", s.id)}
                      className={`clay clay-press flex flex-col items-center gap-2 rounded-3xl border-2 p-3 text-center ${
                        on ? `${CHIP_TONES[(i + 2) % CHIP_TONES.length]} border-transparent text-primary-foreground` : "border-border bg-card"
                      }`}
                    >
                      <span className="text-3xl">{s.emoji}</span>
                      <span className="text-xs font-bold leading-tight">{s.label}</span>
                      {on && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6">
                <Field
                  label="Cuéntanos qué sabes hacer"
                  emoji="🗣️"
                  multiline
                  dir={rtl}
                  value={cv.experience}
                  onChange={(v) => set("experience", v)}
                  placeholder="Habla o escribe libremente. Ej: he cuidado a mis tres hijos y a mi madre, cocino para 10 personas, organizo la casa..."
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="display mb-1 text-2xl">📸 Tu foto</h2>
              <p className="mb-6 text-muted-foreground">La recortamos y le ponemos fondo profesional automáticamente.</p>
              <PhotoStudio photo={cv.photo} onChange={(p) => set("photo", p)} />
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="display mb-1 text-2xl">🎉 Tu currículum</h2>
              <p className="mb-4 text-muted-foreground">Elige el diseño. Todos están preparados para los filtros automáticos (ATS).</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => set("template", t.id as TemplateId)}
                    className={`clay clay-press rounded-3xl border-2 p-4 text-left ${
                      cv.template === t.id ? "border-primary bg-secondary" : "border-border bg-card"
                    }`}
                  >
                    <strong className="block text-base">
                      {t.emoji} {t.name}
                    </strong>
                    <span className="text-sm text-muted-foreground">{t.hint}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border-2 border-border">
                <div className="origin-top-left" style={{ transform: "scale(0.42)", width: 794, height: 1123 * 0.42 }}>
                  <CvDocument cv={cv} />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ClayButton tone="teal" onClick={downloadPdf} disabled={working !== null}>
                  {working === "pdf" ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />} Descargar PDF
                </ClayButton>
                {cv.lang !== "es-ES" && (
                  <ClayButton tone="gold" onClick={downloadTranslated} disabled={working !== null}>
                    {working === "es" ? <Loader2 className="animate-spin" size={20} /> : <Languages size={20} />} PDF traducido al español
                  </ClayButton>
                )}
                <ClayButton tone="berry" onClick={makeShareLink} disabled={working !== null}>
                  {working === "share" ? <Loader2 className="animate-spin" size={20} /> : <Link2 size={20} />} Crear enlace para compartir
                </ClayButton>
                <ClayButton tone="cream" onClick={() => window.print()}>
                  <Printer size={20} /> Imprimir
                </ClayButton>
                <ClayButton
                  tone="cream"
                  onClick={() => {
                    clearProgress();
                    setCv(emptyCv());
                    setStep(0);
                  }}
                >
                  <RotateCcw size={18} /> Empezar otro
                </ClayButton>
              </div>

              {shareUrl && (
                <div className="clay mt-4 rounded-3xl border-2 border-berry bg-card p-4">
                  <p className="font-bold">🔗 Tu enlace</p>
                  <a href={shareUrl} className="break-all text-sm font-semibold text-primary underline">
                    {shareUrl}
                  </a>
                </div>
              )}

              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Save size={15} /> Tu progreso se guarda solo en este dispositivo.
              </p>
            </div>
          )}
        </div>

        {step < 6 && (
          <div className="no-print mt-6 flex justify-between">
            <ClayButton tone="cream" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft size={20} /> Atrás
            </ClayButton>
            <ClayButton tone="teal" onClick={() => setStep((s) => Math.min(6, s + 1))} disabled={!canNext}>
              {step === 5 ? "Ver mi CV" : "Siguiente"} <ChevronRight size={20} />
            </ClayButton>
          </div>
        )}
      </section>

      {/* Lienzo oculto para generar el PDF a tamaño real */}
      <div style={{ position: "fixed", left: -10000, top: 0 }} aria-hidden>
        <div ref={printRef}>
          <CvDocument cv={exportCv ?? cv} />
        </div>
      </div>
    </main>
  );
}
