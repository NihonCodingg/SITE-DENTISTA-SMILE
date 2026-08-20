'use client';

import { DEPOIMENTOS } from '@/lib/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { VideoCard } from '@/components/ui/VideoCard';
import GradualBlur from '@/components/reactbits/GradualBlur';

type Props = {
  onAbrirVideo: (slug: string) => void;
};

// O GradualBlur vendorizado tem z-index:1000 por padrão (components/
// reactbits/GradualBlur.tsx) — pensado para um componente sozinho na tela,
// não para uma faixa decorativa dentro de uma seção que fica atrás de
// overlays reais do site. Sem override, essas faixas vazavam visualmente por
// cima do fundo escurecido do Lightbox (achado de review, Task 12: o fundo
// pintado de vermelho revelou as duas faixas por cima dele). `1` é seguro
// porque este blur é decoração só dentro do próprio scroller — nunca precisa
// competir com nada fora da seção. Exportada (não só um literal inline nas
// duas instâncias abaixo) para o teste de regressão em
// __tests__/depoimentos.test.tsx comparar contra `Z_INDEX_BACKDROP`
// (importado de components/ui/Lightbox.tsx) sem repetir nenhum dos dois
// números — os dois lados da comparação vêm da fonte real.
export const Z_INDEX_BLUR_BORDA = 1;

/**
 * Seção "Depoimentos" (Task 12). São vídeos reais, gravados na clínica — sem
 * nome de paciente, sem número, sem avaliação inventada (ux-guidance.md: "os
 * nossos são vídeos gravados na clínica, o que é uma prova mais forte que um
 * nome escrito"). A legenda de cada card já vem de `DEPOIMENTOS`
 * (lib/content.ts) e descreve o que foi tratado, nunca quem foi tratado.
 *
 * Carrossel horizontal com scroll-snap; `GradualBlur` (React Bits,
 * vendorizado em components/reactbits/GradualBlur.tsx) marca as duas bordas
 * do scroller para sinalizar que o conteúdo continua. `overflow-x-auto` vive
 * no próprio scroller (`.depoimentos-scroller`), nunca na página — não há
 * reset global de overflow-x no projeto (conferido em app/globals.css), então
 * é este componente sozinho quem garante que os cards com
 * `flex-[0_0_min(260px,78vw)]` ficam contidos: `min(...,78vw)` nunca deixa um
 * card sozinho ser mais largo que a viewport, e é o scroller — não a seção —
 * quem ganha a barra de rolagem.
 */
export function Depoimentos({ onAbrirVideo }: Props) {
  return (
    <section id="depoimentos" className="bg-creme px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1360px]">
        <Reveal>
          <SectionHeading
            sobretitulo="Quem já passou por aqui"
            titulo="As histórias valem mais do que qualquer anúncio"
          />
        </Reveal>
        <Reveal delay={0.06} className="mt-3 max-w-[52ch]">
          <p className="font-corpo text-[16px] text-grafite">Pacientes reais, gravados na própria clínica.</p>
        </Reveal>

        <div className="relative mt-10 md:mt-14">
          <div className="depoimentos-scroller flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 pb-2 md:gap-6 md:scroll-pl-8">
            {DEPOIMENTOS.map((d, i) => (
              <Reveal key={d.slug} delay={Math.min(i, 2) * 0.06} className="shrink-0 snap-start flex-[0_0_min(260px,78vw)]">
                <VideoCard slug={d.slug} titulo={d.titulo} legenda={d.legenda} onAbrir={onAbrirVideo} />
              </Reveal>
            ))}
          </div>

          {/* Decorativo: só indica "tem mais pra rolar". pointer-events:none
              já vem do próprio GradualBlur (nenhum hoverIntensity passado),
              então nunca atrapalha o arraste por toque no scroller.
              zIndex explícito e baixo (ver Z_INDEX_BLUR_BORDA acima) — sem
              ele, o default de 1000 do componente vaza por cima do fundo
              escurecido do Lightbox. */}
          <GradualBlur position="left" width="56px" divCount={4} zIndex={Z_INDEX_BLUR_BORDA} className="rounded-l-[24px]" />
          <GradualBlur position="right" width="56px" divCount={4} zIndex={Z_INDEX_BLUR_BORDA} className="rounded-r-[24px]" />
        </div>
      </div>
    </section>
  );
}
