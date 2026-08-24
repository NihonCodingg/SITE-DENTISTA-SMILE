### Task 3: Detecção de capacidade do dispositivo

**Files:**
- Create: `site/lib/useCapability.ts`
- Create: `site/__tests__/useCapability.test.tsx`

**Interfaces:**
- Produces: `useCapability(): { podeAnimar: boolean; podePesado: boolean; montado: boolean }`
  - `podeAnimar` — false se `prefers-reduced-motion: reduce`
  - `podePesado` — false se `!podeAnimar`, ou `saveData`, ou `deviceMemory < 4`, ou `hardwareConcurrency < 4`
  - `montado` — false no SSR e no primeiro render, para evitar hydration mismatch

Este hook é o **único** lugar do projeto que consulta `matchMedia` ou `navigator.connection`. Toda seção com motion pesado consome ele.

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/useCapability.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- useCapability`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar o hook**

```ts
'use client';
import { useEffect, useState } from 'react';

export type Capacidade = { podeAnimar: boolean; podePesado: boolean; montado: boolean };

export function useCapability(): Capacidade {
  const [cap, setCap] = useState<Capacidade>({ podeAnimar: false, podePesado: false, montado: false });

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');

    const avaliar = () => {
      const podeAnimar = !mq.matches;
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      const economia = nav.connection?.saveData === true;
      const memoria = nav.deviceMemory ?? 8;
      const nucleos = nav.hardwareConcurrency ?? 8;
      setCap({
        podeAnimar,
        podePesado: podeAnimar && !economia && memoria >= 4 && nucleos >= 4,
        montado: true,
      });
    };

    avaliar();
    mq.addEventListener('change', avaliar);
    return () => mq.removeEventListener('change', avaliar);
  }, []);

  return cap;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- useCapability`
Expected: PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
cd site && git add -A && git commit -m "feat: hook de capacidade do dispositivo para gatear motion pesado"
```

---

