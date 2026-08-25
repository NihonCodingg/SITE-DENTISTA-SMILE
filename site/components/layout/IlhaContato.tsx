'use client';

import { useEffect, useRef, useState } from 'react';
import { waLink, ENDERECO } from '@/lib/contact';
import { useCapability } from '@/lib/useCapability';
import {
  DynamicIsland,
  DynamicIslandProvider,
  DynamicContainer,
  useDynamicIslandSize,
} from '@/components/cultui/DynamicIsland';
import type { SizePresets } from '@/components/cultui/DynamicIsland';

/**
 * A ilha de contato: a pílula flutuante que acompanha a leitura da página.
 * Task 21, pedido do dono do projeto — é a `DynamicIsland` do cult-ui,
 * vendorizada em components/cultui/DynamicIsland.tsx.
 *
 * Ela SUBSTITUI o botão flutuante de WhatsApp (`WhatsAppFab`, Task 6). Não é
 * um segundo elemento flutuante: dois deles brigando pela mesma tela é o tipo
 * de acúmulo que o guia de craft pede para evitar. A ilha herda o contrato do
 * FAB — só aparece depois que a pessoa passa do hero, para não competir com o
 * CTA de lá, e uma vez visível continua visível.
 *
 * O que ela diz muda com a seção que está sendo lida, e só diz coisa
 * confirmada (BRIEFING.md, lib/contact.ts): os tratamentos que a clínica faz e
 * o endereço. Nada de horário, nota, convênio ou número de pacientes — nenhum
 * deles existe.
 *
 * As trocas estão presas a SEÇÕES, não a pixels de scroll: numa leitura
 * inteira ela muda de forma poucas vezes, e nunca no meio de uma rolagem
 * contínua. Uma ilha que respira a cada scroll seria exatamente o movimento
 * nervoso que o guia de craft manda evitar.
 */

/**
 * O que a ilha diz em cada trecho da página. Fora dessas seções ela volta ao
 * formato compacto.
 *
 * Ela é sempre a MESMA coisa: um link para o WhatsApp. O que muda é a linha de
 * contexto em cima. Duas decisões por trás disso:
 *
 * - Nenhum estado usa os presets altos (`medium` mede 210px). Medido num
 *   celular de 667px de altura, um painel desses cobre quase um terço da tela
 *   — muito para um elemento que a pessoa não pediu. Todos os estados aqui têm
 *   no máximo 84px.
 * - Nenhum estado tem dois links dentro. Um link dentro de outro link não é
 *   HTML válido, e uma ilha que às vezes é botão e às vezes é painel obriga a
 *   pessoa a reaprender o que ela faz a cada seção.
 */
/** Fora das seções abaixo, a ilha volta a este formato. `compactLong` (300px)
 *  e não `compact` (235px): medido, "Agendar avaliação" a 12px com o tracking
 *  da marca não cabe nos 167px que sobram dentro de um `compact` depois do
 *  ícone e das margens — vinha "AGENDAR AVALIAÇ…" na tela. */
const TAMANHO_PADRAO: SizePresets = 'compactLong';

const SECOES: Array<{ id: string; tamanho: SizePresets; contexto: string; acao: string }> = [
  {
    id: 'tratamentos',
    tamanho: 'long',
    contexto: 'Facetas · Implantes · Próteses',
    acao: 'Fale com a gente pelo WhatsApp',
  },
  {
    id: 'como-funciona',
    tamanho: 'long',
    contexto: 'Começa com uma avaliação',
    acao: 'Fale com a gente pelo WhatsApp',
  },
  {
    id: 'localizacao',
    tamanho: 'long',
    contexto: `${ENDERECO.rua}, ${ENDERECO.numero}`,
    acao: 'Combine seu horário pelo WhatsApp',
  },
  {
    id: 'faq',
    tamanho: 'long',
    contexto: 'Ficou com alguma dúvida?',
    acao: 'Pergunte pelo WhatsApp',
  },
];

const MENSAGEM_ILHA = 'Olá! Vim pelo site e quero falar sobre um tratamento.';

/**
 * A seção do convite final. Enquanto ela está na tela, a ilha se recolhe: o
 * bloco grande de agendamento fica exatamente onde a pílula flutua, e a ilha
 * só cobriria o botão dele. Dois CTAs para o mesmo WhatsApp, um por cima do
 * outro, não somam nada.
 */
const SECAO_CONVITE = 'agendar';

