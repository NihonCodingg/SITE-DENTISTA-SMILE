'use client';

// Vendorizado de DavidHDev/react-bits — ver README.md deste diretório para
// origem, commit e todas as modificações feitas neste arquivo.

import { useEffect, useRef, useSyncExternalStore, type CSSProperties, type ElementType, type ReactElement } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

// A Font Loading API é um sistema externo ao React (como o Lenis em
// lib/motion.tsx), então a sincronização usa `useSyncExternalStore` em vez de
// `useState` dentro de um `useEffect` — chamar setState direto de dentro de
// um efeito é o que a regra `set-state-in-effect` do eslint-plugin-react-hooks
// do Next 16 recusa (mesma razão documentada em lib/motion.tsx).
function useFontsLoaded(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.fonts.ready.then(onChange);
      document.fonts.addEventListener('loadingdone', onChange);
      return () => document.fonts.removeEventListener('loadingdone', onChange);
    },
    () => document.fonts.status === 'loaded',
    () => false
  );
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete,
}: SplitTextProps): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const fontsLoaded = useFontsLoaded();

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  // Original usava o hook `useGSAP` de `@gsap/react` (dependência que este
  // projeto não tinha). Trocado por `useEffect` + cleanup manual, o mesmo
  // idioma que `site/components/ui/Reveal.tsx` já usa para gsap — evita
  // adicionar um pacote novo para o que o projeto já resolve com o hook
  // nativo do React.
  //
  // `from`/`to` entram no efeito por `fromKey`/`toKey` (JSON.stringify), não
  // pelos objetos em si: o chamador passa literais inline (`from={{opacity:0,
  // y:'0.4em'}}`), então a identidade muda a cada render — usar os objetos
  // direto na dependency array recriaria o split (e reiniciaria a animação)
  // em todo re-render do componente pai, não só quando o valor muda de verdade.
  const fromKey = JSON.stringify(from);
  const toKey = JSON.stringify(to);

  useEffect(() => {
    if (!ref.current || !text || !fontsLoaded) return;
    if (animationCompletedRef.current) return;

    // Registrado aqui, não no escopo do módulo (o original do React Bits
    // registra ao importar): gsap.registerPlugin(ScrollTrigger, ...) toca
    // matchMedia internamente, e módulo importado é avaliado antes de
    // qualquer stub de matchMedia rodar (SSR/testes). Reveal.tsx já resolve
    // isso registrando dentro do efeito — mesma correção aqui.
    gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

    const el = ref.current as HTMLElement & { _rbsplitInstance?: GSAPSplitText };

    if (el._rbsplitInstance) {
      try {
        el._rbsplitInstance.revert();
      } catch {
        // instância já revertida — nada a fazer
      }
      el._rbsplitInstance = undefined;
    }

    const startPct = (1 - threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
    const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
    const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
    const sign =
      marginValue === 0 ? '' : marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    let targets: Element[] = [];
    const assignTargets = (self: GSAPSplitText) => {
      if (splitType.includes('chars') && self.chars?.length) targets = self.chars;
      if (!targets.length && splitType.includes('words') && self.words.length) targets = self.words;
      if (!targets.length && splitType.includes('lines') && self.lines.length) targets = self.lines;
      if (!targets.length) targets = self.chars || self.words || self.lines;
    };

    const splitInstance = new GSAPSplitText(el, {
      type: splitType,
      smartWrap: true,
      autoSplit: splitType === 'lines',
      reduceWhiteSpace: false,
      onSplit: (self: GSAPSplitText) => {
        assignTargets(self);
        return gsap.fromTo(targets, { ...from }, {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: { trigger: el, start, once: true, fastScrollEnd: true, anticipatePin: 0.4 },
          onComplete: () => {
            animationCompletedRef.current = true;
            onCompleteRef.current?.();
          },
          willChange: 'transform, opacity',
          force3D: true,
        });
      },
    });

    el._rbsplitInstance = splitInstance;

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
      try {
        splitInstance.revert();
      } catch {
        // instância já desmontada — nada a fazer
      }
      el._rbsplitInstance = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fromKey/toKey substituem from/to de propósito, ver comentário acima
  }, [text, delay, duration, ease, splitType, fromKey, toKey, threshold, rootMargin, fontsLoaded]);

  const style: CSSProperties = { textAlign, wordWrap: 'break-word', willChange: 'transform, opacity' };
  const classes = `split-parent inline-block whitespace-normal ${className}`;
  const Tag = (tag || 'p') as ElementType;

  return (
    <Tag ref={ref} style={style} className={classes}>
      {text}
    </Tag>
  );
}
