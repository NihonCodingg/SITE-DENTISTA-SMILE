'use client';

/**
 * A "ilha dinâmica": uma pílula flutuante que muda de tamanho e de conteúdo
 * conforme o contexto — Task 21, pedido do dono do projeto.
 *
 * Origem: cult-ui, `apps/www/registry/default/ui/dynamic-island.tsx`
 * (https://github.com/nolly-studio/cult-ui, licença MIT — ver `LICENSE.md`
 * nesta pasta). Ver `README.md` aqui do lado para o commit de referência e a
 * lista completa de modificações.
 *
 * Modificações sobre o original:
 * 1. **`clipPath: url(#squircle-…)` removido.** O original termina cada
 *    transição aplicando `clip-path: url(#squircle-<tamanho>)`, apontando para
 *    `<clipPath>` de SVG que vivem no arquivo de demonstração do cult-ui e não
 *    vêm com o componente. Referência de `clip-path` que não resolve não é
 *    ignorada pelo Chrome: ela recorta TUDO, e a ilha simplesmente some. Sem
 *    os SVGs, a linha só podia quebrar.
 * 2. **Cores viraram props/`className`.** O original crava `bg-black`,
 *    `border-black/10` e um punhado de variantes `dark:` do shadcn — este
 *    projeto tem paleta própria (`app/globals.css`).
 * 3. **`flex` adicionado ao contêiner animado.** O original põe
 *    `items-center justify-center` num elemento sem `display:flex`, então as
 *    duas classes não faziam nada.
 * 4. **`setSize` não trava mais a volta, e virou estável.** O guard do
 *    original é `previousSize !== newSize && newSize !== size` — a primeira
 *    metade impede voltar ao tamanho anterior, então `compact → long →
 *    compact` para no terceiro passo e a ilha fica presa. O guard virou uma
 *    checagem de idempotência dentro do reducer, o que além de destravar a
 *    volta tira `state.size` das dependências de `setSize`: com a identidade
 *    estável, um efeito do consumidor não é refeito a cada troca de tamanho.
 * 5. **A fila de animações agendada ganhou cancelamento.** O original percorre
 *    a fila com `await setTimeout` dentro de um `useEffect` sem cleanup: se o
 *    componente desmontar no meio, os `dispatch` seguintes continuam saindo.
 * 6. **Largura presa à janela.** Os presets são pixels fixos (`long` e
 *    `medium` medem 371px); numa tela de 360px a ilha encostaria nas duas
 *    bordas. Agora a largura nunca passa de `window.innerWidth - margem`.
 * 7. **`reducedMotion` virou prop**, alimentada por `useCapability()` — sob
 *    movimento reduzido a troca é uma transição curta em vez de mola.
 *    Reduzir, não zerar: a ilha continua mudando de tamanho e de conteúdo.
 * 8. **`any` eliminado** (`willChange`, o `[key: string]: any` do
 *    `DynamicIslandContent`).
 *
 * Sobre animar largura e altura: o projeto anima só
 * `transform`/`opacity`/`clip-path`. Aqui a forma É o componente. A exceção
 * fica contida porque a ilha é `position: fixed` — mudar o tamanho dela não
 * reorganiza nada do documento — e porque ela muda de forma poucas vezes por
 * visita, não a cada quadro.
 * 9. **`w-full` removido do contêiner.** O original envolve a ilha num
 *    `flex w-full justify-center`, que ocupa a largura toda e centraliza a
 *    ilha dentro de si. O efeito colateral é que ele ANULA o alinhamento de
 *    quem chama: um `justify-end` no envoltório de fora alinha um filho que já
 *    tem 100% da largura, ou seja, não move nada. Foi assim que a ilha ficou
 *    centralizada no desktop mesmo com o `md:justify-end` do
 *    `layout/IlhaContato.tsx` — descoberto na revisão de entrega, medido: num
 *    monitor de 1350px ela ficava em 478-849 em vez de terminar em 1326.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { Dispatch, ReactNode } from 'react';
import { AnimatePresence, motion, useWillChange } from 'motion/react';
import type { MotionValue } from 'motion/react';

const stiffness = 400;
const damping = 30;
/** Teto de largura do original (o nome é dele; é um máximo, não um mínimo). */
const MAX_WIDTH = 691;
const MAX_HEIGHT_MOBILE_ULTRA = 400;
const MAX_HEIGHT_MOBILE_MASSIVE = 700;
/** Folga em cada lado, para a ilha nunca encostar na borda da tela. */
const MARGEM_LATERAL = 32;

const min = (a: number, b: number) => (a < b ? a : b);

