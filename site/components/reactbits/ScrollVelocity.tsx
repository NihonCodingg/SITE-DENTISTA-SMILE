'use client';

/**
 * Trilha de texto que rola horizontalmente e acelera com a velocidade do
 * scroll — recuperado na Task 19 ("maximizar React Bits"). Origem:
 * src/ts-tailwind/TextAnimations/ScrollVelocity/ScrollVelocity.tsx (ver
 * components/reactbits/README.md para o commit de referência).
 *
 * Até a Task 19 este projeto implementava isso à mão em
 * `components/sections/Ticker.tsx` — decisão registrada em
 * `components/reactbits/README.md`, revertida pela mesma decisão do
 * parceiro que trouxe o `StaggeredMenu`/`Silk` de volta.
 *
 * Modificações sobre o original:
 * 1. **Pausa fora da viewport e com a aba oculta.** O original monta
 *    `useAnimationFrame` (motion/react) incondicionalmente — nunca checa
 *    visibilidade, exatamente o motivo pelo qual não tinha sido vendorizado
 *    antes. Adicionado: um `IntersectionObserver` no container (`parallax`)
 *    e uma checagem de `document.hidden`, no MESMO padrão de
 *    `Silk.tsx`/`Ticker.tsx` — o callback do `useAnimationFrame`
 *    continua sendo chamado a cada frame pelo ticker global da Motion (não
 *    dá pra cancelar o registro sem desmontar o hook), mas agora só
 *    atualiza `baseX` quando visível e com a aba em primeiro plano; fora
 *    disso é um retorno antecipado, custo desprezível.
 * 2. **Tipografia do original removida do template fixo.** `scrollerClassName`
 *    entrava concatenado a classes hardcoded (`text-4xl font-bold
 *    tracking-[-0.02em] drop-shadow md:text-[5rem] md:leading-[5rem]`) —
 *    cascata do Tailwind não garante que uma classe short-hand externa
 *    vença uma classe de tamanho igual já presente no template. Removidas;
 *    a tipografia agora é 100% responsabilidade de quem chama (ver
 *    `Ticker.tsx`, que passa as classes da pílula amarela existente).
 * 3. `scrollContainerRef?: React.RefObject<HTMLElement>` virou
 *    `RefObject<HTMLElement | null>` — o React 19 mudou o retorno de
 *    `useRef<T>(null)` pra `RefObject<T | null>`; o tipo antigo não aceitava
 *    a maioria dos refs reais criados com `useRef`.
 * 4. `'use client'` já estava implícito pelo uso de hooks, mas nenhuma
 *    mudança de comportamento — apenas explicitado no topo, mesmo padrão
 *    dos outros arquivos deste diretório.
 * 5. Nenhuma chamada de rede, nenhum `matchMedia` próprio (usa só
 *    `motion/react`) — quem decide se este componente existe na árvore é
 *    `Ticker.tsx`, via `useCapability().podeAnimar` (fonte única,
 *    inalterado).
 * 6. `VelocityText` movido para escopo de módulo — no original ele era
 *    definido DENTRO do corpo de `ScrollVelocity`, uma nova definição de
 *    componente a cada render do pai. Não chegava a quebrar nada aqui (as
 *    props de `ScrollVelocity` não mudam depois do mount), mas é o tipo de
 *    padrão que remonta os filhos à toa se o pai re-renderizar por outro
 *    motivo — corrigido por ser mais correto, sem custo nenhum de
 *    comportamento observável.
 */

import { useRef, useLayoutEffect, useState, type ReactNode, type RefObject, type CSSProperties } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from 'motion/react';

interface VelocityMapping {
  input: [number, number];
  output: [number, number];
}

interface VelocityTextProps {
  children: ReactNode;
  baseVelocity: number;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: CSSProperties;
  scrollerStyle?: CSSProperties;
}

export interface ScrollVelocityProps {
  scrollContainerRef?: RefObject<HTMLElement | null>;
  texts: ReactNode[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: CSSProperties;
  scrollerStyle?: CSSProperties;
}

function useElementWidth<T extends HTMLElement>(ref: RefObject<T | null>): number {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) setWidth(ref.current.offsetWidth);
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);

  return width;
}

function VelocityText({
  children,
  baseVelocity,
  scrollContainerRef,
  className = '',
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
}: VelocityTextProps) {
  const baseX = useMotionValue(0);
  const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
  const { scrollY } = useScroll(scrollOptions);
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: damping ?? 50, stiffness: stiffness ?? 400 });
  const velocityFactor = useTransform(smoothVelocity, velocityMapping?.input || [0, 1000], velocityMapping?.output || [0, 5], {
    clamp: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);

  function wrap(min: number, max: number, v: number): number {
    const range = max - min;
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  }

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return '0px';
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  // Visibilidade: mesmo padrão de Silk.tsx/Ticker.tsx. Guardado
  // em refs (não estado) — não precisa re-renderizar nada, só ser lido
  // dentro do callback de useAnimationFrame abaixo.
  const visivelRef = useRef(false);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visivelRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(el);
    return () => intersectionObserver.disconnect();
  }, []);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((_t, delta) => {
    if (!visivelRef.current || document.hidden) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const spans = [];
  for (let i = 0; i < (numCopies ?? 6); i++) {
    spans.push(
      <span className={`flex-shrink-0 ${className}`} key={i} ref={i === 0 ? copyRef : undefined}>
        {children}&nbsp;
      </span>
    );
  }

  return (
    <div ref={containerRef} className={`${parallaxClassName ?? ''} relative overflow-hidden`} style={parallaxStyle}>
      <motion.div className={`${scrollerClassName ?? ''} flex whitespace-nowrap`} style={{ x, ...scrollerStyle }}>
        {spans}
      </motion.div>
    </div>
  );
}

export const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = '',
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
}) => {
  return (
    <section>
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {text}
        </VelocityText>
      ))}
    </section>
  );
};

export default ScrollVelocity;
