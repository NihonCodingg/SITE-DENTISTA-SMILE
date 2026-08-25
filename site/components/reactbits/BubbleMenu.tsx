'use client';

/**
 * Menu de bolhas: a logo numa pílula, o botão numa bolha redonda ao lado, e os
 * itens entrando como pílulas que estouram uma depois da outra — Task 23, o
 * menu do celular. Origem:
 * src/ts-tailwind/Components/BubbleMenu/BubbleMenu.tsx (ver
 * components/reactbits/README.md para o commit e a lista completa).
 *
 * O layout segue o CSS do original na faixa de celular (`max-width: 899px`),
 * que é a única em que este menu aparece: bolhas de 48px no topo com 2em de
 * folga, lista começando a 120px, pílulas de largura cheia com 80px de altura
 * mínima e `row-gap` de 16px.
 *
 * Modificações sobre o original:
 *
 * 1. `'use client'` no topo (o original não declara).
 * 2. **O `<nav aria-label="Main navigation">` virou o painel do menu.** O
 *    original é um nav próprio, fixo, sempre visível, que convive com o
 *    cabeçalho da página. Este site já tem um `<Header>` de verdade, e um
 *    segundo landmark de navegação disputaria o mesmo papel. Aqui as bolhas
 *    vivem DENTRO do painel que abre.
 * 3. **O estado de aberto/fechado saiu do componente.** O original guarda
 *    `isMenuOpen` internamente, e aí quem está por fora não consegue fechar o
 *    menu (no `Escape`, ao navegar, ao tocar no fundo). Agora são as props
 *    `open` e `onClose`, controladas por `layout/MobileMenu.tsx`, que é quem
 *    também prende o foco, escuta o `Escape`, devolve o foco ao hambúrguer do
 *    header e trava o scroll.
 * 4. **`role="dialog"` + `aria-modal` no painel.** Ele É modal — o foco fica
 *    preso dentro e o resto da página vira `inert`. O original não declara
 *    papel nenhum, e sem isso quem usa leitor de tela não é avisado de que
 *    entrou num diálogo.
 * 5. **`role="menu"`/`role="menuitem"` removidos.** São papéis de menu de
 *    APLICAÇÃO: o leitor de tela anuncia "menu" e a pessoa passa a esperar
 *    navegação por setas, que não existe aqui. São links de navegação — uma
 *    lista e links dizem exatamente o que são.
 * 6. **`aria-pressed` do botão virou `aria-expanded`.** `pressed` é de
 *    alternância (um botão que fica apertado); revelar um painel é `expanded`.
 * 7. **O arquivo CSS global não veio.** O original traz um `BubbleMenu.css`
 *    com nomes de classe genéricos (`.bubble`, `.pill-list`, `.pill-link`) que
 *    vazam para a página inteira, mais um `!important` em `margin-left`. Tudo
 *    virou utilitário do Tailwind no próprio elemento.
 * 8. **`reducedMotion` virou prop.** O original anima sempre. Sob movimento
 *    reduzido as pílulas aparecem sem o estouro — reduzir, não zerar.
 * 9. **`aria-hidden`/`inert` amarrados a `open`**, e o painel nunca desmonta:
 *    nó estável para o GSAP, e nenhum `inert` preso por timing de desmontagem.
 *    (O original monta e desmonta o overlay por estado, e ainda controla a
 *    visibilidade com `gsap.set(overlay, { display })` — que é o tipo de coisa
 *    que deixa `inert` preso quando se abre de novo antes de a saída acabar.)
 * 10. **Os tempos entraram na régua de motion do projeto** (`MOTION_BOLHAS`,
 *    travado por `__tests__/bubbleMenu.test.ts`). Os defaults ficavam todos
 *    fora dela — 500ms de entrada contra o teto de 300, 120ms de passo contra
 *    a janela de 30-80, e 860ms até o último item contra o teto de 450.
 * 11. **Nenhum `ease-in`.** O original fecha com `power3.in` nas pílulas e nos
 *    rótulos; o guia do projeto crava que interface nunca usa ease-IN. A saída
 *    usa a mesma `--ease-gaveta` do resto do site. A ENTRADA continua em
 *    `back.out` de propósito: passar do ponto e voltar é o que faz uma bolha
 *    parecer bolha, e ease-out não é o que a regra proíbe.
 * 12. **`height: 10px` inline saiu da pílula.** O original crava altura de
 *    10px no link e devolve o tamanho por `min-height` + `padding` — funciona
 *    por acidente, e torna qualquer ajuste de espaçamento um chute.
 * 13. **`gsap.utils.random(-0.05, 0.05)` no atraso de cada bolha saiu.** Com
 *    o passo de 120ms do original a variação some no meio; com os 50ms daqui
 *    ela chega a inverter a ordem de duas bolhas vizinhas, e o efeito deixa de
 *    ser uma sequência.
 * 15. **O GSAP escala um INVÓLUCRO, não o elemento clicável.** No original o
 *    `scale` vai direto no `<a>` e no `<button>`. Os dois escreveriam
 *    `transform` no mesmo elemento, e o inline do GSAP ganha do `:active` do
 *    `.pressable` — a peça perderia o feedback de toque, que é a assinatura
 *    tátil deste site. O `<li>` (e um `<span>` na bolha do botão) recebe a
 *    escala; o link e o botão ficam com o `transform` deles.
 * 14. **A rotação das pílulas continua desligada nesta faixa**, como no CSS
 *    original (`transform: rotate(var(--item-rot))` só existe a partir de
 *    900px). Não é esquecimento: pílula de largura cheia girada estoura a
 *    lateral da tela. A prop segue aceita para um uso futuro em tela larga.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { gsap } from 'gsap';
import { EASE_GAVETA_ID, registrarEaseGaveta } from '@/lib/easeGaveta';

export interface BubbleMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
  /** Graus de inclinação da pílula. Só vale a partir de 900px (ver mod. 14). */
  rotation?: number;
  hoverStyles?: { bgColor?: string; textColor?: string };
}

