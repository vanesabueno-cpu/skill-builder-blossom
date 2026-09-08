import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { atsReport } from "@/lib/ats";
import type { CvData } from "@/lib/cv-types";
import type { Dict } from "@/lib/i18n";

export const REQUIRED_IDS = ["nombre", "contacto", "experiencia", "perfil"];

export function atsStatus(cv: CvData) {
  const report = atsReport(cv);
  const missing = report.items.filter((i) => REQUIRED_IDS.includes(i.id) && !i.ok);
  return { ...report, missing, canExport: missing.length === 0 && report.score >= 60 };
}

export function AtsPanel({ cv, d }: { cv: CvData; d: Dict }) {
  const { items, score, keywords, canExport, missing } = atsStatus(cv);
  const tone = score >= 80 ? "bg-leaf" : score >= 60 ? "bg-gold" : "bg-accent";

  return (
    <div className="clay rounded-3xl border-2 border-border bg-card p-5">
      <h3 className="display text-xl">🎯 {d.atsTitle}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{d.atsP}</p>

      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl font-black">{score}</span>
        <span className="text-sm font-semibold text-muted-foreground">/ 100</span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
          <div className={`h-full ${tone}`} style={{ width: `${score}%` }} />
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-start gap-2 text-sm">
            {i.ok ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-leaf" />
            ) : (
              <Circle size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
            )}
            <span>
              <strong className={i.ok ? "" : "text-accent"}>{i.label}</strong>
              {!i.ok && <span className="block text-muted-foreground">{i.tip}</span>}
            </span>
          </li>
        ))}
      </ul>

      {keywords.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-bold">🔑 {d.keywords}</p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span key={k} className="rounded-full border-2 border-border bg-secondary px-3 py-1 text-xs font-semibold">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {!canExport && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-gold bg-secondary p-3 text-sm font-semibold">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          {missing.length
            ? missing.map((m) => m.label).join(" · ")
            : "Necesitas al menos 60 puntos para descargar."}
        </p>
      )}
    </div>
  );
}
