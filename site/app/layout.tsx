import type { Metadata } from 'next';
import { Archivo_Black, Jost, Source_Sans_3, Caveat } from 'next/font/google';
import { MotionProvider } from '@/lib/motion';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--fonte-archivo', display: 'swap' });
const jost = Jost({ subsets: ['latin'], weight: ['300','400','500'], variable: '--fonte-jost', display: 'swap' });
const source = Source_Sans_3({ subsets: ['latin'], weight: ['400','600','700'], variable: '--fonte-source', display: 'swap' });
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
