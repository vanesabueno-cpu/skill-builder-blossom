import type { CvData } from "./cv-types";
import { experienceBullets, profileSentence, qualityBullets } from "./cv-phrases";

export async function exportCvToDocx(cv: CvData, filename: string) {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    LevelFormat,
    BorderStyle,
  } = await import("docx");

  const heading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 260, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "16665D", space: 2 } },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, color: "16665D", size: 24 })],
    });

  const bullet = (text: string) =>
    new Paragraph({ numbering: { reference: "cv-bullets", level: 0 }, children: [new TextRun(text)] });

  const contact = [cv.telefono, cv.email, cv.ciudad].filter(Boolean).join("  ·  ");
  const body: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: cv.nombre || "Tu nombre", bold: true, size: 44 })],
    }),
    new Paragraph({ children: [new TextRun({ text: contact, color: "5C5147" })], spacing: { after: 120 } }),
  ];

  for (const section of cv.sections.filter((s) => s.visible)) {
    if (section.id === "perfil") {
      body.push(heading(section.title), new Paragraph({ children: [new TextRun(profileSentence(cv))] }));
    } else if (section.id === "experiencia") {
      body.push(heading(section.title), ...experienceBullets(cv).map(bullet));
    } else if (section.id === "formacion") {
      const studies = cv.education.filter((e) => e.titulo || e.lugar || e.nivel);
      body.push(heading(section.title));
      if (studies.length) {
        studies.forEach((e) =>
          body.push(
            bullet(
              [e.titulo || e.nivel, e.titulo ? e.nivel : "", e.lugar, e.anio].filter(Boolean).join(" — "),
            ),
          ),
        );
      } else {
        body.push(new Paragraph({ children: [new TextRun("Formación no reglada y aprendizaje en el entorno familiar.")] }));
      }
    } else {
      body.push(heading(section.title), ...qualityBullets(cv).map(bullet));
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    numbering: {
      config: [
        {
          reference: "cv-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 480, hanging: 240 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: { page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } },
        children: body,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
