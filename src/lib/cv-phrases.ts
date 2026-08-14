import { QUALITIES, SECTORS, labelsOf, type CvData } from "./cv-types";

/** Frases profesionales de currículum a partir de cada cualidad elegida. */
const QUALITY_PHRASES: Record<string, string> = {
  equipo: "Trabajo en equipo: coordinación con compañeras y compañeros para sacar adelante las tareas del día.",
  puntual: "Puntualidad y compromiso: cumplimiento riguroso de horarios y turnos.",
  empatia: "Trato empático y respetuoso con personas de distintas edades y culturas.",
  limpieza: "Limpieza y orden: mantenimiento de espacios higiénicos y organizados según protocolos.",
  cocina: "Cocina: elaboración de menús equilibrados y control de alérgenos y despensa.",
  ninos: "Cuidado de menores: rutinas diarias, apoyo escolar, alimentación y seguridad.",
  mayores: "Atención a personas mayores o dependientes: acompañamiento, higiene y control de medicación.",
  ventas: "Atención al público y ventas: acogida al cliente, asesoramiento y cobro.",
  idiomas: "Comunicación en varios idiomas, útil para la atención a clientela diversa.",
  manual: "Habilidad manual y precisión en tareas de mantenimiento y montaje.",
  costura: "Costura y arreglos textiles: patronaje básico, remiendos y confección.",
  conducir: "Conducción y desplazamientos autónomos para recados y reparto.",
  cuentas: "Gestión de cuentas y presupuesto doméstico: control de gastos y compras.",
  comunicacion: "Comunicación clara y escucha activa en la relación con clientes y equipo.",
  rapidez: "Ritmo ágil y resistencia en tareas físicas y jornadas exigentes.",
  responsable: "Responsabilidad y autonomía: gestión completa de tareas sin supervisión constante.",
  actitud: "Actitud positiva y disposición para aprender nuevas funciones.",
};

const SECTOR_PHRASES: Record<string, string> = {
  hosteleria: "Hostelería: servicio de sala, preparación de comandas y limpieza de menaje.",
  limpieza: "Limpieza profesional de viviendas y espacios comunes con productos específicos.",
  cuidados: "Cuidado de personas en el entorno familiar, con acompañamiento y apoyo diario.",
  comercio: "Comercio: reposición, orden del punto de venta y atención a clientela.",
  textil: "Textil: costura, arreglos y cuidado de prendas.",
  agricultura: "Agricultura: recolección, manipulado y envasado de producto.",
  construccion: "Construcción y reformas: apoyo en obra y acabados.",
  administracion: "Administración: organización de documentos, citas y gestiones.",
  cocina: "Cocina profesional: preparación de grandes cantidades y control de tiempos.",
  transporte: "Transporte y reparto: rutas, cargas y entregas.",
  otro: "Experiencia polivalente adaptada a las necesidades de cada puesto.",
};

export function profileSentence(cv: CvData) {
  if (cv.bio.trim()) return cv.bio.trim();
  const q = labelsOf(QUALITIES, cv.qualities).slice(0, 3).join(", ").toLowerCase();
  const s = labelsOf(SECTORS, cv.sectors).slice(0, 2).join(" y ").toLowerCase();
  return `Persona responsable y con ganas de trabajar${s ? `, orientada a ${s}` : ""}${q ? `. Destaca por ${q}` : ""}.`;
}

export function experienceBullets(cv: CvData): string[] {
  const out: string[] = [];
  if (cv.experience.trim()) {
    cv.experience
      .split(/\n+|(?<=\.)\s+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 2)
      .forEach((l) => out.push(l.charAt(0).toUpperCase() + l.slice(1)));
  }
  cv.sectors.forEach((id) => {
    const p = SECTOR_PHRASES[id];
    if (p) out.push(p);
  });
  if (out.length === 0)
    out.push("Gestión integral del hogar: organización, compras, limpieza, cocina y cuidado de la familia.");
  return out.slice(0, 8);
}

export function qualityBullets(cv: CvData): string[] {
  const out = cv.qualities.map((id) => QUALITY_PHRASES[id]).filter(Boolean) as string[];
  return out.length ? out : ["Persona responsable, puntual y con actitud positiva."];
}

export const QUALITY_PHRASE_MAP = QUALITY_PHRASES;
export const SECTOR_PHRASE_MAP = SECTOR_PHRASES;
