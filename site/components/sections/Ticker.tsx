'use client';

import { useEffect, useState } from 'react';
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

/**
 * A fita é a MESMA nas duas faixas de tela — o que muda são as medidas de
 * desenho dela (Task 22, correção pedida pelo dono do projeto: "a linha está
 * muito pequena e fora de proporção com o resto do site").
 *
 * Por que ela encolhe sozinha e é preciso compensar à mão: o SVG do
 * `TextLoop` tem caixa FIXA de 1200×520 e escala para a largura disponível.
 * Numa tela de 375px sobram 351px de contêiner, ou seja, escala 0,29 — as
 * medidas de desenho do desktop (texto 22, fita 64) viram 6px de texto e 19px
 * de fita na tela. Um risco amarelo com letra ilegível.
 *
 * A correção é dividir cada medida pela escala daquela faixa. Os números
 * abaixo são o resultado disso, e o que eles produzem NA TELA é o que
 * importa: texto de ~13px (a mesma régua dos outros rótulos do site) e fita
 * de ~50px de altura no celular; ~23px e ~67px no desktop.
 */
const MEDIDAS_FITA = {
  // 351px de contêiner ÷ 1200 da caixa = escala 0,29.
  celular: { fontSize: 44, ribbonWidth: 171, curviness: 75, letterSpacing: 7, altura: 'h-[112px]' },
  // Acima de 768px a caixa praticamente não é reduzida (escala ~1).
  tela: { fontSize: 22, ribbonWidth: 64, curviness: 40, letterSpacing: 3, altura: 'h-[190px]' },
};

function useTelaLarga() {
  const [larga, setLarga] = useState(false);

  useEffect(() => {
    const medir = () => setLarga(window.innerWidth >= 768);
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  return larga;
}

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
  const telaLarga = useTelaLarga();
  const texto = textoTratamentos();
  const medidas = telaLarga ? MEDIDAS_FITA.tela : MEDIDAS_FITA.celular;
  const mostrarFita = montado && podeAnimar;

  return (
    <div
      data-testid="ticker"
      aria-hidden="true"
      className={`mx-3 mt-1.5 overflow-hidden rounded-[16px] font-rotulo text-[14px] font-medium tracking-[.22em] text-preto uppercase${
        mostrarFita ? '' : ' bg-amarelo'
      }`}
    >
      {mostrarFita ? (
        // Task 20, pedido do dono do projeto: a faixa reta virou a FITA
        // curva do `TextLoop` (React Bits), com os tratamentos correndo por
        // ela. A fita desenha o próprio fundo amarelo, então o `bg-amarelo`
        // do envoltório sai neste ramo — sobrariam duas faixas amarelas, uma
        // reta atrás da curva.
        // A caixa do SVG da fita é fixa em 1200×520 — em tela cheia isso
        // vira ~43% da largura em ALTURA, quase toda vazia acima e abaixo da
        // onda (achado do dono do projeto: "não pode tomar tanto espaço
        // assim"). O invólucro corta para a faixa útil: altura própria,
        // overflow escondido, e o SVG centralizado verticalmente — a onda
        // fica, o vazio some.
        <div className={`relative overflow-hidden ${medidas.altura}`}>
          <div className="absolute top-1/2 left-0 w-full -translate-y-1/2">
            <TextLoop
              text={texto}
              shape="wave"
              separator={SEPARADOR.trim()}
              speed={90}
              curviness={medidas.curviness}
              fontSize={medidas.fontSize}
              fontWeight={600}
              letterSpacing={medidas.letterSpacing}
              color="var(--color-preto)"
              ribbon
              ribbonColor="var(--color-amarelo)"
              ribbonWidth={medidas.ribbonWidth}
              reducedMotion={!podeAnimar}
              className="w-full"
            />
          </div>
        </div>
      ) : (
        <TrilhaEstatica texto={texto} />
      )}
    </div>
  );
}
