'use client';

import { useState, type ReactNode } from 'react';
import { Hero } from './Hero';
import { Clinica, LEGENDA_RECEPCAO } from './Clinica';
import { Depoimentos } from './Depoimentos';
import { AntesDepois } from './AntesDepois';
import { ComoFunciona } from './ComoFunciona';
import { Lightbox } from '@/components/ui/Lightbox';
import { DEPOIMENTOS } from '@/lib/content';

// slug → legenda de TODO vídeo que a página pode abrir no lightbox
// compartilhado. Só quem monta o <Lightbox> (aqui) precisa saber traduzir
// slug em legenda — Hero/Clínica/Depoimentos continuam só chamando
// onAbrirVideo(slug), sem saber que existe um Lightbox do outro lado.
const LEGENDA_TOUR = 'Tour em vídeo pela Smile Ipiranga.';
const LEGENDAS: Record<string, string> = {
  'tour-clinica': LEGENDA_TOUR,
  recepcao: LEGENDA_RECEPCAO,
  ...Object.fromEntries(DEPOIMENTOS.map((d) => [d.slug, d.legenda])),
};

type Props = {
  ticker: ReactNode;
  pilares: ReactNode;
  tratamentos: ReactNode;
  sorrisos: ReactNode;
  profissional: ReactNode;
};

/**
 * Fronteira 'use client' única para o estado "qual vídeo está aberto no
 * lightbox" (Task 12) — compartilhado por Hero (Task 7/8), Clínica e
 * Depoimentos (Task 12). Substitui o antigo `HeroSection.tsx` (Task 7), que
 * criou exatamente este padrão — só que para uma seção. Agora o estado
 * precisa ser visto por três seções em pontos diferentes da árvore, então a
 * fronteira sobe para envolvê-las todas em vez de cada uma ter a sua.
 *
 * `app/page.tsx` continua Server Component: Ticker/Pilares/Tratamentos/
 * Sorrisos/Profissional (que não precisam do estado de vídeo) são
 * renderizados lá e chegam aqui já prontos via prop — é o padrão
 * documentado do Next.js para intercalar Server Components dentro da árvore
 * de um Client Component sem importar um módulo server dentro de um arquivo
 * 'use client' (o que quebra o build). `Sorrisos` (Task 13) e `Profissional`
 * (Task 14) são Server Components elas mesmas — só a decisão WebGL/fallback
 * dentro de Sorrisos (`SorrisosGaleria.tsx`) é cliente.
 *
 * `AntesDepois` e `ComoFunciona` (Task 14) já são 'use client' por conta
 * própria (GSAP/ScrollTrigger/useCapability internos) — por isso, ao
 * contrário de Profissional, entram direto aqui, sem passar por prop, no
 * mesmo padrão que Clinica e Depoimentos já seguem.
 *
 * O `<Lightbox>` só precisa existir uma vez porque ele mesmo já se portala
 * para `document.body` (Task 11) — a posição dele nesta árvore não afeta
 * onde ele aparece na página, só quem controla seu estado.
 */
export function PaginaComVideo({ ticker, pilares, tratamentos, sorrisos, profissional }: Props) {
  const [videoAberto, setVideoAberto] = useState<string | null>(null);

  return (
    <>
      <Hero onAbrirVideo={setVideoAberto} />
      {ticker}
      {pilares}
      {tratamentos}
      <Clinica onAbrirVideo={setVideoAberto} />
      {sorrisos}
      {profissional}
      <Depoimentos onAbrirVideo={setVideoAberto} />
      <AntesDepois />
      <ComoFunciona />

      <Lightbox
        slug={videoAberto}
        legenda={videoAberto ? (LEGENDAS[videoAberto] ?? '') : ''}
        onFechar={() => setVideoAberto(null)}
      />
    </>
  );
}
