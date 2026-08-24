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
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
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
        {/* Hero, Clínica e Depoimentos precisam do mesmo estado "qual vídeo
            está aberto" e de um único <Lightbox> — PaginaComVideo é a
            fronteira 'use client' que segura isso (Task 12), recebendo
            Ticker/Pilares/Tratamentos/Sorrisos/Profissional (Server
            Components, sem estado de vídeo) já prontos por prop para manter
            a ordem certa da página sem importar um módulo server dentro de
            um arquivo client. Profissional (Task 14) entra entre Sorrisos e
            Depoimentos; AntesDepois e ComoFunciona (Task 14, 'use client'
            por conta própria) entram direto dentro de PaginaComVideo, depois
            de Depoimentos — não passam por aqui. ComoFunciona é a última
            seção de dentro de PaginaComVideo (Task 14) — Localizacao, Faq e
            CtaFinal (Task 15) são 'use client' por conta própria também
            (mesmo padrão de AntesDepois/ComoFunciona), mas não precisam do
            estado de vídeo do Lightbox, então entram aqui direto, como
            irmãs de <PaginaComVideo>, mantendo app/page.tsx um Server
            Component — a ordem final da página continua a mesma de ponta a
            ponta. */}
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
      <WhatsAppFab />
    </>
  );
}
