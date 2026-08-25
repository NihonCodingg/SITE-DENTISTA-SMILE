'use client';

import { useCapability } from '@/lib/useCapability';
import { useTelaLarga } from '@/lib/useTelaLarga';
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
 * Medidas do carrossel por faixa de tela, e a altura que a seção reserva para
 * ele. O `DepthCarousel` recebe pixels — a conta é aqui.
 *
 * O detalhe que não é óbvio: o componente NÃO desenha o cartão no tamanho
 * pedido. Ele calcula `escala = larguraDisponível / (cardWidth + 2·spread +
 * gutter)` e aplica isso a tudo. Duas consequências que já custaram caro:
 *
 * 1. **`gutter` (a folga lateral) pesa tanto quanto `cardWidth`.** No original
 *    do React Bits ela é 120px cravada; num contêiner de 343px isso sozinho
 *    come 35% da largura, e um cartão de 380px nascia com 240 na tela. Por
 *    isso o componente ganhou a prop (modificação 7) e o celular pede 24.
 * 2. **A altura tem que sair da MESMA conta.** A versão anterior reservava
 *    `cardWidth × 1,6 + 40` — um número herdado do desktop. No celular isso
 *    dava 648px de caixa para um cartão de 240: mais de 400px de vazio, metade
 *    acima e metade abaixo. Agora a altura é a do cartão JÁ ESCALADO mais 96px
 *    de folga (sombra, indicadores e ar).
 *
 * Medido depois da mudança: celular 375px → cartão da frente com 302px de
 * largura numa seção de 343 (88%); desktop 1061px → 460px, o tamanho pedido,
 * porque a escala satura em 1.
 */
type Medida = { cardWidth: number; spread: number; gutter: number };

const MEDIDAS: { celular: Medida; tela: Medida } = {
  celular: { cardWidth: 380, spread: 14, gutter: 24 },
  tela: { cardWidth: 460, spread: 80, gutter: 120 },
};

/**
 * A altura da caixa do carrossel, em CSS puro — e não em JS.
 *
 * A conta é a MESMA que o componente usa para escalar:
 *   escala = larguraÚtil / (cardWidth + 2·spread + gutter)
 *   altura = cardWidth · escala + folga
 * No celular, `larguraÚtil = 100vw − 32` (o padding da seção) e o denominador
 * é 380 + 28 + 24 = 432. Substituindo, com 96px de folga para a sombra, os
 * indicadores e o ar:
 *   altura = 380 · (100vw − 32) / 432 + 152 = 87,96vw + 123,85px
 * que é o `calc()` abaixo. Acima de 768px a escala satura em 1 e a altura é
 * fixa: 460 + 152 = 612.
 *
 * Por que não em JS, que era como estava: a versão anterior lia
 * `window.innerWidth` durante o render para calcular a escala. Isso produz um
 * número no servidor e outro no cliente, e o React reclamou em voz alta —
 * "server rendered HTML didn't match", com `height:400` de um lado e
 * `height:"398px"` do outro. Altura de layout é trabalho de CSS: o navegador
 * já sabe a largura da janela sem ninguém perguntar, e sem risco de os dois
 * lados discordarem.
 */
const ALTURA_CARROSSEL = 'h-[calc(87.96vw+123.85px)] md:h-[612px]';

function useMedidasCarrossel(telaLarga: boolean) {
  return telaLarga ? MEDIDAS.tela : MEDIDAS.celular;
}

export function AntesDepois() {
  const { podeAnimar } = useCapability();
  const telaLarga = useTelaLarga();
  const { cardWidth, spread, gutter } = useMedidasCarrossel(telaLarga);

  // `!ANTES_DEPOIS.length` (não `=== 0`): o array vem de `as const` em
  // lib/content.ts, então o TypeScript infere `.length` como o literal `5`
  // (tupla de tamanho fixo) — comparar `5 === 0` é sinalizado como
  // impossível (TS2367) em tempo de compilação. A checagem de truthiness
  // evita o literal-type mismatch e continua funcionando de verdade no dia
  // em que o array esvaziar.
  if (!ANTES_DEPOIS.length) return null;

  return (
    // Fundo preto (Task 22) — ver a nota em Tratamentos.tsx.
    <section id="antes-depois" className="bg-preto px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1360px]">
        {/* Mesmo efeito de letras flutuando dos outros títulos (Task 20) e a
            mesma blindagem: as letras fatiadas ficam aria-hidden dentro do
            TituloFlutuante, e o nome acessível vai no próprio h2. */}
        <Reveal
          as="h2"
          aria-label="Resultados reais"
          className={`font-titulo uppercase leading-[0.96] ${TITULO_TRACKING} text-balance text-branco ${TITULO_TAMANHO_PADRAO}`}
        >
          <TituloFlutuante texto="Resultados reais" />
        </Reveal>

        {/* Altura explícita e calculada pela MESMA conta que o carrossel usa
            para escalar (ver `ALTURA_CARROSSEL`): sem isso a caixa fica
            grande demais no celular e sobra vazio, ou pequena demais e o
            cartão cobre o título — as duas coisas já aconteceram. */}
        <div className={`mt-10 md:mt-14 ${ALTURA_CARROSSEL}`}>
          <DepthCarousel
            items={ITENS}
            reducedMotion={!podeAnimar}
            autoplay={podeAnimar}
            autoplayDelay={4200}
            cardWidth={cardWidth}
            cardHeight={cardWidth}
            spread={spread}
            gutter={gutter}
            rotuloCarrossel="Casos de antes e depois"
            showControls
            showIndicators
          />
        </div>

        {/* Dica de uso: o carrossel arrasta, mas nada na tela diz isso — as
            setas sugerem clique, não gesto. Uma linha curta resolve, e é
            rótulo de interface, não copy de marketing. */}
        <p className="mt-4 text-center font-rotulo text-[13px] tracking-[.12em] text-escuro-texto uppercase">
          Arraste para o lado para ver mais
        </p>

        {/* 14px é a mesma exceção do bloco de contato do rodapé: texto legal
            exigido pela CFO-196/2019, lido uma vez, não corpo de leitura —
            registrada na review final da branch (M2). Abaixo de 14px não
            desce. */}
        <p className="mt-6 max-w-[72ch] font-corpo text-[14px] leading-relaxed text-escuro-texto">{AVISO_LEGAL}</p>
      </div>
    </section>
  );
}
