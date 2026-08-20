import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Ticker } from '@/components/sections/Ticker';

function mockMatchMedia(reduz: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce') ? reduz : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('Ticker', () => {
  it('lista os sete tratamentos', () => {
    mockMatchMedia(false);
    render(<Ticker />);
    const txt = screen.getByTestId('ticker').textContent ?? '';
    ['Facetas', 'Implantes', 'Protocolo de implante', 'Próteses', 'Ortodontia', 'Limpeza profissional', 'Clareamento']
      .forEach((t) => expect(txt).toContain(t));
  });

  it('fica fora da arvore de acessibilidade por ser decorativo repetido', () => {
    mockMatchMedia(false);
    render(<Ticker />);
    expect(screen.getByTestId('ticker')).toHaveAttribute('aria-hidden', 'true');
  });

  it('separa os tratamentos por ✦', () => {
    mockMatchMedia(false);
    render(<Ticker />);
    const txt = screen.getByTestId('ticker').textContent ?? '';
    expect(txt).toContain('✦');
  });

  it('com podeAnimar, monta a trilha rolante duplicada (mais de uma copia do primeiro tratamento)', () => {
    mockMatchMedia(false);
    const { container } = render(<Ticker />);
    // A faixa infinita repete o texto lado a lado pra não ter buraco no loop —
    // "Facetas" precisa aparecer mais de uma vez só no modo animado.
    const ocorrencias = (container.textContent?.match(/Facetas/g) ?? []).length;
    expect(ocorrencias).toBeGreaterThan(1);
  });

  it('sob prefers-reduced-motion, fica estatica: mesmo texto, sem duplicar', () => {
    mockMatchMedia(true);
    const { container } = render(<Ticker />);
    const txt = screen.getByTestId('ticker').textContent ?? '';
    ['Facetas', 'Implantes', 'Protocolo de implante', 'Próteses', 'Ortodontia', 'Limpeza profissional', 'Clareamento']
      .forEach((t) => expect(txt).toContain(t));
    // Estático: nenhuma repetição, e nenhuma trilha com will-change de transform.
    const ocorrencias = (container.textContent?.match(/Facetas/g) ?? []).length;
    expect(ocorrencias).toBe(1);
    expect(container.querySelector('[data-ticker-trilha]')).toBeNull();
  });

  it('sob prefers-reduced-motion, a faixa continua visivel (nao some)', () => {
    mockMatchMedia(true);
    render(<Ticker />);
    const el = screen.getByTestId('ticker');
    expect(el).toBeInTheDocument();
    expect(el.textContent?.length ?? 0).toBeGreaterThan(0);
  });

  it('desmonta sem lançar erro (cleanup de rAF e observers)', () => {
    mockMatchMedia(false);
    const { unmount } = render(<Ticker />);
    expect(() => unmount()).not.toThrow();
  });
});

describe('Ticker — motion da trilha (rAF controlado manualmente)', () => {
  function lerOffsetX(el: Element | null): number {
    const transform = (el as HTMLElement | null)?.style.transform ?? '';
    const m = /translate3d\(([-\d.]+)px/.exec(transform);
    return m ? parseFloat(m[1]) : 0;
  }

  it('avança a trilha continuamente e em velocidade constante (linear) enquanto visível', () => {
    mockMatchMedia(false);

    // jsdom não faz layout — offsetWidth de verdade sempre é 0. Fixamos um
    // valor grande o bastante pra o wrap-around nunca entrar em jogo dentro
    // da janela curta deste teste, e testamos só o avanço linear.
    const larguraSpy = vi
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockReturnValue(10000);

    let quadro: FrameRequestCallback | null = null;
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        quadro = cb;
        return 1;
      });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const { container } = render(<Ticker />);
    const trilha = container.querySelector('[data-ticker-trilha] > div');
    expect(quadro).not.toBeNull();

    // 1º quadro: só registra o timestamp inicial (dt=0), sem lenis nenhum
    // Lenis conectado (sem <MotionProvider> na árvore, useLenis() = null) —
    // então a velocidade fica só na base, sem boost. Intervalos de 30ms e
    // 60ms — bem abaixo do teto de 100ms que o loop aplica pra não saltar
    // depois de uma aba minimizada, senão os dois ficariam igualmente
    // grampeados no teto e a proporção pareceria "não-linear" por um motivo
    // que nada tem a ver com a curva de movimento.
    quadro!(0);
    const offset0 = lerOffsetX(trilha);

    quadro!(30); // +30ms
    const offset30 = lerOffsetX(trilha);

    quadro!(90); // +60ms a mais (janela 2x maior, mesma velocidade)
    const offset90 = lerOffsetX(trilha);

    // Constante e para a esquerda: cada quadro desloca mais que o anterior,
    // nunca para, nunca inverte.
    expect(offset30).toBeLessThan(offset0);
    expect(offset90).toBeLessThan(offset30);

    // Linear: o deslocamento do 2º intervalo (60ms) é ~2x o do 1º (30ms) —
    // sem curva de easing, sem aceleração espúria (sem scroll não há boost).
    const delta1 = offset0 - offset30; // positivo (moveu pra esquerda)
    const delta2 = offset30 - offset90;
    expect(delta2 / delta1).toBeGreaterThan(1.8);
    expect(delta2 / delta1).toBeLessThan(2.2);

    larguraSpy.mockRestore();
    rafSpy.mockRestore();
  });

  it('pausa a trilha fora da viewport (IntersectionObserver) e com a aba oculta (document.hidden)', () => {
    mockMatchMedia(false);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(10000);

    let quadro: FrameRequestCallback | null = null;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      quadro = cb;
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    // Substitui o stub no-op de IntersectionObserver (vitest.setup.ts) por um
    // que guarda o callback, pra simular a faixa saindo da viewport de
    // verdade — o mesmo mecanismo do Silk.tsx (Task 8).
    let aoInterseccionar: ((entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void) | null = null;
    class IntersectionObserverStubDeTeste {
      constructor(cb: (entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void) {
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

    const { container } = render(<Ticker />);
    const trilha = container.querySelector('[data-ticker-trilha] > div');
    expect(aoInterseccionar).not.toBeNull();

    quadro!(0);
    quadro!(100);
    const offsetVisivel = lerOffsetX(trilha);
    expect(offsetVisivel).toBeLessThan(0); // já andou

    // Sai da viewport.
    aoInterseccionar!([{ isIntersecting: false }]);
    quadro!(200);
    quadro!(300);
    expect(lerOffsetX(trilha)).toBe(offsetVisivel); // parado, nada mudou

    // Volta pra viewport, mas a aba está oculta.
    aoInterseccionar!([{ isIntersecting: true }]);
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    quadro!(400);
    quadro!(500);
    expect(lerOffsetX(trilha)).toBe(offsetVisivel); // ainda parado

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  });
});
