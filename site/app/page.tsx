import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PaginaComVideo } from '@/components/sections/PaginaComVideo';
import { Ticker } from '@/components/sections/Ticker';
import { Pilares } from '@/components/sections/Pilares';
import { Tratamentos } from '@/components/sections/Tratamentos';
import { Sorrisos } from '@/components/sections/Sorrisos';
import { Profissional } from '@/components/sections/Profissional';
import { Localizacao } from '@/components/sections/Localizacao';
import { Faq } from '@/components/sections/Faq';
import { CtaFinal } from '@/components/sections/CtaFinal';
import { IlhaContato } from '@/components/layout/IlhaContato';
import { dentistJsonLd } from '@/lib/jsonld';

// Título e descrição focados em busca local — "dentista Ipiranga" é o termo
// que o briefing pede pra disputar, com os tratamentos de maior intenção de
// busca (facetas, implantes) logo no título. metadataBase vem do layout
// raiz, então a imagem do Open Graph pode usar caminho relativo.
export const metadata: Metadata = {
  title: 'Smile — Dentista no Ipiranga, São Paulo | Facetas, Implantes e Próteses',
  description:
    'Consultório odontológico no Ipiranga, São Paulo. Facetas, implantes, próteses, ortodontia e clareamento com atendimento humanizado. Agende sua avaliação pelo WhatsApp.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    title: 'Smile — Seu novo sorriso começa aqui',
    description: 'Odontologia integrada no Ipiranga, São Paulo. Atendimento humanizado e sorriso com propósito.',
    images: [{ url: '/img/hero-foto.jpg', width: 928, height: 1143 }],
  },
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistJsonLd()) }}
      />
      <Header />
      {/* id="topo": alvo do logo do header (ANCORA_TOPO, Task 18 E2) */}
      <main id="topo" className="bg-branco">
        {/* PaginaComVideo carrega a ordem das seções do corpo. Foi a
            fronteira 'use client' que segurava o estado "qual vídeo está
            aberto no lightbox" (Task 12); desde 24/08 os vídeos abrem no
            Instagram e não há mais estado nem lightbox, então ela voltou a
            ser Server Component. Ticker/Pilares/Tratamentos/Sorrisos/
            Profissional continuam chegando por prop, herança daquela
            fronteira. Localizacao, Faq e CtaFinal entram aqui direto, como
            irmãs — a ordem final da página é a mesma de ponta a ponta. */}
        <PaginaComVideo
          ticker={<Ticker />}
          pilares={<Pilares />}
          tratamentos={<Tratamentos />}
          sorrisos={<Sorrisos />}
          profissional={<Profissional />}
        />
        <Localizacao />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
      <IlhaContato />
    </>
  );
}
