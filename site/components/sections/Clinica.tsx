import { VideoCard } from '@/components/ui/VideoCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { REEL_RECEPCAO } from '@/lib/content';

const LEGENDA_RECEPCAO = 'Vídeo da recepção da Smile Ipiranga, gravado no consultório.';

/**
 * Seção "A Clínica" (Task 12). O cartão leva ao reel da recepção no Instagram,
 * em aba nova — como o design aprovado desenhava. A Task 12 tinha trocado isso
 * por um vídeo hospedado abrindo em lightbox, com o argumento de que "um
 * clique que tira a pessoa do site é um clique perdido"; o dono do projeto
 * reverteu em 24/08. O acervo de vídeo é do Instagram da clínica, e o site não
 * carrega o peso dele.
 */
export function Clinica() {
  return (
    <section id="clinica" className="mx-auto max-w-[1360px] px-4 py-16 md:px-8 md:py-24">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-[clamp(32px,6vw,80px)]">
        <Reveal className="flex flex-col gap-5">
          <SectionHeading flutuar sobretitulo="O ambiente" titulo="Um lugar onde dá vontade de sentar e conversar" />
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
              reel={REEL_RECEPCAO}
            />

            {/* Gradiente + rótulo por cima do VideoCard: sibling depois do
                card no DOM, pointer-events-none para o clique atravessar até
                o link do card. Fica só na metade inferior — a mesma
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