export type SizePresets =
  | 'reset'
  | 'empty'
  | 'default'
  | 'compact'
  | 'compactLong'
  | 'large'
  | 'long'
  | 'minimalLeading'
  | 'minimalTrailing'
  | 'compactMedium'
  | 'medium'
  | 'tall'
  | 'ultra'
  | 'massive';

const SIZE_PRESETS = {
  RESET: 'reset',
  EMPTY: 'empty',
  DEFAULT: 'default',
  COMPACT: 'compact',
  COMPACT_LONG: 'compactLong',
  LARGE: 'large',
  LONG: 'long',
  MINIMAL_LEADING: 'minimalLeading',
  MINIMAL_TRAILING: 'minimalTrailing',
  COMPACT_MEDIUM: 'compactMedium',
  MEDIUM: 'medium',
  TALL: 'tall',
  ULTRA: 'ultra',
  MASSIVE: 'massive',
} as const;

type Preset = {
  width: number;
  height?: number;
  aspectRatio: number;
  borderRadius: number;
};

const DynamicIslandSizePresets: Record<SizePresets, Preset> = {
  [SIZE_PRESETS.RESET]: { width: 150, aspectRatio: 1, borderRadius: 20 },
  [SIZE_PRESETS.EMPTY]: { width: 0, aspectRatio: 0, borderRadius: 0 },
  [SIZE_PRESETS.DEFAULT]: { width: 150, aspectRatio: 44 / 150, borderRadius: 46 },
  [SIZE_PRESETS.MINIMAL_LEADING]: { width: 52.33, aspectRatio: 44 / 52.33, borderRadius: 22 },
  [SIZE_PRESETS.MINIMAL_TRAILING]: { width: 52.33, aspectRatio: 44 / 52.33, borderRadius: 22 },
  [SIZE_PRESETS.COMPACT]: { width: 235, aspectRatio: 44 / 235, borderRadius: 46 },
  [SIZE_PRESETS.COMPACT_LONG]: { width: 300, aspectRatio: 44 / 235, borderRadius: 46 },
  [SIZE_PRESETS.COMPACT_MEDIUM]: { width: 351, aspectRatio: 64 / 371, borderRadius: 44 },
  [SIZE_PRESETS.LONG]: { width: 371, aspectRatio: 84 / 371, borderRadius: 42 },
  [SIZE_PRESETS.MEDIUM]: { width: 371, aspectRatio: 210 / 371, borderRadius: 22 },
  [SIZE_PRESETS.LARGE]: { width: 371, aspectRatio: 84 / 371, borderRadius: 42 },
  [SIZE_PRESETS.TALL]: { width: 371, aspectRatio: 210 / 371, borderRadius: 42 },
  [SIZE_PRESETS.ULTRA]: { width: 630, aspectRatio: 630 / 800, borderRadius: 42 },
  [SIZE_PRESETS.MASSIVE]: { width: 891, height: 1900, aspectRatio: 891 / 891, borderRadius: 42 },
};

type BlobStateType = {
  size: SizePresets;
  previousSize: SizePresets | undefined;
  animationQueue: Array<{ size: SizePresets; delay: number }>;
  isAnimating: boolean;
};

type BlobAction =
  | { type: 'SET_SIZE'; newSize: SizePresets }
  | { type: 'SCHEDULE_ANIMATION'; animationSteps: Array<{ size: SizePresets; delay: number }> }
  | { type: 'ANIMATION_END' };

type BlobContextType = {
  state: BlobStateType;
  dispatch: Dispatch<BlobAction>;
  setSize: (size: SizePresets) => void;
  scheduleAnimation: (animationSteps: Array<{ size: SizePresets; delay: number }>) => void;
  presets: Record<SizePresets, Preset>;
  reducedMotion: boolean;
};

const BlobContext = createContext<BlobContextType | undefined>(undefined);

const blobReducer = (state: BlobStateType, action: BlobAction): BlobStateType => {
  switch (action.type) {
    case 'SET_SIZE':
      // Idempotente (modificação 4): pedir o tamanho que já está em uso não
      // muda nada. Sem isto, `previousSize` viraria igual a `size`, e é essa
      // igualdade que `DynamicContainer`/`DynamicTitle` usam para decidir
      // animar até `opacity: 0` — o conteúdo da ilha sumiria.
      if (action.newSize === state.size) return state;
      return { ...state, size: action.newSize, previousSize: state.size, isAnimating: false };
    case 'SCHEDULE_ANIMATION':
      return { ...state, animationQueue: action.animationSteps, isAnimating: action.animationSteps.length > 0 };
    case 'ANIMATION_END':
      return { ...state, isAnimating: false };
    default:
      return state;
  }
};

