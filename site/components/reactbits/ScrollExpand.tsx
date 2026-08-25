'use client';

/**
 * Mídia que se abre com o scroll — Task 20 (seção "O tour", logo depois do
 * hero). Origem: src/ts-tailwind/Animations/ScrollExpand/ScrollExpand.tsx
 * (ver components/reactbits/README.md para o commit e a lista completa).
 *
 * Modificações sobre o original:
 * 1. `'use client'` no topo (o original não declara).
 * 2. **`reducedMotion` virou prop.** O original chamava
 *    `window.matchMedia('(prefers-reduced-motion: reduce)')` por conta
 *    própria; a fonte única deste projeto é `useCapability()`.
 * 3. **`<img>` trocado por `next/image`** — o original serve o arquivo cru.
 *    Esta é a maior imagem da página quando aberta, então passar pelo
 *    otimizador (AVIF, tamanho certo) não é detalhe. O modo `video` foi
 *    REMOVIDO junto: o site não hospeda vídeo (ver `ui/VideoCard.tsx`), e
 *    manter o ramo convidaria a reintroduzir um.
 * 5. **Slot `midia`.** O original só expande uma imagem. O hero deste site
 *    precisa que o BLOCO INTEIRO se abra — card creme, headline, foto do
 *    doutor, colunas — com a foto parada no lugar onde o design a colocou.
 *    Com `midia`, o que cresce é conteúdo, não um arquivo.
 * 9. **O overlay fica inerte enquanto está invisível.** No original o bloco
 *    do CTA é desenhado com `opacity` vinda do scroll, mas continua clicável e
 *    focável em `opacity: 0` — desde o topo da página existe um botão
 *    transparente por cima da headline, que o Tab alcança e que o toque acerta
 *    sem querer. Agora `pointer-events: none` + `inert` acompanham a
 *    opacidade.
 * 10. **A geometria entra nas dependências do efeito.** O original só
 *    reage a scroll e resize; trocar `startWidth`/`startHeight` em tempo de
 *    execução (que é como o hero muda a moldura entre celular e desktop) não
 *    repinta nada — a moldura fica com a porcentagem antiga até o próximo
 *    evento de scroll.
 */

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

type ConfigKey =
  | 'startWidth'
  | 'startHeight'
  | 'startRadius'
  | 'endRadius'
  | 'mediaZoom'
  | 'scrollDistance'
  | 'holdDistance'
  | 'smoothing'
  | 'overlayScrim'
  | 'useWindowScroll'
  | 'enabled';

