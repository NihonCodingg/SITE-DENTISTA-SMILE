'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCapability } from '@/lib/useCapability';
import { urlImagemOtimizada } from '@/lib/imgOtimizada';
import { SORRISOS } from '@/lib/content';

// ogl (dependência do CircularGallery) fora do first-load JS da rota — mesmo
// mecanismo que HeroBackdrop.tsx (Task 8) já usa para o Silk. Ver
// task-13-report.md para a saída do `npm run build` que prova isso.
//
// Task 17 (performance): tentei também adiar esta montagem com
// `requestIdleCallback`, mesma hipótese do HeroBackdrop.tsx — sem ganho
// mensurável (ver o comentário lá e task-17-report.md), revertido pra
// montagem direta por não ter número que justificasse a complexidade extra.
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

// Task 17 (performance): `CircularGallery` carrega textura com `new Image()`
// direto (ver components/reactbits/CircularGallery.tsx) — passa batido pelo
// otimizador do `next/image`. Medido: os 9 JPEGs originais (700–950px,
// 70–240KB cada) somavam ~600KB SÓ da galeria, o maior bloco isolado do
// `total-byte-weight` da rota inteira (task-17-report.md). `urlImagemOtimizada`
// (lib/imgOtimizada.ts) passa pela mesma rota `/_next/image` que o
// `next/image` já usa, pedindo 640px — perceptualmente idêntico no card de
// ~220px, uma fração do peso.
//
// Hospedado em escopo de módulo (não recalculado dentro do componente): SORRISOS
// é um `const` importado, nunca muda em tempo de execução, então mapear uma vez
// aqui dá a mesma referência estável pra sempre. Correção pós-review: antes isto
// era `SORRISOS.map(...)` dentro do corpo de SorrisosGaleria — uma referência
// NOVA a cada render. Como `items` está nas deps do `useEffect` que cria o
// contexto WebGL em CircularGallery.tsx, qualquer re-render futuro do pai
// destruiria e recriaria o contexto inteiro. Mesmo raciocínio que já vale para
// `onError` (comentário em CircularGallery.tsx): identidade estável evita
// recriar o WebGL à toa.
const ITENS_WEBGL = SORRISOS.map((s) => ({ image: urlImagemOtimizada(s.img, 640) }));

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
/**
 * A MESMA altura nos dois ramos. Sem isso, a troca do fallback para o WebGL
 * na hidratação mudava a altura da seção (medido em 375×812: 354px do
 * scroller contra 568px do canvas) e empurrava tudo abaixo dela — 0,44 de
 * CLS num único deslocamento, quatro vezes o limite de 0,1 que o Core Web
 * Vitals considera bom. O canvas precisa de altura explícita porque desenha
 * em espaço próprio; então é o scroller que se ajusta, centralizando os
 * cartões na caixa mais alta em vez de depender do próprio conteúdo.
 */
/**
 * Task 22 (achado do dono do projeto: "está meio grande demais no celular"):
 * era `min(70vh, 640px)`. O `CircularGallery` desenha cada retrato com 60% da
 * altura do canvas (`plane.scale.y = 900 × altura/1500`, medido) — numa tela
 * de 812px isso dava um canvas de 568 e um retrato de 341px de altura, quase
 * metade da tela, para uma seção que é ilustrativa e não o assunto principal.
 *
 * `52vh` no celular põe o retrato em ~253px; a partir de 768px continua a
 * medida antiga, onde a galeria tem largura para mostrar vários de uma vez e o
 * tamanho maior faz sentido.
 *
 * A altura é a MESMA nos dois ramos (WebGL e scroller de fallback) e é por
 * isso que ela mora numa constante só: na Task 13 a troca de um pelo outro na
 * hidratação mudava a altura da seção (354 contra 568, medido em 375×812) e
 * empurrava tudo abaixo dela — 0,44 de CLS num único deslocamento.
 */
const ALTURA_GALERIA = 'h-[min(52vh,420px)] md:h-[min(70vh,640px)]';

export function SorrisosGaleria() {
  const { podePesado, montado } = useCapability();
  const [webglFalhou, setWebglFalhou] = useState(false);

  const mostrarWebgl = montado && podePesado && !webglFalhou;

  if (mostrarWebgl) {
    return (
      <>
        <div className={`relative ${ALTURA_GALERIA} w-full`} data-diag="galeria">
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
    <div
      className={`sorrisos-scroller flex ${ALTURA_GALERIA} snap-x snap-mandatory items-center gap-5 overflow-x-auto scroll-pl-4 px-4 md:gap-8 md:scroll-pl-8 md:px-8`}
    >
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
