'use client';

import { ENDERECO, INSTAGRAM } from '@/lib/contact';
import { REEL_TOUR } from '@/lib/content';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { HeroBackdrop } from './HeroBackdrop';
import ScrollExpand from '@/components/reactbits/ScrollExpand';
import { CtaAgendamento } from '@/components/ui/CtaAgendamento';
import { ProvaSocial } from '@/components/ui/ProvaSocial';
import { useCapability } from '@/lib/useCapability';
import { useTelaLarga } from '@/lib/useTelaLarga';

const HEADLINE = 'Seu novo sorriso começa aqui';

/**
 * O tamanho da moldura fechada, por faixa de tela.
 *
 * Por que o celular precisa de outro número: a moldura é uma porcentagem da
 * janela, mas o texto dentro dela não encolhe na mesma proporção. Medido numa
 * tela de 375px com os 44% do desktop, a moldura nascia com 165px de largura e
 * a headline com 300 — ela aparecia INTEIRA POR FORA da moldura, que foi o que
 * o dono do projeto apontou. Com 86%, a moldura fechada mede 322px e o texto
 * cabe dentro dela desde o primeiro quadro.
 *
 * A altura desce junto (62% → 54%): uma moldura quase tão larga quanto a tela
 * e alta demais deixa de parecer uma moldura e vira a tela inteira, e aí a
 * abertura não tem para onde crescer.
 */
function useMoldura(telaLarga: boolean) {
  return telaLarga ? { startWidth: 44, startHeight: 62 } : { startWidth: 86, startHeight: 54 };
}

