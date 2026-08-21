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

  it('marca o CRO pendente com a borda tracejada dourada do brief', () => {
    render(<Profissional />);
    const trecho = screen.getByText('CRO-SP a confirmar');
    expect(trecho.className).toMatch(/border-dashed/);
    expect(trecho.className).toMatch(/border-dourado/);
  });

  // Regressão (review pós-implementação): BRIEFING.md §4 marca a
  // especialidade em si como pendência separada do CRO ("Ortodontista
  // (bordado no jaleco)... ⚠️ PENDENTE — confirmar se é especialidade
  // registrada") — não uma coisa só. A primeira versão desta seção só
  // tracejava o CRO; pela Resolução CFO-196/2019 não se anuncia
  // especialidade sem registro correspondente, então "Ortodontista" exibido
  // como fato afirmado, sem essa confirmação, carrega o mesmo risco
  // regulatório que um CRO inventado.
  it('marca TAMBEM a especialidade (Ortodontista) como pendente, nao so o CRO', () => {
    render(<Profissional />);
    const especialidade = screen.getByText('Ortodontista');
    expect(especialidade.className).toMatch(/border-dashed/);
    expect(especialidade.className).toMatch(/border-dourado/);
  });

  it('nao inventa formacao, tempo de atuacao ou numero de CRO', () => {
    // BRIEFING.md §4: só o nome está confirmado sem ressalva — especialidade
    // e CRO são as duas pendências marcadas acima. Nenhum dígito pode
    // aparecer perto de "CRO", e nenhuma das palavras que indicariam um
    // dado de formação/tempo de atuação inventado.
    const { container } = render(<Profissional />);
    expect(container.textContent).not.toMatch(/anos? de (experiência|atuação)|formad[oa] (pela|em|no)/i);
  });

  it('usa a foto real do doutor, nao mais o frame de video antigo', () => {
    const { container } = render(<Profissional />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toContain('dr-vinicius.jpg');
  });

  // Regressão (review pós-implementação): o `alt` da foto tinha
  // "...ortodontista da Smile Ipiranga" — afirmava a especialidade como
  // fato para quem usa leitor de tela, sem a ressalva de pendência que
  // quem enxerga recebe pelo tracejado (teste acima). `alt` deve descrever
  // a CENA, não repetir a credencial — que já está no texto da seção,
  // marcada como pendente. Se alguém reescrever o `alt` no futuro e
  // reintroduzir a credencial, este teste pega.
  it('o alt da foto descreve a cena, nao afirma a especialidade nao confirmada', () => {
    const { container } = render(<Profissional />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt') ?? '').not.toMatch(/ortodontista/i);
    // ...enquanto o texto da seção continua trazendo a especialidade, com a
    // marcação de pendente intacta (não é uma remoção da informação, é uma
    // mudança de ONDE e COMO ela aparece).
    expect(container.textContent).toMatch(/ortodontista/i);
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

  // Task 18 (C): ritmo da página. Profissional, Depoimentos, Antes/Depois,
  // Como Funciona e Localização eram cinco seções seguidas em creme; esta é
  // a que quebra o bloco ao meio, em branco. Se voltar a creme, o trecho
  // inteiro volta a ser monótono — e ninguém além deste teste percebe.
  it('fica em bg-branco para quebrar o bloco de cinco secoes em creme', () => {
    const { container } = render(<ComoFunciona />);
    const secao = container.querySelector('section#como-funciona');
    expect(secao).not.toBeNull();
    expect(secao?.className).toMatch(/\bbg-branco\b/);
    expect(secao?.className).not.toMatch(/\bbg-creme\b/);
  });
});
