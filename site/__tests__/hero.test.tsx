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
    // O GSAP escreve `aria-label` no `.split-parent` com o texto ORIGINAL
    // antes de fatiar (node_modules/gsap/SplitText.js) — imune ao artefato,
    // porque não depende dos nós de texto que o split rearranja. Testar por
    // aria-label (igualdade exata, não regex frouxa) mantém o teste
    // protegendo contra qualquer regressão real de espaçamento, sem tocar
    // em código de produção para contornar uma lacuna só do jsdom.
    const splitParent = container.querySelector('.split-parent');
    expect(splitParent).not.toBeNull();
    expect(splitParent).toHaveAttribute('aria-label', 'Seu novo sorriso começa aqui');
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

    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }));
  });
});
