import type { Metadata } from 'next';
import { Archivo_Black, Jost, Source_Sans_3, Caveat } from 'next/font/google';
import { MotionProvider } from '@/lib/motion';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--fonte-archivo', display: 'swap' });
// Pesos 400 (default do Tailwind preflight) e 500 (`font-medium`, usado em
// font-rotulo) são os únicos que o projeto de fato aplica — confirmado com
// `grep -rn "font-rotulo" components app` (Task 17). 300 nunca é usado por
// nenhum elemento com `font-rotulo`: era peso morto, baixado sem servir a
// nenhuma classe do site.
const jost = Jost({ subsets: ['latin'], weight: ['400','500'], variable: '--fonte-jost', display: 'swap' });
// Idem: `font-corpo` (Source Sans 3) só aparece sem classe de peso — nenhum
// `font-semibold`/`font-bold` no projeto inteiro (`grep -rn "font-semibold\
// |font-bold" components app`, Task 17). 600 e 700 eram baixados à toa.
const source = Source_Sans_3({ subsets: ['latin'], weight: '400', variable: '--fonte-source', display: 'swap' });
// Task 17 (performance): testado `preload: false` aqui (a Caveat só é usada em
// CtaFinal.tsx, abaixo da dobra — hipótese: tirá-la da rajada de preload de
// alta prioridade liberaria banda simulada pra foto do hero). Medido (3
// builds, 3 lighthouse cada): LCP simulado não mudou (4368,7ms vs 4360,6ms
// da baseline — dentro do ruído) e o FCP simulado PIOROU de forma
// reprodutível (~910ms → ~1220ms nas 3 amostras). Sem ganho e com regressão
// medida — revertido. Detalhe completo em task-17-report.md.
const caveat = Caveat({ subsets: ['latin'], weight: '600', variable: '--fonte-caveat', display: 'swap' });

// Só `metadataBase` mora aqui: é a única configuração de metadata que o
// Next.js recomenda deixar no layout raiz (se propaga pra qualquer rota
// futura). Título, descrição, Open Graph, canonical e o JSON-LD ficam em
// app/page.tsx — é lá que mora o conteúdo real de busca local, e page.tsx
// foi refatorado na Task 7 justamente pra poder exportar metadata.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${jost.variable} ${source.variable} ${caveat.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
