import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

// Arquivo isolado (em vez de um describe dentro de profissional.test.tsx)
// porque o mock de módulo abaixo substitui @/lib/content inteiro para TODO
// teste deste arquivo — misturar com os testes de ComoFunciona (que
// precisam de PASSOS de verdade) no mesmo arquivo faria o mock vazar entre
// describes.
vi.mock('@/lib/content', async (importarOriginal) => {
  const real = await importarOriginal<typeof import('@/lib/content')>();
  return { ...real, ANTES_DEPOIS: [] };
});

describe('AntesDepois com ANTES_DEPOIS vazio', () => {
  it('nao renderiza a secao — sem titulo orfao quando as fotos somem', async () => {
    const { AntesDepois } = await import('@/components/sections/AntesDepois');
    const { container } = render(<AntesDepois />);
    expect(container.querySelector('section#antes-depois')).toBeNull();
    expect(container.textContent).toBe('');
  });
});
