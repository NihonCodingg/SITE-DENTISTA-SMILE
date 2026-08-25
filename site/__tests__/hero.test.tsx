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

  // Task 21: o CTA principal deixou de ser um link direto para o WhatsApp e
  // virou o gatilho de um cartão (CtaAgendamento) — o link do WhatsApp mora
  // dentro dele. O que este teste protege é que o CTA continua existindo e
  // continua sendo o botão que abre esse caminho; o caminho em si está
  // testado em ctaAgendamento.test.tsx.
  it('tem o CTA principal, agora abrindo o cartão de agendamento', () => {
    render(<Hero />);
    const cta = screen.getByRole('button', { name: /Agendar minha avaliação/i });
    expect(cta).toHaveAttribute('aria-expanded', 'false');
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
