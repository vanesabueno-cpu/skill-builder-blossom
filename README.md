# Curricular Brilliance

Crea la app con un estilo profesional, llamativo, colorido, muy intuitivo para personas que no saben leer o traducir, con botones de imágenes en plastilina 3d. Está app es para colectivos de mujeres y jóvenes que no tienen estudios ni experiencia laboral. El objetivo es que adquieran un currículum con la experiencia en sus hogares o sus cualidades y los motiven para la búsqueda de empleo activo. 

Añade las dependencias npm: jspdf, html2canvas y lucide-react.

Crea una edge function de Supabase llamada 'translate' que reciba { text, sourceLang } y llame a la API de Anthropic (modelo claude-sonnet-4-6) para traducir al español en tono profesional para currículum, guardando mi ANTHROPIC_API_KEY como secreto Sin el paso 4, todo funciona igual excepto el botón "Traducir"; el dictado por voz funciona de todas formas sin necesitarlo.

Añadir un sistema para guardar mi progreso del CV y poder retomarlo después en el mismo dispositivo.

Implementar una opción para generar un enlace compartible de mi CV y poder enviarlo a otras personas.

Mejorar el fotomatón con recorte automático, ajuste de encuadre y un fondo más profesional antes de exportar el PDF.

Añadir la opción de descargar una versión completa del CV traducida al español (cuando escriba en árabe o francés), junto con la versión original.

Añade 6 plantillas de CV ats con diseños modernos, actuales y atractivos para empresas.

Crea la app como si fueses un 

experto.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://skill-builder-blossom.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/45f5f8e9-969f-4129-b913-867a395ab833).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
