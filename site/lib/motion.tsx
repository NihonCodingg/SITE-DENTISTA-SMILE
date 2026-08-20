'use client';
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from './useCapability';

/**
 * Lenis vive fora do React (é uma instância de classe presa ao DOM/rAF), então a
 * ligação com o React usa `useSyncExternalStore` em vez de `useState` dentro do
 * `useEffect` — a criação do Lenis é assíncrona em relação à renderização (só
 * acontece depois que `useCapability()` confirma que pode animar) e precisa
 * notificar os consumidores de `useLenis()` sem chamar um setState direto de
 * dentro do efeito, o que o eslint-plugin-react-hooks do Next 16 recusa (regra
 * `set-state-in-effect` — "force update / external sync: use
 * useSyncExternalStore").
 */
type LenisStore = {
  getSnapshot: () => Lenis | null;
  subscribe: (onChange: () => void) => () => void;
  set: (lenis: Lenis | null) => void;
};

function createLenisStore(): LenisStore {
  let lenis: Lenis | null = null;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => lenis,
    subscribe(onChange) {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    set(next) {
      lenis = next;
      listeners.forEach((l) => l());
    },
  };
}

const Ctx = createContext<LenisStore | null>(null);

const semProvider: LenisStore = {
  getSnapshot: () => null,
  subscribe: () => () => {},
  set: () => {},
};

export function useLenis(): Lenis | null {
  const store = useContext(Ctx) ?? semProvider;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  // Estado com inicializador preguiçoso: cria o store uma única vez, mas — ao
  // contrário de um ref — pode ser lido durante a renderização (é isso que o
  // `<Ctx.Provider value={store}>` abaixo faz) sem violar a regra `react-hooks/refs`
  // do Next 16, que proíbe ler `ref.current` fora de efeitos/handlers. O setter
  // nunca é chamado de novo: quem muda é o objeto externo, via `store.set(...)`.
  const [store] = useState<LenisStore>(() => createLenisStore());

  const { podeAnimar, montado } = useCapability();
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!montado || !podeAnimar) return;
    gsap.registerPlugin(ScrollTrigger);

    const l = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.6 });
    store.set(l);

    l.on('scroll', ScrollTrigger.update);
    const loop = (t: number) => { l.raf(t); raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf.current);
      l.destroy();
      ScrollTrigger.getAll().forEach((s) => s.kill());
      store.set(null);
    };
  }, [montado, podeAnimar, store]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
