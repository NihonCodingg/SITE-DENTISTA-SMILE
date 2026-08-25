'use client';

/**
 * Bloco que se abre e se fecha com a altura animada — Task 21, o CTA
 * "Agendar minha avaliação".
 *
 * Origem: cult-ui, `apps/www/registry/default/ui/expandable.tsx`
 * (https://github.com/nolly-studio/cult-ui, licença MIT — ver `LICENSE.md`
 * nesta pasta). Ver `README.md` aqui do lado para o commit de referência e a
 * lista completa de modificações.
 *
 * Modificações sobre o original:
 * 1. **`ExpandableCard`, `ExpandableCardHeader`, `ExpandableCardContent` e
 *    `ExpandableCardFooter` não vieram.** São cascas de estilo do shadcn: o
 *    `cn()` de `@/lib/utils` (clsx + tailwind-merge, que este projeto não
 *    tem) e tokens de tema do shadcn (`hsl(var(--border))`, `bg-muted`,
 *    `ring-border`) que aqui não existem — a paleta do site é outra. O
 *    comportamento inteiro mora em `Expandable`, `ExpandableTrigger` e
 *    `ExpandableContent`; o visual é do projeto.
 * 2. **`react-use-measure` trocado por um hook local** (`useAltura`, com
 *    `ResizeObserver`) — a única coisa que o pacote fazia aqui era medir a
 *    altura do conteúdo. Mesmo critério do `SplitText` (Task 8), onde
 *    `@gsap/react` foi substituído por `useEffect`: não adicionar dependência
 *    para o que o navegador já resolve.
 * 3. **O gatilho virou `<button>` de verdade.** O original é um `<div>` com
 *    `role="button"`, `tabIndex={0}` e um `onKeyDown` que reimplementa Enter e
 *    Espaço à mão — um botão nativo já traz tudo isso, mais o foco visível e o
 *    tipo certo dentro de formulário. Ganhou também `aria-expanded` e
 *    `aria-controls`, que o original não tem: sem eles, quem usa leitor de
 *    tela não sabe que o botão abre algo, nem se está aberto.
 * 4. **`aria-label="Toggle expand"` removido** — além de estar em inglês, ele
 *    APAGAVA o texto do botão para o leitor de tela ("Agendar minha avaliação"
 *    virava "Toggle expand"). O nome acessível agora é o próprio rótulo.
 * 5. **`reducedMotion` virou prop**, alimentada por `useCapability()`. Sob
 *    movimento reduzido a abertura é imediata em vez de mola — reduzir, não
 *    zerar: o conteúdo continua abrindo e fechando.
 * 6. **`any` eliminado** dos tipos de animação (`TargetAndTransition` do
 *    motion) e o tipo `AnimationConfig`, que o original declara e nunca usa,
 *    não veio.
 *
 * Sobre animar altura: o projeto anima só `transform`/`opacity`/`clip-path`.
 * Aqui a altura É o mecanismo — é o que "expandir" quer dizer. Exceção
 * consciente e limitada: acontece por clique (nunca por scroll), num bloco só,
 * e o que se mexe é o fluxo abaixo dele, que é o comportamento esperado de um
 * conteúdo que se revela.
 */

import { createContext, forwardRef, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import type { HTMLMotionProps, TargetAndTransition } from 'motion/react';

const springConfig = { stiffness: 200, damping: 20, bounce: 0.2 };

interface ExpandableContextType {
  isExpanded: boolean;
  toggleExpand: () => void;
  transitionDuration: number;
  easeType: 'easeInOut' | 'easeIn' | 'easeOut' | 'linear' | [number, number, number, number];
  reducedMotion: boolean;
  contentId?: string;
}

const ExpandableContext = createContext<ExpandableContextType>({
  isExpanded: false,
  toggleExpand: () => {},
  transitionDuration: 0.3,
  easeType: 'easeInOut',
  reducedMotion: false,
});

const useExpandable = () => useContext(ExpandableContext);

/** Mede a altura de um elemento (substitui `react-use-measure`, modificação 2). */
function useAltura<T extends HTMLElement>(): [(el: T | null) => void, number] {
  const [altura, setAltura] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = (el: T | null) => {
    observerRef.current?.disconnect();
    if (!el) return;
    setAltura(el.getBoundingClientRect().height);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entrada]) => setAltura(entrada.target.getBoundingClientRect().height));
    ro.observe(el);
    observerRef.current = ro;
  };

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, altura];
}