export function IlhaContato() {
  const { podeAnimar, montado } = useCapability();
  const [visivel, setVisivel] = useState(false);
  const [recolhida, setRecolhida] = useState(false);
  const sentinelaRef = useRef<HTMLDivElement>(null);

  /**
   * Aparece depois do hero — o mesmo observador que o `WhatsAppFab` usava, com
   * a mesma razão registrada lá: observar o `<section id="hero">` de verdade,
   * porque a altura real dele diverge bastante de 100dvh (no celular passa de
   * uma viewport; no desktop é bem mais curto). O sentinel de 1px continua só
   * como defesa para uma página sem hero — que é o cenário dos testes.
   *
   * A entrada é de mão única de propósito: uma ilha que some e volta toda vez
   * que o scroll cruza a borda do hero é movimento nervoso.
   */
  useEffect(() => {
    if (!montado) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const alvo = document.getElementById('hero') ?? sentinelaRef.current;
    if (!alvo) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) return;
        if (entrada.boundingClientRect.top >= 0) return;
        setVisivel(true);
        observer.disconnect();
      },
      { threshold: 0 }
    );
    observer.observe(alvo);
    return () => observer.disconnect();
  }, [montado]);

  // Some enquanto o convite final está na tela (ver SECAO_CONVITE).
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const convite = document.getElementById(SECAO_CONVITE);
    if (!convite) return;

    const observer = new IntersectionObserver(([entrada]) => setRecolhida(entrada.isIntersecting), {
      threshold: 0,
    });
    observer.observe(convite);
    return () => observer.disconnect();
  }, []);

  const aparente = visivel && !recolhida;

  return (
    <>
      {/* Fallback: só é observado se #hero não existir na página. */}
      <div ref={sentinelaRef} aria-hidden="true" style={{ position: 'absolute', top: '100dvh', left: 0, width: 1, height: 1 }} />

      <div
        className={
          // Centro embaixo no celular (é onde o polegar chega) e canto
          // direito em tela larga, que é onde o botão flutuante morava. Ao
          // centro numa tela grande a ilha cai exatamente sobre o conteúdo
          // centralizado das seções — os indicadores do carrossel de
          // resultados, por exemplo.
          'fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 md:justify-end md:pr-6 transition-[transform,opacity] duration-[280ms] ease-saida ' +
          (aparente ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 ' + (podeAnimar ? 'scale-95' : 'scale-100'))
        }
      >
        <DynamicIslandProvider initialSize={TAMANHO_PADRAO} reducedMotion={!podeAnimar}>
          <ConteudoIlha ativa={aparente} />
        </DynamicIslandProvider>
      </div>
    </>
  );
}

function ConteudoIlha({ ativa }: { ativa: boolean }) {
  const { state, setSize } = useDynamicIslandSize();
  const [secao, setSecao] = useState<(typeof SECOES)[number] | null>(null);

  /**
   * Qual seção está sendo lida. A faixa de `rootMargin` reduz a viewport ao
   * seu terço central: a seção "atual" é a que ocupa o meio da tela, não a que
   * encostou na borda — sem isso, duas seções vizinhas ficariam disputando o
   * estado durante toda a rolagem entre elas.
   */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const dentro = new Set<string>();
    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) dentro.add(e.target.id);
          else dentro.delete(e.target.id);
        });
        const atual = SECOES.find((s) => dentro.has(s.id)) ?? null;
        setSecao(atual);
        setSize(atual ? atual.tamanho : TAMANHO_PADRAO);
      },
      { rootMargin: '-33% 0px -33% 0px', threshold: 0 }
    );

    SECOES.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [setSize]);

  const foco = ativa ? 0 : -1;

  return (
    <DynamicIsland
      id="ilha-contato"
      className="border border-escuro-linha bg-preto text-branco shadow-[0_18px_40px_rgba(17,17,17,0.32)]"
    >
      <DynamicContainer className="flex h-full w-full items-center justify-center">
        {/* Sem `aria-label`: o nome acessível vem do texto visível. Trocar um
            pelo outro quebraria o critério 2.5.3 (Label in Name) — o que se lê
            na tela e o que o leitor de tela anuncia deixariam de bater. Por
            isso a segunda linha SEMPRE nomeia a ação: é ela que vira o nome do
            link quando a linha de contexto muda. */}
        <a
          href={waLink(MENSAGEM_ILHA)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={foco}
          className="pressable flex h-full w-full items-center gap-3 px-5 text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amarelo text-preto">
            <WhatsAppIcon tamanho={18} />
          </span>

          {state.size === 'long' && secao ? (
            <span className="flex min-w-0 flex-col gap-0.5">
              {/* 11px com tracking curto: medido num celular de 375px, a
                  linha de contexto tem 255px úteis depois do ícone e das
                  margens, e a 12px/.1em o endereço não cabia — vinha
                  reticências no meio da rua, que é pior do que não ter a
                  linha. */}
              <span className="truncate font-rotulo text-[11px] tracking-[.08em] text-branco uppercase">
                {secao.contexto}
              </span>
              <span className="truncate font-corpo text-[13px] text-escuro-texto">{secao.acao}</span>
            </span>
          ) : (
            <span className="truncate font-rotulo text-[12px] font-medium tracking-[.1em] text-branco uppercase">
              Agendar avaliação
            </span>
          )}
        </a>
      </DynamicContainer>
    </DynamicIsland>
  );
}

/** O mesmo símbolo que o cartão de agendamento usa (ui/CtaAgendamento.tsx). */
function WhatsAppIcon({ tamanho = 18 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.02 3C9.4 3 4 8.36 4 14.94c0 2.18.59 4.22 1.61 5.98L4 29l8.28-2.17a12.9 12.9 0 0 0 3.74.55h.01c6.62 0 12.02-5.36 12.02-11.94C28.05 8.36 22.65 3 16.02 3Zm0 21.8h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-4.92 1.29 1.31-4.77-.24-.39a9.79 9.79 0 0 1-1.52-5.19c0-5.42 4.43-9.83 9.9-9.83 5.46 0 9.89 4.41 9.89 9.83 0 5.42-4.43 9.86-9.9 9.86Zm5.42-7.38c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.86 1.22 3.06.15.2 2.1 3.2 5.09 4.48.71.31 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
      />
    </svg>
  );
}
