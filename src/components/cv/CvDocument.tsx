import type { ReactNode } from "react";
import { SECTORS, labelsOf, type CvData, type SectionId } from "@/lib/cv-types";
import { experienceBullets, profileSentence, qualityBullets } from "@/lib/cv-phrases";

const INK = "#2B2118";
const MUTED = "#5C5147";
const LINE = "#DCD2BE";
const TEAL = "#16665D";
const GOLD = "#C89B3C";
const CORAL = "#B5482A";
const BERRY = "#A63A6B";

const accentOf = (t: CvData["template"]) =>
  t === "sello" ? TEAL : t === "energia" ? CORAL : t === "elegante" ? INK : t === "bloques" ? BERRY : TEAL;

function Photo({ src, round, size = 96 }: { src: string; round?: boolean; size?: number }) {
  return (
    <img
      src={src}
      alt="Foto de perfil"
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: round ? "50%" : 8,
        border: `2px solid ${LINE}`,
        flexShrink: 0,
      }}
    />
  );
}

export function CvDocument({ cv }: { cv: CvData }) {
  const accent = accentOf(cv.template);
  const sectors = labelsOf(SECTORS, cv.sectors);
  const studies = cv.education.filter((e) => e.titulo || e.lugar || e.nivel);
  const contact = [cv.telefono, cv.email, cv.ciudad].filter(Boolean);
  const visible = cv.sections.filter((s) => s.visible);

  const base = {
    width: 794,
    minHeight: 1123,
    background: "#FFFFFF",
    color: INK,
    fontFamily: cv.template === "elegante" ? "Georgia, 'Times New Roman', serif" : "Arial, Helvetica, sans-serif",
    fontSize: 13,
    lineHeight: 1.5,
    boxSizing: "border-box" as const,
  };

  const H = ({ children }: { children: ReactNode }) => (
    <h2
      style={{
        fontSize: 12.5,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: accent,
        margin: "20px 0 8px",
        borderBottom: `2px solid ${LINE}`,
        paddingBottom: 4,
        fontWeight: 700,
      }}
    >
      {children}
    </h2>
  );

  const Bullets = ({ items }: { items: string[] }) => (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((b, i) => (
        <li key={i} style={{ marginBottom: 4 }}>
          {b}
        </li>
      ))}
    </ul>
  );

  const body = (id: SectionId): ReactNode => {
    if (id === "perfil") return <p style={{ margin: 0 }}>{profileSentence(cv)}</p>;
    if (id === "experiencia")
      return (
        <div>
          {sectors.length > 0 && <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{sectors.join(" · ")}</p>}
          <Bullets items={experienceBullets(cv)} />
        </div>
      );
    if (id === "formacion")
      return studies.length ? (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {studies.map((e, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              <strong>{e.titulo || e.nivel}</strong>
              {e.titulo ? ` · ${e.nivel}` : ""}
              {e.lugar ? ` — ${e.lugar}` : ""}
              {e.anio ? ` (${e.anio})` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, color: MUTED }}>Formación no reglada y aprendizaje en el entorno familiar.</p>
      );
    return <Bullets items={qualityBullets(cv)} />;
  };

  const flow = (only?: SectionId[]) =>
    visible
      .filter((s) => !only || only.includes(s.id))
      .map((s) => (
        <div key={s.id}>
          <H>{s.title}</H>
          {body(s.id)}
        </div>
      ));

  const sideIds: SectionId[] = ["cualidades", "formacion"];

  /* ---------- 1. Nítida ---------- */
  if (cv.template === "nitida") {
    return (
      <div style={{ ...base, padding: 52 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", borderBottom: `3px solid ${INK}`, paddingBottom: 16 }}>
          {cv.photo && <Photo src={cv.photo} />}
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
            <p style={{ margin: "4px 0 0", color: MUTED }}>{contact.join("  ·  ")}</p>
          </div>
        </div>
        {flow()}
      </div>
    );
  }

  /* ---------- 2. Dos columnas ---------- */
  if (cv.template === "columna") {
    return (
      <div style={{ ...base, padding: 44, display: "flex", gap: 30 }}>
        <aside style={{ width: 230, flexShrink: 0 }}>
          {cv.photo && <Photo src={cv.photo} size={190} />}
          <H>Contacto</H>
          {contact.map((c) => (
            <p key={c} style={{ margin: "0 0 4px" }}>
              {c}
            </p>
          ))}
          {flow(sideIds)}
        </aside>
        <main style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
          <div style={{ height: 4, width: 70, background: accent, margin: "10px 0 8px" }} />
          {flow(["perfil", "experiencia"])}
        </main>
      </div>
    );
  }

  /* ---------- 3. Cabecera de color ---------- */
  if (cv.template === "sello") {
    return (
      <div style={base}>
        <header style={{ background: TEAL, color: "#FFFFFF", padding: "34px 52px", display: "flex", gap: 24, alignItems: "center" }}>
          {cv.photo && <Photo src={cv.photo} round size={110} />}
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
            <p style={{ margin: "10px 0 0", fontSize: 12.5, opacity: 0.92 }}>{contact.join("  ·  ")}</p>
          </div>
        </header>
        <div style={{ padding: "6px 52px 52px" }}>{flow()}</div>
      </div>
    );
  }

  /* ---------- 4. Bloques ---------- */
  if (cv.template === "bloques") {
    return (
      <div style={{ ...base, padding: 44 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {cv.photo && <Photo src={cv.photo} size={104} />}
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
            <p style={{ margin: "8px 0 0", fontSize: 12.5 }}>{contact.join("  ·  ")}</p>
          </div>
        </div>
        {visible.map((s) => (
          <section
            key={s.id}
            style={{ background: "#F8F5EF", border: `1px solid ${LINE}`, borderRadius: 14, padding: "14px 20px", marginTop: 14 }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 12.5, letterSpacing: "0.1em", textTransform: "uppercase", color: accent }}>
              {s.title}
            </h2>
            {body(s.id)}
          </section>
        ))}
      </div>
    );
  }

  /* ---------- 5. Elegante ---------- */
  if (cv.template === "elegante") {
    return (
      <div style={{ ...base, padding: 56 }}>
        <div style={{ textAlign: "center", borderBottom: `1px solid ${LINE}`, paddingBottom: 18 }}>
          {cv.photo && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Photo src={cv.photo} round size={104} />
            </div>
          )}
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "0.04em" }}>{cv.nombre || "Tu nombre"}</h1>
          <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 12.5, letterSpacing: "0.08em" }}>{contact.join("   ·   ")}</p>
        </div>
        {flow()}
      </div>
    );
  }

  /* ---------- 6. Energía ---------- */
  return (
    <div style={{ ...base, display: "flex" }}>
      <aside style={{ width: 250, background: "#FBF2EC", padding: 30, borderRight: `6px solid ${CORAL}` }}>
        {cv.photo && <Photo src={cv.photo} round size={150} />}
        <H>Contacto</H>
        {contact.map((c) => (
          <p key={c} style={{ margin: "0 0 4px", fontSize: 12.5 }}>
            {c}
          </p>
        ))}
        {visible.some((s) => s.id === "cualidades") && (
          <>
            <H>{visible.find((s) => s.id === "cualidades")?.title}</H>
            <div>
              {labelsOf(
                [],
                [],
              ).length === 0 &&
                cv.qualities.length > 0 &&
                qualityBullets(cv).map((q, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      background: GOLD,
                      color: "#FFFFFF",
                      borderRadius: 10,
                      padding: "4px 8px",
                      fontSize: 11,
                      margin: "0 4px 6px 0",
                      fontWeight: 600,
                    }}
                  >
                    {q.split(":")[0]}
                  </span>
                ))}
            </div>
          </>
        )}
      </aside>
      <main style={{ flex: 1, padding: 36 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
        {flow(["perfil", "experiencia", "formacion"])}
      </main>
    </div>
  );
}
