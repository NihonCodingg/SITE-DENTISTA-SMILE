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
  default: () => <div data-testid="silk-stub" />,
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

  it('nao monta o fundo WebGL sob prefers-reduced-motion', async () => {
    cap(true, 8);
    const { queryByTestId } = render(<HeroBackdrop />);
    await waitFor(() => expect(queryByTestId('silk-stub')).toBeNull());
  });

  it('nao monta o fundo WebGL em aparelho de pouca memoria', async () => {
    cap(false, 2);
    const { queryByTestId } = render(<HeroBackdrop />);
    await waitFor(() => expect(queryByTestId('silk-stub')).toBeNull());
  });

  it('fica sempre fora da arvore de acessibilidade', () => {
    cap(false, 8);
    const { container } = render(<HeroBackdrop />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });
});
