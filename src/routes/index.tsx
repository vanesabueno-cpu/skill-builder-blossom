import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CloudDownload,
  CloudUpload,
  Download,
  FileText,
  Languages,
  Link2,
  Loader2,
  Lock,
  Printer,
  RotateCcw,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { ClayButton } from "@/components/cv/ClayButton";
import { CvDocument } from "@/components/cv/CvDocument";
import { PhotoStudio } from "@/components/cv/PhotoStudio";
import { AtsPanel, atsStatus } from "@/components/cv/AtsPanel";
import { SectionEditor } from "@/components/cv/SectionEditor";
import { HelpBar } from "@/components/cv/HelpBar";
import { AiWrite } from "@/components/cv/AiWrite";
import { exportNodeToPdf } from "@/lib/cv-pdf";
import { exportCvToDocx } from "@/lib/cv-docx";
import { clearProgress, loadProgress, saveProgress } from "@/lib/cv-storage";
import { createCvShare } from "@/lib/cv-share.functions";
import { loadCvCloud, saveCvCloud } from "@/lib/cv-cloud.functions";
import { translateTexts } from "@/lib/translate.functions";
import { supabase } from "@/integrations/supabase/client";
import { t as dictOf, VOICE_LOCALE } from "@/lib/i18n";
import { useDictation, useVoiceGuide } from "@/lib/voice";
import { AmbientPlayer, type Mood } from "@/lib/music";
import {
  EDU_LEVELS,
  LANGS,
  QUALITIES,
  SECTORS,
  TEMPLATES,
  emptyCv,
  uiLangOf,
  withDefaults,
  type CvData,
  type CvSection,
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
          "Crea tu currículum paso a paso con botones de imágenes, voz y traducción. Puntuación ATS, foto profesional, PDF y Word listos para entregar.",
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

const STEP_ICONS = [heroImg, iconDatos, iconEstudios, iconCualidades, iconExperiencia, iconFoto, iconCv];
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

  const [viewLang, setViewLang] = useState<LangCode | null>(null);
  const [viewCv, setViewCv] = useState<CvData | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cloudAt, setCloudAt] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{ data: CvData; step: number; updatedAt: string } | null>(null);

  const [mood, setMood] = useState<Mood | null>(null);
  const playerRef = useRef<AmbientPlayer | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const translate = useServerFn(translateTexts);
  const share = useServerFn(createCvShare);
  const cloudSave = useServerFn(saveCvCloud);
  const cloudLoad = useServerFn(loadCvCloud);

  const ui = uiLangOf(cv.lang);
  const d = dictOf(ui);
  const rtl = cv.lang === "ar-SA" ? ("rtl" as const) : ("ltr" as const);

  const voice = useVoiceGuide(VOICE_LOCALE[ui]!);
  const onDictated = useCallback(
    (text: string) => {
      setCv((p) => {
        if (step === 1) return { ...p, bio: [p.bio, text].filter(Boolean).join(" ") };
        return { ...p, experience: [p.experience, text].filter(Boolean).join(" ") };
      });
      toast.success("✔️");
    },
    [step],
  );
  const dictation = useDictation(VOICE_LOCALE[ui]!, onDictated);

  useEffect(() => {
    const saved = loadProgress();
    if (saved && saved.data.nombre) setResume({ ...saved, data: withDefaults(saved.data) });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => saveProgress(cv, step), 400);
    return () => clearTimeout(t);
  }, [cv, step]);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setUserEmail(data.session?.user.email ?? null);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Guía de voz automática en cada paso
  const introRef = useRef(-1);
  useEffect(() => {
    if (!voice.enabled || introRef.current === step) return;
    introRef.current = step;
    voice.auto(d.stepIntro[step] ?? "");
  }, [step, voice, d]);

  // Música ambiente
  useEffect(() => {
    if (!playerRef.current) playerRef.current = new AmbientPlayer();
    const p = playerRef.current;
    if (mood) void p.play(mood);
    else p.stop();
  }, [mood]);
  useEffect(() => () => playerRef.current?.stop(), []);

  const set = <K extends keyof CvData>(key: K, value: CvData[K]) => setCv((p) => ({ ...p, [key]: value }));
  const toggle = (key: "qualities" | "sectors", id: string, max?: number) =>
    setCv((p) => {
      const list = p[key];
      const next = list.includes(id) ? list.filter((x) => x !== id) : max && list.length >= max ? list : [...list, id];
      return { ...p, [key]: next };
    });
  const updateEdu = (i: number, patch: Partial<Education>) =>
    setCv((p) => ({ ...p, education: p.education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) }));

  const canNext = step === 1 ? cv.nombre.trim().length > 0 : step === 3 ? cv.qualities.length > 0 : true;
  const baseName = useMemo(() => `CV-${(cv.nombre || "mi-cv").replace(/\s+/g, "-")}`, [cv.nombre]);
  const ats = useMemo(() => atsStatus(cv), [cv]);
  const active = viewCv ?? cv;

  const translateCv = useCallback(
    async (target: LangCode, source: LangCode, data: CvData): Promise<CvData> => {
      const eduTitles = data.education.map((e) => e.titulo);
      const sectionTitles = data.sections.map((s) => s.title);
      const texts = [data.bio, data.experience, ...eduTitles, ...sectionTitles].map((x) => x || "-");
      const { translations } = await translate({
        data: { texts, sourceLang: source, targetLang: target },
      });
      const eduStart = 2;
      const secStart = eduStart + eduTitles.length;
      return {
        ...data,
        lang: target,
        bio: data.bio ? (translations[0] ?? data.bio) : "",
        experience: data.experience ? (translations[1] ?? data.experience) : "",
        education: data.education.map((e, i) => ({
          ...e,
          titulo: e.titulo ? (translations[eduStart + i] ?? e.titulo) : "",
        })),
        sections: data.sections.map((s, i) => ({ ...s, title: translations[secStart + i] ?? s.title })),
      };
    },
    [translate],
  );

  const changeViewLang = async (target: LangCode | null) => {
    if (!target || target === cv.lang) {
      setViewLang(null);
      setViewCv(null);
      return;
    }
    setWorking("view");
    try {
      const translated = await translateCv(target, cv.lang, cv);
      setViewCv(translated);
      setViewLang(target);
    } catch {
      toast.error("La traducción no está disponible ahora mismo.");
    } finally {
      setWorking(null);
    }
  };

  const renderAndExport = async (data: CvData, name: string) => {
    setExportCv(data);
    await new Promise((r) => setTimeout(r, 450));
    const node = printRef.current;
    if (!node) return;
    await exportNodeToPdf(node, name);
    setExportCv(null);
  };

  const guard = () => {
    if (ats.canExport) return true;
    toast.error(
      ats.missing.length
        ? `Faltan datos: ${ats.missing.map((m) => m.label).join(", ")}`
        : "Necesitas al menos 60 puntos ATS para descargar.",
    );
    setStep(6);
    return false;
  };

  const downloadPdf = async () => {
    if (!guard()) return;
    setWorking("pdf");
    try {
      await renderAndExport(active, `${baseName}.pdf`);
      toast.success("PDF descargado");
    } catch {
      toast.error("No se pudo crear el PDF. Prueba con «Imprimir».");
    } finally {
      setWorking(null);
    }
  };

  const downloadDocx = async () => {
    if (!guard()) return;
    setWorking("docx");
    try {
      await exportCvToDocx(active, `${baseName}.docx`);
      toast.success("Word descargado");
    } catch {
      toast.error("No se pudo crear el Word.");
    } finally {
      setWorking(null);
    }
  };

  const downloadTranslated = async () => {
    if (!guard()) return;
    setWorking("es");
    try {
      const translated = await translateCv("es-ES", cv.lang, cv);
      await renderAndExport(translated, `${baseName}-ES.pdf`);
      toast.success("PDF en español descargado");
    } catch {
      toast.error("La traducción no está disponible ahora mismo.");
    } finally {
      setWorking(null);
    }
  };

  const quickTranslate = async () => {
    if (!cv.bio && !cv.experience) {
      toast.info("Escribe o dicta algo primero.");
      return;
    }
    setWorking("quick");
    try {
      const { translations } = await translate({
        data: { texts: [cv.bio || "-", cv.experience || "-"], sourceLang: cv.lang, targetLang: "es" },
      });
      setCv((p) => ({
        ...p,
        bio: p.bio ? (translations[0] ?? p.bio) : p.bio,
        experience: p.experience ? (translations[1] ?? p.experience) : p.experience,
      }));
      toast.success("Textos traducidos al español");
    } catch {
      toast.error("La traducción no está disponible ahora mismo.");
    } finally {
      setWorking(null);
    }
  };

  const makeShareLink = async () => {
    setWorking("share");
    try {
      const { token } = await share({ data: { payload: active as unknown as Record<string, unknown> } });
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

  const signIn = async (mode: "in" | "up") => {
    setWorking("auth");
    try {
      const res =
        mode === "in"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (res.error) throw res.error;
      setUserEmail(res.data.user?.email ?? email);
      setPassword("");
      toast.success(mode === "in" ? "Sesión iniciada" : "Cuenta creada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo entrar.");
    } finally {
      setWorking(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setCloudAt(null);
  };

  const pushCloud = async () => {
    setWorking("cloud");
    try {
      const { updatedAt } = await cloudSave({ data: { payload: cv as unknown as Record<string, unknown>, step } });
      setCloudAt(updatedAt);
      toast.success("Guardado en la nube");
    } catch {
      toast.error("No se pudo guardar en la nube.");
    } finally {
      setWorking(null);
    }
  };

  const pullCloud = async () => {
    setWorking("cloud");
    try {
      const res = await cloudLoad({ data: {} });
      if (!res.found) {
        toast.info("Todavía no hay nada guardado en la nube.");
        return;
      }
      const remote = withDefaults(res.payload as Partial<CvData>);
      if (cv.nombre && JSON.stringify(remote) !== JSON.stringify(cv)) {
        setConflict({ data: remote, step: res.step, updatedAt: res.updatedAt });
      } else {
        setCv(remote);
        setStep(res.step);
        toast.success("Currículum recuperado");
      }
      setCloudAt(res.updatedAt);
    } catch {
      toast.error("No se pudo recuperar de la nube.");
    } finally {
      setWorking(null);
    }
  };

  return (
    <main className="min-h-screen pb-24" dir={rtl}>
      {resume && (
        <div className="no-print mx-auto max-w-3xl px-5 pt-5">
          <div className="clay flex flex-wrap items-center gap-3 rounded-3xl border-2 border-gold bg-card p-4">
            <span className="text-2xl">💾</span>
            <p className="flex-1 text-base font-semibold">{d.resumeMsg}</p>
            <ClayButton
              tone="gold"
              onClick={() => {
                setCv(resume.data);
                setStep(resume.step);
                setResume(null);
              }}
            >
              {d.resumeGo}
            </ClayButton>
            <ClayButton
              tone="cream"
              onClick={() => {
                clearProgress();
                setResume(null);
              }}
            >
              {d.resumeNew}
            </ClayButton>
          </div>
        </div>
      )}

      <header className="no-print mx-auto max-w-3xl px-5 pt-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{d.kicker}</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">{d.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{d.subtitle}</p>
      </header>

      <HelpBar
        d={d}
        voiceOn={voice.enabled}
        onToggleVoice={() => {
          const next = !voice.enabled;
          voice.setEnabled(next);
          if (next) voice.say(d.stepIntro[step] ?? "");
          else voice.stop();
        }}
        onRead={() => (voice.speaking ? voice.stop() : voice.say(d.stepIntro[step] ?? ""))}
        speaking={voice.speaking}
        micSupported={dictation.supported}
        listening={dictation.listening}
        onMic={() => (dictation.listening ? dictation.stop() : dictation.start())}
        onTranslate={quickTranslate}
        translating={working === "quick"}
        music={mood}
        onMusic={setMood}
      />

      <nav className="no-print mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2 px-5">
        {STEP_ICONS.map((icon, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            title={d.steps[i]}
            aria-label={d.steps[i]}
            className={`clay clay-press flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${
              i === step ? "border-primary bg-secondary" : i < step ? "border-gold bg-card" : "border-border bg-card opacity-70"
            }`}
          >
            <img src={icon} alt="" width={64} height={64} loading="lazy" className="h-11 w-11 object-contain" />
          </button>
        ))}
      </nav>

      <section className="mx-auto mt-6 max-w-3xl px-5">
        <div className="no-print clay rounded-[2rem] border-2 border-border bg-card p-6 sm:p-8">
          {step === 0 && (
            <div className="text-center">
              <img src={heroImg} alt="Mujer sosteniendo su currículum" width={768} height={768} className="mx-auto h-56 w-56 object-contain" />
              <h2 className="display text-2xl">{d.welcomeH}</h2>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">{d.welcomeP}</p>
              <p className="mt-6 text-base font-bold">{d.chooseLang}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      set("lang", l.code as LangCode);
                      setViewCv(null);
                      setViewLang(null);
                    }}
                    dir={l.code === "ar-SA" ? "rtl" : "ltr"}
                    className={`clay clay-press rounded-2xl border-2 px-5 py-3 text-lg font-bold ${
                      cv.lang === l.code ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{d.tip}</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="display mb-1 text-2xl">📇 {d.steps[1]}</h2>
              <p className="mb-6 text-muted-foreground">{d.stepIntro[1]}</p>
              <Field label={d.name} emoji="🙋‍♀️" value={cv.nombre} onChange={(v) => set("nombre", v)} placeholder={d.namePh} dir={rtl} />
              <Field label={d.phone} emoji="📞" value={cv.telefono} onChange={(v) => set("telefono", v)} placeholder="612 345 678" />
              <Field label={d.email} emoji="✉️" value={cv.email} onChange={(v) => set("email", v)} placeholder="tunombre@correo.com" />
              <Field label={d.city} emoji="📍" value={cv.ciudad} onChange={(v) => set("ciudad", v)} placeholder="Motril" dir={rtl} />
              <AiWrite kind="perfil" lang={ui} onWritten={(text) => set("bio", text)} />
              <Field label={d.bio} emoji="😊" multiline dir={rtl} value={cv.bio} onChange={(v) => set("bio", v)} placeholder={d.bioPh} />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="display mb-1 text-2xl">🎓 {d.studies}</h2>
              <p className="mb-6 text-muted-foreground">{d.studiesP}</p>
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
                      placeholder={d.degree}
                      value={edu.titulo}
                      onChange={(e) => updateEdu(i, { titulo: e.target.value })}
                    />
                    <input
                      className="clay rounded-2xl border-2 border-border bg-card px-4 py-3"
                      placeholder={d.year}
                      value={edu.anio}
                      onChange={(e) => updateEdu(i, { anio: e.target.value })}
                    />
                  </div>
                  <input
                    dir={rtl}
                    className="clay mt-3 w-full rounded-2xl border-2 border-border bg-card px-4 py-3"
                    placeholder={d.place}
                    value={edu.lugar}
                    onChange={(e) => updateEdu(i, { lugar: e.target.value })}
                  />
                  {cv.education.length > 1 && (
                    <button
                      onClick={() => set("education", cv.education.filter((_, idx) => idx !== i))}
                      className="mt-3 text-sm font-bold text-accent underline"
                    >
                      {d.removeStudy}
                    </button>
                  )}
                </div>
              ))}
              <ClayButton
                tone="cream"
                onClick={() => set("education", [...cv.education, { nivel: EDU_LEVELS[0] as string, titulo: "", lugar: "", anio: "" }])}
              >
                ➕ {d.addStudy}
              </ClayButton>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="display mb-1 text-2xl">🌟 {d.qualities}</h2>
              <p className="mb-6 text-muted-foreground">{d.qualitiesP}</p>
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
              <p className="mt-4 text-sm text-muted-foreground">
                {cv.qualities.length} / 8 {d.chosen}
              </p>
              <div className="mt-6">
                <AiWrite
                  kind="cualidades"
                  lang={ui}
                  hint="Por ejemplo: paciente, ordenada, familia"
                  onWritten={(text) => set("bio", text)}
                />
                <Field
                  label="Frase sobre tus cualidades (sale en tu perfil)"
                  emoji="🌟"
                  multiline
                  dir={rtl}
                  value={cv.bio}
                  onChange={(v) => set("bio", v)}
                  placeholder={d.bioPh}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="display mb-1 text-2xl">💼 {d.experience}</h2>
              <p className="mb-6 text-muted-foreground">{d.experienceP}</p>
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
                <AiWrite
                  kind="experiencia"
                  lang={ui}
                  hint="Por ejemplo: cocina, limpieza, niños"
                  onWritten={(text) => set("experience", text)}
                />
                <Field
                  label={d.expLabel}
                  emoji="🗣️"
                  multiline
                  dir={rtl}
                  value={cv.experience}
                  onChange={(v) => set("experience", v)}
                  placeholder={d.expPh}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="display mb-1 text-2xl">📸 {d.photo}</h2>
              <p className="mb-6 text-muted-foreground">{d.photoP}</p>
              <PhotoStudio photo={cv.photo} onChange={(p) => set("photo", p)} />
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="display mb-1 text-2xl">🎉 {d.cv}</h2>
              <p className="mb-4 text-muted-foreground">{d.cvP}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => set("template", tpl.id as TemplateId)}
                    className={`clay clay-press rounded-3xl border-2 p-4 text-left ${
                      cv.template === tpl.id ? "border-primary bg-secondary" : "border-border bg-card"
                    }`}
                  >
                    <strong className="block text-base">
                      {tpl.emoji} {tpl.name}
                    </strong>
                    <span className="text-sm text-muted-foreground">{tpl.hint}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4">
                <SectionEditor
                  sections={cv.sections}
                  onChange={(s: CvSection[]) => {
                    set("sections", s);
                    setViewCv(null);
                    setViewLang(null);
                  }}
                  d={d}
                />
                <AtsPanel cv={cv} d={d} />
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border-2 border-border">
                <div className="origin-top-left" style={{ transform: "scale(0.42)", width: 794, height: 1123 * 0.42 }}>
                  <CvDocument cv={active} />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ClayButton tone="teal" onClick={downloadPdf} disabled={working !== null || !ats.canExport}>
                  {working === "pdf" ? <Loader2 className="animate-spin" size={20} /> : ats.canExport ? <Download size={20} /> : <Lock size={20} />}{" "}
                  {d.downloadPdf}
                </ClayButton>
                <ClayButton tone="leaf" onClick={downloadDocx} disabled={working !== null || !ats.canExport}>
                  {working === "docx" ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />} {d.downloadDocx}
                </ClayButton>
                {cv.lang !== "es-ES" && (
                  <ClayButton tone="gold" onClick={downloadTranslated} disabled={working !== null}>
                    {working === "es" ? <Loader2 className="animate-spin" size={20} /> : <Languages size={20} />} {d.translatedPdf}
                  </ClayButton>
                )}
                <ClayButton tone="berry" onClick={makeShareLink} disabled={working !== null}>
                  {working === "share" ? <Loader2 className="animate-spin" size={20} /> : <Link2 size={20} />} {d.shareLink}
                </ClayButton>
                <ClayButton tone="cream" onClick={() => window.print()}>
                  <Printer size={20} /> {d.print}
                </ClayButton>
                <ClayButton
                  tone="cream"
                  onClick={() => {
                    clearProgress();
                    setCv(emptyCv());
                    setViewCv(null);
                    setViewLang(null);
                    setStep(0);
                  }}
                >
                  <RotateCcw size={18} /> {d.startOver}
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
            </div>
          )}
        </div>

        {/* Ver el CV en cualquier idioma, en cualquier paso */}
        <div className="no-print clay mt-6 rounded-3xl border-2 border-border bg-card p-4">
          <p className="mb-2 text-sm font-bold">🌍 Ver el currículum en otro idioma</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void changeViewLang(null)}
              className={`clay-press rounded-full border-2 px-3 py-2 text-sm font-bold ${
                viewLang === null ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              {LANGS.find((l) => l.code === cv.lang)?.label}
            </button>
            {LANGS.filter((l) => l.code !== cv.lang).map((l) => (
              <button
                key={l.code}
                onClick={() => void changeViewLang(l.code)}
                disabled={working !== null}
                className={`clay-press rounded-full border-2 px-3 py-2 text-sm font-bold disabled:opacity-50 ${
                  viewLang === l.code ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                }`}
              >
                {working === "view" && <Loader2 className="mr-1 inline animate-spin" size={12} />}
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nube */}
        <div className="no-print clay mt-4 rounded-3xl border-2 border-border bg-card p-4">
          <p className="text-sm font-bold">☁️ {d.cloud}</p>
          <p className="mb-3 text-sm text-muted-foreground">{d.cloudP}</p>
          {userEmail ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{userEmail}</span>
              <ClayButton tone="teal" onClick={pushCloud} disabled={working !== null}>
                {working === "cloud" ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18} />} {d.saveCloud}
              </ClayButton>
              <ClayButton tone="gold" onClick={pullCloud} disabled={working !== null}>
                <CloudDownload size={18} /> {d.loadCloud}
              </ClayButton>
              <ClayButton tone="cream" onClick={signOut}>
                {d.signOut}
              </ClayButton>
              {cloudAt && (
                <span className="text-xs text-muted-foreground">
                  <Save size={12} className="inline" /> {new Date(cloudAt).toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="clay rounded-2xl border-2 border-border bg-background px-3 py-2 text-sm"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="clay rounded-2xl border-2 border-border bg-background px-3 py-2 text-sm"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <ClayButton tone="teal" onClick={() => signIn("in")} disabled={working !== null}>
                {d.signIn}
              </ClayButton>
              <ClayButton tone="cream" onClick={() => signIn("up")} disabled={working !== null}>
                {d.signUp}
              </ClayButton>
            </div>
          )}

          {conflict && (
            <div className="mt-3 rounded-2xl border-2 border-gold bg-secondary p-3 text-sm">
              <p className="font-bold">Hay una versión distinta en la nube ({new Date(conflict.updatedAt).toLocaleString()}).</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <ClayButton
                  tone="gold"
                  onClick={() => {
                    setCv(conflict.data);
                    setStep(conflict.step);
                    setConflict(null);
                    toast.success("Usando la versión de la nube");
                  }}
                >
                  Usar la de la nube
                </ClayButton>
                <ClayButton
                  tone="cream"
                  onClick={() => {
                    setConflict(null);
                    void pushCloud();
                  }}
                >
                  Mantener esta y guardar
                </ClayButton>
              </div>
            </div>
          )}
        </div>

        {step < 6 && (
          <div className="no-print mt-6 flex justify-between">
            <ClayButton tone="cream" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft size={20} /> {d.back}
            </ClayButton>
            <ClayButton tone="teal" onClick={() => setStep((s) => Math.min(6, s + 1))} disabled={!canNext}>
              {step === 5 ? d.seeCv : d.next} <ChevronRight size={20} />
            </ClayButton>
          </div>
        )}
      </section>

      {/* Lienzo oculto para generar el PDF a tamaño real */}
      <div className="print-area" style={{ position: "fixed", left: -10000, top: 0 }} aria-hidden>
        <div ref={printRef}>
          <CvDocument cv={exportCv ?? active} />
        </div>
      </div>
    </main>
  );
}
