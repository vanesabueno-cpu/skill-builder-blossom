import type { CvData } from "./cv-types";

const KEY = "mi-cv-mi-historia:v1";

export type SavedProgress = { data: CvData; step: number; savedAt: string };

export function saveProgress(data: CvData, step: number) {
  if (typeof window === "undefined") return;
  try {
    const payload: SavedProgress = { data, step, savedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
}

export function loadProgress(): SavedProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedProgress) : null;
  } catch {
    return null;
  }
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