export interface BubbleMenuProps {
  open: boolean;
  items: BubbleMenuItem[];
  onItemClick?: () => void;
  /** Fecha o painel — a bolha do botão chama isto. */
  onClose?: () => void;
  /** Conteúdo da bolha da logo. */
  logo?: ReactNode;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  /** Renderizado depois da lista (o CTA de WhatsApp). */
  rodape?: ReactNode;
  /** Vem de `useCapability().podeAnimar` — o componente não consulta matchMedia. */
  reducedMotion?: boolean;
  panelId?: string;
  panelLabel?: string;
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
}

/**
 * Régua de motion do menu do celular (design-guidance.md, "Menu mobile —
 * checklist de craft": 300ms abrindo, 220ms fechando, stagger ~40ms, saída
 * mais rápida que a entrada). Em segundos, a unidade do GSAP. Exportada para
 * o teste travar os números contra os tetos sem mockar o GSAP.
 *
 * Os defaults do React Bits ficavam TODOS fora dessa régua: 500ms de entrada
 * (contra o teto de 300), 120ms de passo entre itens (contra a janela de
 * 30-80) e, com quatro itens, 860ms até o último assentar — quase o dobro do
 * teto de 450ms. A régua é do projeto e é anterior a este componente; quem se
 * ajusta é ele.
 *
 * O passo é 50ms, e não os 40ms do drawer anterior, porque aqui a sequência É
 * o efeito — a bolha precisa ser vista chegando depois da anterior. 50ms é o
 * maior valor que ainda cabe no teto de 450ms com os quatro itens do nav
 * (3 × 50 + 280 = 430ms) e continua dentro da janela de 30-80.
 */
export const MOTION_BOLHAS = {
  /** cada pílula, do zero ao tamanho cheio */
  entrada: 0.28,
  /** saída — quem fecha já decidiu, não faça esperar */
  saida: 0.2,
  /** passo entre pílulas (janela do guia: 30-80ms) */
  stagger: 0.05,
  /** o rótulo subindo dentro da pílula */
  rotulo: 0.28,
} as const;

