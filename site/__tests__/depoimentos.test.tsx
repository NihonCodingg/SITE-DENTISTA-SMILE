import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Depoimentos } from '@/components/sections/Depoimentos';
import { DEPOIMENTOS } from '@/lib/content';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', class {
  observe() {} unobserve() {} disconnect() {}
});

describe('Depoimentos', () => {
  it('mostra o título da seção', () => {
    render(<Depoimentos onAbrirVideo={() => {}} />);
    expect(screen.getByRole('heading', { level: 2 }))
      .toHaveTextContent(/As histórias valem mais do que qualquer anúncio/i);
  });

  it('renderiza um card para cada depoimento de lib/content.ts', () => {
    render(<Depoimentos onAbrirVideo={() => {}} />);
    DEPOIMENTOS.forEach((d) => {
      expect(screen.getByRole('button', { name: new RegExp(d.titulo, 'i') })).toBeInTheDocument();
    });
  });

  it('abre o vídeo certo ao clicar em cada card', () => {
    const abrir = vi.fn();
    render(<Depoimentos onAbrirVideo={abrir} />);
    DEPOIMENTOS.forEach((d) => {
      screen.getByRole('button', { name: new RegExp(d.titulo, 'i') }).click();
      expect(abrir).toHaveBeenCalledWith(d.slug);
    });
    expect(abrir).toHaveBeenCalledTimes(DEPOIMENTOS.length);
  });

  it('nao manda o usuario para fora do site', () => {
    const { container } = render(<Depoimentos onAbrirVideo={() => {}} />);
    expect(container.querySelectorAll('a[target="_blank"]')).toHaveLength(0);
  });

  it('nao inventa nome de paciente nem avaliacao', () => {
    const { container } = render(<Depoimentos onAbrirVideo={() => {}} />);
    expect(container.textContent).not.toMatch(/★|estrelas/i);
  });

  it('o scroller tem overflow-x proprio, nao a secao inteira', () => {
    const { container } = render(<Depoimentos onAbrirVideo={() => {}} />);
    const secao = container.querySelector('section#depoimentos');
    const scroller = container.querySelector('.depoimentos-scroller');
    expect(scroller).not.toBeNull();
    expect(scroller?.className).toMatch(/overflow-x-auto/);
    expect(secao?.className ?? '').not.toMatch(/overflow-x-auto/);
  });
});
