import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/sections/Hero';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Hero', () => {
  it('usa a headline da marca como h1 unico', () => {
    const { container } = render(<Hero onAbrirVideo={() => {}} />);
    // Com podeAnimar=true (matchMedia mockado acima como "nunca reduzido") a
    // Hero usa o SplitText vendorizado (components/reactbits/SplitText.tsx),
    // que reparte a headline em spans por palavra via gsap/SplitText e anima
    // `y` sobre eles. Só em jsdom — não no Chrome real, confirmado manualmente
    // na Task 8 — essa combinação específica (SplitText + gsap animando `y`
    // nos alvos) reordena o texto node de espaço entre duas das palavras, e
    // `heading.textContent` sai sem esse espaço.
    //
    // Task 18 (A1): o GSAP SplitText é instanciado com `aria: 'hidden'` — os
    // spans fatiados ficam aria-hidden e NENHUM aria-label é escrito no
    // `.split-parent` (um <span> sem role, onde aria-label é proibido — axe
    // `aria-prohibited-attr`, WCAG 4.1.2). O nome acessível vai para o
    // próprio <h1>, onde é válido. Igualdade exata (não regex frouxa): o
    // texto original fica imune ao artefato de espaçamento do jsdom, e o
    // teste trava que o atributo está no lugar certo E não no errado.
    const splitParent = container.querySelector('.split-parent');
    expect(splitParent).not.toBeNull();
    expect(splitParent).not.toHaveAttribute('aria-label');
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveAttribute('aria-label', 'Seu novo sorriso começa aqui');
    expect(screen.getByRole('heading', { level: 1, name: 'Seu novo sorriso começa aqui' })).toBe(h1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leva o CTA principal ao WhatsApp', () => {
    render(<Hero onAbrirVideo={() => {}} />);
    expect(screen.getByRole('link', { name: /Agendar minha avaliação/i }))
      .toHaveAttribute('href', expect.stringContaining('wa.me/551122740228'));
  });

  it('dispara o tour ao clicar no card de video', () => {
    const abrir = vi.fn();
    render(<Hero onAbrirVideo={abrir} />);
    screen.getByRole('button', { name: /Tour pela clínica/i }).click();
    expect(abrir).toHaveBeenCalledOnce();
  });

  it('descreve a foto do hero para leitor de tela', () => {
    render(<Hero onAbrirVideo={() => {}} />);
    expect(screen.getByAltText(/Paciente sorrindo na Smile/i)).toBeInTheDocument();
  });

  it('nao afirma numero que a clinica nao tem', () => {
    const { container } = render(<Hero onAbrirVideo={() => {}} />);
    expect(container.textContent).not.toMatch(/\d+\s*\+/);
    expect(container.textContent).not.toMatch(/★|estrelas/);
  });

  it('sob prefers-reduced-motion, a headline continua um h1 puro (sem SplitText)', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { container } = render(<Hero onAbrirVideo={() => {}} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Seu novo sorriso começa aqui');
    // Sem podeAnimar, o SplitText não monta — nada de span.split-parent na
    // árvore, só o texto puro que o servidor já mandou.
    expect(container.querySelector('.split-parent')).toBeNull();
    // E sem SplitText o aria-label seria redundante — o texto já é o nome.
    expect(heading).not.toHaveAttribute('aria-label');

    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }));
  });
});
