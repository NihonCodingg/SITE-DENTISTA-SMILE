import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Profissional } from '@/components/sections/Profissional';
import { AntesDepois } from '@/components/sections/AntesDepois';
import { ComoFunciona } from '@/components/sections/ComoFunciona';
import { PASSOS, ANTES_DEPOIS } from '@/lib/content';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Profissional', () => {
  it('mostra o nome confirmado do responsavel', () => {
    render(<Profissional />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Dr. Vinicius Aracena');
  });

  it('mantem o CRO marcado como pendente, sem inventar numero', () => {
    render(<Profissional />);
    expect(screen.getByText(/CRO-SP a confirmar/i)).toBeInTheDocument();
    expect(screen.queryByText(/CRO-SP\s*\d/)).toBeNull();
  });

  it('marca o trecho pendente com a borda tracejada dourada do brief', () => {
    render(<Profissional />);
    const trecho = screen.getByText('CRO-SP a confirmar');
    expect(trecho.className).toMatch(/border-dashed/);
    expect(trecho.className).toMatch(/border-dourado/);
  });

  it('nao inventa formacao, tempo de atuacao ou numero de CRO', () => {
    // BRIEFING.md §4: só nome e especialidade declarada estão confirmados.
    // Nenhum dígito pode aparecer perto de "CRO", e nenhuma das palavras que
    // indicariam um dado de formação/tempo de atuação inventado.
    const { container } = render(<Profissional />);
    expect(container.textContent).not.toMatch(/anos? de (experiência|atuação)|formad[oa] (pela|em|no)/i);
  });

  it('usa a foto real do doutor, nao mais o frame de video antigo', () => {
    const { container } = render(<Profissional />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toContain('dr-vinicius.jpg');
  });
});

describe('AntesDepois', () => {
  it('exibe o aviso legal exigido', () => {
    render(<AntesDepois />);
    expect(screen.getByText(/publicadas com autorização dos pacientes/i)).toBeInTheDocument();
    expect(screen.getByText(/Cada caso é único/i)).toBeInTheDocument();
  });

  it('nao promete resultado', () => {
    const { container } = render(<AntesDepois />);
    expect(container.textContent).not.toMatch(/garantid|melhor resultado|sempre funciona/i);
  });

  it('renderiza uma imagem para cada item de ANTES_DEPOIS, sem inventar paciente', () => {
    const { container } = render(<AntesDepois />);
    const imgs = Array.from(container.querySelectorAll('img'));
    expect(imgs).toHaveLength(ANTES_DEPOIS.length);
    ANTES_DEPOIS.forEach((item) => {
      // next/image reescreve `src` para a URL do otimizador
      // (`/_next/image?url=%2Fimg%2F...`) — comparamos só o nome do
      // arquivo, que sobrevive ao percent-encoding, em vez do caminho
      // completo com barras.
      const arquivo = item.img.split('/').pop()!;
      expect(imgs.some((img) => img.getAttribute('src')?.includes(arquivo))).toBe(true);
    });
  });

  it('o scroller tem overflow-x proprio, nao a secao inteira', () => {
    const { container } = render(<AntesDepois />);
    const secao = container.querySelector('section#antes-depois');
    const scroller = container.querySelector('.antes-depois-scroller');
    expect(scroller).not.toBeNull();
    expect(scroller?.className).toMatch(/overflow-x-auto/);
    expect(secao?.className ?? '').not.toMatch(/overflow-x-auto/);
  });
});

describe('ComoFunciona', () => {
  it('mostra os quatro passos como h3, com numero, titulo e descricao reais', () => {
    render(<ComoFunciona />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
    PASSOS.forEach((p) => {
      expect(screen.getByRole('heading', { level: 3, name: p.titulo })).toBeInTheDocument();
      expect(screen.getByText(p.desc)).toBeInTheDocument();
      expect(screen.getByText(p.n)).toBeInTheDocument();
    });
  });

  it('tem um titulo de secao (h2) com a copy aprovada', () => {
    render(<ComoFunciona />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      /Da primeira mensagem ao seu tratamento/i
    );
  });

  it('a linha de progresso e decorativa, nunca lida por leitor de tela', () => {
    const { container } = render(<ComoFunciona />);
    const linha = container.querySelector('.bg-amarelo\\/40');
    expect(linha).not.toBeNull();
    expect(linha?.getAttribute('aria-hidden')).toBe('true');
  });
});
