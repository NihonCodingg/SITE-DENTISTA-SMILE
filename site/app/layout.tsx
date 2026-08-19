import { Archivo_Black, Jost, Source_Sans_3, Caveat } from 'next/font/google';
import './globals.css';

const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--fonte-archivo', display: 'swap' });
const jost = Jost({ subsets: ['latin'], weight: ['300','400','500'], variable: '--fonte-jost', display: 'swap' });
const source = Source_Sans_3({ subsets: ['latin'], weight: ['400','600','700'], variable: '--fonte-source', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], weight: '600', variable: '--fonte-caveat', display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${jost.variable} ${source.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
