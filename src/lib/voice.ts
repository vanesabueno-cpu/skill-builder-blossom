import { useCallback, useEffect, useRef, useState } from "react";

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(locale: string) {
  const voices = window.speechSynthesis.getVoices();
  const base = locale.split("-")[0];
  return (
    voices.find((v) => v.lang.replace("_", "-").toLowerCase() === locale.toLowerCase()) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base!.toLowerCase())) ??
    null
  );
}

export function useVoiceGuide(locale: string) {
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    if (!speechSupported()) return;
    // Fuerza la carga del catálogo de voces en algunos navegadores.
    window.speechSynthesis.getVoices();
    const onVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
  }, []);

  const stop = useCallback(() => {
    if (!speechSupported()) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const say = useCallback((text: string) => {
    if (!speechSupported() || !text.trim()) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = localeRef.current;
    const v = pickVoice(localeRef.current);
    if (v) u.voice = v;
    u.rate = 0.92;
    u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    return true;
  }, []);

  const auto = useCallback(
    (text: string) => {
      if (!enabled) return;
      say(text);
    },
    [enabled, say],
  );

  useEffect(() => () => stop(), [stop]);

  return { enabled, setEnabled, speaking, say, auto, stop, supported: speechSupported() };
}

type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getRecognitionCtor(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useDictation(locale: string, onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const ref = useRef<SR | null>(null);
  const cb = useRef(onText);
  cb.current = onText;

  const supported = typeof window !== "undefined" && getRecognitionCtor() !== null;

  const stop = useCallback(() => {
    ref.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return false;
    const rec = new Ctor();
    ref.current = rec;
    rec.lang = locale;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let out = "";
      for (let i = 0; i < e.results.length; i++) out += e.results[i]?.[0]?.transcript ?? "";
      if (out.trim()) cb.current(out.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    setListening(true);
    return true;
  }, [locale]);

  return { listening, start, stop, supported };
}
