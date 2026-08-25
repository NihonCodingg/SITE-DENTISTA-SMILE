import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProvaSocial } from '@/components/ui/ProvaSocial';
import { PENDENTE } from '@/components/ui/pendente';
import { SORRISOS } from '@/lib/content';

/**
 * A regra do projeto é nunca inventar dado da clínica. "Mais de mil sorrisos
 * transformados" e cinco estrelas são as DUAS coisas inventadas que o site
 * exibe hoje — entraram a pedido do dono do projeto, com referência visual
 * própria, e ficam com a marcação de pendência até a clínica confirmar o
 * número e a origem da nota.
 *
 * Estes testes existem para que a marcação não caia sem querer numa refatoração
 * futura: se alguém tirar o tracejado, o vermelho aparece aqui e não em
 * produção.
 */
describe('ProvaSocial', () => {
  it('a afirmação de número nasce marcada como pendente', () => {
    const { container } = render(<ProvaSocial />);
    // A frase precisa existir e estar DENTRO do bloco tracejado. O seletor
    // procura pelo pedaço estável da constante `PENDENTE` (o tracejado), e não
    // pelas classes de espessura/cor, que podem mudar sem mudar o sentido.
    expect(PENDENTE).toContain('border-dashed');
    screen.getByText(/Mais de mil sorrisos transformados/i);
    const marcado = container.querySelector('[class*="border-dashed"]');
    expect(marcado).not.toBeNull();
    expect(marcado!.textContent).toMatch(/Mais de mil sorrisos transformados/i);
  });

  it('as estrelas ficam dentro da mesma marcação, não soltas', () => {
    const { container } = render(<ProvaSocial />);
    const marcado = container.querySelector('[class*="border-dashed"]');
    expect(marcado).not.toBeNull();
    // Cinco estrelas, todas dentro do bloco marcado.
    expect(marcado!.querySelectorAll('svg')).toHaveLength(5);
    expect(container.querySelectorAll('svg')).toHaveLength(5);
  });

  it('os rostos são retratos que o site já exibe, não fotos novas', () => {
    const { container } = render(<ProvaSocial />);
    const imgs = Array.from(container.querySelectorAll('img'));
    expect(imgs.length).toBeGreaterThan(0);

    const daGaleria = SORRISOS.map((s) => s.img);
    imgs.forEach((img) => {
      const src = decodeURIComponent(img.getAttribute('src') ?? '');
      expect(daGaleria.some((caminho) => src.includes(caminho))).toBe(true);
    });
  });

  it('os rostos não entram no nome acessível — quem carrega o sentido é o texto', () => {
    const { container } = render(<ProvaSocial />);
    const fileira = container.querySelector('[aria-hidden="true"]');
    expect(fileira).not.toBeNull();
    expect(fileira!.querySelectorAll('img').length).toBeGreaterThan(0);
    // Nenhum link: o original do magicui envolve cada avatar num <a> para um
    // perfil, e paciente não tem perfil para onde ir.
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });
});
