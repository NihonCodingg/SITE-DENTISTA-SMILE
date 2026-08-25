'use client';

/**
 * Sanfona de painéis: um painel aberto, os outros comprimidos, trocando por
 * hover, toque, foco ou seta do teclado — Task 21, a seção de depoimentos.
 * Origem: src/ts-tailwind/Components/AccordionGallery/AccordionGallery.tsx
 * (ver components/reactbits/README.md para o commit e a lista completa).
 *
 * Modificações sobre o original:
 * 1. `'use client'` no topo (o original não declara).
 * 2. **`reducedMotion` virou prop.** O original chamava
 *    `window.matchMedia('(prefers-reduced-motion: reduce)')` no corpo do
 *    componente; a fonte única deste projeto é `useCapability()`.
 * 3. **`DEFAULT_ITEMS` removido.** Eram cinco fotos do `picsum.photos` —
 *    chamada de rede a terceiro embutida no default. `items` passou a ser
 *    obrigatório.
 * 4. **`<img>` trocado por `next/image`** (`fill` + `sizes`), como em todo
 *    componente vendorizado deste projeto: os pôsteres passam pelo
 *    otimizador em vez de sair crus.
 * 5. **`role="list"`/`role="listitem"` removidos.** No original cada painel é
 *    um `<a>` com `role="listitem"` — o role sobrescreve a semântica de link,
 *    e um leitor de tela deixa de anunciar que aquilo abre algo. Como cada
 *    painel aqui É um link para o Instagram, o que importa é justamente ser
 *    anunciado como link. O nome acessível de cada um vem de `ariaLabel` no
 *    item (em português, escrito pela seção).
 * 6. **`target="_blank"`/`rel` opcionais** (`abrirEmNovaAba`): o original só
 *    navega na mesma aba, e os links daqui saem do site.
 * 7. **`--ag-dim` passou a ser animado no PAINEL, não na mídia.** Bug do
 *    original: a variável era escrita no `<span>` da mídia, e lida no
 *    `<span>` do overlay — que é IRMÃO dela, não filho. A herança nunca
 *    chegava, então o overlay usava para sempre o fallback `0.35` e o painel
 *    aberto ficava escurecido igual aos fechados. Escrita no painel (ancestral
 *    dos dois), a variável cascateia e o escurecimento passa a existir de
 *    verdade.
 * 8. **Os saltos `max-[520px]:` foram removidos.** O original vira coluna
 *    sozinho abaixo de 520px, mas mantém a altura da linha e o
 *    `width: var(--ag-media-size)` da mídia por estilo inline — que nenhuma
 *    media query alcança. Resultado: no celular a mídia continua dimensionada
 *    como se a sanfona fosse horizontal. Aqui `orientation` é decidida por
 *    quem chama (o mesmo idioma que `AntesDepois.tsx` já usa para medir a
 *    tela), e a mídia acompanha.
 * 9. **`selo`**: nó opcional desenhado por cima de cada painel. Estes painéis
 *    são pôsteres de vídeo, não fotos — sem um indicador de "play" nada na
 *    tela diz que o clique abre um reel.
 * 10. **`contain: layout`** na raiz. O efeito anima `flex-grow`, que é
 *    layout — exceção consciente à regra do projeto (só transform/opacity/
 *    clip-path animam), porque é o próprio mecanismo do componente. O
 *    `contain` prende esse recálculo à sanfona, para que ele não suba e
 *    reorganize a página inteira a cada quadro.
 * 11. `willChange` só quando há movimento (o original deixa a dica fixa; o CSS
 *    do original a removia sob `prefers-reduced-motion`, o que a variante
 *    Tailwind perdeu ao virar estilo inline).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
  /** Nome acessível do link — escrito pela seção, em português. */
  ariaLabel?: string;
}

export interface AccordionGalleryProps {
  items: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  panelColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
  labelClassName?: string;
  /** Vem de `useCapability().podeAnimar` — o componente não consulta matchMedia. */
  reducedMotion?: boolean;
  abrirEmNovaAba?: boolean;
  /** Desenhado por cima de todo painel (ver modificação 9). */
  selo?: ReactNode;
  sizes?: string;
}

