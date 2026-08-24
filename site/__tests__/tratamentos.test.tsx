import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pilares } from '@/components/sections/Pilares';
import { Tratamentos } from '@/components/sections/Tratamentos';
import { PILARES, TRATAMENTOS } from '@/lib/content';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Pilares', () => {
  // Task 18 (A2): os quatro rótulos NÃO são headings. A seção não tem <h2>
  // e o heading anterior na página é o <h1> do hero — um <h3> aqui saltava
  // nível (axe `heading-order`, WCAG 1.3.1, reprovava o Lighthouse de
  // acessibilidade). "Atendimento humanizado" etc. são rótulos de 2-3
  // palavras sem conteúdo organizado abaixo, não subtítulos de subseção:
  // viraram <p><strong>, com as mesmas classes (visual idêntico).
  it('mostra os quatro rotulos por texto, sem nenhum heading de nivel 3 na secao', () => {
    const { container } = render(<Pilares />);
    PILARES.forEach((p) => {
      expect(screen.getByText(p.titulo)).toBeInTheDocument();
    });
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    expect(container.querySelectorAll('h3')).toHaveLength(0);
    // Nem heading de nível nenhum: a seção inteira fica entre o <h1> do hero
    // e o <h2> de Tratamentos, sem título próprio (COPY.md §3 não tem um).
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
  });

  it('usa titulo e descricao reais de lib/content.ts, sem parafrasear', () => {
    render(<Pilares />);
    PILARES.forEach((p) => {
      const rotulo = screen.getByText(p.titulo);
      expect(rotulo.tagName).toBe('STRONG');
      expect(screen.getByText(p.desc)).toBeInTheDocument();
    });
  });
});

describe('Tratamentos', () => {
  // Regressão: o bloco de título da seção (COPY.md §4 — sobretítulo,
  // título e intro) foi esquecido na Task 10 e não pego por nenhuma
  // review; a seção pulava direto da margem para a linha "01 Facetas" (ver
  // fix-titulos-report.md). Se alguém remover o bloco de novo, este teste
  // falha.
  it('mostra o bloco de titulo da secao (sobretitulo, h2 e intro de COPY.md §4)', () => {
    render(<Tratamentos />);
    expect(screen.getByText('O que fazemos')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Soluções que transformam sorrisos' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cada caso começa com uma avaliação\. A partir dela, montamos o plano de tratamento/i)
    ).toBeInTheDocument();
  });

  // Task 20: as sete linhas viraram uma roda de opções (OptionWheel) com o
  // tratamento escolhido aberto ao lado. O que estes testes guardavam —
  // os sete tratamentos presentes, com número, nome e descrição reais, cada
  // um levando ao WhatsApp com mensagem própria — continua valendo; muda
  // onde procurar.
  it('oferece os sete tratamentos como opcoes da roda', () => {
    render(<Tratamentos />);
    const opcoes = screen.getAllByRole('option');
    expect(opcoes).toHaveLength(TRATAMENTOS.length);
    TRATAMENTOS.forEach((t) => {
      expect(opcoes.some((o) => o.textContent === t.nome)).toBe(true);
    });
  });

  it('mantem os sete pares nome + descricao no documento, mesmo fora de tela', () => {
    const { container } = render(<Tratamentos />);
    const lista = container.querySelector('ul.sr-only');
    expect(lista).not.toBeNull();
    TRATAMENTOS.forEach((t) => {
      expect(lista!.textContent).toContain(t.nome);
      expect(lista!.textContent).toContain(t.desc);
    });
  });

  it('o painel mostra numero, nome e descricao reais do tratamento selecionado', () => {
    render(<Tratamentos />);
    const primeiro = TRATAMENTOS[0];
    expect(screen.getByRole('heading', { level: 3, name: primeiro.nome })).toBeInTheDocument();
    expect(screen.getByText(primeiro.n)).toBeInTheDocument();
    expect(screen.getByText(primeiro.desc)).toBeInTheDocument();
  });

  it('cada tratamento abre o WhatsApp com mensagem propria', () => {
    render(<Tratamentos />);
    const primeiro = TRATAMENTOS[0];
    const cta = screen.getByRole('link', { name: new RegExp(`Falar sobre ${primeiro.nome}`, 'i') });
    expect(cta.getAttribute('href')).toContain(encodeURIComponent(primeiro.nome.toLowerCase()));
    expect(cta.getAttribute('href')).toContain('wa.me/551122740228');
    expect(cta.className).toContain('pressable');
  });

  it('a foto do painel vem do disco — sem cair no glifo de fallback', () => {
    const { container } = render(<Tratamentos />);
    expect(container.querySelector('img[src*="trat-"]')).not.toBeNull();
    expect(container.textContent?.match(/✦/g)).toBeNull();
  });

  it('a secao carrega o id que o Header (Task 6) ja espera em #tratamentos', () => {
    const { container } = render(<Tratamentos />);
    expect(container.querySelector('#tratamentos')).toBeTruthy();
  });

});
