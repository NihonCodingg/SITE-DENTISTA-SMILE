import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import CircularGallery from '@/components/reactbits/CircularGallery';

// `ogl` cria um contexto WebGL de verdade — jsdom não suporta. Mockado para
// verificar, de forma determinística, os três requisitos duros da Task 13:
// nenhuma chamada de rede, pausa fora da viewport / aba oculta, e cleanup
// completo (WEBGL_lose_context) — sem depender de um browser real.
const hoisted = vi.hoisted(() => ({
  loseContext: vi.fn(),
  renderSpy: vi.fn(),
  setSizeSpy: vi.fn(),
  programCount: { n: 0 },
  rendererShouldThrow: { value: false },
}));

type ProgramOpts = { uniforms: Record<string, { value: unknown }> };
type MeshOpts = { program: unknown };

vi.mock('ogl', () => {
  class Renderer {
    gl: {
      canvas: HTMLCanvasElement;
      clearColor: () => void;
      getExtension: (name: string) => { loseContext: () => void } | null;
    };
    constructor() {
      if (hoisted.rendererShouldThrow.value) {
        throw new Error('WebGL indisponível (mock)');
      }
      const canvas = document.createElement('canvas');
      this.gl = {
        canvas,
        clearColor: () => {},
        getExtension: (name: string) => (name === 'WEBGL_lose_context' ? { loseContext: hoisted.loseContext } : null),
      };
    }
    setSize(...args: unknown[]) {
      hoisted.setSizeSpy(...args);
    }
    render(...args: unknown[]) {
      hoisted.renderSpy(...args);
    }
  }
  class Camera {
    fov = 45;
    position = { z: 20 };
    aspect = 1;
    perspective(opts: { aspect: number }) {
      this.aspect = opts.aspect;
    }
  }
  class Transform {}
  class Plane {}
  class Mesh {
    position = { x: 0, y: 0 };
    rotation = { z: 0 };
    scale = { x: 0, y: 0 };
    program: unknown;
    constructor(_gl: unknown, opts: MeshOpts) {
      this.program = opts.program;
    }
    setParent() {}
  }
  class Program {
    uniforms: Record<string, { value: unknown }>;
    constructor(_gl: unknown, opts: ProgramOpts) {
      hoisted.programCount.n += 1;
      this.uniforms = opts.uniforms;
    }
  }
  class Texture {
    image: unknown;
  }
  return { Renderer, Camera, Transform, Plane, Mesh, Program, Texture };
});

function itensDeExemplo(n: number) {
  return Array.from({ length: n }, (_, i) => ({ image: `/img/retrato-${i + 1}.jpg` }));
}

describe('CircularGallery (vendorizado do React Bits)', () => {
  beforeEach(() => {
    hoisted.loseContext.mockClear();
    hoisted.renderSpy.mockClear();
    hoisted.setSizeSpy.mockClear();
    hoisted.programCount.n = 0;
    hoisted.rendererShouldThrow.value = false;
  });

  it('nao chama fetch — a legenda em canvas e o carregamento de fonte do Google foram removidos', () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const { unmount } = render(<CircularGallery items={itensDeExemplo(3)} />);
    unmount();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('monta um canvas dentro de um container marcado aria-hidden (decorativo)', () => {
    const { container } = render(<CircularGallery items={itensDeExemplo(3)} />);
    const host = container.querySelector('[data-testid="circular-gallery"]');
    expect(host).not.toBeNull();
    expect(host?.getAttribute('aria-hidden')).toBe('true');
    expect(host?.querySelector('canvas')).not.toBeNull();
  });

  it('nao expõe role/tabIndex de navegação por teclado (não leva a nada perceptível num leitor de tela)', () => {
    const { container } = render(<CircularGallery items={itensDeExemplo(3)} />);
    const host = container.querySelector('[data-testid="circular-gallery"]');
    expect(host?.getAttribute('role')).toBeNull();
    expect(host?.getAttribute('tabindex')).toBeNull();
  });

  it('duplica os itens para o loop contínuo (N itens -> 2N planos com textura própria)', () => {
    render(<CircularGallery items={itensDeExemplo(9)} />);
    expect(hoisted.programCount.n).toBe(18);
  });

  it('libera o contexto WebGL e remove o canvas no unmount', () => {
    const { container, unmount } = render(<CircularGallery items={itensDeExemplo(3)} />);
    expect(container.querySelector('canvas')).not.toBeNull();
    unmount();
    expect(hoisted.loseContext).toHaveBeenCalledTimes(1);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('chama onError e não derruba a árvore se o WebGL falhar mesmo em aparelho "pesado"', () => {
    hoisted.rendererShouldThrow.value = true;
    const onError = vi.fn();
    expect(() => render(<CircularGallery items={itensDeExemplo(3)} onError={onError} />)).not.toThrow();
    expect(onError).toHaveBeenCalledWith(true);
  });

  it('desmonta sem lançar mesmo sem nenhum item', () => {
    const { unmount } = render(<CircularGallery items={[]} />);
    expect(() => unmount()).not.toThrow();
  });
});

describe('CircularGallery — pausa fora da viewport (IntersectionObserver) e com a aba oculta (document.hidden)', () => {
  beforeEach(() => {
    hoisted.loseContext.mockClear();
    hoisted.renderSpy.mockClear();
    hoisted.rendererShouldThrow.value = false;
  });

  it('só chama renderer.render enquanto visível e em primeiro plano; retoma ao voltar', () => {
    let quadro: FrameRequestCallback | null = null;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      quadro = cb;
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    let aoInterseccionar: ((entries: { isIntersecting: boolean }[]) => void) | null = null;
    class IntersectionObserverStubDeTeste {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        aoInterseccionar = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStubDeTeste);

    render(<CircularGallery items={itensDeExemplo(3)} />);
    expect(quadro).not.toBeNull();
    expect(aoInterseccionar).not.toBeNull();

    quadro!(0);
    expect(hoisted.renderSpy).toHaveBeenCalledTimes(1);

    // Sai da viewport (scroll da página).
    aoInterseccionar!([{ isIntersecting: false }]);
    quadro!(16);
    expect(hoisted.renderSpy).toHaveBeenCalledTimes(1); // não renderizou de novo

    // Volta pra viewport, mas a aba está oculta.
    aoInterseccionar!([{ isIntersecting: true }]);
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    quadro!(32);
    expect(hoisted.renderSpy).toHaveBeenCalledTimes(1); // ainda parado

    // Aba volta ao primeiro plano.
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    quadro!(48);
    expect(hoisted.renderSpy).toHaveBeenCalledTimes(2); // voltou a renderizar

    vi.unstubAllGlobals();
  });
});
