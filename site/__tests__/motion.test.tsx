import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionProvider, useLenis } from '@/lib/motion';

function mockMatchMedia(reduz: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: reduz,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

function mockNavigatorCapaz() {
  vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: false } });
}

function Probe() {
  const lenis = useLenis();
  return <div data-testid="probe">{lenis ? 'tem-lenis' : 'sem-lenis'}</div>;
}

describe('MotionProvider / useLenis', () => {
  it('useLenis() fora do provider devolve null sem quebrar', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('sem-lenis');
  });

  it('não cria o Lenis quando prefers-reduced-motion está ativo', () => {
    mockMatchMedia(true);
    mockNavigatorCapaz();
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('sem-lenis');
  });

  it('cria o Lenis e propaga via useLenis() quando pode animar', () => {
    mockMatchMedia(false);
    mockNavigatorCapaz();
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('tem-lenis');
  });

  it('desmonta sem lançar erro (Lenis destruído, ScrollTriggers mortos)', () => {
    mockMatchMedia(false);
    mockNavigatorCapaz();
    const { unmount } = render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    expect(() => unmount()).not.toThrow();
  });
});

// Regressão (achado de review em navegador, fix-titulos-report.md): uma
// seção alcançada por navegação direta com hash na URL (link de bio/story
// do Instagram, reload, back/forward) ou por clique num link de âncora
// podia renderizar com `<Reveal>` presos em opacity:0 — os ScrollTrigger de
// cada Reveal calculam a posição de disparo contra o layout no instante da
// montagem, sem saber que a página ainda ia rolar (Lenis) ou que o layout
// ainda não tinha assentado (hash direto). `ScrollTrigger.refresh()`
// recalcula essas posições; estes testes travam SÓ a parte determinística —
// que ele é chamado (ou não) nos dois pontos certos, não o efeito visual em
// si (isso é validado manualmente no navegador, ver fix-titulos-report.md).
describe('MotionProvider — ScrollTrigger.refresh() nos dois pontos da correção de âncora', () => {
  let refreshSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockMatchMedia(false);
    mockNavigatorCapaz();
    refreshSpy = vi.spyOn(ScrollTrigger, 'refresh').mockImplementation(() => undefined as unknown as void);
  });

  afterEach(() => {
    refreshSpy.mockRestore();
    window.location.hash = '';
  });

  it('com location.hash já presente na montagem, chama ScrollTrigger.refresh() depois que o layout assenta', async () => {
    window.location.hash = '#tratamentos';
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    await waitFor(() => expect(refreshSpy).toHaveBeenCalled());
  });

  it('sem location.hash na montagem, NÃO chama ScrollTrigger.refresh()', async () => {
    window.location.hash = '';
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    // Espera real — dá tempo pro mesmo microtask/macrotask que dispararia o
    // refresh no teste acima, se o guard de `location.hash` não existisse.
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('ao clicar num link de âncora, o scrollTo do Lenis recebe onComplete que chama ScrollTrigger.refresh()', () => {
    const scrollToSpy = vi
      .spyOn(Lenis.prototype, 'scrollTo')
      .mockImplementation(function (this: Lenis, _target, opts) {
        // Simula o scroll suave já tendo terminado — é exatamente o
        // instante em que o código de produção precisa recalcular.
        opts?.onComplete?.(this);
      });

    const { container } = render(
      <MotionProvider>
        <a href="#tratamentos">Ir para tratamentos</a>
        <section id="tratamentos" />
      </MotionProvider>
    );

    const link = container.querySelector('a[href="#tratamentos"]')!;
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));

    expect(scrollToSpy).toHaveBeenCalled();
    expect(refreshSpy).toHaveBeenCalled();
    scrollToSpy.mockRestore();
  });
});

// Regressão de review (Task 15): a primeira versão da correção acima vivia
// inteira dentro do guard `if (!montado || !podeAnimar) return`, então quem
// tem prefers-reduced-motion: reduce ligado nunca chegava a rodar o refresh
// por hash-na-montagem — mesmo <Reveal> (Reveal.tsx) criando um
// ScrollTrigger de verdade independente de podeAnimar ("reduzir não é
// zerar": o reveal continua existindo sob reduced-motion, só sem o
// deslocamento). É o pior segmento pra deixar quebrado: quem liga movimento
// reduzido geralmente faz por necessidade, não preferência estética.
describe('MotionProvider — refresh por hash funciona TAMBÉM sob prefers-reduced-motion', () => {
  let refreshSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockMatchMedia(true); // reduced-motion ligado — podeAnimar fica false
    mockNavigatorCapaz();
    refreshSpy = vi.spyOn(ScrollTrigger, 'refresh').mockImplementation(() => undefined as unknown as void);
  });

  afterEach(() => {
    refreshSpy.mockRestore();
    window.location.hash = '';
  });

  it('com location.hash presente na montagem, chama ScrollTrigger.refresh() mesmo sem Lenis (reduced-motion)', async () => {
    window.location.hash = '#tratamentos';
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    // Confirma primeiro que este é de fato o caminho sem Lenis (podeAnimar
    // false) — sem isso o teste não prova o que diz provar.
    expect(screen.getByTestId('probe')).toHaveTextContent('sem-lenis');
    await waitFor(() => expect(refreshSpy).toHaveBeenCalled());
  });

  it('sem location.hash na montagem, NÃO chama ScrollTrigger.refresh() (reduced-motion)', async () => {
    window.location.hash = '';
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('nao registra listener de clique de ancora quando nao ha Lenis (reduced-motion)', () => {
    const scrollToSpy = vi.spyOn(Lenis.prototype, 'scrollTo');

    const { container } = render(
      <MotionProvider>
        <a href="#tratamentos">Ir para tratamentos</a>
        <section id="tratamentos" />
      </MotionProvider>
    );

    const link = container.querySelector('a[href="#tratamentos"]')!;
    const evento = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    link.dispatchEvent(evento);

    // Sem Lenis, o comportamento nativo do link deve valer — nada de
    // preventDefault nem lenis.scrollTo() interceptando o clique.
    expect(scrollToSpy).not.toHaveBeenCalled();
    expect(evento.defaultPrevented).toBe(false);
    scrollToSpy.mockRestore();
  });
});