interface DynamicIslandProviderProps {
  children: ReactNode;
  initialSize?: SizePresets;
  initialAnimation?: Array<{ size: SizePresets; delay: number }>;
  /** Vem de `useCapability().podeAnimar` — o componente não consulta matchMedia. */
  reducedMotion?: boolean;
}

const DynamicIslandProvider = ({
  children,
  initialSize = SIZE_PRESETS.DEFAULT,
  initialAnimation = [],
  reducedMotion = false,
}: DynamicIslandProviderProps) => {
  const [state, dispatch] = useReducer(blobReducer, {
    size: initialSize,
    previousSize: SIZE_PRESETS.EMPTY,
    animationQueue: initialAnimation,
    isAnimating: initialAnimation.length > 0,
  });

  useEffect(() => {
    if (state.animationQueue.length === 0) return;
    // Cancelamento (modificação 5): sem isto, desmontar no meio da fila deixa
    // os `dispatch` seguintes saindo para um componente que não existe mais.
    let cancelado = false;
    const processQueue = async () => {
      for (const step of state.animationQueue) {
        await new Promise((resolve) => setTimeout(resolve, step.delay));
        if (cancelado) return;
        dispatch({ type: 'SET_SIZE', newSize: step.size });
      }
      if (!cancelado) dispatch({ type: 'ANIMATION_END' });
    };
    processQueue();
    return () => {
      cancelado = true;
    };
  }, [state.animationQueue]);

  // O guard saiu daqui e foi para o reducer (modificação 4). Dois ganhos: o
  // original travava a VOLTA ao tamanho anterior (`compact → long → compact`
  // parava no terceiro passo), e `setSize` agora tem identidade estável — sem
  // isso, todo efeito que depende dela é refeito a cada troca de tamanho, o
  // que aqui significava destruir e recriar o IntersectionObserver que decide
  // qual seção está sendo lida.
  const setSize = useCallback((newSize: SizePresets) => {
    dispatch({ type: 'SET_SIZE', newSize });
  }, []);

  const scheduleAnimation = useCallback((animationSteps: Array<{ size: SizePresets; delay: number }>) => {
    dispatch({ type: 'SCHEDULE_ANIMATION', animationSteps });
  }, []);

  return (
    <BlobContext.Provider
      value={{ state, dispatch, setSize, scheduleAnimation, presets: DynamicIslandSizePresets, reducedMotion }}
    >
      {children}
    </BlobContext.Provider>
  );
};

const useDynamicIslandSize = () => {
  const context = useContext(BlobContext);
  if (!context) throw new Error('useDynamicIslandSize precisa estar dentro de um DynamicIslandProvider');
  return context;
};

const useScheduledAnimations = (animations: Array<{ size: SizePresets; delay: number }>) => {
  const { scheduleAnimation } = useDynamicIslandSize();
  const animationsRef = useRef(animations);

  useEffect(() => {
    scheduleAnimation(animationsRef.current);
  }, [scheduleAnimation]);
};

/**
 * Largura e altura do preset, já presas à janela (modificação 6): os presets
 * são pixels fixos e `long`/`medium` medem 371px, que numa tela de 360
 * encostaria nas duas bordas.
 */
const calculateDimensions = (
  size: SizePresets,
  screenSize: string,
  currentSize: Preset,
  larguraJanela: number
): { width: string; height: number } => {
  const teto = larguraJanela > 0 ? min(MAX_WIDTH, larguraJanela - MARGEM_LATERAL) : MAX_WIDTH;

  if (size === 'massive' && screenSize === 'mobile') {
    return { width: `${min(350, teto)}px`, height: MAX_HEIGHT_MOBILE_MASSIVE };
  }
  if (size === 'ultra' && screenSize === 'mobile') {
    return { width: `${min(350, teto)}px`, height: MAX_HEIGHT_MOBILE_ULTRA };
  }

  const width = min(currentSize.width, teto);
  // A altura sai da PROPORÇÃO do preset aplicada à largura já limitada — sem
  // isto, uma ilha estreitada pela tela ficaria alta demais para o conteúdo.
  return { width: `${width}px`, height: currentSize.aspectRatio * width };
};