const AccordionGallery = ({
  items,
  defaultIndex = 0,
  accentColor = '#ffffff',
  overlayColor = '#060010',
  textColor = '#ffffff',
  panelColor = '#0a0713',
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = '',
  labelClassName = '',
  reducedMotion = false,
  abrirEmNovaAba = false,
  selo,
  sizes = '100vw',
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === 'vertical';
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));

  const overlayBg = `linear-gradient(180deg, transparent 45%, color-mix(in srgb, ${overlayColor} 78%, transparent) 100%), color-mix(in srgb, ${overlayColor} calc(var(--ag-dim, 0.35) * 100%), transparent)`;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !reducedMotion ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        // `--ag-dim` vai no painel (ver modificação 7): é o ancestral comum da
        // mídia e do overlay, então é daqui que a variável cascateia.
        tl.to(
          panel,
          { flexGrow: isActive ? grow : 1, ...rotProp, '--ag-dim': isActive ? 0 : 0.35, duration: dur, ease },
          0
        );

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              '--ag-gray': gray,
              duration: dur,
              ease,
            },
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: reducedMotion ? 0 : stagger }, 0);
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [active, count, expandRatio, duration, ease, vertical, tilt, parallax, grayscale, showLabels, stagger, reducedMotion]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  const handleEnter = (i: number) => {
    if (trigger === 'hover') setActive(i);
  };

  // Primeiro clique abre o painel; o segundo é que segue o link. É o que faz o
  // componente funcionar no toque, onde não existe hover.
  const handleClick = (i: number, e: MouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`flex ${vertical ? 'flex-col' : 'flex-row'} w-full max-w-full [contain:layout] [perspective:1400px] ${className}`.trim()}
      style={{ gap: `${gap}px`, height: `${height}px` }}
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = (item.link ? 'a' : 'div') as 'a';
        return (
          <Tag
            key={item.image}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el;
            }}
            className="group relative block min-h-0 min-w-0 flex-[1_1_0] cursor-pointer overflow-hidden no-underline outline-none [transform-style:preserve-3d] [transform-origin:center] [box-shadow:0_10px_30px_-18px_rgba(0,0,0,0.8)] focus-visible:[box-shadow:0_0_0_2px_var(--ag-accent),0_10px_30px_-18px_rgba(0,0,0,0.8)]"
            style={
              {
                borderRadius: `${radius}px`,
                background: panelColor,
                '--ag-accent': accentColor,
                willChange: reducedMotion ? undefined : 'flex-grow, transform',
              } as CSSProperties
            }
            href={item.link || undefined}
            target={item.link && abrirEmNovaAba ? '_blank' : undefined}
            rel={item.link && abrirEmNovaAba ? 'noopener noreferrer' : undefined}
            onClick={(e) => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.ariaLabel || item.label}
          >
            <span className="absolute inset-0 overflow-hidden [border-radius:inherit]">
              <span
                ref={(el: HTMLElement | null) => {
                  mediaRefs.current[i] = el;
                }}
                className="absolute top-1/2 left-1/2 [filter:grayscale(var(--ag-gray,1))]"
                style={{
                  width: vertical ? '100%' : 'var(--ag-media-size, 320px)',
                  height: vertical ? 'var(--ag-media-size, 320px)' : '100%',
                  willChange: reducedMotion ? undefined : 'transform, filter',
                }}
              >
                <Image
                  src={item.image}
                  alt={item.alt || ''}
                  fill
                  sizes={sizes}
                  draggable={false}
                  className="block select-none object-cover [-webkit-user-drag:none]"
                />
              </span>
              <span className="pointer-events-none absolute inset-0" style={{ background: overlayBg }} aria-hidden="true" />
            </span>

            {selo ? (
              <span className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center" aria-hidden="true">
                {selo}
              </span>
            ) : null}

            {showLabels && (
              <span className="pointer-events-none absolute right-5 bottom-5 left-5 z-[2] flex items-center gap-3" aria-hidden="true">
                <span
                  ref={(el: HTMLElement | null) => {
                    barRefs.current[i] = el;
                  }}
                  className="h-[26px] w-[3px] flex-none rounded-[3px] opacity-0"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 12px color-mix(in srgb, ${accentColor} 60%, transparent)`,
                  }}
                />
                <span
                  ref={(el: HTMLElement | null) => {
                    textRefs.current[i] = el;
                  }}
                  className={`overflow-hidden text-ellipsis whitespace-nowrap opacity-0 [text-shadow:0_2px_14px_rgba(0,0,0,0.55)] ${labelClassName}`.trim()}
                  style={{ color: textColor }}
                >
                  {item.label}
                </span>
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
