import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { HeroBackdrop } from '@/components/sections/HeroBackdrop';

// O Silk real (components/reactbits/Silk.tsx) desenha num <canvas> via
// three/@react-three/fiber, que jsdom não sustenta — e entra por
// `next/dynamic({ ssr:false })`, que resolve de forma ASSÍNCRONA. Procurar
// `container.querySelector('canvas')` logo depois do render devolvia `null`
// sempre, inclusive com o gate `montado && podePesado` removido: os testes
// negativos passavam por construção, sem provar nada (achado I3 da review
// final da branch). Com o stub, o que a árvore monta é síncrono de observar,
// e o teste positivo abaixo é o controle que dá sentido aos negativos.
vi.mock('@/components/reactbits/Silk', () => ({
  default: ({ reducedMotion }: { reducedMotion?: boolean }) => (
    <div data-testid="silk-stub" data-reduzido={reducedMotion ? 'sim' : 'nao'} />
  ),
}));

function cap(reduz: boolean, memoria: number) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce') ? reduz : false, media: q,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('navigator', { deviceMemory: memoria, hardwareConcurrency: 8, connection: { saveData: false } });
}

describe('HeroBackdrop', () => {
  beforeEach(() => vi.unstubAllGlobals());

  // Controle positivo: sem ele, os dois negativos abaixo não distinguem
  // "o gate barrou" de "o componente nunca monta neste ambiente".
  it('monta o fundo WebGL em aparelho capaz', async () => {
    cap(false, 8);
    const { queryByTestId } = render(<HeroBackdrop />);
    await waitFor(() => expect(queryByTestId('silk-stub')).not.toBeNull());
  });

  // CONTRATO CORRIGIDO EM 25/08/2026. Este teste exigia que o fundo SUMISSE
  // sob movimento reduzido — ou seja, protegia o bug: quem liga "reduzir
  // movimento" no sistema ficava com a moldura em creme chapado, sem o
  // dourado da marca (achado numa captura do dono do projeto). O dourado é
  // TEXTURA, não animação, e a regra desta base é "reduzir não é zerar".
  // O que a preferência de movimento deve fazer é CONGELAR a textura, e é
  // isso que o teste passa a exigir.
  it('sob prefers-reduced-motion o fundo CONTINUA, congelado', async () => {
    cap(true, 8);
    const { queryByTestId } = render(<HeroBackdrop />);
    await waitFor(() => expect(queryByTestId('silk-stub')).not.toBeNull());
    expect(queryByTestId('silk-stub')).toHaveAttribute('data-reduzido', 'sim');
  });

  it('sem preferencia de movimento, o fundo anima', async () => {
    cap(false, 8);
    const { queryByTestId } = render(<HeroBackdrop />);
    await waitFor(() => expect(queryByTestId('silk-stub')).not.toBeNull());
    expect(queryByTestId('silk-stub')).toHaveAttribute('data-reduzido', 'nao');
  });

  // Este continua barrando de verdade: pouca memória é limite de APARELHO,
  // não preferência de quem usa — e aí não há textura congelada que salve.
  it('nao monta o fundo WebGL em aparelho de pouca memoria', async () => {
    cap(false, 2);
    const { queryByTestId } = render(<HeroBackdrop />);
    await waitFor(() => expect(queryByTestId('silk-stub')).toBeNull());
  });

  // A textura da marca NUNCA some — este é o contrato que faltava e que
  // teria pego o celular sem dourado: o canvas tem três portões (montagem,
  // aparelho, largura), e todo caminho barrado precisa cair na IMAGEM
  // estática da mesma seda, não num creme chapado.
  it('a textura estatica esta presente em aparelho capaz E em aparelho fraco', async () => {
    for (const memoria of [8, 2]) {
      cap(false, memoria);
      const { container, unmount } = render(<HeroBackdrop />);
      expect(container.querySelector('img[src*="seda-dourada"]')).not.toBeNull();
      unmount();
    }
  });

  it('fica sempre fora da arvore de acessibilidade', () => {
    cap(false, 8);
    const { container } = render(<HeroBackdrop />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });
});
