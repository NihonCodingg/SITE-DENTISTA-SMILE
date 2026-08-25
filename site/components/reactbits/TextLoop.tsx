'use client';

/**
 * Fita curva com texto correndo por ela — Task 20, a faixa dos tratamentos
 * logo abaixo do hero. Origem:
 * src/ts-tailwind/TextAnimations/TextLoop/TextLoop.tsx (ver
 * components/reactbits/README.md para o commit e a lista completa).
 *
 * Modificações sobre o original:
 * 1. `'use client'` no topo (o original não declara).
 * 2. **`reducedMotion` virou prop.** O original chamava
 *    `window.matchMedia('(prefers-reduced-motion: reduce)')` por conta
 *    própria; a fonte única deste projeto é `useCapability()`.
 * 3. **Pausa fora da viewport e com a aba oculta.** O original roda a
 *    animação para sempre enquanto montado — mesma correção que
 *    `ScrollVelocity` e `CircularGallery` levaram na Task 19: fita decorativa
 *    não gasta CPU de quem não está olhando.
 */

import { CSSProperties, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

export type TextLoopShape = 'wave' | 'circle' | 'infinity' | 'arch' | 'line';
export type TextLoopDirection = 'forward' | 'reverse';

export interface TextLoopProps {
  text?: string;
  shape?: TextLoopShape;
  path?: string;
  speed?: number;
  direction?: TextLoopDirection;
  separator?: string;
  curviness?: number;
  fontSize?: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  uppercase?: boolean;
  color?: string;
  ribbon?: boolean;
  ribbonColor?: string;
  ribbonWidth?: number;
  pauseOnHover?: boolean;
  /** Vem de `useCapability().podeAnimar` — o componente não consulta matchMedia. */
  reducedMotion?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface Metrics {
  length: number;
  reps: number;
}

const VIEW_W = 1200;
const VIEW_H = 520;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const EDGE_PAD = 6;

const buildPath = (shape: TextLoopShape, curviness: number, ribbonWidth: number): string => {
  const c = Math.max(0, curviness);
  const room = Math.max(20, CY - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

  switch (shape) {
    case 'circle': {
      const r = Math.min(90 + c * 0.95, room);
      return `M ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} Z`;
    }
    case 'infinity': {
      const r = 150 + c * 1.4;
      const h = Math.min(60 + c * 0.95, room);
      return [
        `M ${CX} ${CY}`,
        `C ${CX + r * 0.55} ${CY - h} ${CX + r} ${CY - h} ${CX + r} ${CY}`,
        `C ${CX + r} ${CY + h} ${CX + r * 0.55} ${CY + h} ${CX} ${CY}`,
        `C ${CX - r * 0.55} ${CY - h} ${CX - r} ${CY - h} ${CX - r} ${CY}`,
        `C ${CX - r} ${CY + h} ${CX - r * 0.55} ${CY + h} ${CX} ${CY}`,
        'Z'
      ].join(' ');
    }
    case 'arch': {
      const rise = Math.min(120 + c * 1.1, room * 2);
      return `M 120 ${CY + rise / 2} Q ${CX} ${CY - rise * 1.5} ${VIEW_W - 120} ${CY + rise / 2}`;
    }
    case 'line':
      return `M -320 ${CY} L ${VIEW_W + 320} ${CY}`;
    case 'wave':
    default: {
      const a = Math.min(c * 2.2, room * 2);
      return `M -320 ${CY} Q -160 ${CY - a} 0 ${CY} T 320 ${CY} T 640 ${CY} T 960 ${CY} T 1280 ${CY} T ${VIEW_W + 320} ${CY}`;
    }
  }
};

const TextLoop = ({
  text = 'React ✦ Bits',
  shape = 'wave',
  path,
  speed = 90,
  direction = 'forward',
  separator = '✦',
  curviness = 90,
  fontSize = 46,
  fontWeight = 800,
  letterSpacing = 2,
  uppercase = true,
  color = '#ffffff',
  ribbon = true,
  ribbonColor = '#5227FF',
  ribbonWidth = 86,
  pauseOnHover = true,
  reducedMotion = false,
  className = '',
  style = {}
}: TextLoopProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const measureRef = useRef<SVGTextElement | null>(null);
  const headRef = useRef<SVGTextPathElement | null>(null);
  const tailRef = useRef<SVGTextPathElement | null>(null);

  const [metrics, setMetrics] = useState<Metrics>({ length: 0, reps: 1 });

  const rawId = useId();
  const pathId = `text-loop-${rawId.replace(/:/g, '')}`;

  const d = useMemo(() => path || buildPath(shape, curviness, ribbonWidth), [path, shape, curviness, ribbonWidth]);

  const unit = useMemo(() => {
    const base = uppercase ? String(text).toUpperCase() : String(text);
    const gap = separator ? `\u00A0${separator}\u00A0` : '\u00A0\u00A0\u00A0';
    return `${base}${gap}`;
  }, [text, separator, uppercase]);

  const textStyle = useMemo<CSSProperties>(
    () => ({ fontSize: `${fontSize}px`, fontWeight, letterSpacing: `${letterSpacing}px` }),
    [fontSize, fontWeight, letterSpacing]
  );

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    const measureEl = measureRef.current;
    if (!pathEl || !measureEl) return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      let length = 0;
      let unitWidth = 0;
      try {
        length = pathEl.getTotalLength();
        unitWidth = measureEl.getComputedTextLength();
      } catch {
        return;
      }
      if (!length) return;

      const reps = unitWidth > 0 ? Math.max(1, Math.round(length / unitWidth)) : 1;
      setMetrics(prev => (prev.length === length && prev.reps === reps ? prev : { length, reps }));
    };

    measure();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [d, unit, fontSize, fontWeight, letterSpacing]);

  useEffect(() => {
    const { length } = metrics;
    const head = headRef.current;
    const tail = tailRef.current;
    if (!head || !tail || !length) return undefined;

    const apply = (offset: number) => {
      const partner = offset >= 0 ? offset - length : offset + length;
      head.setAttribute('startOffset', String(offset));
      tail.setAttribute('startOffset', String(partner));
    };

    apply(0);

    const prefersReduced =
      reducedMotion;
    if (prefersReduced || speed <= 0) return undefined;

    const state = { offset: 0 };
    const tween = gsap.to(state, {
      offset: direction === 'reverse' ? -length : length,
      duration: length / speed,
      ease: 'none',
      repeat: -1,
      onUpdate: () => apply(state.offset)
    });

    const root = rootRef.current;
    const pause = () => tween.pause();
    const resume = () => tween.resume();

    if (pauseOnHover && root) {
      root.addEventListener('pointerenter', pause);
      root.addEventListener('pointerleave', resume);
    }

    // Pausa fora da viewport e com a aba oculta — o original roda para
    // sempre enquanto montado. Mesma correção que `ScrollVelocity` e
    // `CircularGallery` levaram na Task 19: fita decorativa não gasta CPU de
    // quem não está olhando.
    // Nasce PAUSADA quando há observador. Antes começava com `visivel = true`
    // e só parava quando a primeira entrada do IntersectionObserver chegava —
    // e essa entrada é entregue numa tarefa posterior, que durante o
    // carregamento entra numa fila atrás da hidratação. Resultado medido no
    // Lighthouse mobile: a fita animava durante toda a janela em que o TBT é
    // contado, mesmo estando três telas abaixo da dobra. Cada quadro dela
    // reescreve `startOffset` de dois `textPath`, o que força o navegador a
    // recalcular texto sobre curva — 340 a 680ms de bloqueio por algo que
    // ninguém estava vendo. Com o valor inicial `false`, o primeiro quadro já
    // é parado e quem manda ligar é o observador.
    let visivel = false;
    const avaliar = () => {
      if (visivel && !document.hidden) tween.resume();
      else tween.pause();
    };
    const io = root
      ? new IntersectionObserver(
          (entradas) => {
            visivel = entradas[0]?.isIntersecting ?? true;
            avaliar();
          },
          { threshold: 0 }
        )
      : null;
    if (io && root) io.observe(root);
    else visivel = true; // sem observador não há quem ligue depois
    document.addEventListener('visibilitychange', avaliar);
    avaliar();

    return () => {
      tween.kill();
      io?.disconnect();
      document.removeEventListener('visibilitychange', avaliar);
      if (pauseOnHover && root) {
        root.removeEventListener('pointerenter', pause);
        root.removeEventListener('pointerleave', resume);
      }
    };
  }, [metrics, speed, direction, pauseOnHover, reducedMotion]);

  const loopText = unit.repeat(metrics.reps);
  const fitLength = metrics.length || undefined;

  return (
    <div ref={rootRef} className={`relative w-full overflow-hidden ${className}`.trim()} style={style}>
      <svg
        className="block w-full h-auto"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={text}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={d}
          fill="none"
          stroke={ribbon ? ribbonColor : 'none'}
          strokeWidth={ribbon ? ribbonWidth : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text ref={measureRef} className="invisible pointer-events-none" style={textStyle} aria-hidden="true">
          {unit}
        </text>

        <text className="select-none" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={headRef} href={`#${pathId}`} startOffset={0} textLength={fitLength} lengthAdjust="spacing">
            {loopText}
          </textPath>
        </text>

        <text className="select-none" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={tailRef} href={`#${pathId}`} startOffset={0} textLength={fitLength} lengthAdjust="spacing">
            {loopText}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default TextLoop;
