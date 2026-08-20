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

// jsdom não implementa a Font Loading API (document.fonts) — todo navegador
// real suporta desde ~2018. O SplitText (React Bits, vendorizado em
// site/components/reactbits/SplitText.tsx) espera document.fonts.ready antes
// de fazer o split; sem este stub, qualquer teste que monte a Hero com
// podeAnimar=true quebra por um gap do ambiente de teste, não do código.
if (typeof document !== 'undefined' && !document.fonts) {
  Object.defineProperty(document, 'fonts', {
    value: {
      status: 'loaded',
      ready: Promise.resolve(),
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    configurable: true,
  });
}

// jsdom não implementa IntersectionObserver. O fundo WebGL (Silk, montado só
// quando podePesado) usa um para pausar o rAF fora da viewport — sem este
// stub, qualquer teste que monte esse componente quebra pelo mesmo motivo.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

// jsdom não implementa playback de <video>/<audio>: play()/pause()/load() existem
// (não lançam), mas play() devolve undefined em vez de Promise — todo navegador
// real devolve Promise desde que autoplay virou política do browser, não do
// elemento. VideoCard e Lightbox chamam os três; sem este stub, qualquer teste que
// dispare o IntersectionObserver de verdade (em vez do stub vazio que nunca invoca
// a callback) ou monte o Lightbox quebra por um gap do ambiente de teste, não do
// código — e também deixa de ser possível espionar as chamadas com vi.spyOn.
if (typeof HTMLMediaElement !== 'undefined') {
  HTMLMediaElement.prototype.play = function play() {
    return Promise.resolve();
  };
  HTMLMediaElement.prototype.pause = function pause() {};
  HTMLMediaElement.prototype.load = function load() {};
}
