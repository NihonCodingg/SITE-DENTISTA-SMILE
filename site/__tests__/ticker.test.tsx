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
    // Estático: nenhuma repetição, e o <section> que o ScrollVelocity
    // (React Bits) monta no modo animado nem existe.
    const ocorrencias = (container.textContent?.match(/Facetas/g) ?? []).length;
    expect(ocorrencias).toBe(1);
    expect(container.querySelector('section')).toBeNull();
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

describe('Ticker — motion da trilha (React Bits ScrollVelocity, timers reais)', () => {
  // O ScrollVelocity vendorizado (components/reactbits/ScrollVelocity.tsx)
  // usa useAnimationFrame do motion/react — um ticker interno da própria
  // lib, não uma chamada direta e isolada a window.requestAnimationFrame
  // como o antigo TrilhaAnimada tinha. Não dá pra mockar esse ticker com a
  // mesma precisão de quadro-a-quadro do teste anterior; em vez disso,
  // deixamos o rAF real do jsdom rodar (jsdom 21+ tem um polyfill de rAF
  // funcional) e observamos o resultado depois de uma janela real de tempo
  // — mede o comportamento observável (anda / não anda), não a curva exata.
  //
  // offsetWidth de verdade é sempre 0 em jsdom (não faz layout) — sem
  // mockar, `copyWidth` do ScrollVelocity nunca sai de 0 e a trilha nunca
  // se move (ver a guarda `if (copyWidth === 0) return '0px'` no
  // componente). Fixado num valor grande o bastante pra o wrap-around
  // nunca entrar em jogo dentro da janela curta destes testes.
  function lerTransformX(el: Element | null): number {
    const style = (el as HTMLElement | null)?.style.transform ?? '';
    const m = /translateX\(([-\d.]+)px\)/.exec(style);
    return m ? parseFloat(m[1]) : 0;
  }

  function montarComLarguraFixa() {
    const larguraSpy = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(10000);
    const resultado = render(<Ticker />);
    const scroller = resultado.container.querySelector('section > div > div') as HTMLElement | null;
    return { ...resultado, scroller, larguraSpy };
  }

  it('avança a trilha (a posição muda) enquanto visível', async () => {
    mockMatchMedia(false);
    const { scroller, larguraSpy } = montarComLarguraFixa();
    expect(scroller).not.toBeNull();

    const antes = lerTransformX(scroller);
    await new Promise((r) => setTimeout(r, 200));
    const depois = lerTransformX(scroller);

    expect(depois).not.toBe(antes);
    larguraSpy.mockRestore();
  });

  it('pausa fora da viewport (IntersectionObserver)', async () => {
    mockMatchMedia(false);

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

    const { scroller, larguraSpy } = montarComLarguraFixa();
    expect(aoInterseccionar).not.toBeNull();

    // Uma pequena espera inicial deixa o `copyWidth` (medido via
    // offsetWidth, mockado acima) assentar — a mudança de largura de 0 pro
    // valor mockado dispara UM re-render que recalcula a posição de
    // repouso mesmo sem nenhum movimento real (é matemática do `wrap`, não
    // animação). Captura a posição DEPOIS desse assentamento, pra não
    // confundir "assentou a largura" com "andou".
    await new Promise((r) => setTimeout(r, 20));

    // Nunca disparou "visível" — a trilha começa parada (mesmo padrão do
    // Silk.tsx: só liga depois que o IntersectionObserver confirmar).
    const offsetParado = lerTransformX(scroller);
    await new Promise((r) => setTimeout(r, 150));
    expect(lerTransformX(scroller)).toBe(offsetParado);

    // Entra na viewport: passa a andar.
    aoInterseccionar!([{ isIntersecting: true }]);
    await new Promise((r) => setTimeout(r, 150));
    const offsetAndando = lerTransformX(scroller);
    expect(offsetAndando).not.toBe(offsetParado);

    // Sai de novo: para.
    aoInterseccionar!([{ isIntersecting: false }]);
    await new Promise((r) => setTimeout(r, 150));
    expect(lerTransformX(scroller)).toBe(offsetAndando);

    larguraSpy.mockRestore();
  });

  it('pausa com a aba oculta (document.hidden)', async () => {
    mockMatchMedia(false);

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

    const { scroller, larguraSpy } = montarComLarguraFixa();
    aoInterseccionar!([{ isIntersecting: true }]);
    await new Promise((r) => setTimeout(r, 150));
    const offsetAntes = lerTransformX(scroller);
    expect(offsetAntes).not.toBe(0);

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    await new Promise((r) => setTimeout(r, 150));
    expect(lerTransformX(scroller)).toBe(offsetAntes);

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    larguraSpy.mockRestore();
  });
});
