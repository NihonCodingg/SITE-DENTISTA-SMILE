'use client';

import Image from 'next/image';
import { waLink, ENDERECO, INSTAGRAM } from '@/lib/contact';
import { SectionHeading } from '@/components/ui/SectionHeading';

type Props = {
  onAbrirVideo: (slug: string) => void;
};

// Motion e o fundo WebGL (Silk) ficam para a Task 8 — aqui é só a estrutura,
// para a dobra de 375px fechar primeiro. `id="hero"` é usado pelo
// WhatsAppFab (lib/layout) para saber exatamente onde a seção termina, em
// vez de aproximar por 100dvh.
export function Hero({ onAbrirVideo }: Props) {
  return (
    <section id="hero" className="bg-branco px-3 pt-4 pb-10 md:px-6 md:pt-6 md:pb-14">
      <div className="mx-auto max-w-[1360px] rounded-[32px] bg-creme px-[clamp(20px,4vw,64px)] pt-[clamp(24px,5vw,56px)] pb-[clamp(28px,5vw,56px)]">
        <SectionHeading
          as="h1"
          align="center"
          sobretitulo="Odontologia integrada no Ipiranga"
          titulo="Seu novo sorriso começa aqui"
          className="mx-auto"
          tituloClassName="mx-auto max-w-[14ch] text-[clamp(42px,7.6vw,104px)]"
        >
          <Image
            src="/img/sorriso-arco.png"
            alt=""
            width={240}
            height={101}
            className="mx-auto h-[clamp(24px,3.2vw,44px)] w-auto"
          />
        </SectionHeading>

        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-end gap-10 md:mt-14">
          {/* Coluna 1 — proposta, CTAs, resposta pelo WhatsApp */}
          <div className="flex flex-col gap-5">
            <p className="max-w-[42ch] font-corpo text-[16px] leading-relaxed text-grafite">
              Facetas, implantes, próteses e ortodontia com atendimento personalizado para cada
              paciente. No coração do Ipiranga, cuidando de toda a região.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={waLink()}
                className="pressable inline-flex min-h-11 items-center justify-center rounded-full bg-preto px-7 font-rotulo text-[13px] font-medium tracking-[.08em] text-branco uppercase pointer-fine:hover:bg-escuro-linha"
              >
                Agendar minha avaliação
              </a>
              <a
                href="#clinica"
                className="pressable inline-flex min-h-11 items-center font-rotulo text-[13px] tracking-[.08em] text-preto uppercase underline underline-offset-4 pointer-fine:hover:text-grafite"
              >
                Conhecer a clínica
              </a>
            </div>

            <p className="font-rotulo text-[12px] tracking-[.1em] text-grafite uppercase">
              Resposta pelo WhatsApp
            </p>
          </div>

          {/* Coluna 2 — foto (LCP) com o card do tour sobreposto */}
          <div className="relative mx-auto w-full md:max-w-[460px]">
            <div className="relative aspect-[944/1122] overflow-hidden rounded-[24px] bg-borda">
              <Image
                src="/img/hero-foto.jpg"
                alt="Paciente sorrindo na Smile Ipiranga"
                fill
                sizes="(max-width: 768px) 100vw, 460px"
                preload
                fetchPriority="high"
                className="object-cover"
              />
            </div>

            <button
              type="button"
              onClick={() => onAbrirVideo('tour-clinica')}
              className="pressable absolute bottom-4 left-4 flex min-h-11 items-center gap-3 rounded-full bg-branco/94 py-2 pr-5 pl-2 shadow-[0_12px_30px_rgba(17,17,17,0.18)] backdrop-blur-[6px] pointer-fine:hover:bg-branco"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amarelo text-preto">
                <PlayIcon />
              </span>
              <span className="font-rotulo text-[13px] font-medium tracking-[.06em] text-preto uppercase">
                Tour pela clínica
              </span>
            </button>
          </div>

          {/* Coluna 3 — especialidades reais, cadeira única, endereço, instagram */}
          <div className="flex flex-col gap-4 md:items-end md:text-right">
            <p className="font-rotulo text-[13px] tracking-[.12em] text-preto uppercase">
              Facetas • Implantes • Próteses
            </p>
            <p className="max-w-[32ch] font-corpo text-[15px] text-grafite">
              Consultório de cadeira única: atenção inteira, sem correria entre um paciente e
              outro.
            </p>
            <div className="font-corpo text-[14px] text-grafite">
              <p>
                {ENDERECO.rua}, {ENDERECO.numero} — {ENDERECO.bairro}, {ENDERECO.cidade}/
                {ENDERECO.uf}
              </p>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable inline-flex min-h-11 items-center underline underline-offset-4 pointer-fine:hover:text-preto"
              >
                @smileipiranga
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.5 2.2v9.6a.6.6 0 0 0 .93.5l7.4-4.8a.6.6 0 0 0 0-1L4.43 1.7a.6.6 0 0 0-.93.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
