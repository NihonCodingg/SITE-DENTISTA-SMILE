'use client';

import { TRATAMENTOS } from '@/lib/content';
import { useCapability } from '@/lib/useCapability';
import { ScrollVelocity } from '@/components/reactbits/ScrollVelocity';

/**
 * Faixa decorativa dos 7 tratamentos, logo abaixo do Hero. É repetida (o
 * mesmo conteúdo já existe, de verdade, na seção de Tratamentos da Task 10) —
 * por isso a faixa inteira leva `aria-hidden="true"`: sem isso o leitor de
 * tela leria a lista duas vezes.
 *
 * Task 19 ("maximizar React Bits"): até aqui esta faixa era implementada à
 * mão com um `requestAnimationFrame` próprio — decisão registrada em
 * `components/reactbits/README.md`, revertida pela decisão do parceiro
 * ("forçar o máximo possível"). Agora usa o `ScrollVelocity` original do
 * React Bits, vendorizado e corrigido em
 * `components/reactbits/ScrollVelocity.tsx` — a correção principal foi
 * ACRESCENTAR a pausa fora da viewport/aba oculta que o original não tinha
 * (mesmo padrão do antigo `TrilhaAnimada`, agora dentro do componente
 * vendorizado).
 *
 * A aceleração pela velocidade do scroll não vem mais do Lenis diretamente
 * (o `Ticker` antigo lia `lenis.on('scroll', ...)`) — o `ScrollVelocity`
 * calcula a própria velocidade via `useScroll`/`useVelocity` do
 * `motion/react`, que observa `window.scrollY`. Como o Lenis (`lib/motion.tsx`)
 * roda em modo "window" (anima `window.scrollTo` de verdade, não um
 * transform virtual), `window.scrollY` reflete o scroll suavizado do Lenis
 * igual antes — só a fonte de leitura da velocidade mudou de "Lenis emite"
 * para "Motion observa o scroll nativo", sem precisar de `useLenis()` aqui.
 */

const SEPARADOR = ' ✦ ';
const BASE_SPEED = 40; // px/s parado — calma, a marca não é nervosa
const NUM_COPIAS = 4; // cópias lado a lado na trilha — cobre monitores ultra-wide sem buraco no loop

// Mapeamento de velocidade de scroll → fator de boost. Mais conservador que
// o default do React Bits (`input:[0,1000] output:[0,5]`, até 6x a
// velocidade base): design-guidance.md pede motion "calmo e confiante, não
// estalado e nervoso" — um flick de scroll rápido não deveria fazer a
// trilha disparar 6x. Ajustado pra um teto de ~3.5x.
const VELOCITY_MAPPING = { input: [0, 1400] as [number, number], output: [0, 2.5] as [number, number] };

function textoTratamentos(): string {
  return TRATAMENTOS.map((t) => t.nome).join(SEPARADOR);
}

function TrilhaEstatica({ texto }: { texto: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-5 py-3.5 text-center">
      {texto}
    </div>
  );
}

export function Ticker() {
  const { podeAnimar, montado } = useCapability();
  const texto = textoTratamentos();

  return (
    <div
      data-testid="ticker"
      aria-hidden="true"
      className="mx-3 mt-1.5 overflow-hidden rounded-[16px] bg-amarelo font-rotulo text-[14px] font-medium tracking-[.22em] text-preto uppercase"
    >
      {montado && podeAnimar ? (
        // Tipografia (font-rotulo, tamanho, tracking, uppercase, cor) não é
        // passada por prop nenhuma pro ScrollVelocity — o componente
        // vendorizado não força mais tamanho/peso próprios (ver
        // components/reactbits/ScrollVelocity.tsx, modificação nº2), então
        // os spans internos herdam tudo isso por cascata normal do CSS a
        // partir do className já presente no <div data-testid="ticker">
        // que envolve este componente.
        <ScrollVelocity
          texts={[texto]}
          velocity={BASE_SPEED}
          numCopies={NUM_COPIAS}
          damping={60}
          stiffness={300}
          velocityMapping={VELOCITY_MAPPING}
          className="pr-[1.5em] pl-[1.5em]"
          parallaxClassName="py-3.5"
        />
      ) : (
        <TrilhaEstatica texto={texto} />
      )}
    </div>
  );
}
