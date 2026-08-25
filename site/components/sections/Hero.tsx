'use client';

import { ENDERECO, INSTAGRAM } from '@/lib/contact';
import { REEL_TOUR } from '@/lib/content';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { HeroBackdrop } from './HeroBackdrop';
import DriftWall from '@/components/reactbits/DriftWall';
import ScrollExpand from '@/components/reactbits/ScrollExpand';
import { CtaAgendamento } from '@/components/ui/CtaAgendamento';
import { useCapability } from '@/lib/useCapability';

const HEADLINE = 'Seu novo sorriso começa aqui';

// A parede de fotos do fundo (DriftWall) usa SÓ imagens que o site já
// exibe em outras seções — nada novo entra por aqui, e as pendências de
// autorização de imagem continuam as mesmas da galeria e do antes/depois.
const FOTOS_PAREDE = [
  '/img/retrato-1.jpg', '/img/retrato-2.jpg', '/img/retrato-3.jpg',
  '/img/retrato-4.jpg', '/img/retrato-5.jpg', '/img/retrato-6.jpg',
  '/img/retrato-7.jpg', '/img/retrato-8.jpg', '/img/retrato-9.jpg',
  '/img/fachada.jpg', '/img/clinica-interior.jpg', '/img/dr-vinicius.jpg',
].map((image) => ({ image }));

// `id="hero"` é usado pela IlhaContato (components/layout) para saber
// exatamente onde a seção termina, em vez de aproximar por 100dvh.
export function Hero() {
  const { podeAnimar, pontoFino } = useCapability();

  // Headline como texto preto puro, sempre — decisão do dono do projeto
  // ("se não puder centralizar, desfaça"): a versão mascarada
  // (MaskedHeading, letras preenchidas pela foto) foi tentada e desfeita.
  // O recorte dela é desenhado em coordenadas absolutas dentro de um palco
  // que escala e centra por flex, e a combinação nunca assentou — o texto
  // puro centra por natureza e é o que o design aprovado mostra.
  const titulo = HEADLINE;

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
            {/* A parede de fotos (DriftWall, pedido do dono do projeto)
                deriva por cima do Silk e por trás do scrim/headline. Só
                monta quando o aparelho aguenta o resto do peso do hero —
                mesma régua do canvas. */}
            {podeAnimar && (
              <div className="absolute inset-0 opacity-[0.5]">
                <DriftWall
                  decorativo
                  items={FOTOS_PAREDE}
                  // 10 colunas para a parede SANGRAR a tela inteira (pedido
                  // do dono do projeto: "pode repetir as fotos, precisa
                  // estar a tela cheia"): 10 × (150+14) × escala 1,18 ≈
                  // 1.935px de plano, cobrindo até ultrawide. As 12 fotos se
                  // repetem em ciclo por coluna — repetição autorizada.
                  columns={10}
                  tileWidth={150}
                  tileHeight={190}
                  gap={14}
                  radius={16}
                  tilt={14}
                  turn={-12}
                  speed={26}
                  variance={0.35}
                  parallax={pontoFino ? 0.5 : 0}
                  dim={0.3}
                  overlayColor="var(--color-preto)"
                  reducedMotion={!podeAnimar}
                />
              </div>
            )}
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
        {/* O botão não sai mais direto para o WhatsApp: ele abre um cartão com
            quem atende, o que a clínica faz e onde fica, e é de lá que sai o
            link (pedido do dono do projeto). O `Magnet` continua, agora por
            dentro do CtaAgendamento — envolvendo só o botão, não o cartão. */}
        <CtaAgendamento tema="amarelo" magnetico />
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
