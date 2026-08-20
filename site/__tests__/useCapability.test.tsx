import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCapability } from '@/lib/useCapability';

/**
 * Cria um mock de MediaQueryList e o instala como `matchMedia` global.
 * Devolve a MESMA instância (mql) em toda chamada de `matchMedia(...)`
 * dentro do teste, com `addEventListener`/`removeEventListener` como
 * vi.fn() acessíveis — necessário para capturar o handler de 'change'
 * e para afirmar que o cleanup remove exatamente esse handler.
 */
function mockMatchMedia(reduz: boolean) {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  const mql = {
    matches: reduz,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener,
    removeEventListener,
  };
  vi.stubGlobal('matchMedia', () => mql);
  return mql;
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

  it('bloqueia o pesado em aparelho com poucos núcleos', () => {
    mockMatchMedia(false);
    vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 2, connection: { saveData: false } });
    const { result } = renderHook(() => useCapability());
    expect(result.current.podeAnimar).toBe(true);
    expect(result.current.podePesado).toBe(false);
  });

  it('trata ausência de deviceMemory e hardwareConcurrency como aparelho capaz', () => {
    // Safari e Firefox não expõem navigator.deviceMemory; vários browsers
    // também não expõem hardwareConcurrency em todo contexto. Ausência da
    // API não pode ser lida como "aparelho fraco" — o hook cai no
    // fallback `?? 8` e trata como capaz.
    mockMatchMedia(false);
    vi.stubGlobal('navigator', { connection: { saveData: false } });
    const { result } = renderHook(() => useCapability());
    expect(result.current.podeAnimar).toBe(true);
    expect(result.current.podePesado).toBe(true);
  });

  it('reage em tempo real quando a preferência de reduced-motion muda', () => {
    const mql = mockMatchMedia(false);
    vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: false } });
    const { result } = renderHook(() => useCapability());
    expect(result.current.podeAnimar).toBe(true);
    expect(result.current.podePesado).toBe(true);

    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    const handler = mql.addEventListener.mock.calls[0][1] as () => void;

    act(() => {
      mql.matches = true;
      handler();
    });

    expect(result.current.podeAnimar).toBe(false);
    expect(result.current.podePesado).toBe(false);
  });

  it('remove o listener de change ao desmontar', () => {
    const mql = mockMatchMedia(false);
    vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: false } });
    const { unmount } = renderHook(() => useCapability());

    const handler = mql.addEventListener.mock.calls[0][1] as () => void;
    expect(mql.removeEventListener).not.toHaveBeenCalled();

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith('change', handler);
  });
});
