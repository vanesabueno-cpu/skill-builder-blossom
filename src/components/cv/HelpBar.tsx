import { Volume2, VolumeX, Music, Mic, MicOff, Languages } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import type { Mood } from "@/lib/music";

import iconAltavoz from "@/assets/clay-altavoz.png";
import iconMicro from "@/assets/clay-microfono.png";
import iconMusica from "@/assets/clay-musica.png";
import iconTraductor from "@/assets/clay-traductor.png";

function ToolButton({
  img,
  label,
  active,
  onClick,
  disabled,
  children,
}: {
  img: string;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`clay clay-press flex min-w-20 flex-col items-center gap-1 rounded-2xl border-2 px-3 py-2 text-[11px] font-bold disabled:opacity-40 ${
        active ? "border-primary bg-secondary" : "border-border bg-card"
      }`}
    >
      <img src={img} alt="" width={48} height={48} className="h-9 w-9 object-contain" />
      <span className="flex items-center gap-1">
        {children}
        {label}
      </span>
    </button>
  );
}

export function HelpBar({
  d,
  voiceOn,
  onToggleVoice,
  onRead,
  speaking,
  micSupported,
  listening,
  onMic,
  onTranslate,
  translating,
  music,
  onMusic,
}: {
  d: Dict;
  voiceOn: boolean;
  onToggleVoice: () => void;
  onRead: () => void;
  speaking: boolean;
  micSupported: boolean;
  listening: boolean;
  onMic: () => void;
  onTranslate: () => void;
  translating: boolean;
  music: Mood | null;
  onMusic: (m: Mood | null) => void;
}) {
  return (
    <div className="no-print mx-auto mt-5 max-w-3xl px-5">
      <div className="clay flex flex-wrap items-center justify-center gap-2 rounded-3xl border-2 border-border bg-card p-3">
        <ToolButton img={iconAltavoz} label={d.readStep} onClick={onRead} active={speaking}>
          <Volume2 size={12} />
        </ToolButton>
        <ToolButton img={iconAltavoz} label={voiceOn ? d.voiceOn : d.voiceOff} onClick={onToggleVoice} active={voiceOn}>
          {voiceOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
        </ToolButton>
        <ToolButton img={iconMicro} label={listening ? d.listening : d.dictate} onClick={onMic} active={listening} disabled={!micSupported}>
          {listening ? <Mic size={12} /> : <MicOff size={12} />}
        </ToolButton>
        <ToolButton img={iconTraductor} label={d.translate} onClick={onTranslate} active={translating}>
          <Languages size={12} />
        </ToolButton>
        <ToolButton img={iconMusica} label={music ? d[music === "focus" ? "focus" : music === "relax" ? "relax" : "motivation"] : d.music} onClick={() => onMusic(music ? null : "focus")} active={music !== null}>
          <Music size={12} />
        </ToolButton>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {(["focus", "motivation", "relax"] as Mood[]).map((m) => (
          <button
            key={m}
            onClick={() => onMusic(music === m ? null : m)}
            className={`clay-press rounded-full border-2 px-3 py-1 text-xs font-bold ${
              music === m ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
            }`}
          >
            {d[m]}
          </button>
        ))}
        <button
          onClick={() => onMusic(null)}
          className="clay-press rounded-full border-2 border-border bg-card px-3 py-1 text-xs font-bold"
        >
          🔇 {d.musicOff}
        </button>
      </div>
    </div>
  );
}
