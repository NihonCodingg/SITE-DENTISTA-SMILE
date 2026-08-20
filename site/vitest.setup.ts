import '@testing-library/jest-dom/vitest';

// jsdom não implementa ResizeObserver. O construtor do Lenis (site/lib/motion.tsx)
// usa um internamente e lança se ele não existir — sem este stub, qualquer teste
// que monte <MotionProvider> com podeAnimar=true quebra por um gap do ambiente de
// teste, não do código.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
