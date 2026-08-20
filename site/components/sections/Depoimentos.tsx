'use client';

import { DEPOIMENTOS } from '@/lib/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { VideoCard } from '@/components/ui/VideoCard';
import GradualBlur from '@/components/reactbits/GradualBlur';

type Props = {
  onAbrirVideo: (slug: string) => void;
};

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
              então nunca atrapalha o arraste por toque no scroller. */}
          <GradualBlur position="left" width="56px" divCount={4} className="rounded-l-[24px]" />
          <GradualBlur position="right" width="56px" divCount={4} className="rounded-r-[24px]" />
        </div>
      </div>
    </section>
  );
}
