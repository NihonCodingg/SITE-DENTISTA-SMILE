'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCapability } from '@/lib/useCapability';
import { SORRISOS } from '@/lib/content';

// ogl (dependência do CircularGallery) fora do first-load JS da rota — mesmo
// mecanismo que HeroBackdrop.tsx (Task 8) já usa para o Silk. Ver
// task-13-report.md para a saída do `npm run build` que prova isso.
const CircularGallery = dynamic(() => import('@/components/reactbits/CircularGallery'), {
  ssr: false,
  loading: () => null,
});

// Nunca inventamos nome de paciente — este é o único texto que acompanha
// cada retrato, nos dois modos (fallback visível e canvas WebGL, que
// precisa de um equivalente textual porque leitor de tela não lê canvas).
const ALT_RETRATO = 'Paciente da Smile sorrindo';

// "Levemente rotacionadas e deslocadas" (design-guidance.md, adendo da Task
// 13) — só `transform`, nunca layout. Ciclo de 3 valores para o olho não
// pegar um padrão óbvio repetindo a cada 2 cartões.
const TRANSFORMS_FALLBACK = [
  'rotate-[-2.5deg] translate-y-1.5',
  'rotate-[2deg] -translate-y-2',
  'rotate-[-1deg] translate-y-1',
];

// Hospedado em escopo de módulo (não recalculado dentro do componente): SORRISOS
// é um `const` importado, nunca muda em tempo de execução, então mapear uma vez
// aqui dá a mesma referência estável pra sempre. Correção pós-review: antes isto
// era `SORRISOS.map(...)` dentro do corpo de SorrisosGaleria — uma referência
// NOVA a cada render. Como `items` está nas deps do `useEffect` que cria o
// contexto WebGL em CircularGallery.tsx, qualquer re-render futuro do pai
// destruiria e recriaria o contexto inteiro. Mesmo raciocínio que já vale para
// `onError` (comentário em CircularGallery.tsx): identidade estável evita
// recriar o WebGL à toa.
const ITENS_WEBGL = SORRISOS.map((s) => ({ image: s.img }));

/**
 * Decide QUAL veículo mostra os 9 retratos (lib/content.ts → SORRISOS):
 * galeria WebGL com inércia (`CircularGallery`, React Bits vendorizado) ou
 * um scroller horizontal com snap e `next/image` — nunca os dois, e nunca
 * nenhum. `useCapability().podePesado` já cobre reduced-motion, economia de
 * dados e aparelho fraco (é o gate único do projeto para essas três coisas).
 *
 * Antes da montagem (`montado` false) o render já é o fallback — mesmo
 * "nasce visível" que `Reveal.tsx`/`Ticker.tsx` seguem: o HTML que o
 * servidor manda é conteúdo real (9 `<img>` com `alt`), nunca um esqueleto.
 * A troca para WebGL só acontece depois que o cliente confirma capacidade.
 *
 * Acessibilidade: o `CircularGallery` marca seu próprio host `aria-hidden`
 * (não existe leitor de tela para canvas). Este componente é quem garante
 * que, enquanto o WebGL está no ar, um parágrafo `sr-only` com o mesmo
 * conteúdo (9 fotos de pacientes reais) continua no DOM — ninguém que usa
 * leitor de tela fica sem saber que a seção existe.
 */
export function SorrisosGaleria() {
  const { podePesado, montado } = useCapability();
  const [webglFalhou, setWebglFalhou] = useState(false);

  const mostrarWebgl = montado && podePesado && !webglFalhou;

  if (mostrarWebgl) {
    return (
      <>
        <div className="relative h-[min(70vh,640px)] w-full">
          <CircularGallery items={ITENS_WEBGL} onError={setWebglFalhou} />
        </div>
        <p className="sr-only">
          Galeria com {SORRISOS.length} fotos de pacientes reais da Smile Ipiranga sorrindo, resultado dos
          tratamentos feitos na clínica.
        </p>
      </>
    );
  }

  return (
    <div className="sorrisos-scroller flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pt-6 pb-10 md:gap-8 md:scroll-pl-8 md:px-8">
      {SORRISOS.map((s, i) => (
        <div key={s.img} className={`shrink-0 snap-start ${TRANSFORMS_FALLBACK[i % TRANSFORMS_FALLBACK.length]}`}>
          <div className="relative aspect-[3/4] w-[min(220px,58vw)] overflow-hidden rounded-[20px] bg-escuro-linha">
            <Image
              src={s.img}
              alt={ALT_RETRATO}
              fill
              sizes="(max-width: 768px) 58vw, 220px"
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
