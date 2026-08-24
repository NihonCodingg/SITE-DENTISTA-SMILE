'use client';

import { waLink, ENDERECO, INSTAGRAM } from '@/lib/contact';
import { REEL_TOUR } from '@/lib/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import ScrollExpand from '@/components/reactbits/ScrollExpand';
import SplitText from '@/components/reactbits/SplitText';
import Magnet from '@/components/reactbits/Magnet';
import { useCapability } from '@/lib/useCapability';

const HEADLINE = 'Seu novo sorriso começa aqui';

// `id="hero"` é usado pelo WhatsAppFab (lib/layout) para saber exatamente
// onde a seção termina, em vez de aproximar por 100dvh.
export function Hero() {
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
    <section id="hero" className="bg-branco">
      {/*
        O hero É o `ScrollExpand` do React Bits, usado como ele foi feito: a
        foto ocupa a tela por trás, uma moldura arredondada mostra um pedaço
        dela, a headline fica no meio, e a moldura se abre até sangrar
        conforme a pessoa rola. O CTA entra quando a abertura termina.

        Tentei antes encaixar o efeito em volta da grade de três colunas do
        design; não cabia — o palco tem a altura da janela e aquele hero media
        1296px. Aqui o conteúdo do palco é só headline e CTA, então cabe em
        qualquer tela, inclusive no celular, sem variante compacta nem
        exceção. O que estava nas colunas laterais desceu para a faixa logo
        abaixo: nada de conteúdo se perdeu.
      */}
      <ScrollExpand
        src="/img/hero-foto.jpg"
        alt="Dr. Vinicius Aracena sorrindo sob o letreiro da Smile Ipiranga"
        useWindowScroll
        reducedMotion={!podeAnimar}
        startWidth={44}
        startHeight={62}
        startRadius={24}
        endRadius={0}
        mediaZoom={1.18}
        scrollDistance={1}
        holdDistance={0.15}
        overlayScrim={0.42}
        scrollHint="Role para abrir"
        title={
          // `tema="escuro"` porque o título fica sobre a foto: sobretítulo
          // amarelo, headline branca. `tituloAriaLabel` só no ramo em que o
          // SplitText monta — o GSAP esconde as palavras fatiadas do leitor
          // de tela e o nome volta pelo heading, onde `aria-label` é válido
          // (Task 18, A1).
          <SectionHeading
            as="h1"
            align="center"
            tema="escuro"
            sobretitulo="Odontologia integrada no Ipiranga"
            titulo={titulo}
            tituloAriaLabel={podeAnimar ? HEADLINE : undefined}
            className="absolute inset-x-0 top-[30%] mx-auto flex w-full flex-col"
            // Topo ANCORADO, não centralizado. Centralizado, qualquer
            // mudança de altura do bloco o desloca — e as duas fontes da
            // marca terminam de carregar depois da primeira pintura, o que
            // valia 0,176 de CLS em dois saltos (medido; um por fonte).
            // Ancorado, o texto só cresce para baixo: a distância de
            // deslocamento é zero, e é a distância que o CLS mede.
            tituloClassName="mx-auto max-w-[min(92%,560px)] text-[clamp(28px,4.4vw,64px)] [text-shadow:0_2px_24px_rgba(17,17,17,0.45)]"
          />
        }
      >
        <Magnet disabled={!magnetAtivo} padding={90} magnetStrength={3}>
          <a
            href={waLink()}
            className="pressable inline-flex min-h-11 items-center rounded-full bg-amarelo px-7 font-rotulo text-[13px] font-medium tracking-[.08em] text-preto uppercase pointer-fine:hover:bg-dourado"
          >
            Agendar minha avaliação
          </a>
        </Magnet>
      </ScrollExpand>

      {/* A faixa que recebe o que estava nas colunas laterais do hero antigo:
          proposta, especialidades, cadeira única, endereço, Instagram e o
          tour. Saiu de dentro do palco, que precisa caber numa tela — não do
          site. */}
      <div className="mx-auto grid max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-8 px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-col gap-5">
          <p className="max-w-[42ch] font-corpo text-[16px] leading-relaxed text-grafite">
            Facetas, implantes, próteses e ortodontia com atendimento personalizado para cada
            paciente. No coração do Ipiranga, cuidando de toda a região.
          </p>

          <a
            href="#clinica"
            className="pressable inline-flex min-h-11 w-fit items-center font-rotulo text-[13px] tracking-[.1em] text-preto uppercase underline underline-offset-4"
          >
            Conhecer a clínica ↓
          </a>

          <p className="font-rotulo text-[12px] tracking-[.1em] text-grafite uppercase">
            Resposta pelo WhatsApp
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end md:text-right">
          <p className="font-rotulo text-[13px] tracking-[.12em] text-preto uppercase">
            Facetas • Implantes • Próteses
          </p>
          <p className="max-w-[32ch] font-corpo text-[16px] text-grafite">
            Consultório de cadeira única — aqui você não é encaixado entre um paciente e outro.
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

          {/* Abre o reel do tour no Instagram da clínica, em aba nova — o site
              não hospeda vídeo (ver components/ui/VideoCard.tsx). */}
          <a
            href={REEL_TOUR}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable inline-flex min-h-11 w-fit items-center gap-3 rounded-full bg-branco/94 py-2 pr-5 pl-2 shadow-[0_12px_30px_rgba(17,17,17,0.14)] pointer-fine:hover:bg-branco"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amarelo text-preto">
              <PlayIcon />
            </span>
            <span className="font-rotulo text-[13px] font-medium tracking-[.06em] text-preto uppercase">
              Tour pela clínica
            </span>
          </a>
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
