import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import type { CvSection } from "@/lib/cv-types";
import type { Dict } from "@/lib/i18n";

export function SectionEditor({
  sections,
  onChange,
  d,
}: {
  sections: CvSection[];
  onChange: (s: CvSection[]) => void;
  d: Dict;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    const a = next[i]!;
    const b = next[j]!;
    next[i] = b;
    next[j] = a;
    onChange(next);
  };

  const patch = (i: number, p: Partial<CvSection>) =>
    onChange(sections.map((s, idx) => (idx === i ? { ...s, ...p } : s)));

  return (
    <div className="clay rounded-3xl border-2 border-border bg-card p-5">
      <h3 className="display text-xl">🧩 {d.sections}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{d.sectionsP}</p>
      <ul className="space-y-3">
        {sections.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 rounded-2xl border-2 border-border bg-background p-2">
            <div className="flex flex-col">
              <button
                aria-label="Subir"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="clay-press rounded-lg p-1 disabled:opacity-30"
              >
                <ArrowUp size={16} />
              </button>
              <button
                aria-label="Bajar"
                onClick={() => move(i, 1)}
                disabled={i === sections.length - 1}
                className="clay-press rounded-lg p-1 disabled:opacity-30"
              >
                <ArrowDown size={16} />
              </button>
            </div>
            <input
              className="flex-1 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-semibold"
              value={s.title}
              onChange={(e) => patch(i, { title: e.target.value })}
            />
            <button
              aria-label={s.visible ? "Ocultar" : "Mostrar"}
              onClick={() => patch(i, { visible: !s.visible })}
              className={`clay-press rounded-xl border-2 p-2 ${s.visible ? "border-primary bg-secondary" : "border-border bg-card opacity-60"}`}
            >
              {s.visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
