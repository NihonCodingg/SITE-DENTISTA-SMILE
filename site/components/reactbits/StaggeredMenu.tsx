'use client';

/**
 * Painel animado do drawer do menu mobile — Task 19 ("maximizar React Bits").
 * Origem: src/ts-tailwind/Components/StaggeredMenu/StaggeredMenu.tsx (ver
 * components/reactbits/README.md para o commit de referência e a lista
 * completa de modificações).
 *
 * Este arquivo é uma versão MUITO reduzida e corrigida do original de 588
 * linhas. O que foi mantido é exatamente o que torna este componente valioso
 * — a coreografia GSAP de abertura (painéis de cor deslizando, painel
 * principal deslizando, itens entrando em stagger com leve rotação, contador
 * numérico revelando). O que foi removido/adicionado está documentado no
 * README; resumo dos pontos que afetam acessibilidade:
 *
 * - O `<header>` interno (logo + botão hambúrguer com morph de ícone/texto)
 *   foi REMOVIDO. `MobileMenu.tsx` já tem seu próprio botão hambúrguer, que
 *   já morfa para X — duplicar esse controle aqui seria dois triggers pra
 *   uma coisa só. Isso também elimina ~150 linhas de gsap.timeline (spin do
 *   ícone, ciclo de texto "Menu"/"Close") que não tinham nenhuma exigência
 *   de acessibilidade em jogo.
 * - O componente virou CONTROLADO por uma prop `open` (não tem mais estado
 *   próprio nem `onClick` de toggle) — `MobileMenu.tsx` continua dono do
 *   estado, do foco preso, do Escape e da trava de scroll, exatamente como
 *   antes da troca. Only a `useEffect` interno observa `open` e decide se
 *   chama `playOpen()`/`playClose()`.
 * - `aria-hidden`/`inert` são props diretas amarradas a `open` — o nó NUNCA
 *   desmonta (GSAP anima o mesmo elemento pra sempre), então não existe a
 *   corrida de timing que o motion.div + AnimatePresence tinha (ver
 *   MobileMenu.tsx antigo). Reabertura rápida não pode deixar `inert` preso
 *   porque não há intervalo nenhum em que a prop e o estado divirjam.
 * - **Bug corrigido**: o `busyRef` do original fazia `playOpen()` retornar
 *   sem fazer nada se uma animação já estivesse "em voo" — mas só
 *   `playOpen()` respeitava essa flag; `playClose()` não. Numa sequência
 *   abrir→fechar→abrir rápida (a exigência de "reabertura < 220ms" desta
 *   task), o segundo `playOpen()` podia chegar enquanto `busyRef` ainda
 *   estava `true` (setado pelo close em voo) e virar no-op — o estado React
 *   dizia "aberto" mas o GSAP nunca tocava a timeline, painel ficava preso
 *   fora da tela. Removido: cada chamada já mata (`.kill()`) a timeline
 *   anterior antes de construir a nova, o que já é suficiente pra
 *   reentrância seguras sem uma flag "busy" solta.
 * - **Sob reduced motion, o GSAP não passa pelo reset global de
 *   `transition-duration` do CSS** (`globals.css`) — GSAP não usa
 *   `transition`, interpola por conta própria a cada frame. Sem tratamento
 *   especial, o painel deslizaria e os itens fariam stagger com rotação
 *   mesmo com `prefers-reduced-motion`. Corrigido: quando `reducedMotion` é
 *   true, a timeline GSAP nunca roda — o painel abre/fecha só por
 *   opacity (CSS, pega o reset do reset global), sem nenhum deslocamento,
 *   os prelayers decorativos nem renderizam, e os itens/números renderizam
 *   já na posição final (nunca recebem os `gsap.set` que os escondem).
 * - Contador de números: fallback do CSS mudou de `var(--sm-num-opacity, 0)`
 *   para `var(--sm-num-opacity, 1)` — sob reduced motion a variável nunca é
 *   tocada por JS, e com fallback 0 os números ficariam invisíveis para
 *   sempre. No modo animado a timeline segue setando explicitamente 0→1, o
 *   fallback nunca importa ali.
 * - Toque: `.sm-panel-item` ganhou a classe `pressable` (globals.css) —
 *   escala 0.97 no `:active`. O GSAP anima só o `<span
 *   class="sm-panel-itemLabel">` filho, nunca o `<a class="sm-panel-item">`
 *   — os dois transforms (CSS no pai, GSAP no filho) compõem naturalmente
 *   por aninhamento normal do CSS, não competem pela mesma propriedade do
 *   mesmo elemento (isso só seria um problema dentro do MESMO sistema de
 *   valores da Motion — ver design-guidance.md — não é o caso aqui, GSAP e
 *   CSS puro não compartilham esse mecanismo).
 * - Cores/tema: removida a paleta placeholder do React Bits (`#5227FF`
 *   roxo, `#ff0000` vermelho de fallback, painel branco). Painel usa
 *   `var(--color-creme)`, texto `var(--color-preto)`, accent
 *   `var(--color-dourado)` — tudo por prop, sem tocar a lógica.
 * - `backdrop-filter` do painel original foi removido (o painel de hoje é
 *   sólido, sem blur) — nada a ver com o bug de containing-block do
 *   `<header>` do Task 6 (esse é resolvido pelo portal em `MobileMenu.tsx`,
 *   inalterado), só simplificação: um painel sólido não precisa de blur.
 * - `socialItems`/`displaySocials`/`logoUrl`/`menuButtonColor`/
 *   `openMenuButtonColor`/`changeMenuColorOnOpen`/`isFixed`/
 *   `closeOnClickAway`/`onMenuOpen`/`onMenuClose` foram removidos — nenhum
 *   tem uso neste projeto (o CTA do WhatsApp entra via prop `footer`, o
 *   clique-fora já é tratado pelo backdrop em `MobileMenu.tsx`).
 * - `--sm-num-opacity` continua sendo uma custom property por ITEM
 *   (`.sm-panel-item`), não numa var no elemento pai — não recalcula estilo
 *   de irmãos, dentro da regra de performance do design-guidance.md.
 */

