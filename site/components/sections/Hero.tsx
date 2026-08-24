'use client';

import Image from 'next/image';
import { waLink, ENDERECO, INSTAGRAM } from '@/lib/contact';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { HeroBackdrop } from './HeroBackdrop';
import SplitText from '@/components/reactbits/SplitText';
import Magnet from '@/components/reactbits/Magnet';
import { useCapability } from '@/lib/useCapability';

type Props = {
  onAbrirVideo: (slug: string) => void;
};

const HEADLINE = 'Seu novo sorriso começa aqui';

// `id="hero"` é usado pelo WhatsAppFab (lib/layout) para saber exatamente
// onde a seção termina, em vez de aproximar por 100dvh.
export function Hero({ onAbrirVideo }: Props) {
  const { podeAnimar, pontoFino } = useCapability();

  // O texto sempre existe puro no HTML do servidor (SEO/LCP): no primeiro
  // render — servidor e cliente antes da hidratação confirmar podeAnimar —
  // isto é só a string. O SplitText assume depois, via re-render, nunca
  // trocando o que já foi pintado.
  const titulo = podeAnimar ? (
    <SplitText
      text={HEADLINE}
      tag="span"
      splitType="words"
      delay={40}
      duration={0.8}
      ease="power3.out"
      from={{ opacity: 0, y: '0.4em' }}
    />
  ) : (
    HEADLINE
  );

  // Magnet sem sentido em touch — só custaria um listener de mousemove sem
  // efeito visual nenhum. pontoFino vem do useCapability(), fonte única.
  const magnetAtivo = podeAnimar && pontoFino;

  return (
    <section id="hero" className="bg-branco px-3 pt-4 pb-10 md:px-6 md:pt-6 md:pb-14">
      <div className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[32px] bg-creme px-[clamp(20px,4vw,64px)] pt-[clamp(24px,5vw,56px)] pb-[clamp(28px,5vw,56px)]">
        <HeroBackdrop />

        <div className="relative">
          <SectionHeading
            as="h1"
            align="center"
            sobretitulo="Odontologia integrada no Ipiranga"
            titulo={titulo}
            // Só no ramo em que o SplitText monta: o GSAP (aria:'hidden', ver
            // reactbits/SplitText.tsx) esconde as palavras fatiadas do leitor
            // de tela, e o nome volta pelo heading, onde aria-label é válido
            // (Task 18, A1). No ramo de texto puro o conteúdo já é o nome.
            tituloAriaLabel={podeAnimar ? HEADLINE : undefined}
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
                <Magnet padding={80} magnetStrength={6} disabled={!magnetAtivo}>
                  <a
                    href={waLink()}
                    className="pressable inline-flex min-h-11 items-center justify-center rounded-full bg-preto px-7 font-rotulo text-[13px] font-medium tracking-[.08em] text-branco uppercase pointer-fine:hover:bg-escuro-linha"
                  >
                    Agendar minha avaliação
                  </a>
                </Magnet>
                <Magnet padding={80} magnetStrength={6} disabled={!magnetAtivo}>
                  <a
                    href="#clinica"
                    className="pressable inline-flex min-h-11 items-center font-rotulo text-[13px] tracking-[.08em] text-preto uppercase underline underline-offset-4 pointer-fine:hover:text-grafite"
                  >
                    Conhecer a clínica
                  </a>
                </Magnet>
              </div>

              <p className="font-rotulo text-[12px] tracking-[.1em] text-grafite uppercase">
                Resposta pelo WhatsApp
              </p>
            </div>

            {/* Coluna 2 — foto (LCP) com o card do tour sobreposto */}
            <div className="relative mx-auto w-full md:max-w-[460px]">
              {/* Task 17 (H2): "100vw" superestimava a largura real. O próprio
                  boundingRect do audit de LCP mediu 348px num viewport de 412
                  (85vw): padding do section (px-3, 12px) + padding do card
                  (px-[clamp(20px,4vw,64px)], 20px no mobile) tiram 64px dos
                  dois lados, sobrando exatamente 348px de coluna. Com DPR
                  1,75 simulado, 100vw pedia o candidato de 750px do srcset —
                  85vw (612,9px físicos) já pede o de 640px, mas fica a só
                  27px do corte de 750px, e 6 amostras repetidas mostraram o
                  navegador escolhendo os dois candidatos de forma alternada
                  (bimodal: total-byte-weight ora 524KB ora 1.155KB na mesma
                  build/servidor — corrida na aplicação do DPR simulado do
                  Lighthouse perto de um limite de srcset). 80vw (576,8px
                  físicos, 63px de margem) resolveu SEMPRE para 640px em 6
                  amostras — mesma fração de largura real (só 5% menor que os
                  348px medidos, imperceptível numa foto). Detalhe completo em
                  task-17-report.md. */}
              <div className="relative aspect-[928/1143] overflow-hidden rounded-[24px] bg-borda">
                <Image
                  src="/img/hero-foto.jpg"
                  alt="Dr. Vinicius Aracena sorrindo sob o letreiro da Smile Ipiranga"
                  fill
                  sizes="(max-width: 768px) 80vw, 460px"
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
              <p className="max-w-[32ch] font-corpo text-[16px] text-grafite">
                Consultório de cadeira única — aqui você não é encaixado entre um paciente e
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