/** Teto do guia para qualquer coisa que a pessoa aciona. */
export const TETO_ACIONADO = 0.3;
/** Teto do brief da Task 18 para o conjunto (último item assentado). */
export const TETO_CONJUNTO = 0.45;

/** Instante (s) em que a última de `quantidade` pílulas assenta, contado da abertura. */
export function tempoUltimoItem(quantidade: number): number {
  if (quantidade <= 0) return 0;
  return (quantidade - 1) * MOTION_BOLHAS.stagger + Math.max(MOTION_BOLHAS.entrada, MOTION_BOLHAS.rotulo);
}

export const BubbleMenu = forwardRef<HTMLElement, BubbleMenuProps>(function BubbleMenu(
  {
    open,
    items,
    onItemClick,
    onClose,
    logo,
    menuAriaLabel = 'Fechar menu',
    menuBg = 'var(--color-branco)',
    menuContentColor = 'var(--color-preto)',
    rodape,
    reducedMotion = false,
    panelId = 'bubble-menu-panel',
    panelLabel = 'Menu',
    animationEase = 'back.out(1.5)',
    animationDuration = MOTION_BOLHAS.entrada,
    staggerDelay = MOTION_BOLHAS.stagger,
  },
  forwardedRef
) {
  const painelRef = useRef<HTMLElement | null>(null);
  const bolhasRef = useRef<(HTMLElement | null)[]>([]);
  const rotulosRef = useRef<(HTMLElement | null)[]>([]);

  useImperativeHandle(forwardedRef, () => painelRef.current as HTMLElement);

  useEffect(() => {
    const bolhas = bolhasRef.current.filter(Boolean) as HTMLElement[];
    const rotulos = rotulosRef.current.filter(Boolean) as HTMLElement[];
    if (!bolhas.length) return;

    registrarEaseGaveta();
    gsap.killTweensOf([...bolhas, ...rotulos]);

    // Movimento reduzido: sem estouro e sem escalonamento. As pílulas
    // simplesmente estão lá (ou não estão) — o menu continua abrindo.
    if (reducedMotion) {
      gsap.set(bolhas, { scale: open ? 1 : 0, transformOrigin: '50% 50%' });
      gsap.set(rotulos, { y: 0, autoAlpha: open ? 1 : 0 });
      return;
    }

    if (open) {
      gsap.set(bolhas, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(rotulos, { y: 20, autoAlpha: 0 });

      bolhas.forEach((bolha, i) => {
        const tl = gsap.timeline({ delay: i * staggerDelay });
        tl.to(bolha, { scale: 1, duration: animationDuration, ease: animationEase });
        if (rotulos[i]) {
          tl.to(
            rotulos[i],
            { y: 0, autoAlpha: 1, duration: MOTION_BOLHAS.rotulo, ease: EASE_GAVETA_ID },
            `-=${animationDuration * 0.9}`
          );
        }
      });
    } else {
      // `--ease-gaveta`, não um `power3.in`: o guia do projeto crava que
      // interface nunca usa ease-IN — nem na saída. O original usa nos dois.
      gsap.to(rotulos, { y: 20, autoAlpha: 0, duration: MOTION_BOLHAS.saida, ease: EASE_GAVETA_ID });
      gsap.to(bolhas, { scale: 0, duration: MOTION_BOLHAS.saida, ease: EASE_GAVETA_ID });
    }

    return () => {
      gsap.killTweensOf([...bolhas, ...rotulos]);
    };
  }, [open, reducedMotion, animationDuration, animationEase, staggerDelay]);

  // A bolha da logo e a do botão estouram primeiro, e as pílulas vêm depois —
  // a mesma ordem de leitura de cima para baixo.
  const registrarBolha = (i: number) => (el: HTMLElement | null) => {
    bolhasRef.current[i] = el;
  };
  const registrarRotulo = (i: number) => (el: HTMLElement | null) => {
    rotulosRef.current[i] = el;
  };

  return (
    <aside
      ref={(no) => {
        painelRef.current = no;
      }}
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-label={panelLabel}
      aria-hidden={!open}
      inert={!open}
      // `pointer-events-none` no painel e `auto` só nas bolhas e nas pílulas,
      // como no original: o toque ENTRE as pílulas atravessa e chega ao fundo
      // escurecido, que fecha o menu. Um painel opaco engoliria esse toque.
      className="pointer-events-none absolute inset-0"
    >
      {/* A fileira do topo: logo numa pílula à esquerda, botão numa bolha à
          direita. Medidas do original: bolha de 48px, 2em de folga em cima e
          nas laterais. */}
      <div className="absolute inset-x-0 top-8 flex items-center justify-between gap-4 px-8">
        <div
          ref={registrarBolha(0)}
          className="pointer-events-auto inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)] [will-change:transform]"
          style={{ background: menuBg }}
        >
          <span className="inline-flex h-full items-center justify-center [&_img]:max-h-[60%] [&_img]:w-auto">
            {logo}
          </span>
        </div>

        {/* O GSAP escala o INVÓLUCRO, não o botão. Os dois escreveriam
            `transform` no mesmo elemento, e o inline do GSAP ganharia do
            `:active` do `.pressable` — o botão perderia o feedback de toque
            que é a assinatura tátil do site. Mesma separação nas pílulas. */}
        <span ref={registrarBolha(1)} className="pointer-events-auto inline-block [will-change:transform]">
          <button
            type="button"
            onClick={onClose}
            aria-label={menuAriaLabel}
            aria-expanded={open}
            aria-controls={panelId}
            className="pressable inline-flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-full border-0 p-0 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            style={{ background: menuBg }}
          >
          {/* As duas linhas do hambúrguer viram um ✕ — `transform` puro, com a
              mesma transição de 300ms do original. */}
            <span
              className="block h-[2px] w-[26px] rounded-[2px] transition-transform duration-300 ease-saida"
              style={{ background: menuContentColor, transform: open ? 'translateY(4px) rotate(45deg)' : undefined }}
            />
            <span
              className="mt-[6px] block h-[2px] w-[26px] rounded-[2px] transition-transform duration-300 ease-saida"
              style={{ background: menuContentColor, transform: open ? 'translateY(-4px) rotate(-45deg)' : undefined }}
            />
          </button>
        </span>
      </div>

      {/* A lista, com a folga de 120px do original para não passar por baixo
          das bolhas. */}
      <div className="absolute inset-0 flex flex-col justify-start overflow-y-auto px-6 pt-[120px] pb-8">
        <ul className="pointer-events-auto m-0 flex list-none flex-col gap-4 p-0">
          {items.map((item, i) => (
            <li
              key={item.link}
              ref={registrarBolha(i + 2)}
              className="flex items-stretch justify-center [will-change:transform]"
            >
              <a
                href={item.link}
                aria-label={item.ariaLabel}
                onClick={onItemClick}
                className="pressable relative flex min-h-[80px] w-full items-center justify-center overflow-hidden rounded-[999px] px-6 text-center font-titulo text-[clamp(1.2rem,6vw,2rem)] leading-none whitespace-nowrap uppercase no-underline shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-[background,color] duration-300 pointer-fine:hover:bg-[var(--bolha-hover-bg)] pointer-fine:hover:text-[var(--bolha-hover-cor)]"
                style={
                  {
                    background: menuBg,
                    color: menuContentColor,
                    '--bolha-hover-bg': item.hoverStyles?.bgColor ?? 'var(--color-amarelo)',
                    '--bolha-hover-cor': item.hoverStyles?.textColor ?? menuContentColor,
                  } as CSSProperties
                }
              >
                <span ref={registrarRotulo(i + 2)} className="inline-block [will-change:transform,opacity]">
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {rodape ? <div className="pointer-events-auto mt-4">{rodape}</div> : null}
      </div>
    </aside>
  );
});

export default BubbleMenu;
