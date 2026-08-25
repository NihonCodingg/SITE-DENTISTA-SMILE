'use client';

/**
 * Menu de bolhas: cada item é uma pílula que entra estourando, uma depois da
 * outra — Task 23, o menu do celular. Origem:
 * src/ts-tailwind/Components/BubbleMenu/BubbleMenu.tsx (ver
 * components/reactbits/README.md para o commit e a lista completa).
 *
 * Modificações sobre o original — as três primeiras são o que permite este
 * componente entrar sem desfazer três rodadas de correção de acessibilidade
 * que o menu do celular já tinha custado:
 *
 * 1. **O cabeçalho próprio (logo + hambúrguer) não veio.** O original desenha
 *    um `<nav>` fixo com a logo numa bolha e o botão de abrir noutra. Este
 *    site já tem um `<Header>` de verdade — com logo, telefone e CTA — e o
 *    hambúrguer dele mora em `layout/MobileMenu.tsx`, junto do foco preso, do
 *    `Escape`, do retorno de foco e da trava de scroll. Um segundo `<nav>`
 *    com "Main navigation" ainda criaria duas landmarks de navegação
 *    disputando o mesmo papel. É a MESMA modificação que o `StaggeredMenu`
 *    levou na Task 19, pela mesma razão.
 * 2. **O estado de aberto/fechado saiu do componente.** O original guarda
 *    `isMenuOpen` internamente, e aí quem está por fora não consegue fechar o
 *    menu (no `Escape`, no clique no fundo, ao navegar). Agora é a prop
 *    `open`, controlada — mesmo contrato do `StaggeredMenu`, para o painel ser
 *    trocável sem tocar em `MobileMenu.tsx`.
 * 3. **`role="menu"`/`role="menuitem"` removidos.** São papéis de menu de
 *    APLICAÇÃO — o leitor de tela anuncia "menu" e a pessoa passa a esperar
 *    navegação por setas, que não existe aqui. São links de navegação: uma
 *    lista e links dão exatamente o que são. (O original ainda usa
 *    `aria-pressed` no botão de abrir, que é de alternância, não de
 *    revelação; o botão não veio, mas o `MobileMenu` usa `aria-expanded`.)
 * 4. **O bloco `<style>` global não veio.** O original injeta CSS com nomes de
 *    classe genéricos (`.pill-list`, `.pill-link`) que vazam para a página
 *    inteira, mais um `!important` em `background` e regras de `nth-child`
 *    para uma grade de três colunas que só existe acima de 900px — largura em
 *    que este menu nem aparece. Tudo que sobra é utilitário do Tailwind no
 *    próprio elemento.
 * 5. **`reducedMotion` virou prop.** O original anima sempre. Aqui, sob
 *    movimento reduzido, as pílulas aparecem sem o estouro — reduzir, não
 *    zerar: o menu continua abrindo e fechando.
 * 6. **`aria-hidden`/`inert` amarrados a `open`**, e o painel NUNCA desmonta —
 *    mesma blindagem do `StaggeredMenu`: nó estável para o GSAP e nenhum
 *    `inert` preso por timing de desmontagem.
 * 7. **Os tempos entraram na régua de motion do projeto.** Os defaults do
 *    React Bits ficavam todos fora dela — 500ms de entrada contra o teto de
 *    300, 120ms de passo contra a janela de 30-80, e 860ms até o último item
 *    assentar contra o teto de 450. Ver `MOTION_BOLHAS`, travado por
 *    `__tests__/bubbleMenu.test.ts`.
 * 8. **Nenhum `ease-in`.** O original fecha com `power3.in` nas pílulas e nos
 *    rótulos; o guia do projeto crava que interface nunca usa ease-IN. A saída
 *    passou a usar a mesma `--ease-gaveta` do resto do site. A ENTRADA
 *    continua em `back.out` de propósito: passar do ponto e voltar é o que faz
 *    uma bolha parecer bolha, e ease-out não é o que a regra proíbe.
 * 9. **`height: 10` inline saiu.** O original põe altura 10px no link e
 *    devolve o tamanho por `min-height` e `padding` — funciona por acidente e
 *    torna qualquer ajuste de espaçamento um chute.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { ReactNode } from 'react';
import { gsap } from 'gsap';
import { EASE_GAVETA_ID, registrarEaseGaveta } from '@/lib/easeGaveta';

export interface BubbleMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface BubbleMenuProps {
  open: boolean;
  items: BubbleMenuItem[];
  onItemClick?: () => void;
  /** Renderizado antes da lista (o botão ✕ de fechar). */
  cabecalho?: ReactNode;
  footer?: ReactNode;
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
 * A curva de entrada é a única exceção deliberada: `back.out` passa do ponto e
 * volta, e é EXATAMENTE isso que faz uma bolha parecer bolha. Continua sendo
 * um ease-OUT — a regra que o guia crava é nunca usar ease-IN em interface, e
 * essa segue valendo (a saída usa a mesma `--ease-gaveta` do resto do site).
 */
export const MOTION_BOLHAS = {
  /** cada pílula, do zero ao tamanho cheio */
  entrada: 0.28,
  /** saída — quem fecha já decidiu, não faça esperar */
  saida: 0.2,
  /** passo entre pílulas (janela do guia: 30-80ms) */
  stagger: 0.04,
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
    cabecalho,
    footer,
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
  const bolhasRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const rotulosRef = useRef<(HTMLSpanElement | null)[]>([]);

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

  return (
    <aside
      ref={(no) => {
        painelRef.current = no;
      }}
      id={panelId}
      // `role="dialog"` + `aria-modal`: o painel é modal de verdade — o foco
      // fica preso dentro dele, o `Escape` fecha e todo o resto da página vira
      // `inert` enquanto ele está aberto (quem faz isso é `layout/MobileMenu.tsx`).
      // O original não declara papel nenhum; sem isso, quem usa leitor de tela
      // não recebe o anúncio de que entrou num diálogo, e a promessa de "só
      // existe isto agora" fica só no comportamento.
      role="dialog"
      aria-modal="true"
      aria-label={panelLabel}
      aria-hidden={!open}
      inert={!open}
      className={
        'pointer-events-auto absolute inset-0 flex flex-col justify-center gap-5 overflow-y-auto bg-creme px-5 py-8' +
        (reducedMotion ? ' transition-opacity duration-200 ease-saida' : '')
      }
      style={reducedMotion ? { opacity: open ? 1 : 0 } : undefined}
    >
      {cabecalho}

      <ul className="flex list-none flex-col gap-3">
        {items.map((item, i) => (
          <li key={item.link}>
            <a
              ref={(el) => {
                bolhasRef.current[i] = el;
              }}
              href={item.link}
              aria-label={item.ariaLabel}
              onClick={onItemClick}
              className="pressable flex min-h-[76px] w-full items-center justify-center rounded-full bg-branco px-6 text-center font-titulo text-[clamp(20px,6vw,30px)] leading-none text-preto uppercase shadow-[0_6px_18px_rgba(17,17,17,0.10)] [will-change:transform] pointer-fine:hover:bg-amarelo"
            >
              <span
                ref={(el) => {
                  rotulosRef.current[i] = el;
                }}
                className="inline-block [will-change:transform,opacity]"
              >
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {footer}
    </aside>
  );
});

export default BubbleMenu;