type ExpandablePropsBase = Omit<HTMLMotionProps<'div'>, 'children'>;

interface ExpandableProps extends ExpandablePropsBase {
  children: ReactNode | ((props: { isExpanded: boolean }) => ReactNode);
  expanded?: boolean;
  onToggle?: () => void;
  transitionDuration?: number;
  easeType?: 'easeInOut' | 'easeIn' | 'easeOut' | 'linear' | [number, number, number, number];
  initialDelay?: number;
  /** Vem de `useCapability().podeAnimar` — o componente não consulta matchMedia. */
  reducedMotion?: boolean;
  /** `id` do bloco que abre, para o `aria-controls` do gatilho. */
  contentId?: string;
}

const Expandable = forwardRef<HTMLDivElement, ExpandableProps>(function Expandable(
  {
    children,
    expanded,
    onToggle,
    transitionDuration = 0.3,
    easeType = 'easeInOut',
    initialDelay = 0,
    reducedMotion = false,
    contentId,
    ...props
  },
  ref
) {
  const [isExpandedInternal, setIsExpandedInternal] = useState(false);
  const isExpanded = expanded !== undefined ? expanded : isExpandedInternal;
  const toggleExpand = onToggle || (() => setIsExpandedInternal((prev) => !prev));

  const contextValue: ExpandableContextType = {
    isExpanded,
    toggleExpand,
    transitionDuration: reducedMotion ? 0 : transitionDuration,
    easeType,
    reducedMotion,
    contentId,
  };

  return (
    <ExpandableContext.Provider value={contextValue}>
      <motion.div
        ref={ref}
        initial={false}
        transition={{ duration: contextValue.transitionDuration, ease: easeType, delay: initialDelay }}
        {...props}
      >
        {typeof children === 'function' ? children({ isExpanded }) : children}
      </motion.div>
    </ExpandableContext.Provider>
  );
});

type AnimationPreset = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
};

const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  'slide-up': { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 } },
  'slide-down': { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } },
  scale: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 } },
};

const ExpandableContent = forwardRef<
  HTMLDivElement,
  Omit<HTMLMotionProps<'div'>, 'ref'> & { preset?: keyof typeof ANIMATION_PRESETS }
>(function ExpandableContent({ children, preset, ...props }, ref) {
  const { isExpanded, transitionDuration, easeType, reducedMotion, contentId } = useExpandable();
  const [medirRef, alturaMedida] = useAltura<HTMLDivElement>();
  const alturaAnimada = useMotionValue(0);
  const alturaSuave = useSpring(alturaAnimada, springConfig);

  useEffect(() => {
    alturaAnimada.set(isExpanded ? alturaMedida : 0);
  }, [isExpanded, alturaMedida, alturaAnimada]);

  const animacao = preset ? ANIMATION_PRESETS[preset] : { initial: {}, animate: {}, exit: {} };
  // Sob movimento reduzido a altura não passa pela mola: ela salta direto para
  // o valor medido, e o conteúdo aparece sem percurso.
  const altura = reducedMotion ? (isExpanded ? alturaMedida : 0) : alturaSuave;

  return (
    <motion.div
      ref={ref}
      id={contentId}
      style={{ height: altura, overflow: 'hidden' }}
      transition={{ duration: transitionDuration, ease: easeType }}
      {...props}
    >
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            ref={medirRef}
            initial={reducedMotion ? false : animacao.initial}
            animate={animacao.animate}
            exit={reducedMotion ? { opacity: 0 } : animacao.exit}
            transition={{ duration: transitionDuration, ease: easeType }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const ExpandableTrigger = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
  function ExpandableTrigger({ children, className = '', ...props }, ref) {
    const { toggleExpand, isExpanded, contentId } = useExpandable();

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggleExpand}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export { Expandable, ExpandableContent, ExpandableTrigger, ExpandableContext, useExpandable };
