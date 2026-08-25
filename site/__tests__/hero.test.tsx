import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/sections/Hero';
import { REEL_TOUR } from '@/lib/content';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Hero', () => {
  it('usa a headline da marca como h1 unico', () => {
    render(<Hero />);
    // A headline é texto preto puro — a versão mascarada (MaskedHeading) foi
    // tentada e desfeita por decisão do dono do projeto (ver o comentário no
    // Hero). Texto real dispensa aria-label: o conteúdo já é o nome.
    const h1 = screen.getByRole('heading', { level: 1, name: 'Seu novo sorriso começa aqui' });
    expect(h1).not.toHaveAttribute('aria-label');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leva o CTA principal ao WhatsApp', () => {
    render(<Hero />);
    expect(screen.getByRole('link', { name: /Agendar minha avaliação/i }))
      .toHaveAttribute('href', expect.stringContaining('wa.me/551122740228'));
  });

  it('leva o tour para o reel no Instagram, em aba nova', () => {
    render(<Hero />);
    const link = screen.getByRole('link', { name: /Tour pela clínica/i });
    expect(link).toHaveAttribute('href', REEL_TOUR);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('descreve a foto do hero para leitor de tela', () => {
    render(<Hero />);
    expect(screen.getByAltText(/Dr\. Vinicius Aracena sorrindo sob o letreiro/i)).toBeInTheDocument();
  });

  it('nao afirma numero que a clinica nao tem', () => {
    const { container } = render(<Hero />);
    expect(container.textContent).not.toMatch(/\d+\s*\+/);
    expect(container.textContent).not.toMatch(/★|estrelas/);
  });

  it('sob prefers-reduced-motion, a headline continua identica: texto puro', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { container } = render(<Hero />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Seu novo sorriso começa aqui');
    expect(container.querySelector('h1 svg')).toBeNull();
    expect(container.querySelector('h1 img')).toBeNull();
    expect(heading).not.toHaveAttribute('aria-label');

    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }));
  });
});