import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuProps {
  open: boolean;
  items: StaggeredMenuItem[];
  onItemClick?: () => void;
  footer?: React.ReactNode;
  position?: 'left' | 'right';
  /** Cores dos painéis decorativos que deslizam atrás do painel principal. */
  colors?: string[];
  accentColor?: string;
  displayItemNumbering?: boolean;
  /** true sob prefers-reduced-motion — desliga a timeline GSAP inteira. */
  reducedMotion?: boolean;
  panelId?: string;
  panelLabel?: string;
}

export const StaggeredMenu = forwardRef<HTMLElement, StaggeredMenuProps>(function StaggeredMenu(
  {
    open,
    items,
    onItemClick,
    footer,
    position = 'right',
    colors = ['#F0B40C', '#FCCC24'],
    accentColor = '#F0B40C',
    displayItemNumbering = true,
    reducedMotion = false,
    panelId = 'staggered-menu-panel',
    panelLabel = 'Menu'
  },
  forwardedRef
) {
  const panelRef = useRef<HTMLElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);

  const setPanelRef = useCallback(
    (node: HTMLElement | null) => {
      panelRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  // Posiciona tudo fora da tela na montagem — só no modo animado. No modo
  // reduced-motion o posicionamento é feito via opacity/CSS mais abaixo, sem
  // deslocamento nenhum (nada de xPercent).
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel) return;

      const preLayers = preContainer
        ? (Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[])
        : [];
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
    });
    return () => ctx.revert();
  }, [position, reducedMotion]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
    ) as HTMLElement[];

    const offscreen = position === 'left' ? -100 : 100;
    const layerStates = layers.map((el) => ({ el, start: offscreen }));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 8 });
    if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 } as gsap.TweenVars);

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.55;

    tl.fromTo(panel, { xPercent: offscreen }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime);

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15;
      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 0.8, ease: 'power4.out', stagger: { each: 0.06, from: 'start' } },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.5, ease: 'power2.out', '--sm-num-opacity': 1, stagger: { each: 0.06, from: 'start' } } as gsap.TweenVars,
          itemsStart + 0.08
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    const tl = buildOpenTimeline();
    tl?.play(0);
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: offscreen,
      duration: 0.28,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 8 });
        const numberEls = Array.from(
          panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
        ) as HTMLElement[];
        if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 } as gsap.TweenVars);
      }
    });
  }, [position]);

  useEffect(() => {
    if (reducedMotion) return;
    if (open) playOpen();
    else playClose();
  }, [open, reducedMotion, playOpen, playClose]);

  // Sob reduced motion nenhuma timeline roda — kill em qualquer sobra ao
  // trocar de modo em runtime (o dispositivo pode alternar a preferência
  // com o menu montado, useCapability reage a 'change' do matchMedia).
  useEffect(() => {
    if (!reducedMotion) return;
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    const panel = panelRef.current;
    if (panel) gsap.set(panel, { clearProps: 'transform' });
    const layers = preLayerElsRef.current;
    if (layers.length) gsap.set(layers, { clearProps: 'transform' });
  }, [reducedMotion]);

  const wrapperStyle = accentColor ? ({ ['--sm-accent' as string]: accentColor } as React.CSSProperties) : undefined;

  return (
    <div className="pointer-events-none h-full w-full" style={wrapperStyle} data-position={position}>
      {!reducedMotion && (
        <div ref={preLayersRef} className="sm-prelayers pointer-events-none absolute inset-y-0 right-0 z-[5] w-[min(320px,86vw)]" aria-hidden="true">
          {colors.slice(0, 2).map((c, i) => (
            <div key={i} className="sm-prelayer absolute inset-0 translate-x-0" style={{ background: c }} />
          ))}
        </div>
      )}

      <aside
        ref={setPanelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={panelLabel}
        aria-hidden={!open}
        inert={!open}
        className={
          'sm-panel-scope pointer-events-auto absolute inset-y-0 right-0 z-10 flex h-dvh w-[min(320px,86vw)] flex-col justify-between bg-creme px-6 py-6 shadow-[-12px_0_30px_rgba(17,17,17,0.14)]' +
          (reducedMotion ? ' transition-opacity duration-200 ease-out' : '')
        }
        style={reducedMotion ? { opacity: open ? 1 : 0 } : undefined}
      >
        <div>
          <ul className="sm-panel-list m-0 flex list-none flex-col p-0" data-numbering={displayItemNumbering || undefined}>
            {items.map((it, idx) => (
              <li key={it.link + idx} className="sm-panel-itemWrap relative overflow-hidden leading-none">
                <a
                  href={it.link}
                  aria-label={it.ariaLabel}
                  onClick={onItemClick}
                  className="pressable sm-panel-item relative flex min-h-[56px] items-center gap-4 border-b border-borda font-rotulo text-[15px] uppercase tracking-[.1em] text-preto"
                >
                  <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                    {it.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {footer}
      </aside>

      <style>{`
.sm-panel-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
.sm-panel-scope .sm-panel-list[data-numbering] .sm-panel-item::before {
  counter-increment: smItem;
  content: counter(smItem, decimal-leading-zero);
  font-family: var(--font-rotulo);
  font-size: 12px;
  color: var(--sm-accent, var(--color-dourado));
  opacity: var(--sm-num-opacity, 1);
  pointer-events: none;
  user-select: none;
}
      `}</style>
    </div>
  );
});
