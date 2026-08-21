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

  it('lista os sete tratamentos mais o CTA', () => {
    render(<Tratamentos />);
    expect(screen.getAllByRole('link')).toHaveLength(8);
  });

  it('cada tratamento abre o WhatsApp com mensagem propria', () => {
    render(<Tratamentos />);
    const facetas = screen.getByRole('link', { name: /Facetas/i });
    expect(facetas.getAttribute('href')).toContain('facetas');
    expect(facetas.getAttribute('href')).toContain('wa.me/551122740228');
  });

  it('cada linha usa numero, nome e descricao reais — nenhum dado inventado', () => {
    render(<Tratamentos />);
    TRATAMENTOS.forEach((t) => {
      const link = screen.getByRole('link', { name: new RegExp(t.nome, 'i') });
      expect(link.textContent).toContain(t.n);
      expect(link.textContent).toContain(t.desc);
    });
  });

  it('as sete linhas tem foto real no disco — nenhuma cai no fallback do glifo', () => {
    // O cliente entregou foto para os 7 tratamentos (trat-clareamento.jpg foi
    // o ultimo, processado na rodada de correcao da Task 19). Todas as 7
    // linhas devem renderizar <img>, e o glifo ✦ de fallback nao deve
    // aparecer mais — nao ha <img> quebrada apontando pra foto que nao existe
    // porque existeFoto() confirma cada arquivo em disco antes de decidir.
    const { container } = render(<Tratamentos />);
    expect(container.querySelectorAll('img[src*="trat-"]').length).toBe(TRATAMENTOS.length);
    expect(container.textContent?.match(/✦/g)).toBeNull();
  });

  it('a secao carrega o id que o Header (Task 6) ja espera em #tratamentos', () => {
    const { container } = render(<Tratamentos />);
    expect(container.querySelector('#tratamentos')).toBeTruthy();
  });

  it('cada linha e pressionavel (feedback de toque)', () => {
    render(<Tratamentos />);
    TRATAMENTOS.forEach((t) => {
      const link = screen.getByRole('link', { name: new RegExp(t.nome, 'i') });
      expect(link.className).toContain('pressable');
    });
  });

  it('a coluna de texto tem min-w-0 para nao estourar no mobile', () => {
    const { container } = render(<Tratamentos />);
    expect(container.querySelector('.min-w-0')).toBeTruthy();
  });
});
