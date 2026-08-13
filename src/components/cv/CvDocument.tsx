import { QUALITIES, SECTORS, labelsOf, type CvData } from "@/lib/cv-types";

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
  const qualities = labelsOf(QUALITIES, cv.qualities);
  const sectors = labelsOf(SECTORS, cv.sectors);
  const studies = cv.education.filter((e) => e.titulo || e.lugar || e.nivel);
  const contact = [cv.telefono, cv.email, cv.ciudad].filter(Boolean);

  const base = {
    width: 794,
    minHeight: 1123,
    background: "#FFFFFF",
    color: INK,
    fontFamily: cv.template === "elegante" ? "Georgia, 'Times New Roman', serif" : "Arial, Helvetica, sans-serif",
    fontSize: 13.5,
    lineHeight: 1.5,
    boxSizing: "border-box" as const,
  };

  const H = ({ children }: { children: string }) => (
    <h2
      style={{
        fontSize: 13,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: accent,
        margin: "22px 0 8px",
        borderBottom: `2px solid ${LINE}`,
        paddingBottom: 4,
        fontWeight: 700,
      }}
    >
      {children}
    </h2>
  );

  const Studies = () =>
    studies.length ? (
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

  const Experience = () => (
    <div>
      {sectors.length > 0 && (
        <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{sectors.join(" · ")}</p>
      )}
      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
        {cv.experience || "Experiencia adquirida en la organización del hogar, cuidados y tareas de responsabilidad diaria."}
      </p>
    </div>
  );

  const QualityList = ({ inline }: { inline?: boolean }) =>
    inline ? (
      <p style={{ margin: 0 }}>{qualities.join(" · ") || "—"}</p>
    ) : (
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {qualities.map((q) => (
          <li key={q} style={{ marginBottom: 3 }}>
            {q}
          </li>
        ))}
      </ul>
    );

  /* ---------- 1. Nítida ---------- */
  if (cv.template === "nitida") {
    return (
      <div style={{ ...base, padding: 56 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", borderBottom: `3px solid ${INK}`, paddingBottom: 16 }}>
          {cv.photo && <Photo src={cv.photo} />}
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
            <p style={{ margin: "4px 0 0", color: MUTED }}>{contact.join("  ·  ")}</p>
          </div>
        </div>
        {cv.bio && (
          <>
            <H>Perfil</H>
            <p style={{ margin: 0 }}>{cv.bio}</p>
          </>
        )}
        <H>Experiencia</H>
        <Experience />
        <H>Formación</H>
        <Studies />
        <H>Cualidades</H>
        <QualityList inline />
      </div>
    );
  }

  /* ---------- 2. Dos columnas ---------- */
  if (cv.template === "columna") {
    return (
      <div style={{ ...base, padding: 48, display: "flex", gap: 32 }}>
        <aside style={{ width: 230, flexShrink: 0 }}>
          {cv.photo && <Photo src={cv.photo} size={190} />}
          <h2 style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginTop: 20 }}>Contacto</h2>
          {contact.map((c) => (
            <p key={c} style={{ margin: "0 0 4px" }}>
              {c}
            </p>
          ))}
          <h2 style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginTop: 20 }}>Cualidades</h2>
          <QualityList />
          <h2 style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginTop: 20 }}>Formación</h2>
          <Studies />
        </aside>
        <main style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
          <div style={{ height: 4, width: 70, background: accent, margin: "10px 0 16px" }} />
          {cv.bio && <p style={{ margin: 0 }}>{cv.bio}</p>}
          <H>Experiencia</H>
          <Experience />
        </main>
      </div>
    );
  }

  /* ---------- 3. Cabecera de color ---------- */
  if (cv.template === "sello") {
    return (
      <div style={base}>
        <header style={{ background: TEAL, color: "#FFFFFF", padding: "38px 56px", display: "flex", gap: 24, alignItems: "center" }}>
          {cv.photo && <Photo src={cv.photo} round size={110} />}
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
            {cv.bio && <p style={{ margin: "6px 0 0", opacity: 0.92 }}>{cv.bio}</p>}
            <p style={{ margin: "10px 0 0", fontSize: 12.5, opacity: 0.92 }}>{contact.join("  ·  ")}</p>
          </div>
        </header>
        <div style={{ padding: "10px 56px 56px" }}>
          <H>Experiencia</H>
          <Experience />
          <H>Formación</H>
          <Studies />
          <H>Cualidades</H>
          <QualityList inline />
        </div>
      </div>
    );
  }

  /* ---------- 4. Bloques ---------- */
  if (cv.template === "bloques") {
    const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
      <section style={{ background: "#F8F5EF", border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 20px", marginTop: 16 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: accent }}>{title}</h2>
        {children}
      </section>
    );
    return (
      <div style={{ ...base, padding: 48 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {cv.photo && <Photo src={cv.photo} size={104} />}
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
            {cv.bio && <p style={{ margin: "4px 0 0", color: MUTED }}>{cv.bio}</p>}
            <p style={{ margin: "8px 0 0", fontSize: 12.5 }}>{contact.join("  ·  ")}</p>
          </div>
        </div>
        <Card title="Experiencia">
          <Experience />
        </Card>
        <Card title="Formación">
          <Studies />
        </Card>
        <Card title="Cualidades">
          <QualityList inline />
        </Card>
      </div>
    );
  }

  /* ---------- 5. Elegante ---------- */
  if (cv.template === "elegante") {
    return (
      <div style={{ ...base, padding: 60 }}>
        <div style={{ textAlign: "center", borderBottom: `1px solid ${LINE}`, paddingBottom: 20 }}>
          {cv.photo && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Photo src={cv.photo} round size={104} />
            </div>
          )}
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "0.04em" }}>{cv.nombre || "Tu nombre"}</h1>
          <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 12.5, letterSpacing: "0.08em" }}>{contact.join("   ·   ")}</p>
        </div>
        {cv.bio && <p style={{ textAlign: "center", fontStyle: "italic", margin: "18px auto 0", maxWidth: 520 }}>{cv.bio}</p>}
        <H>Experiencia</H>
        <Experience />
        <H>Formación</H>
        <Studies />
        <H>Cualidades</H>
        <QualityList inline />
      </div>
    );
  }

  /* ---------- 6. Energía ---------- */
  return (
    <div style={{ ...base, display: "flex" }}>
      <aside style={{ width: 250, background: "#FBF2EC", padding: 34, borderRight: `6px solid ${CORAL}` }}>
        {cv.photo && <Photo src={cv.photo} round size={150} />}
        <h2 style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL, marginTop: 20 }}>Contacto</h2>
        {contact.map((c) => (
          <p key={c} style={{ margin: "0 0 4px", fontSize: 12.5 }}>
            {c}
          </p>
        ))}
        <h2 style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL, marginTop: 20 }}>Cualidades</h2>
        <div>
          {qualities.map((q) => (
            <span
              key={q}
              style={{
                display: "inline-block",
                background: GOLD,
                color: "#FFFFFF",
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: 11.5,
                margin: "0 4px 6px 0",
                fontWeight: 700,
              }}
            >
              {q}
            </span>
          ))}
        </div>
      </aside>
      <main style={{ flex: 1, padding: 40 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{cv.nombre || "Tu nombre"}</h1>
        {cv.bio && <p style={{ margin: "8px 0 0", color: MUTED }}>{cv.bio}</p>}
        <H>Experiencia</H>
        <Experience />
        <H>Formación</H>
        <Studies />
      </main>
    </div>
  );
}
