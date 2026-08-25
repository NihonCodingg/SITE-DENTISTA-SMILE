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
vi.stubGlobal('ResizeObserver', class {
  observe() {} unobserve() {} disconnect() {}
});

describe('Depoimentos', () => {
  it('mostra o título da seção', () => {
    render(<Depoimentos />);
    expect(screen.getByRole('heading', { level: 2 }))
      .toHaveTextContent(/As histórias valem mais do que qualquer anúncio/i);
  });

  it('renderiza um painel para cada depoimento de lib/content.ts', () => {
    render(<Depoimentos />);
    DEPOIMENTOS.forEach((d) => {
      expect(screen.getByRole('link', { name: new RegExp(d.titulo, 'i') })).toBeInTheDocument();
    });
  });

  it('cada painel leva ao reel certo no Instagram, em aba nova e com rel seguro', () => {
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

  // Regressão (Task 21): a AccordionGallery do React Bits marca cada painel
  // com role="listitem", o que sobrescreve a semântica de link — quem usa
  // leitor de tela deixaria de saber que o painel abre o Instagram. A
  // vendorização removeu o role; este teste é o que impede ele de voltar numa
  // futura atualização do componente.
  it('os painéis continuam sendo anunciados como link, não como item de lista', () => {
    const { container } = render(<Depoimentos />);
    expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(DEPOIMENTOS.length);
  });

  // A seção nunca ganha barra de rolagem horizontal própria: a sanfona
  // distribui os painéis dentro da largura que tem.
  it('a seção não rola na horizontal', () => {
    const { container } = render(<Depoimentos />);
    const secao = container.querySelector('section#depoimentos');
    expect(secao?.className ?? '').not.toMatch(/overflow-x-auto/);
  });
});
