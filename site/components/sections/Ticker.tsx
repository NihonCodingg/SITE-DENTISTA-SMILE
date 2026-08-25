'use client';

import { TRATAMENTOS } from '@/lib/content';
import { useCapability } from '@/lib/useCapability';
import TextLoop from '@/components/reactbits/TextLoop';

/**
 * Faixa decorativa dos 7 tratamentos, logo abaixo do Hero. É repetida (o
 * mesmo conteúdo já existe, de verdade, na seção de Tratamentos da Task 10) —
 * por isso a faixa inteira leva `aria-hidden="true"`: sem isso o leitor de
 * tela leria a lista duas vezes.
 *
 * Task 19 ("maximizar React Bits"): até aqui esta faixa era implementada à
 * mão com um `requestAnimationFrame` próprio — decisão registrada em
 * `components/reactbits/README.md`, revertida pela decisão do parceiro
 * ("forçar o máximo possível"). Agora usa o `TextLoop` do
 * React Bits, vendorizado e corrigido em
 * `components/reactbits/TextLoop.tsx` — a correção principal foi
 * ACRESCENTAR a pausa fora da viewport/aba oculta que o original não tinha
 * (mesmo padrão do antigo `TrilhaAnimada`, agora dentro do componente
 * vendorizado).
 *
 * A aceleração pela velocidade do scroll não vem mais do Lenis diretamente
 * (o `Ticker` antigo lia `lenis.on('scroll', ...)`) — o `TextLoop`
 * calcula a própria velocidade via `useScroll`/`useVelocity` do
 * `motion/react`, que observa `window.scrollY`. Como o Lenis (`lib/motion.tsx`)
 * roda em modo "window" (anima `window.scrollTo` de verdade, não um
 * transform virtual), `window.scrollY` reflete o scroll suavizado do Lenis
 * igual antes — só a fonte de leitura da velocidade mudou de "Lenis emite"
 * para "Motion observa o scroll nativo", sem precisar de `useLenis()` aqui.
 */

const SEPARADOR = ' ✦ ';

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
      className={`mx-3 mt-1.5 overflow-hidden rounded-[16px] font-rotulo text-[14px] font-medium tracking-[.22em] text-preto uppercase${
        montado && podeAnimar ? '' : ' bg-amarelo'
      }`}
    >
      {montado && podeAnimar ? (
        // Task 20, pedido do dono do projeto: a faixa reta virou a FITA
        // curva do `TextLoop` (React Bits), com os tratamentos correndo por
        // ela. A fita desenha o próprio fundo amarelo, então o `bg-amarelo`
        // do envoltório sai neste ramo — sobrariam duas faixas amarelas, uma
        // reta atrás da curva.
        <TextLoop
          text={texto}
          shape="wave"
          separator={SEPARADOR.trim()}
          speed={90}
          curviness={40}
          fontSize={22}
          fontWeight={600}
          letterSpacing={3}
          color="var(--color-preto)"
          ribbon
          ribbonColor="var(--color-amarelo)"
          ribbonWidth={64}
          reducedMotion={!podeAnimar}
          className="w-full"
        />
      ) : (
        <TrilhaEstatica texto={texto} />
      )}
    </div>
  );
}
