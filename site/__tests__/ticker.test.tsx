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
    // A fita renderiza em maiúsculas (`uppercase` do TextLoop) e alarga o
    // espaço INTERNO de cada nome com inquebráveis, para as palavras não
    // colarem sobre a curva (ver `textoTratamentos` no componente). A
    // comparação normaliza as duas coisas: o que importa é que os sete
    // tratamentos estejam lá, não a caixa das letras nem a largura do espaço
    // do desenho.
    const txt = (screen.getByTestId('ticker').textContent ?? '')
      .toLowerCase()
      .replace(/\s+/g, ' ');
    ['Facetas', 'Implantes', 'Protocolo de implante', 'Próteses', 'Ortodontia', 'Limpeza profissional', 'Clareamento']
      .forEach((t) => expect(txt).toContain(t.toLowerCase()));
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

  it('com podeAnimar, a fita repete o conteudo para o laco nao ter buraco', () => {
    mockMatchMedia(false);
    const { container } = render(<Ticker />);
    // O `TextLoop` repete a unidade de texto ao longo do caminho, e desenha
    // duas cópias (cabeça e cauda) para a emenda do laço nunca aparecer.
    const ocorrencias = (container.textContent?.match(/facetas/gi) ?? []).length;
    expect(ocorrencias).toBeGreaterThan(1);
  });

  it('sob prefers-reduced-motion, fica estatica: mesmo texto, sem duplicar', () => {
    mockMatchMedia(true);
    const { container } = render(<Ticker />);
    const txt = screen.getByTestId('ticker').textContent ?? '';
    ['Facetas', 'Implantes', 'Protocolo de implante', 'Próteses', 'Ortodontia', 'Limpeza profissional', 'Clareamento']
      .forEach((t) => expect(txt).toContain(t));
    // Estático: nenhuma repetição, e o SVG da fita nem chega a ser montado.
    const ocorrencias = (container.textContent?.match(/facetas/gi) ?? []).length;
    expect(ocorrencias).toBe(1);
    expect(container.querySelector('svg')).toBeNull();
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

describe('Ticker — a fita (React Bits TextLoop)', () => {
  // A faixa reta virou a fita curva do `TextLoop` na Task 20. O mecanismo
  // mudou — o texto agora corre por um `<textPath>` de SVG, movido por um
  // tween do GSAP —, mas o que estes testes guardam é o mesmo: a fita repete
  // o conteúdo para não ter buraco no laço, e não gasta CPU de quem não está
  // olhando (pausa fora da viewport e com a aba oculta), que foi a correção
  // exigida de todo componente animado desde a Task 19.

  it('desenha a fita em SVG com o texto correndo por um caminho', () => {
    mockMatchMedia(false);
    const { container } = render(<Ticker />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.querySelectorAll('textPath').length).toBeGreaterThan(0);
  });

  // ⚠️ A pausa por viewport e por aba oculta NÃO é verificável aqui. O
  // `TextLoop` só cria o tween (e, com ele, o IntersectionObserver e o
  // listener de `visibilitychange`) depois de MEDIR o caminho do SVG com
  // `getTotalLength`/`getComputedTextLength` — que o jsdom não implementa,
  // devolvendo zero e fazendo o efeito retornar cedo. O código da pausa está
  // em `components/reactbits/TextLoop.tsx` e é a modificação nº3 da
  // vendorização; confirmá-lo exige navegador de verdade.
});
