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

  it('sem a foto no disco, cai no fallback com o glifo — nao aponta pra outra imagem', () => {
    // As 7 imagens trat-*.jpg nao existem em public/img nesta task. Nao pode
    // haver <img> quebrada apontando pra elas: o fallback e o glifo ✦.
    const { container } = render(<Tratamentos />);
    expect(container.querySelectorAll('img[src*="trat-"]').length).toBe(0);
    expect(container.textContent?.match(/✦/g)?.length).toBe(TRATAMENTOS.length);
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
