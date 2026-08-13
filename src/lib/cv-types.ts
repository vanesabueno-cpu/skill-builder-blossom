export type LangCode = "es-ES" | "ar-SA" | "fr-FR";

export const LANGS: { code: LangCode; label: string; flag: string }[] = [
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
  { code: "ar-SA", label: "العربية", flag: "🇲🇦" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷" },
];

export type Chip = { id: string; label: string; emoji: string };

export const QUALITIES: Chip[] = [
  { id: "equipo", label: "Trabajo en equipo", emoji: "🤝" },
  { id: "puntual", label: "Puntualidad", emoji: "⏰" },
  { id: "empatia", label: "Empatía", emoji: "💛" },
  { id: "limpieza", label: "Limpieza y orden", emoji: "✨" },
  { id: "cocina", label: "Cocina", emoji: "🍲" },
  { id: "ninos", label: "Cuidado de niños", emoji: "👶" },
  { id: "mayores", label: "Cuidado de mayores", emoji: "🧓" },
  { id: "ventas", label: "Ventas y trato al público", emoji: "🛍️" },
  { id: "idiomas", label: "Varios idiomas", emoji: "🌍" },
  { id: "manual", label: "Habilidad manual", emoji: "🛠️" },
  { id: "costura", label: "Costura", emoji: "🧵" },
  { id: "conducir", label: "Conducir", emoji: "🚗" },
  { id: "cuentas", label: "Gestión de cuentas", emoji: "🧮" },
  { id: "comunicacion", label: "Buena comunicación", emoji: "💬" },
  { id: "rapidez", label: "Rapidez y energía", emoji: "⚡" },
  { id: "responsable", label: "Responsabilidad", emoji: "🛡️" },
  { id: "actitud", label: "Actitud positiva", emoji: "😊" },
];

export const SECTORS: Chip[] = [
  { id: "hosteleria", label: "Hostelería", emoji: "🍽️" },
  { id: "limpieza", label: "Limpieza", emoji: "🧹" },
  { id: "cuidados", label: "Cuidado de personas", emoji: "🤲" },
  { id: "comercio", label: "Comercio y ventas", emoji: "🛒" },
  { id: "textil", label: "Costura y textil", emoji: "🧶" },
  { id: "agricultura", label: "Agricultura", emoji: "🌾" },
  { id: "construccion", label: "Construcción", emoji: "🧱" },
  { id: "administracion", label: "Administración", emoji: "🗂️" },
  { id: "cocina", label: "Cocina profesional", emoji: "👩‍🍳" },
  { id: "transporte", label: "Transporte", emoji: "🚚" },
  { id: "otro", label: "Otro", emoji: "🌟" },
];

export const EDU_LEVELS = [
  "Sin estudios formales",
  "Educación primaria",
  "Educación secundaria",
  "Formación profesional",
  "Estudios universitarios",
  "Otro",
];

export type Education = { nivel: string; titulo: string; lugar: string; anio: string };

export type TemplateId = "nitida" | "columna" | "sello" | "bloques" | "elegante" | "energia";

export const TEMPLATES: { id: TemplateId; name: string; hint: string; emoji: string }[] = [
  { id: "nitida", name: "Nítida", hint: "Una columna, muy limpia. La más segura para los robots de selección.", emoji: "📄" },
  { id: "columna", name: "Dos columnas", hint: "Datos y cualidades a la izquierda, experiencia a la derecha.", emoji: "🧱" },
  { id: "sello", name: "Cabecera de color", hint: "Cabecera con color y foto redonda. Moderna y cercana.", emoji: "🎨" },
  { id: "bloques", name: "Bloques", hint: "Secciones en tarjetas suaves. Muy fácil de leer.", emoji: "🗂️" },
  { id: "elegante", name: "Elegante", hint: "Tipografía con carácter, estilo editorial.", emoji: "🕊️" },
  { id: "energia", name: "Energía", hint: "Barra lateral de color y cualidades destacadas.", emoji: "⚡" },
];

export type CvData = {
  lang: LangCode;
  template: TemplateId;
  nombre: string;
  telefono: string;
  email: string;
  ciudad: string;
  bio: string;
  education: Education[];
  qualities: string[];
  sectors: string[];
  experience: string;
  photo: string | null;
};

export const emptyCv = (): CvData => ({
  lang: "es-ES",
  template: "nitida",
  nombre: "",
  telefono: "",
  email: "",
  ciudad: "",
  bio: "",
  education: [{ nivel: EDU_LEVELS[0] as string, titulo: "", lugar: "", anio: "" }],
  qualities: [],
  sectors: [],
  experience: "",
  photo: null,
});

export const labelsOf = (list: Chip[], ids: string[]) =>
  ids.map((id) => list.find((c) => c.id === id)?.label).filter(Boolean) as string[];
