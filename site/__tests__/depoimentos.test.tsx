import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Depoimentos, Z_INDEX_BLUR_BORDA } from '@/components/sections/Depoimentos';
import { DEPOIMENTOS } from '@/lib/content';

// A camada flutuante mais baixa da página é o header (z-50); acima dele vêm o
// FAB (60), o fundo do drawer (65) e o painel (70). Nada decorativo pode
// passar por cima de nenhuma delas.
const MENOR_CAMADA_FLUTUANTE = 50;

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', class {
  observe() {} unobserve() {} disconnect() {}
});

describe('Depoimentos', () => {
  it('mostra o título da seção', () => {
    render(<Depoimentos />);
    expect(screen.getByRole('heading', { level: 2 }))
      .toHaveTextContent(/As histórias valem mais do que qualquer anúncio/i);
  });

  it('renderiza um card para cada depoimento de lib/content.ts', () => {
    render(<Depoimentos />);
    DEPOIMENTOS.forEach((d) => {
      expect(screen.getByRole('link', { name: new RegExp(d.titulo, 'i') })).toBeInTheDocument();
    });
  });

  it('cada card leva ao reel certo no Instagram, em aba nova e com rel seguro', () => {
    render(<Depoimentos />);
    DEPOIMENTOS.forEach((d) => {
      const link = screen.getByRole('link', { name: new RegExp(d.titulo, 'i') });
      expect(link).toHaveAttribute('href', d.reel);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
  });

  // O site nao hospeda video: nenhum <video> e nenhum .mp4 sai daqui.
  it('nao renderiza video hospedado', () => {
    const { container } = render(<Depoimentos />);
    expect(container.querySelectorAll('video')).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/\.mp4/);
  });

  it('nao inventa nome de paciente nem avaliacao', () => {
    const { container } = render(<Depoimentos />);
    expect(container.textContent).not.toMatch(/★|estrelas/i);
  });

  it('o scroller tem overflow-x proprio, nao a secao inteira', () => {
    const { container } = render(<Depoimentos />);
    const secao = container.querySelector('section#depoimentos');
    const scroller = container.querySelector('.depoimentos-scroller');
    expect(scroller).not.toBeNull();
    expect(scroller?.className).toMatch(/overflow-x-auto/);
    expect(secao?.className ?? '').not.toMatch(/overflow-x-auto/);
  });

  // Regressão (achado de review, Task 12): o GradualBlur vendorizado tem
  // z-index:1000 por padrão — sem override, as duas faixas decorativas nas
  // bordas do carrossel vazam por cima de qualquer coisa flutuante. O alvo
  // original era o fundo do lightbox (z-85); o lightbox deixou de existir em
  // 24/08, quando os vídeos passaram a abrir no Instagram, então a régua
  // agora são as camadas que sobraram. O teste lê o z-index REALMENTE
  // renderizado, não a prop que Depoimentos.tsx passa.
  it('as faixas de GradualBlur ficam abaixo de qualquer camada flutuante', () => {
    const { container } = render(<Depoimentos />);
    const faixas = Array.from(container.querySelectorAll<HTMLElement>('.gradual-blur'));
    expect(faixas).toHaveLength(2);
    faixas.forEach((faixa) => {
      const zIndex = Number(faixa.style.zIndex);
      expect(Number.isNaN(zIndex)).toBe(false);
      expect(zIndex).toBe(Z_INDEX_BLUR_BORDA);
      expect(zIndex).toBeLessThan(MENOR_CAMADA_FLUTUANTE);
    });
  });
});
