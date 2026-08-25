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
    // Desde 25/08/2026, com a moldura fechada (p=0, o estado do jsdom) o
    // overlay do CTA fica `visibility: hidden` de propósito — botão inerte
    // não deve ser anunciado nem alcançável, e um elemento assim tem NOME
    // ACESSÍVEL VAZIO por definição. Por isso a busca é por papel (com
    // `hidden`) + conteúdo, não por nome: o que o teste protege é que o
    // botão existe e nasce fechado.
    const cta = screen
      .getAllByRole('button', { hidden: true })
      .find((b) => /Agendar minha avaliação/i.test(b.textContent ?? ''));
    expect(cta).toBeTruthy();
    expect(cta).toHaveAttribute('aria-expanded', 'false');
  });

  it('leva o tour para o reel no Instagram, em aba nova — nas duas cópias', () => {
    render(<Hero />);
    // Desde 25/08/2026 a coluna de contato renderiza em DOIS lugares com
    // papéis excludentes: dentro do palco em tela larga e na faixa abaixo no
    // celular (quem esconde uma delas é o CSS, que o jsdom não aplica). As
    // duas precisam apontar para o mesmo reel — se uma divergir, metade dos
    // visitantes recebe o link errado.
    // `hidden` + filtro por conteúdo, pela mesma razão do teste do CTA: a
    // cópia do palco nasce dentro do overlay `visibility: hidden` em p=0 e
    // por isso tem nome acessível vazio.
    const links = screen
      .getAllByRole('link', { hidden: true })
      .filter((l) => /Tour pela clínica/i.test(l.textContent ?? ''));
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', REEL_TOUR);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
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

  // Regressão da Task 21 (achado do dono do projeto): numa tela de 375px a
  // moldura fechada nascia com 44% de largura — 165px — enquanto a headline
  // media 300. O texto aparecia INTEIRO POR FORA da moldura. A correção é uma
  // moldura por faixa de tela; o que se lê aqui é o `clip-path` que o
  // ScrollExpand escreve de verdade, não a prop que o Hero passa.
  //
  // Na Task 24 a moldura ganhou um TETO EM PIXELS por cima da porcentagem
  // (`maxStartWidthPx`), para ela parar de crescer com a tela quando já cabe o
  // conteúdo. Nas duas larguras abaixo o teto não morde — 608px é mais que
  // 86% de 375 e mais que 44% de 1280 —, então o que este teste continua
  // medindo é a escolha de FAIXA, que é o que ele sempre mediu.
  it.each([
    { largura: 375, esperado: 7, faixa: 'celular' },   // (100 - 86) / 2
    { largura: 1280, esperado: 28, faixa: 'desktop' }, // (100 - 44) / 2
  ])('a moldura fechada usa a largura da faixa $faixa', ({ largura, esperado }) => {
    const original = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { value: largura, configurable: true });

    const { container } = render(<Hero />);
    const moldura = container.querySelector<HTMLElement>('[style*="clip-path"]');
    expect(moldura).not.toBeNull();

    const lados = moldura!.style.clipPath.match(/[\d.]+%/g) ?? [];
    // inset(<vertical>% <horizontal>% ...) — o segundo valor é o recuo lateral.
    expect(Math.round(parseFloat(lados[1]))).toBe(esperado);

    Object.defineProperty(window, 'innerWidth', { value: original, configurable: true });
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
