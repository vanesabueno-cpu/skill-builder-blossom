import { QUALITIES, SECTORS, labelsOf, type CvData } from "./cv-types";

export type AtsItem = { id: string; ok: boolean; label: string; tip: string; points: number };

const SECTOR_KEYWORDS: Record<string, string[]> = {
  hosteleria: ["atención al cliente", "servicio de sala", "higiene alimentaria", "trabajo en equipo"],
  limpieza: ["limpieza", "desinfección", "orden", "productos químicos", "protocolos"],
  cuidados: ["cuidado de personas", "acompañamiento", "higiene personal", "empatía"],
  comercio: ["atención al cliente", "reposición", "caja", "ventas"],
  textil: ["costura", "arreglos", "confección", "patronaje"],
  agricultura: ["recolección", "manipulado", "envasado", "temporada"],
  construccion: ["obra", "acabados", "seguridad laboral"],
  administracion: ["organización", "archivo", "atención telefónica", "ofimática"],
  cocina: ["cocina", "elaboración de menús", "APPCC", "control de alérgenos"],
  transporte: ["reparto", "rutas", "carga y descarga", "carnet de conducir"],
  otro: ["polivalencia", "aprendizaje rápido", "responsabilidad"],
};

export function suggestedKeywords(cv: CvData): string[] {
  const base = new Set<string>(["responsabilidad", "puntualidad", "trabajo en equipo"]);
  cv.sectors.forEach((s) => (SECTOR_KEYWORDS[s] ?? []).forEach((k) => base.add(k)));
  labelsOf(QUALITIES, cv.qualities).forEach((l) => base.add(l.toLowerCase()));
  const text = `${cv.bio} ${cv.experience}`.toLowerCase();
  return [...base].filter((k) => !text.includes(k.toLowerCase())).slice(0, 10);
}

export function atsReport(cv: CvData) {
  const text = `${cv.bio} ${cv.experience}`.trim();
  const items: AtsItem[] = [
    {
      id: "nombre",
      ok: cv.nombre.trim().split(/\s+/).length >= 2,
      label: "Nombre y apellidos",
      tip: "Escribe tu nombre completo: los filtros automáticos lo buscan primero.",
      points: 12,
    },
    {
      id: "contacto",
      ok: Boolean(cv.telefono.trim()) && /.+@.+\..+/.test(cv.email),
      label: "Teléfono y correo válidos",
      tip: "Añade un teléfono y un correo con formato correcto (nombre@correo.com).",
      points: 16,
    },
    {
      id: "ciudad",
      ok: Boolean(cv.ciudad.trim()),
      label: "Ciudad",
      tip: "Indica tu ciudad: muchas ofertas filtran por zona.",
      points: 6,
    },
    {
      id: "perfil",
      ok: cv.bio.trim().length >= 60,
      label: "Perfil profesional (2 líneas)",
      tip: "Escribe 2 líneas presentándote: quién eres y qué buscas.",
      points: 12,
    },
    {
      id: "experiencia",
      ok: cv.experience.trim().length >= 120,
      label: "Experiencia detallada",
      tip: "Cuenta con más detalle qué hacías: tareas, personas a tu cargo, cantidades.",
      points: 18,
    },
    {
      id: "sectores",
      ok: cv.sectors.length >= 1,
      label: "Sector elegido",
      tip: "Elige al menos un sector para orientar tu currículum.",
      points: 8,
    },
    {
      id: "cualidades",
      ok: cv.qualities.length >= 5,
      label: "5 cualidades o más",
      tip: "Selecciona al menos 5 cualidades: aportan palabras clave al CV.",
      points: 10,
    },
    {
      id: "formacion",
      ok: cv.education.some((e) => e.nivel || e.titulo),
      label: "Formación indicada",
      tip: "Indica tu nivel de estudios, aunque sea «sin estudios formales».",
      points: 8,
    },
    {
      id: "numeros",
      ok: /\d/.test(text),
      label: "Datos concretos (números)",
      tip: "Añade números: «cocino para 10 personas», «3 años cuidando».",
      points: 5,
    },
    {
      id: "foto",
      ok: Boolean(cv.photo),
      label: "Foto profesional",
      tip: "Una foto con fondo neutro genera más confianza en España.",
      points: 5,
    },
  ];
  const score = items.reduce((n, i) => n + (i.ok ? i.points : 0), 0);
  return { items, score, keywords: suggestedKeywords(cv) };
}
