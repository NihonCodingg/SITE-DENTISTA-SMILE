'use client';

import { useCapability } from '@/lib/useCapability';
import { Reveal } from '@/components/ui/Reveal';
import { ANTES_DEPOIS } from '@/lib/content';
import { TITULO_TAMANHO_PADRAO, TITULO_TRACKING } from '@/components/ui/SectionHeading';
import DepthCarousel from '@/components/reactbits/DepthCarousel';

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
export function AntesDepois() {
  const { podeAnimar } = useCapability();

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
        <Reveal
          as="h2"
          className={`font-titulo uppercase leading-[0.96] ${TITULO_TRACKING} text-balance text-preto ${TITULO_TAMANHO_PADRAO}`}
        >
          Resultados reais
        </Reveal>

        <div className="mt-10 md:mt-14">
          <DepthCarousel
            items={ITENS}
            reducedMotion={!podeAnimar}
            autoplay={podeAnimar}
            autoplayDelay={4200}
            cardWidth={300}
            cardHeight={300}
            showControls
            showIndicators
          />
        </div>

        {/* 14px é a mesma exceção do bloco de contato do rodapé: texto legal
            exigido pela CFO-196/2019, lido uma vez, não corpo de leitura —
            registrada na review final da branch (M2). Abaixo de 14px não
            desce. */}
        <p className="mt-6 max-w-[72ch] font-corpo text-[14px] leading-relaxed text-grafite">{AVISO_LEGAL}</p>
      </div>
    </section>
  );
}
