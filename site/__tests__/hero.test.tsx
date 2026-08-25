import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/sections/Hero';
import { REEL_TOUR } from '@/lib/content';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Hero', () => {
  it('usa a headline da marca como h1 unico', () => {
    const { container } = render(<Hero />);
    // Task 20: a headline é o MaskedHeading (components/reactbits/
    // MaskedHeading.tsx) — as letras viram o recorte por onde a foto da
    // marca aparece. O componente espalha as palavras em spans SEM espaço
    // real entre elas (o espaço é `content` de CSS), então o conteúdo visual
    // inteiro fica aria-hidden (modificação nº3 da vendorização) e o nome
    // acessível vai no próprio <h1>, onde aria-label é válido — a MESMA
    // blindagem do SplitText que ele substituiu (Task 18, A1). Igualdade
    // exata: trava que o atributo está no lugar certo.
    const mascarado = container.querySelector('h1 [aria-hidden="true"]');
    expect(mascarado).not.toBeNull();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveAttribute('aria-label', 'Seu novo sorriso começa aqui');
    expect(screen.getByRole('heading', { level: 1, name: 'Seu novo sorriso começa aqui' })).toBe(h1);
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

  it('sob prefers-reduced-motion, a headline continua um h1 puro (sem mascara)', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { container } = render(<Hero />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Seu novo sorriso começa aqui');
    // Sem podeAnimar, o MaskedHeading não monta — nada de recorte de SVG nem
    // imagem dentro do h1, só o texto puro que o servidor já mandou.
    expect(container.querySelector('h1 svg')).toBeNull();
    expect(container.querySelector('h1 img')).toBeNull();
    // E sem a máscara o aria-label seria redundante — o texto já é o nome.
    expect(heading).not.toHaveAttribute('aria-label');

    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }));
  });
});
