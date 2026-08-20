import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { HeroBackdrop } from '@/components/sections/HeroBackdrop';

function cap(reduz: boolean, memoria: number) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce') ? reduz : false, media: q,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('navigator', { deviceMemory: memoria, hardwareConcurrency: 8, connection: { saveData: false } });
}

describe('HeroBackdrop', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('nao monta canvas sob prefers-reduced-motion', () => {
    cap(true, 8);
    const { container } = render(<HeroBackdrop />);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('nao monta canvas em aparelho de pouca memoria', () => {
    cap(false, 2);
    const { container } = render(<HeroBackdrop />);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('fica sempre fora da arvore de acessibilidade', () => {
    cap(false, 8);
    const { container } = render(<HeroBackdrop />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });
});