// `id="hero"` é usado pela IlhaContato (components/layout) para saber
// exatamente onde a seção termina, em vez de aproximar por 100dvh.
export function Hero() {
  const { podeAnimar } = useCapability();
  const telaLarga = useTelaLarga();
  const { startWidth, startHeight } = useMoldura(telaLarga);

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
        exceção. Em tela larga as colunas laterais voltaram para DENTRO do
        palco (entram com o overlay, no fim da abertura); no celular elas
        seguem na faixa logo abaixo — nada de conteúdo se perdeu.
      */}
      <ScrollExpand
        useWindowScroll
        reducedMotion={!podeAnimar}
        // A headline NÃO some quando a moldura abre (pedido do dono do
        // projeto): ela tem que continuar em cena, em cima do CTA, no estado
        // aberto. Por padrão o componente troca uma pela outra.
        fadeTitle={false}
        // E o overlay deixa de centralizar: quem posiciona é o próprio bloco
        // do CTA, com `top` em porcentagem (ver a nota do componente sobre
        // padding em porcentagem, que se resolve pela largura).
        overlayClassName="block"
        startWidth={startWidth}
        startHeight={startHeight}
        // Teto em pixels da moldura fechada (Task 24, pedido do dono do
        // projeto: "deixar o quadrado menor, mais próximo do texto"). Sem ele
        // a moldura é só uma porcentagem da janela e cresce junto com a tela,
        // enquanto o texto dentro dela está limitado a 520px — num monitor
        // largo sobravam mais de 150px de vazio de cada lado. Os números saem
        // do conteúdo: 520 de bloco de título + 44 de folga em cada lado; e
        // 460 de altura de conteúdo (título, arco, CTA e prova social) + 50 de
        // folga em cima e embaixo.
        maxStartWidthPx={608}
        maxStartHeightPx={560}
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
        //
        // A PAREDE DE FOTOS (DriftWall) MOROU AQUI E SAIU EM 25/08/2026, por
        // decisão do dono do projeto depois do teste no aparelho dele: com
        // `?teste=semparede` o site ficou "liso e perfeito"; com a parede,
        // travava o hero inteiro nos dois aparelhos. Era o maior custo de
        // compositor da página (dezenas de texturas em rotação 3D contínua).
        // O vazio que ela deixava no estado aberto foi preenchido pelas
        // colunas de conteúdo, abaixo. O componente está no histórico do git
        // (components/reactbits/DriftWall.tsx) se algum dia voltar.
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
          // A largura do bloco do título acompanha a da MOLDURA em cada faixa
          // (86% no celular, 44% em tela larga), menos uma folga interna.
          // Preso em 380px, como estava, num monitor de 1280 o texto vinha em
          // quatro linhas espremidas dentro de uma moldura de 563px de largura.
          //
          // O `top` faz a MESMA conta do topo da moldura, não uma porcentagem
          // solta da tela. A moldura é centrada com altura
          // `min(startHeight%, 560px)` (ver maxStartHeightPx), então o topo
          // dela fica em `50% - min(startHeight/2 %, 280px)`; o título ancora
          // nisso mais uma folga. Com o antigo `top-[28%]`/`md:top-[22%]`,
          // numa janela ALTA o teto de 560px prendia a moldura no centro
          // enquanto o título subia junto com a porcentagem — medido em
          // 1280×1200, ele nascia 56px PARA FORA da moldura (apontado pelo
          // dono do projeto num monitor alto, 25/08/2026). Os números são
          // acoplados de propósito: 27% = 54/2 e 31% = 62/2 (useMoldura),
          // 280px = 560/2 (maxStartHeightPx). Mudou lá, muda aqui.
          <div className="absolute inset-x-0 top-[calc(50%_-_min(27%,280px)_+_40px)] mx-auto flex w-[min(86vw_-_28px,380px)] flex-col items-center gap-3 md:top-[calc(50%_-_min(31%,280px)_+_28px)] md:w-[min(44vw_-_40px,520px)] md:gap-4">
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
            tituloClassName="mx-auto w-full text-[clamp(26px,4.4vw,64px)]"
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
            link (pedido do dono do projeto). `brilho` liga o reflexo
            especular; ele só monta de verdade onde há ponteiro para seguir. */}
        {/* As porcentagens saem da medição do bloco de cima: no celular o
            título termina em ~43% da tela, no desktop em ~56%. */}
        <div className="absolute inset-x-0 top-[47%] mx-auto flex w-[min(86vw_-_28px,420px)] flex-col items-center gap-4 md:top-[58%] md:w-[min(44vw_-_40px,520px)]">
          <CtaAgendamento tema="amarelo" brilho compacto />
          <ProvaSocial />
        </div>

        {/* As colunas do design aprovado, DENTRO do palco — só em tela larga.
            Elas entram no mesmo fade do overlay, quando a moldura termina de
            abrir: o estado aberto deixou de ser um dourado vazio em volta do
            título (pedido do dono do projeto, 25/08/2026, na mesma decisão
            que removeu a parede de fotos). No celular elas NÃO existem aqui —
            o hero de celular fica exatamente como está — e continuam na
            faixa abaixo do palco, que em tela larga passa a mostrar só a
            foto. `text-left` porque o wrapper do overlay é text-center. */}
        <div className="absolute inset-y-0 left-[4%] hidden w-[min(23vw,330px)] flex-col justify-center text-left md:flex xl:left-[6%]">
          <ColunaProposta />
        </div>
        <div className="absolute inset-y-0 right-[4%] hidden w-[min(23vw,330px)] flex-col justify-center text-left md:flex xl:right-[6%]">
          <ColunaContato />
        </div>
      </ScrollExpand>

      {/* A faixa abaixo da moldura — SÓ NO CELULAR. Em tela larga as colunas
          moram dentro do palco e a foto do doutor que sobrava aqui saiu por
          pedido do dono do projeto ("remova isso", 25/08/2026): sozinha entre
          o hero e a fita, ela parecia órfã. No celular a faixa continua
          inteira, como sempre foi. */}
      <div className="mx-auto grid max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-center gap-8 px-4 py-12 md:hidden">
        <div>
          <ColunaProposta />
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

        <div>
          <ColunaContato />
        </div>
      </div>
    </section>
  );
}

/**
 * As duas colunas do design aprovado — proposta à esquerda, contato à
 * direita. São componentes porque renderizam em DOIS lugares com papéis
 * excludentes: dentro do palco em tela larga (md+, no fade do overlay) e na
 * faixa abaixo dele no celular. JSX repetido aqui já divergiria na primeira
 * edição.
 */
function ColunaProposta() {
  return (
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
  );
}

function ColunaContato() {
  return (
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
