import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCapability } from '@/lib/useCapability';

function mockMatchMedia(reduz: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce') ? reduz : false,
    media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
}

describe('useCapability', () => {
  beforeEach(() => { vi.unstubAllGlobals(); });

  it('bloqueia animação quando o usuário pede menos movimento', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useCapability());
    expect(result.current.podeAnimar).toBe(false);
    expect(result.current.podePesado).toBe(false);
  });

  it('permite tudo num aparelho capaz sem restrição', () => {
    mockMatchMedia(false);
    vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: false } });
    const { result } = renderHook(() => useCapability());
    expect(result.current.podeAnimar).toBe(true);
    expect(result.current.podePesado).toBe(true);
  });

  it('bloqueia o pesado quando o usuário liga economia de dados', () => {
    mockMatchMedia(false);
    vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: true } });
    const { result } = renderHook(() => useCapability());
    expect(result.current.podeAnimar).toBe(true);
    expect(result.current.podePesado).toBe(false);
  });

  it('bloqueia o pesado em aparelho de pouca memória', () => {
    mockMatchMedia(false);
    vi.stubGlobal('navigator', { deviceMemory: 2, hardwareConcurrency: 8, connection: { saveData: false } });
    const { result } = renderHook(() => useCapability());
    expect(result.current.podePesado).toBe(false);
  });
});
