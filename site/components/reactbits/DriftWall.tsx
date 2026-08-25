'use client';

/**
 * Parede de fotos derivando em colunas 3D — Task 20, o fundo amarelo do hero
 * (dentro do palco do ScrollExpand, sobre o Silk). Origem:
 * src/ts-tailwind/Components/DriftWall/DriftWall.tsx (ver
 * components/reactbits/README.md para o commit e a lista completa).
 *
 * Modificações sobre o original:
 * 1. `'use client'` no topo (o original não declara).
 * 2. **`DEFAULT_ITEMS` removido** — eram 15 imagens de `picsum.photos`
 *    (rede a host de terceiro, proibida aqui). `items` é obrigatória.
 * 3. **`reducedMotion` virou prop** em vez dos DOIS `matchMedia` internos.
 *    Sob redução, o quadro é aplicado uma vez e o laço PARA — o original
 *    continuava rodando rAF para sempre mesmo reduzido.
 * 4. **O laço pausa fora da viewport e com a aba oculta** (mesma correção de
 *    `CircularGallery`/`TextLoop`).
 * 5. **Modo decorativo.** O original torna cada azulejo focável
 *    (`tabIndex={0} role="button"`) mesmo sem ação nenhuma — dezenas de
 *    falsos botões na ordem de tabulação. Com `decorativo`, os azulejos são
 *    `<div>` puros, o contêiner fica `aria-hidden` e o rótulo em inglês
 *    ("Drifting wall of tiles") não é emitido.
 * 6. **`<img>` → `next/image`** com o tamanho do azulejo (AVIF, sem excesso).
 * 7. `overlayColor` sem default fora da paleta — quem chama passa o token.
 * 12. **`next/image` trocado por `<img>` cru com a URL do otimizador**
 *    (revisão de entrega). Ver a nota no `renderTile`. Reverte parcialmente a
 *    modificação 6: o que interessava dela — passar pelo otimizador do Next —
 *    continua valendo via `lib/imgOtimizada.ts`; o que saiu foi a camada de
 *    componente de cliente, multiplicada por dezenas de azulejos.
 */

import { CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { urlImagemOtimizada } from '@/lib/imgOtimizada';

export interface DriftWallItem {
  image: string;
  title?: string;
  href?: string;
}

export interface DriftWallProps {
  /** Obrigatória (o default original era picsum.photos). */
  items: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: 'up' | 'down';
  variance?: number;
  parallax?: number;
  pauseOnHover?: boolean;
  lift?: number;
  fade?: number;
  dim?: number;
  grayscale?: boolean;
  overlayColor: string;
  /** Vem de `useCapability().podeAnimar`. */
  reducedMotion?: boolean;
  /** Parede puramente visual: sem foco, sem role, contêiner aria-hidden. */
  decorativo?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface ColumnMeta {
  copyHeight: number;
  copies: number;
}

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

const columnFactor = (index: number, variance: number): number => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

const DriftWall = ({
  items,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  grayscale = false,
  overlayColor,
  className = '',
  reducedMotion = false,
  decorativo = false,
  style
}: DriftWallProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const offsetsRef = useRef<number[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const hoveredColRef = useRef<number>(-1);
  const wallHoveredRef = useRef<boolean>(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const lastTsRef = useRef<number | null>(null);

  const [containerHeight, setContainerHeight] = useState(600);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const reduced = reducedMotion;

  const columnItems = useMemo<DriftWallItem[][]>(() => {
    const cols: DriftWallItem[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => cols[i % columns].push(item));
    return cols.map(col => (col.length ? col : items.slice(0, 1)));
  }, [items, columns]);

  const columnMeta = useMemo<ColumnMeta[]>(() => {
    const unit = tileHeight + gap;
    return columnItems.map(col => {
      const copyHeight = Math.max(unit, col.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnItems, tileHeight, gap, containerHeight]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height || 600);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const baseVelocities = useMemo<number[]>(() => {
    const dirSign = direction === 'up' ? 1 : -1;
    return columnItems.map((_, c) => {
      const altSign = c % 2 === 0 ? 1 : -1;
      return speed * columnFactor(c, variance) * dirSign * altSign;
    });
  }, [columnItems, speed, direction, variance]);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnMeta, columnItems]);

  const ultimoPlanoRef = useRef<string>('');

  const applyPlaneTransform = useCallback(
    (px: number, py: number) => {
      const plane = planeRef.current;
      if (!plane) return;
      // MODIFICAÇÃO Nº13 (travamento no hero). O original reescrevia este
      // transform a CADA quadro. O plano é a raiz de um `preserve-3d` com
      // ~92 azulejos: mudar a rotação dele obriga o compositor a rasterizar a
      // subárvore inteira de novo, em perspectiva. Só que o valor quase
      // sempre não muda — `parallax` é 0 em qualquer aparelho de toque
      // (Hero.tsx passa `pontoFino ? 0.5 : 0`), e no desktop com o ponteiro
      // parado a suavização converge. O amortecimento é exponencial, então
      // ele nunca chega ao alvo em ponto flutuante: sem arredondar, a string
      // muda para sempre em casas decimais invisíveis.
      //
      // Duas casas = 0,01deg, abaixo do que qualquer tela mostra. Comparar a
      // string pronta (e não os números) faz o guard cobrir também `tilt`,
      // `turn`, `roll` e `depth` mudando por prop, sem precisar invalidar
      // nada à mão.
      const t =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${(tilt + py).toFixed(2)}deg) rotateY(${(turn + px).toFixed(2)}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth}px)`;
      if (t === ultimoPlanoRef.current) return;
      ultimoPlanoRef.current = t;
      plane.style.transform = t;
    },
    [tilt, turn, roll, depth]
  );

  useEffect(() => {
    const animate = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      const maxTilt = parallax * 8;
      const targetX = pointerRef.current.x * maxTilt;
      const targetY = -pointerRef.current.y * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.12);
      pointerDampedRef.current.x += (targetX - pointerDampedRef.current.x) * damp;
      pointerDampedRef.current.y += (targetY - pointerDampedRef.current.y) * damp;
      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y);

      // MODIFICAÇÃO Nº16 (travamento no hero). No modo decorativo a deriva das
      // colunas saiu daqui e virou animação de CSS (`estiloTrilha`, abaixo).
      // Este laço escrevia `transform` em dez colunas a cada quadro, na thread
      // principal, durante todo o tempo em que a parede estivesse visível — e
      // no hero isso é a tela inteira até a seção de tratamentos.
      if (!decorativo) {
        if (!reduced) {
          for (let c = 0; c < trackRefs.current.length; c++) {
            const meta = columnMeta[c];
            if (!meta) continue;
            const paused = wallHoveredRef.current && pauseOnHover;
            const factor = paused || hoveredColRef.current === c ? 0 : 1;
            const target = baseVelocities[c] * factor;

            const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
            velocitiesRef.current[c] += (target - velocitiesRef.current[c]) * ease;
            let next = (offsetsRef.current[c] ?? 0) + velocitiesRef.current[c] * dt;
            next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
            offsetsRef.current[c] = next;

            const el = trackRefs.current[c];
            if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
          }
        } else {
          for (let c = 0; c < trackRefs.current.length; c++) {
            const el = trackRefs.current[c];
            const meta = columnMeta[c];
            if (el && meta) el.style.transform = `translate3d(0, ${-(offsetsRef.current[c] ?? 0)}px, 0)`;
          }
        }
      }

      // Sem movimento a reagendar, o laço encerra: com a deriva no CSS, o
      // único motivo para continuar é a suavização do parallax de ponteiro,
      // e ela não existe quando `parallax` é 0 (todo aparelho de toque).
      const precisaDeOutroQuadro = reduced ? false : !decorativo || parallax > 0;
      if (precisaDeOutroQuadro) rafRef.current = requestAnimationFrame(animate);
      else rafRef.current = null;
    };

    // Pausa fora da viewport e com a aba oculta (modificação nº4) — parede
    // decorativa não gasta CPU de quem não está olhando.
    let visivel = true;
    // Com a deriva no CSS, quem precisa parar fora da tela não é mais o rAF
    // (que no modo decorativo já nem roda quando `parallax` é 0) e sim a
    // animação. O navegador desacelera animação de aba oculta sozinho, mas
    // não sabe que esta parede saiu de vista com a aba ainda aberta — e uma
    // animação infinita mantém o compositor acordado de graça. `avaliar()`
    // continua sendo a mesma fonte de verdade das duas coisas.
    const trilhas = () => (decorativo ? trackRefs.current.filter(Boolean) : []);
    const ligar = () => {
      for (const el of trilhas()) if (el) el.style.animationPlayState = 'running';
      if (rafRef.current != null) return;
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    };
    const desligar = () => {
      for (const el of trilhas()) if (el) el.style.animationPlayState = 'paused';
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
    const avaliar = () => {
      if (visivel && !document.hidden) ligar();
      else desligar();
    };
    const io = new IntersectionObserver(
      (entradas) => {
        visivel = entradas[0]?.isIntersecting ?? true;
        avaliar();
      },
      { threshold: 0 }
    );
    if (containerRef.current) io.observe(containerRef.current);
    document.addEventListener('visibilitychange', avaliar);
    avaliar();

    return () => {
      desligar();
      io.disconnect();
      document.removeEventListener('visibilitychange', avaliar);
    };
  }, [baseVelocities, columnMeta, pauseOnHover, parallax, reduced, decorativo, applyPlaneTransform]);

  const activate = useCallback((id: string, index: number): void => {
    activeIdRef.current = id;
    hoveredColRef.current = index;
    setActiveId(id);
  }, []);
  const release = useCallback((): void => {
    activeIdRef.current = null;
    hoveredColRef.current = -1;
    setActiveId(null);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (parallax > 0 && !reduced) {
        pointerRef.current = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5
        };
      }
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const tile = hit && hit.closest ? (hit.closest('[data-tile-id]') as HTMLElement | null) : null;
      if (!tile) return;
      const id = tile.dataset.tileId ?? null;
      if (id === activeIdRef.current) return;
      activeIdRef.current = id;
      hoveredColRef.current = Number(tile.dataset.col);
      setActiveId(id);
    },
    [parallax, reduced]
  );

  const handlePointerLeaveWall = useCallback((): void => {
    wallHoveredRef.current = false;
    pointerRef.current = { x: 0, y: 0 };
    release();
  }, [release]);

  const maskStyle =
    'radial-gradient(ellipse 78% 82% at 50% 46%, #000 var(--dw-edge), transparent 100%), ' +
    'linear-gradient(to top, #000 var(--dw-edge), transparent 100%)';

  const cssVars = useMemo<CSSProperties>(
    () =>
      ({
        '--dw-tile-w': `${tileWidth}px`,
        '--dw-tile-h': `${tileHeight}px`,
        '--dw-gap': `${gap}px`,
        '--dw-radius': `${radius}px`,
        '--dw-lift': `${lift}px`,
        '--dw-dim': dim,
        '--dw-gray': grayscale ? 1 : 0,
        '--dw-overlay': overlayColor,
        '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
        perspective: `${perspective}px`,
        perspectiveOrigin: '50% 50%',
        WebkitMaskImage: maskStyle,
        maskImage: maskStyle,
        WebkitMaskComposite: 'source-in',
        maskComposite: 'intersect',
        ...style
      }) as CSSProperties,
    [tileWidth, tileHeight, gap, radius, lift, dim, grayscale, overlayColor, fade, perspective, maskStyle, style]
  );

  // MODIFICAÇÃO Nº14 (travamento no hero). O azulejo do original carrega a
  // máquina inteira de interação: `translateZ(0)` para ter camada própria,
  // `preserve-3d` para o levantar em Z, `cursor-pointer`, e transições de
  // transform/opacity/box-shadow/filter para os estados de hover e foco.
  //
  // Em `decorativo` nada disso roda — o azulejo é `aria-hidden`, não recebe
  // foco, não tem href e não reage a ponteiro. O que sobrava era só a conta:
  // MEDIDO no hero em 1440×900, com a parede de 92 fotos, o `translateZ(0)`
  // promovia cada azulejo a camada composta. Dava 350 camadas e 62
  // megapixels de área de camada na página, e o `Commit` (empurrar a árvore
  // de camadas para o compositor) custava 5141ms em 382 quadros — 13,5ms por
  // quadro, sozinho mais que o orçamento inteiro de 60fps.
  //
  // O movimento não perde nada: quem anima é a COLUNA (uma camada, com
  // `will-change-transform`), e os azulejos vão junto como conteúdo pintado
  // dela. O filtro fica — ele é a aparência da parede, não custo de camada.
  // MODIFICAÇÃO Nº16 (continuação). A deriva de cada coluna como animação de
  // CSS, para o compositor tocar sozinho.
  //
  // `--dw-loop` é a altura de UMA cópia; a trilha tem duas ou mais, então
  // andar uma cópia e reiniciar não deixa emenda. A duração sai da mesma
  // velocidade que o laço em JS usava (`baseVelocities`, em px/s), e o
  // deslocamento inicial de cada coluna vira `animation-delay` NEGATIVO —
  // é assim que se começa uma animação de CSS já no meio.
  //
  // Metade das colunas tem velocidade negativa (o sinal alternado de
  // `baseVelocities`) e desce em vez de subir. Como a posição se repete a
  // cada `L`, começar em `-offset` para quem desce é o mesmo que começar em
  // `L - offset`, e é essa a conta do atraso no ramo de baixo.
  //
  // Sob movimento reduzido não entra animação nenhuma: fica o mesmo quadro
  // estático que o laço aplicava.
  const estiloTrilha = useCallback(
    (c: number): CSSProperties | undefined => {
      if (!decorativo) return undefined;
      const meta = columnMeta[c];
      const v = baseVelocities[c];
      if (!meta || !v) return undefined;
      const L = meta.copyHeight;
      const inicial = L * ((c * 0.37) % 1);
      if (reduced) return { transform: `translate3d(0, ${-inicial}px, 0)` };
      const modulo = Math.abs(v);
      const paraCima = v > 0;
      return {
        ['--dw-loop']: `${L}px`,
        animation: `${paraCima ? 'dw-deriva-cima' : 'dw-deriva-baixo'} ${(L / modulo).toFixed(3)}s linear infinite`,
        animationDelay: `-${((paraCima ? inicial : L - inicial) / modulo).toFixed(3)}s`,
      } as CSSProperties;
    },
    [decorativo, columnMeta, baseVelocities, reduced]
  );

  const tileClass = cx(
    'group/tile relative block flex-none outline-none w-full h-[calc(var(--dw-tile-h)+var(--dw-gap))]',
    !decorativo && 'cursor-pointer [transform-style:preserve-3d]'
  );
  const innerClass = cx(
    'pointer-events-none absolute inset-[calc(var(--dw-gap)/2)] block overflow-hidden bg-[#0b0b12]',
    'rounded-[var(--dw-radius)] opacity-[var(--dw-dim)]',
    !decorativo && cx(
      '[transform:translateZ(0)]',
      'transition-[transform,opacity,box-shadow] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
      'group-[.is-active]/tile:opacity-100 group-[.is-active]/tile:[transform:translateZ(var(--dw-lift))]',
      'group-[.is-active]/tile:shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)]',
      'group-focus-visible/tile:opacity-100 group-focus-visible/tile:[transform:translateZ(var(--dw-lift))]',
      'group-focus-visible/tile:shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7),0_0_0_2px_rgba(255,255,255,0.9)]'
    )
  );
  const imgClass = cx(
    'block h-full w-full select-none object-cover',
    '[filter:grayscale(var(--dw-gray))_saturate(0.92)]',
    !decorativo && cx(
      'transition-[filter] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
      'group-[.is-active]/tile:[filter:grayscale(0)_saturate(1.05)] group-focus-visible/tile:[filter:grayscale(0)_saturate(1.05)]'
    )
  );
  const overlayClass = cx(
    'pointer-events-none absolute inset-0 bg-[var(--dw-overlay)] opacity-[0.42]',
    !decorativo && cx(
      'transition-opacity duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
      'group-[.is-active]/tile:opacity-0 group-focus-visible/tile:opacity-0'
    )
  );

  const renderTile = (item: DriftWallItem, id: string, colIndex: number) => {
    const inner = (
      <span className={innerClass}>
        {/* `<img>` cru com a URL do otimizador, e não `next/image`
            (modificação 12). A parede desenha dezenas de azulejos — 92 num
            monitor largo, 36 num celular — e cada `next/image` é um
            componente de cliente que o React precisa hidratar. Medido: era o
            maior bloco de nós da página inteira (464 de 1.079) e engordava a
            tarefa de hidratação, que é o que faz a página parecer travada.
            `urlImagemOtimizada` monta a MESMA rota `/_next/image` que o
            componente geraria, com a largura do azulejo (que a função arredonda
            para o próximo tamanho que o otimizador aceita) — o ganho de peso
            (AVIF, tamanho certo) continua igual; some só a camada de React.
            É a mesma solução que a `CircularGallery` já usava por outro
            motivo (WebGL precisa de um HTMLImageElement cru). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urlImagemOtimizada(item.image, tileWidth)}
          alt={item.title ?? ''}
          width={tileWidth}
          height={tileHeight}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={imgClass}
        />
        <span className={overlayClass} aria-hidden="true" />
      </span>
    );
    const commonProps = {
      className: cx(tileClass, activeId === id && 'is-active'),
      'data-tile-id': id,
      'data-col': colIndex,
      onFocus: () => activate(id, colIndex),
      onBlur: release
    };
    if (item.href) {
      return (
        <a key={id} href={item.href} target="_blank" rel="noreferrer noopener" {...commonProps}>
          {inner}
        </a>
      );
    }
    if (decorativo) {
      // Sem tabIndex nem role: azulejo que não faz nada não pode fingir ser
      // botão — o original punha dezenas de falsos botões na tabulação.
      return (
        <div key={id} {...commonProps}>
          {inner}
        </div>
      );
    }
    return (
      <div key={id} tabIndex={0} role="button" aria-label={item.title ?? 'tile'} {...commonProps}>
        {inner}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cx('relative h-full w-full overflow-hidden', className)}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        wallHoveredRef.current = true;
      }}
      onPointerLeave={handlePointerLeaveWall}
      role={decorativo ? undefined : 'group'}
      aria-hidden={decorativo || undefined}
      aria-label={decorativo ? undefined : 'Mosaico de fotos'}
    >
      <div
        ref={planeRef}
        className="absolute left-1/2 top-1/2 flex cursor-pointer flex-row [transform-style:preserve-3d] [transform-origin:50%_50%] will-change-transform"
      >
        {columnItems.map((col, c) => {
          const meta = columnMeta[c];
          const copies = Array.from({ length: meta.copies });
          return (
            <div
              // MODIFICAÇÃO Nº15 (travamento no hero). `preserve-3d` na coluna
              // e na trilha só serve para azulejo que tem Z próprio — que é o
              // caso do modo interativo, onde o hover levanta o azulejo em
              // `translateZ(var(--dw-lift))`. Em `decorativo` ninguém levanta
              // nada, e o efeito colateral é caro: dentro de um contexto 3D o
              // navegador promove CADA filho a camada composta.
              //
              // Achatando, os azulejos da coluna viram conteúdo pintado de UMA
              // camada, que o plano transforma em 3D como um todo. A projeção
              // é a mesma — todos os azulejos são coplanares, então achatar
              // antes ou depois de projetar dá o mesmo pixel.
              className={cx(
                'relative w-[calc(var(--dw-tile-w)+var(--dw-gap))]',
                !decorativo && '[transform-style:preserve-3d]'
              )}
              key={`col-${c}`}
            >
              <div
                className={cx(
                  'flex flex-col will-change-transform',
                  !decorativo && '[transform-style:preserve-3d]'
                )}
                style={estiloTrilha(c)}
                ref={el => {
                  trackRefs.current[c] = el;
                }}
              >
                {copies.map((_, copyIndex) =>
                  col.map((item, itemIndex) => renderTile(item, `${c}-${copyIndex}-${itemIndex}`, c))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriftWall;