const DynamicIsland = ({ children, id, className = '' }: { children: ReactNode; id: string; className?: string }) => {
  const willChange = useWillChange();
  const [screenSize, setScreenSize] = useState('desktop');
  const [larguraJanela, setLarguraJanela] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setLarguraJanela(window.innerWidth);
      if (window.innerWidth <= 640) setScreenSize('mobile');
      else if (window.innerWidth <= 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // Sem `w-full` (ver modificação 9): o contêiner do original ocupa a
    // largura toda e centraliza a ilha dentro de si, o que ANULA qualquer
    // alinhamento que quem chama tenha aplicado por fora. Foi assim que a
    // ilha ficou centralizada no desktop mesmo com `justify-end` no
    // envoltório — o `justify-end` alinhava um filho que já era 100%.
    <div className="z-10 flex items-end justify-center bg-transparent">
      <DynamicIslandContent
        id={id}
        willChange={willChange}
        screenSize={screenSize}
        larguraJanela={larguraJanela}
        className={className}
      >
        {children}
      </DynamicIslandContent>
    </div>
  );
};

const DynamicIslandContent = ({
  children,
  id,
  willChange,
  screenSize,
  larguraJanela,
  className,
}: {
  children: ReactNode;
  id: string;
  willChange: MotionValue<string>;
  screenSize: string;
  larguraJanela: number;
  className: string;
}) => {
  const { state, presets, reducedMotion } = useDynamicIslandSize();
  const currentSize = presets[state.size];
  const dimensions = calculateDimensions(state.size, screenSize, currentSize, larguraJanela);

  return (
    <motion.div
      id={id}
      className={`mx-auto flex h-0 w-0 items-center justify-center overflow-hidden text-center ${className}`.trim()}
      animate={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: currentSize.borderRadius,
        transition: reducedMotion ? { duration: 0.12 } : { type: 'spring', stiffness, damping },
      }}
      style={{ willChange }}
    >
      <AnimatePresence>{children}</AnimatePresence>
    </motion.div>
  );
};

type DynamicChildrenProps = {
  className?: string;
  children?: ReactNode;
};

const DynamicContainer = ({ className, children }: DynamicChildrenProps) => {
  const willChange = useWillChange();
  const { state, reducedMotion } = useDynamicIslandSize();
  const { size, previousSize } = state;
  const isSizeChanged = size !== previousSize;

  return (
    <motion.div
      initial={{
        opacity: size === previousSize ? 1 : 0,
        scale: size === previousSize ? 1 : 0.9,
        y: size === previousSize ? 0 : 5,
      }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0.12 }
          : { type: 'spring' as const, stiffness, damping, duration: isSizeChanged ? 0.5 : 0.8 }
      }
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(10px)', scale: 0.95, y: 20 }}
      style={{ willChange }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const DynamicDiv = ({ className, children }: DynamicChildrenProps) => {
  const { state, reducedMotion } = useDynamicIslandSize();
  const { size, previousSize } = state;
  const willChange = useWillChange();

  return (
    <motion.div
      initial={{ opacity: size === previousSize ? 1 : 0, scale: size === previousSize ? 1 : 0.9 }}
      animate={{
        opacity: size === previousSize ? 0 : 1,
        scale: size === previousSize ? 0.9 : 1,
        transition: reducedMotion ? { duration: 0.12 } : { type: 'spring', stiffness, damping },
      }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(10px)', scale: 0 }}
      style={{ willChange }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const DynamicTitle = ({ className, children }: DynamicChildrenProps) => {
  const { state, reducedMotion } = useDynamicIslandSize();
  const { size, previousSize } = state;
  const willChange = useWillChange();

  return (
    <motion.h3
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: size === previousSize ? 0 : 1,
        scale: size === previousSize ? 0.9 : 1,
        transition: reducedMotion ? { duration: 0.12 } : { type: 'spring', stiffness, damping },
      }}
      style={{ willChange }}
    >
      {children}
    </motion.h3>
  );
};

const DynamicDescription = ({ className, children }: DynamicChildrenProps) => {
  const { state, reducedMotion } = useDynamicIslandSize();
  const { size, previousSize } = state;
  const willChange = useWillChange();

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: size === previousSize ? 0 : 1,
        scale: size === previousSize ? 0.9 : 1,
        transition: reducedMotion ? { duration: 0.12 } : { type: 'spring', stiffness, damping },
      }}
      style={{ willChange }}
    >
      {children}
    </motion.p>
  );
};

export {
  DynamicContainer,
  DynamicTitle,
  DynamicDescription,
  DynamicIsland,
  SIZE_PRESETS,
  stiffness,
  DynamicDiv,
  damping,
  DynamicIslandSizePresets,
  BlobContext,
  useDynamicIslandSize,
  useScheduledAnimations,
  DynamicIslandProvider,
};

export default DynamicIsland;
