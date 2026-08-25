'use client';

import { waLink, ENDERECO, INSTAGRAM } from '@/lib/contact';
import { REEL_TOUR } from '@/lib/content';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { HeroBackdrop } from './HeroBackdrop';
import ScrollExpand from '@/components/reactbits/ScrollExpand';
import MaskedHeading from '@/components/reactbits/MaskedHeading';
import Magnet from '@/components/reactbits/Magnet';
import { useCapability } from '@/lib/useCapability';

const HEADLINE = 'Seu novo sorriso começa aqui';

// `id="hero"` é usado pelo WhatsAppFab (lib/layout) para saber exatamente
// onde a seção termina, em vez de aproximar por 100dvh.
export function Hero() {
  const { podeAnimar, pontoFino } = useCapability();

  // O texto sempre existe puro no HTML do servidor (SEO/LCP): no primeiro
  // render — servidor e cliente antes da hidratação confirmar podeAnimar —
  // isto é só a string. O MaskedHeading assume depois, via re-render:
  // as letras viram o recorte por onde a foto da marca (o letreiro neon
  // sobre o muro verde) aparece, com o reveal de subida por palavra que o
  // SplitText fazia antes — o SplitText saiu junto com ele (Task 20).
  //
  // MAIÚSCULAS no texto de propósito: o recorte é desenhado num <text> de
  // SVG, que NÃO passa pelo `text-transform: uppercase` do h1 — se o texto
  // fosse minúsculo, a medida (uppercase via CSS) e o recorte (minúsculo
  // cru) desenhariam glifos diferentes e o preenchimento sairia do lugar.
  const titulo = podeAnimar ? (
    <MaskedHeading
      text={HEADLINE.toUpperCase()}
      tag="span"
      src="/img/hero-foto.jpg"
      reveal="rise"
      trigger="mount"
      duration={0.9}
      stagger={0.08}
      weight={400}
      textScale={0.16}
      fillScale={1.18}
      drift={10}
      parallax={pontoFino ? 14 : 0}
      brightness={0.92}
      reducedMotion={!podeAnimar}
      // `block`: a raiz do MaskedHeading é um <span> aqui (para viver dentro
      // do h1), e span inline ignora o `w-full` do componente — o autoajuste
      // de tamanho (fontSize = largura × textScale) media a própria caixa de
      // texto, entrava em retroalimentação e afundava no piso de 20px
      // (medido). Como bloco, a largura vem do h1 e a conta fecha.
      className="block"
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
        useWindowScroll
        reducedMotion={!podeAnimar}
        startWidth={44}
        startHeight={62}
        startRadius={24}
        endRadius={0}
        // `mediaZoom={1}`: sem escala na mídia. Não é preferência — o canvas
        // do R3F se dimensiona pelo retângulo JÁ ESCALADO do container, e
        // qualquer zoom aqui faria o fundo animado cobrir só uma fração da
        // moldura (medido: 859px num card de 1022). Sem escala, o efeito vem
        // inteiro da moldura abrindo, que é o que interessa.
        mediaZoom={1}
        scrollDistance={1}
        holdDistance={0.15}
        // Sem escurecer: o scrim do original existe para dar contraste a
        // texto branco sobre foto. Aqui o fundo é o creme da marca e a
        // headline é preta.
        overlayScrim={0}
        // O fundo que a moldura revela é o da marca — creme com a textura
        // dourada animada (`Silk`), o mesmo do design aprovado —, não uma
        // foto. A foto do doutor voltou para o card, logo abaixo.
        midia={
          <div className="relative h-full w-full bg-creme">
            <HeroBackdrop />
          </div>
        }
        scrollHint={
          <span className="font-rotulo text-[12px] tracking-[.14em] text-grafite uppercase">
            Role para abrir
          </span>
        }
        title={
          // `tema="claro"`: a headline fica sobre o creme da marca, então
          // volta a ser preta, como no design aprovado. `tituloAriaLabel` só no ramo em que o
          // SplitText monta — o GSAP esconde as palavras fatiadas do leitor
          // de tela e o nome volta pelo heading, onde `aria-label` é válido
          // (Task 18, A1).
          <div className="absolute inset-x-0 top-[28%] flex flex-col items-center gap-4">
          <SectionHeading
            as="h1"
            align="center"
            tema="claro"
            sobretitulo="Odontologia integrada no Ipiranga"
            titulo={titulo}
            tituloAriaLabel={podeAnimar ? HEADLINE : undefined}
            className="mx-auto flex w-full flex-col"
            // Topo ANCORADO, não centralizado. Centralizado, qualquer
            // mudança de altura do bloco o desloca — e as duas fontes da
            // marca terminam de carregar depois da primeira pintura, o que
            // valia 0,176 de CLS em dois saltos (medido; um por fonte).
            // Ancorado, o texto só cresce para baixo: a distância de
            // deslocamento é zero, e é a distância que o CLS mede.
            tituloClassName="mx-auto max-w-[min(80vw,380px)] text-[clamp(28px,4.4vw,64px)]"
          />

          {/* O sorriso da marca, embaixo da headline. `alt=""` porque é
              ornamento: o nome da clínica e a headline já dizem tudo que ele
              diz, e um leitor de tela não ganha nada ouvindo "arco". */}
          <Image
            src="/img/sorriso-arco.png"
            alt=""
            width={240}
            height={101}
            className="h-[clamp(22px,3vw,40px)] w-auto"
          />
          </div>
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

      {/* As três colunas do design aprovado, logo abaixo da moldura:
          proposta e CTA à esquerda, a foto do doutor no centro,
          especialidades e contato à direita. Elas ficam FORA do palco porque
          ele tem a altura da janela e este bloco, sozinho, mede mais que
          isso — dentro dele nasceria cortado. */}
      <div className="mx-auto grid max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-center gap-8 px-4 py-12 md:px-8 md:py-16">
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

        {/* A foto do doutor, no centro — como no design aprovado. */}
        <div className="mx-auto w-full max-w-[340px]">
          <div className="relative aspect-[928/1143] overflow-hidden rounded-[24px] bg-borda">
            <Image
              src="/img/hero-foto.jpg"
              alt="Dr. Vinicius Aracena sorrindo sob o letreiro da Smile Ipiranga"
              fill
              sizes="(max-width: 768px) 80vw, 340px"
              className="object-cover"
            />
          </div>
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
