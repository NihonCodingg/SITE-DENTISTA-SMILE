'use client';

import { DEPOIMENTOS } from '@/lib/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { useCapability } from '@/lib/useCapability';
import { useTelaLarga } from '@/lib/useTelaLarga';
import AccordionGallery from '@/components/reactbits/AccordionGallery';

/**
 * Seção "Depoimentos" (Task 12). São vídeos reais, gravados na clínica — sem
 * nome de paciente, sem número, sem avaliação inventada (ux-guidance.md: "os
 * nossos são vídeos gravados na clínica, o que é uma prova mais forte que um
 * nome escrito"). A legenda de cada card já vem de `DEPOIMENTOS`
 * (lib/content.ts) e descreve o que foi tratado, nunca quem foi tratado.
 *
 * Task 21, pedido do dono do projeto: os três cards viraram a
 * `AccordionGallery` do React Bits (vendorizada em
 * components/reactbits/AccordionGallery.tsx). Ela substituiu o scroller
 * horizontal com scroll-snap e as duas faixas de `GradualBlur` nas bordas —
 * uma sanfona mostra os três de uma vez, sem barra de rolagem, então não
 * sobrou borda para sinalizar.
 *
 * O vídeo continua NÃO hospedado aqui: cada painel é um link que abre o reel
 * no Instagram da clínica, em aba nova (mesma regra de `ui/VideoCard.tsx`).
 */

/**
 * Sanfona horizontal em tela larga, vertical no celular. O componente recebe
 * pixels e uma orientação — a conta é aqui, como em `AntesDepois.tsx`.
 *
 * Por que não deixar o próprio componente decidir: a variante Tailwind do
 * React Bits tem um salto embutido em 520px que troca a direção por classe,
 * mas mantém altura e largura da mídia em estilo inline — que media query
 * nenhuma alcança (ver modificação 8 no componente). Medir aqui é o que faz a
 * versão de celular ter proporção de verdade.
 *
 * As medidas, e por que o celular não usa as mesmas: o conteúdo de um pôster
 * de reel é retrato (9:16), e o painel aberto só fica em pé se for mais alto
 * que largo.
 *   - Desktop: linha de 560px de altura; com `expandRatio` 0,48 o aberto sai
 *     420×560 (medido) — retrato.
 *   - Celular: coluna. A largura é a da tela (343px numa de 375), então o
 *     aberto precisa passar de 343px de altura para ficar em pé. Com
 *     `expandRatio` 0,48 daria 250px — deitado. Subindo a fatia do aberto
 *     para 0,7 numa coluna de 620px, ele sai 434px de altura (medido) e os
 *     dois fechados viram faixas de ~93px, que é exatamente o que se quer num
 *     celular: um painel grande de verdade e a prova visível de que há mais.
 */
function useMedidasSanfona(telaLarga: boolean) {
  return telaLarga
    ? { orientation: 'horizontal' as const, height: 560, expandRatio: 0.48 }
    : { orientation: 'vertical' as const, height: 620, expandRatio: 0.7 };
}

/**
 * `alt` descreve a cena (vem da legenda de `DEPOIMENTOS`); `ariaLabel` é o
 * nome do LINK, e diz para onde ele vai — a mesma frase que o `VideoCard` já
 * usava, para que a troca de componente não mude o que o leitor de tela ouve.
 */
const PAINEIS = DEPOIMENTOS.map((d) => ({
  image: `/videos/posters/${d.slug}.webp`,
  label: d.titulo,
  alt: d.legenda,
  link: d.reel,
  ariaLabel: `Assistir no Instagram: ${d.titulo}`,
}));

export function Depoimentos() {
  const { podeAnimar, pontoFino } = useCapability();
  const telaLarga = useTelaLarga();
  const { orientation, height, expandRatio } = useMedidasSanfona(telaLarga);

  return (
    <section id="depoimentos" className="bg-creme px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1360px]">
        <Reveal>
          <SectionHeading
            flutuar
            sobretitulo="Quem já passou por aqui"
            titulo="As histórias valem mais do que qualquer anúncio"
          />
        </Reveal>
        <Reveal delay={0.06} className="mt-3 max-w-[52ch]">
          <p className="font-corpo text-[16px] text-grafite">Pacientes reais, gravados na própria clínica.</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 md:mt-14">
          {/* A sanfona não ocupa os 1360px da seção: com três painéis, uma
              linha larga demais achata o painel aberto e transforma um pôster
              de reel (9:16) numa faixa. Em 900px o painel aberto mede
              420×560 (medido) — proporção de retrato, que é o formato do que
              está dentro dele. */}
          <div className="mx-auto max-w-[900px]">
            <AccordionGallery
              items={PAINEIS}
              orientation={orientation}
              height={height}
              /* Abre no primeiro: é o depoimento de facetas, o tratamento que
                 o BRIEFING.md §3 põe como carro-chefe da clínica. */
              defaultIndex={0}
              /* Hover só faz sentido com ponteiro fino; no toque o primeiro
                 toque abre o painel e o segundo abre o Instagram, que é o
                 comportamento do componente com `trigger="click"`. */
              trigger={pontoFino ? 'hover' : 'click'}
              reducedMotion={!podeAnimar}
              expandRatio={expandRatio}
              gap={12}
              radius={24}
              tilt={podeAnimar ? 8 : 0}
              parallax={podeAnimar ? 0.5 : 0}
              /* Sem preto e branco: o assunto da seção é o resultado de um
                 tratamento estético — dente e gengiva em cinza não contam a
                 mesma história. O que separa o painel aberto dos fechados é o
                 escurecimento (`--ag-dim`) e o tamanho. */
              grayscale={false}
              accentColor="var(--color-amarelo)"
              overlayColor="var(--color-preto)"
              textColor="var(--color-branco)"
              panelColor="var(--color-borda)"
              labelClassName="font-rotulo text-[13px] font-medium tracking-[.1em] uppercase md:text-[15px]"
              abrirEmNovaAba
              sizes="(max-width: 768px) 92vw, 500px"
              selo={<PlayBadge />}
            />
          </div>
        </Reveal>

        {/* Dica de uso: os painéis abrem e levam para fora do site, e nada na
            tela diz isso sozinho. Rótulo de interface, não copy. */}
        <p className="mt-4 text-center font-rotulo text-[13px] tracking-[.12em] text-grafite uppercase">
          {pontoFino ? 'Passe o mouse para abrir · clique para ver no Instagram' : 'Toque para abrir · toque de novo para ver no Instagram'}
        </p>
      </div>
    </section>
  );
}

/** O mesmo botão de play amarelo do `VideoCard`, para dizer que é vídeo. */
function PlayBadge() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amarelo text-preto shadow-[0_10px_24px_rgba(17,17,17,0.28)]">
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M3.5 2.2v9.6a.6.6 0 0 0 .93.5l7.4-4.8a.6.6 0 0 0 0-1L4.43 1.7a.6.6 0 0 0-.93.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
