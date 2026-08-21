import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pilares } from '@/components/sections/Pilares';
import { Tratamentos } from '@/components/sections/Tratamentos';
import { PILARES, TRATAMENTOS } from '@/lib/content';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Pilares', () => {
  it('mostra os quatro pilares como h3', () => {
    render(<Pilares />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  });

  it('usa titulo e descricao reais de lib/content.ts, sem parafrasear', () => {
    render(<Pilares />);
    PILARES.forEach((p) => {
      expect(screen.getByRole('heading', { level: 3, name: p.titulo })).toBeInTheDocument();
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
