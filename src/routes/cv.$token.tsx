import { createFileRoute } from "@tanstack/react-router";
import { CvDocument } from "@/components/cv/CvDocument";
import { getCvShare } from "@/lib/cv-share.functions";
import { emptyCv, type CvData } from "@/lib/cv-types";

export const Route = createFileRoute("/cv/$token")({
  loader: async ({ params }) => getCvShare({ data: { token: params.token } }),
  head: () => ({
    meta: [
      { title: "Currículum compartido · Mi CV, mi historia" },
      { name: "description", content: "Currículum creado con Mi CV, mi historia y compartido mediante un enlace privado." },
      { property: "og:title", content: "Currículum compartido" },
      { property: "og:description", content: "Mira este currículum creado con Mi CV, mi historia." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <Centered title="No se pudo abrir el enlace" text="Inténtalo de nuevo en unos minutos." />,
  notFoundComponent: () => <Centered title="Enlace no encontrado" text="Puede que haya caducado." />,
  component: SharedCv,
});

function Centered({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="display text-2xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function SharedCv() {
  const { payload } = Route.useLoaderData();
  if (!payload) return <Centered title="Este enlace ya no está disponible" text="Los enlaces caducan a los 90 días." />;
  const cv = { ...emptyCv(), ...(JSON.parse(payload) as Partial<CvData>) } as CvData;

  return (
    <main className="min-h-screen py-8">
      <h1 className="sr-only">Currículum de {cv.nombre || "candidata"}</h1>
      <div className="mx-auto w-full max-w-[820px] px-3">
        <div className="clay cv-fit rounded-xl bg-white">
          <CvDocument cv={cv} />
        </div>
      </div>
    </main>
  );
}
