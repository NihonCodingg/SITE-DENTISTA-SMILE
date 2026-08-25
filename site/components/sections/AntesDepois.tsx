'use client';

import { useEffect, useState } from 'react';
import { useCapability } from '@/lib/useCapability';
import { Reveal } from '@/components/ui/Reveal';
import { ANTES_DEPOIS } from '@/lib/content';
import { TITULO_TAMANHO_PADRAO, TITULO_TRACKING } from '@/components/ui/SectionHeading';
import DepthCarousel from '@/components/reactbits/DepthCarousel';
import { TituloFlutuante } from '@/components/ui/TituloFlutuante';

// Texto EXATO de COPY.md §8 — Resolução CFO-196/2019 + LGPD (pessoas
// identificáveis): não encurtar, não parafrasear. "Cada caso é único e os
// resultados variam" é também o que impede a seção de soar como promessa de
// resultado, proibida pela mesma resolução.
const AVISO_LEGAL =
  'Imagens de casos realizados na Smile, publicadas com autorização dos pacientes. Cada caso é único e os resultados variam conforme a condição de cada pessoa.';

/**
 * `ANTES_DEPOIS` (lib/content.ts) no formato que o DepthCarousel espera. O
 * `alt` de cada caso vem do conteúdo, não é gerado aqui — o carrossel só
 * transporta.
 */
const ITENS = ANTES_DEPOIS.map((item) => ({ image: item.img, alt: item.alt }));

/**
 * Seção "Antes e Depois" (Task 14) — condicional por design: some por
 * completo (sem título órfão) no dia em que `ANTES_DEPOIS` esvaziar, porque
 * a autorização de uso de imagem de algum paciente foi revogada ou nunca
 * confirmada (PERGUNTAS-CLIENTE.md, pendência nº2, "trava a publicação").
 *
 * O carrossel é o `DepthCarousel` do React Bits (Task 20, pedido do dono do
 * projeto), vendorizado em `components/reactbits/DepthCarousel.tsx`. Ele
 * substituiu o scroller horizontal com `clip-path` que a Task 14 tinha
 * construído: as fotos agora entram em profundidade, com arraste, teclado e
 * autoplay. `reducedMotion` e `autoplay` saem de `useCapability()` — sob
 * `prefers-reduced-motion` o carrossel não se move sozinho e as transições
 * ficam instantâneas, mas as fotos continuam todas alcançáveis.
 *
 * Sem sobretítulo: COPY.md §8 só dá "Título: Resultados reais", sem um
 * sobretítulo aprovado — por isso o <h2> não usa <SectionHeading> (que
 * exige a prop), e sim as mesmas classes que ela aplica ao título — incluindo
 * `TITULO_TAMANHO_PADRAO`/`TITULO_TRACKING`, importadas de SectionHeading.tsx
 * em vez de repetidas aqui como literais, para nunca divergir por acidente
 * (ver fix-titulos-report.md) — para ficar visualmente idêntico ao resto do
 * site.
 */
/**
 * Medidas do carrossel por faixa de tela. O `DepthCarousel` recebe pixels,
 * não classes — a conta é aqui.
 *
 * O detalhe que não é óbvio: o componente NÃO desenha o cartão no tamanho
 * pedido. Ele calcula `escala = larguraDisponível / (cardWidth + 2*spread +
 * 120)` e aplica isso a tudo. Com os defaults (`spread: 90`), um cartão de
 * 460px virava 188px reais num celular de 375 — 37% da tela, o que o dono do
 * projeto viu e apontou. Como a escala é uma razão, o tamanho final depende
 * de `spread` tanto quanto de `cardWidth`: no celular vale encolher o
 * espalhamento lateral e pedir um cartão grande; no desktop sobra largura, a
 * escala satura em 1 e o cartão sai no tamanho pedido.
 */
function useMedidasCarrossel() {
  const [medidas, setMedidas] = useState({ cardWidth: 460, spread: 80 });

  useEffect(() => {
    const medir = () =>
      setMedidas(
        window.innerWidth < 768
          ? { cardWidth: 380, spread: 14 } // medido: ~76% da tela depois da escala
          : { cardWidth: 460, spread: 80 }
      );
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  return medidas;
}

export function AntesDepois() {
  const { podeAnimar } = useCapability();
  const { cardWidth, spread } = useMedidasCarrossel();

  // `!ANTES_DEPOIS.length` (não `=== 0`): o array vem de `as const` em
  // lib/content.ts, então o TypeScript infere `.length` como o literal `5`
  // (tupla de tamanho fixo) — comparar `5 === 0` é sinalizado como
  // impossível (TS2367) em tempo de compilação. A checagem de truthiness
  // evita o literal-type mismatch e continua funcionando de verdade no dia
  // em que o array esvaziar.
  if (!ANTES_DEPOIS.length) return null;

  return (
    <section id="antes-depois" className="bg-creme px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1360px]">
        {/* Mesmo efeito de letras flutuando dos outros títulos (Task 20) e a
            mesma blindagem: as letras fatiadas ficam aria-hidden dentro do
            TituloFlutuante, e o nome acessível vai no próprio h2. */}
        <Reveal
          as="h2"
          aria-label="Resultados reais"
          className={`font-titulo uppercase leading-[0.96] ${TITULO_TRACKING} text-balance text-preto ${TITULO_TAMANHO_PADRAO}`}
        >
          <TituloFlutuante texto="Resultados reais" />
        </Reveal>

        {/* Altura explícita, dimensionada pela PROJEÇÃO, não pelo cartão: o
            DepthCarousel aproxima o cartão central da câmera (translateZ), e
            um cartão de 460px mede ~725px na tela (fator ~1,58, medido). Sem
            isso ele cobria o título e o aviso legal (achado do dono do
            projeto). 1,6 + 40px de folga cobrem a projeção, a sombra e os
            indicadores. */}
        <div className="mt-10 md:mt-14" style={{ height: Math.round(cardWidth * 1.6) + 40 }}>
          <DepthCarousel
            items={ITENS}
            reducedMotion={!podeAnimar}
            autoplay={podeAnimar}
            autoplayDelay={4200}
            cardWidth={cardWidth}
            cardHeight={cardWidth}
            spread={spread}
            rotuloCarrossel="Casos de antes e depois"
            showControls
            showIndicators
          />
        </div>

        {/* Dica de uso: o carrossel arrasta, mas nada na tela diz isso — as
            setas sugerem clique, não gesto. Uma linha curta resolve, e é
            rótulo de interface, não copy de marketing. */}
        <p className="mt-4 text-center font-rotulo text-[13px] tracking-[.12em] text-grafite uppercase">
          Arraste para o lado para ver mais
        </p>

        {/* 14px é a mesma exceção do bloco de contato do rodapé: texto legal
            exigido pela CFO-196/2019, lido uma vez, não corpo de leitura —
            registrada na review final da branch (M2). Abaixo de 14px não
            desce. */}
        <p className="mt-6 max-w-[72ch] font-corpo text-[14px] leading-relaxed text-grafite">{AVISO_LEGAL}</p>
      </div>
    </section>
  );
}