export interface ScrollExpandProps {
  src?: string;
  alt?: string;
  /** Aceita nó, não só string: o hero passa o próprio `<h1>` (o original
   *  renderizava um `<div>`, o que custaria o heading da página). */
  title?: ReactNode;
  /** Aceita nó: o original cravava branco, ilegível sobre fundo claro. */
  scrollHint?: ReactNode;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  /** Vem de `useCapability().podeAnimar` — o componente não consulta matchMedia. */
  reducedMotion?: boolean;
  /**
   * Conteúdo que se abre no lugar da imagem. O original só sabe expandir uma
   * mídia (`src`); aqui o hero inteiro — card creme, headline, foto, colunas —
   * entra por este slot e é ELE que cresce. Quando presente, `src` é ignorado.
   */
  midia?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

const ScrollExpand: React.FC<ScrollExpandProps> = ({
  src = '',
  alt = '',
  title,
  scrollHint,
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  reducedMotion = false,
  midia,
  children,
  className = '',
  style,
  ...rest
}: ScrollExpandProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLImageElement & HTMLVideoElement & HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  const propsRef = useRef<Required<Pick<ScrollExpandProps, ConfigKey>>>(
    {} as Required<Pick<ScrollExpandProps, ConfigKey>>
  );
  // Escrita de ref fora do render (regra `react-hooks/refs` do eslint deste
  // Next) — mesma correção que `DepthCarousel` e `OptionWheel` levaram.
  useLayoutEffect(() => {
    propsRef.current = {
      startWidth,
      startHeight,
      startRadius,
      endRadius,
      mediaZoom,
      scrollDistance,
      holdDistance,
      smoothing,
      overlayScrim,
      useWindowScroll,
      enabled
    };
  });

  const applyProgress = useCallback((p: number) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const c = propsRef.current;

    const e = smoothstep(0, 1, p);

    const w = c.startWidth + (100 - c.startWidth) * e;
    const h = c.startHeight + (100 - c.startHeight) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

    media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;

    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim * e}`;

    if (titleRef.current) {
      const out = smoothstep(0.4, 0.88, p);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.12, p);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }

    if (overlayRef.current) {
      const inn = smoothstep(0.68, 1, p);
      overlayRef.current.style.opacity = `${inn}`;
      overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
      // Enquanto o overlay está invisível, ele não pode continuar clicável nem
      // focável (modificação 9): o CTA que mora aqui fica exatamente sobre a
      // headline, e sem isto existe um botão transparente por cima dela desde
      // o topo da página — que o Tab alcança e que o toque acerta sem querer.
      const oculto = inn < 0.05;
      overlayRef.current.style.pointerEvents = oculto ? 'none' : '';
      overlayRef.current.inert = oculto;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduceMotion = reducedMotion;

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;

    const measure = () => {
      const c = propsRef.current;
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;
      if (stageH <= 0) return;
      stage.style.height = `${stageH}px`;
      track.style.height = `${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px`;

      const w = root.clientWidth || stageH;
      stage.style.setProperty('--se-title-size', `${clamp(w * 0.075, 20, 84)}px`);
    };

    const readProgress = () => {
      const c = propsRef.current;
      if (!c.enabled) return 1;
      const span = stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll) {
        const top = track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const c = propsRef.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }
      applyProgress(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      if (propsRef.current.smoothing <= 0 || reduceMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      measure();
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    const scroller = useWindowScroll ? window : root;
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(root);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
    // A geometria entra nas dependências (modificação 10): quando o hero troca
    // o tamanho da moldura por faixa de tela, o efeito precisa medir e
    // repintar. Sem isso o `clip-path` só é reescrito no próximo scroll ou
    // resize — e a moldura fica com a porcentagem da faixa anterior.
  }, [applyProgress, useWindowScroll, reducedMotion, startWidth, startHeight, startRadius, endRadius, mediaZoom, scrollDistance, holdDistance]);

  const media = midia ? (
    // `mediaRef` é o que recebe o `scale` do percurso — então o wrapper do
    // conteúdo tem que ser ele, não um filho. `h-full` porque o palco tem a
    // altura da janela e o conteúdo se organiza dentro dela.
    <div
      ref={mediaRef as unknown as React.RefObject<HTMLDivElement>}
      className="absolute inset-0 h-full w-full origin-center [will-change:transform]"
    >
      {midia}
    </div>
  ) : (
    <Image
      ref={mediaRef}
      className="absolute inset-0 h-full w-full origin-center select-none object-cover [will-change:transform]"
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      draggable={false}
    />
  );

  return (
    <div
      ref={rootRef}
      className={`relative w-full h-full ${useWindowScroll ? '' : 'overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'} ${className}`.trim()}
      style={style}
      {...rest}
    >
      {/* A altura da pista e do palco vem do CSS ANTES de o JS medir. No
          original os dois nascem com zero e só ganham altura no efeito de
          `measure()` — a página inteira saltava ~2 telas depois da hidratação,
          o que rendeu 0,96 de CLS no Lighthouse mobile (medido). O `measure()`
          continua mandando: ele reescreve os mesmos valores em pixels; a
          diferença é que agora não há um quadro com altura zero. */}
      <div
        ref={trackRef}
        className="relative w-full"
        style={{ minHeight: `${(1 + Math.max(0, scrollDistance) + Math.max(0, holdDistance)) * 100}svh` }}
      >
        <div
          ref={stageRef}
          className="sticky top-0 w-full overflow-hidden [--se-title-size:4rem]"
          style={{ minHeight: '100svh' }}
        >
          <div
            ref={frameRef}
            className="absolute inset-0 [clip-path:inset(21%_29%_21%_29%_round_24px)] [will-change:clip-path]"
          >
            {media}
            <div
              ref={scrimRef}
              className="absolute inset-0 opacity-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.75),rgba(0,0,0,0.1)_45%,rgba(0,0,0,0.35))]"
            />
            {children ? (
              <div
                ref={overlayRef}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-[6%] opacity-0 [will-change:opacity,transform]"
              >
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <div
              ref={titleRef}
              className="absolute inset-0 flex items-center justify-center m-0 px-[6%] text-center font-bold leading-none tracking-[-0.03em] text-white [font-size:var(--se-title-size)] [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] pointer-events-none [will-change:opacity,transform]"
            >
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div
              ref={hintRef}
              className="absolute inset-x-0 bottom-5 text-center pointer-events-none [will-change:opacity,transform]"
            >
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;
