import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Clinica } from '@/components/sections/Clinica';
import { REEL_RECEPCAO } from '@/lib/content';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', class {
  observe() {} unobserve() {} disconnect() {}
});

describe('Clinica', () => {
  it('mantem o texto do ambiente', () => {
    render(<Clinica />);
    expect(screen.getByRole('heading', { level: 2 }))
      .toHaveTextContent(/Um lugar onde dá vontade de sentar e conversar/i);
  });

  // O oposto do que este teste afirmava ate 24/08. A Task 12 tinha decidido
  // hospedar o video e abrir em lightbox para nao "perder o clique"; o dono do
  // projeto reverteu para o que o design aprovado desenhava — o acervo de
  // video e do Instagram da clinica.
  it('nao hospeda video: sem <video> e sem .mp4 no markup', () => {
    const { container } = render(<Clinica />);
    expect(container.querySelectorAll('video')).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/\.mp4/);
  });

  it('leva o video da recepcao para o reel no Instagram, em aba nova', () => {
    render(<Clinica />);
    const link = screen.getByRole('link', { name: /recepção/i });
    expect(link).toHaveAttribute('href', REEL_RECEPCAO);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
