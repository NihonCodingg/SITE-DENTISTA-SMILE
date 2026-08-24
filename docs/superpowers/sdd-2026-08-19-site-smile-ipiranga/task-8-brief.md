### Task 8: Motion do hero + fundo WebGL

**Files:**
- Create: `site/components/sections/HeroBackdrop.tsx`
- Modify: `site/components/sections/Hero.tsx`
- Create: `site/__tests__/heroBackdrop.test.tsx`

**Interfaces:**
- Consumes: `useCapability()`
- Produces: `<HeroBackdrop />` — canvas WebGL, montado só quando `podePesado === true`

- [ ] **Step 1: Instalar os componentes do React Bits**

```bash
cd site && npx shadcn@latest add @react-bits/split-text @react-bits/silk @react-bits/magnet
```

`Silk` traz `ogl` junto. Confirmar na Task 14 que `ogl` **não** entra no bundle inicial.

- [ ] **Step 2: Escrever o teste que falha**

Criar `site/__tests__/heroBackdrop.test.tsx`:

```tsx
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
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `cd site && npm test -- heroBackdrop`
Expected: FAIL — módulo não encontrado

- [ ] **Step 4: Implementar o HeroBackdrop**

```tsx
'use client';
import dynamic from 'next/dynamic';
import { useCapability } from '@/lib/useCapability';

const Silk = dynamic(() => import('@/components/ui/Silk'), { ssr: false, loading: () => null });

export function HeroBackdrop() {
  const { podePesado, montado } = useCapability();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
      {montado && podePesado && (
        <div className="absolute inset-0 opacity-[.28]">
          <Silk speed={2.4} scale={1.1} color="#F0B40C" noiseIntensity={1.1} rotation={0.12} />
        </div>
      )}
    </div>
  );
}
```

O container existe sempre, com `aria-hidden`, para que o layout não mude quando o canvas entra. `opacity:.28` mantém o dourado como textura em vez de protagonista — a headline preta continua com contraste AA sobre o creme.

- [ ] **Step 5: Aplicar o reveal da headline**

Em `Hero.tsx`, quando `podeAnimar`, trocar o `<h1>` estático por `SplitText`:
- `splitType="words"`, `delay={40}`, `duration={.8}`, `ease="power3.out"`, `from={{opacity:0, y:'0.4em'}}`
- Quando `!podeAnimar`, renderizar o `<h1>` puro

**O texto precisa existir no HTML do servidor** para SEO e para o LCP. O SplitText só assume depois da hidratação.

- [ ] **Step 6: Aplicar Magnet nos CTAs**

Envolver os dois CTAs do hero com `Magnet` (`padding={80}`, `magnetStrength={6}`), ativo só quando `podeAnimar` **e** `matchMedia('(pointer:fine)')`. No touch, Magnet não faz sentido e só custa listener.

- [ ] **Step 7: Rodar e confirmar que passa**

Run: `cd site && npm test -- heroBackdrop && npm test -- hero`
Expected: PASS em ambos

- [ ] **Step 8: Medir o custo**

Run: `cd site && npm run build`
Verificar: `ogl` e `Silk` num chunk separado, **fora** do first-load JS da rota.

- [ ] **Step 9: Commit**

```bash
cd site && git add -A && git commit -m "feat: motion do hero com reveal de texto e fundo WebGL gateado"
```

---

