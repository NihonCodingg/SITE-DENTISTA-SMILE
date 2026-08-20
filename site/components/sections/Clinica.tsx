'use client';

import { VideoCard } from '@/components/ui/VideoCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

type Props = {
  onAbrirVideo: (slug: string) => void;
};

// Legenda do vídeo da recepção — usada tanto pelo VideoCard (alt do poster
// quando o vídeo não pode tocar) quanto pelo Lightbox compartilhado
// (PaginaComVideo.tsx importa esta constante para montar o mapa slug→legenda
// do diálogo). Fonte única, para as duas pontas nunca divergirem.
export const LEGENDA_RECEPCAO = 'Vídeo da recepção da Smile Ipiranga, gravado no consultório.';

/**
 * Seção "A Clínica" (Task 12). O design original mandava este cartão de
 * vídeo para fora do site (Instagram, aba nova) — mudança registrada no
 * brief: agora existe o vídeo da recepção gravado na própria clínica, então
 * ele abre no Lightbox compartilhado da página, como qualquer outro vídeo.
 * Um clique que tira a pessoa do site é um clique perdido — o objetivo da
 * página é agendamento.
 */
export function Clinica({ onAbrirVideo }: Props) {
  return (
    <section id="clinica" className="mx-auto max-w-[1360px] px-4 py-16 md:px-8 md:py-24">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-[clamp(32px,6vw,80px)]">
        <Reveal className="flex flex-col gap-5">
          <SectionHeading sobretitulo="O ambiente" titulo="Um lugar onde dá vontade de sentar e conversar" />
          <p className="max-w-[46ch] font-corpo text-[16px] leading-relaxed text-grafite">
            Clínica pequena por escolha: aqui você não é encaixado entre um paciente e outro. O
            espaço foi pensado para tirar o peso da consulta odontológica — luz, plantas, silêncio
            e alguém que explica cada etapa antes de começar.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto w-full">
          <div className="relative mx-auto aspect-[9/16] w-[min(360px,100%)] overflow-hidden rounded-[24px]">
            <VideoCard
              slug="recepcao"
              titulo="Conheça a recepção"
              legenda={LEGENDA_RECEPCAO}
              onAbrir={onAbrirVideo}
            />

            {/* Gradiente + rótulo por cima do VideoCard: sibling depois do
                card no DOM, pointer-events-none para o clique atravessar até
                o <button> do card. Fica só na metade inferior — a mesma
                faixa onde o próprio VideoCard já desenha seu ícone de play
                (bottom-right), então o rótulo fica à esquerda, sem competir
                com o ícone. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[24px] bg-gradient-to-t from-preto/60 to-transparent"
            />
            <span className="pointer-events-none absolute bottom-4 left-4 max-w-[60%] font-rotulo text-[12px] font-medium tracking-[.08em] text-branco uppercase">
              Vídeo / Conheça a recepção
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
