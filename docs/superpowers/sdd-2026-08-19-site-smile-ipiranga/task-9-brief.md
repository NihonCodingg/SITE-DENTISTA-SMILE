### Task 9: Ticker reativo ao scroll

**Files:**
- Create: `site/components/sections/Ticker.tsx`
- Create: `site/__tests__/ticker.test.tsx`

**Interfaces:**
- Consumes: `TRATAMENTOS` da Task 4, `useCapability()`
- Produces: `<Ticker />`

- [ ] **Step 1: Instalar o componente**

```bash
cd site && npx shadcn@latest add @react-bits/scroll-velocity
```

- [ ] **Step 2: Escrever o teste que falha**

Criar `site/__tests__/ticker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Ticker } from '@/components/sections/Ticker';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Ticker', () => {
  it('lista os sete tratamentos', () => {
    render(<Ticker />);
    const txt = screen.getByTestId('ticker').textContent ?? '';
    ['Facetas','Implantes','Protocolo de implante','Próteses','Ortodontia','Limpeza profissional','Clareamento']
      .forEach(t => expect(txt).toContain(t));
  });

  it('fica fora da arvore de acessibilidade por ser decorativo repetido', () => {
    render(<Ticker />);
    expect(screen.getByTestId('ticker')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `cd site && npm test -- ticker`
Expected: FAIL

- [ ] **Step 4: Implementar**

Faixa `bg-amarelo rounded-[16px] mx-3 mt-1.5`, Jost 500 14px, `tracking-[.22em]`, uppercase, itens separados por `✦`.

Com `podeAnimar`: `ScrollVelocity` do React Bits, `velocity={40}` de base, acelerando com o scroll. Sem: faixa estática, mesmo texto, sem animação.

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `cd site && npm test -- ticker`
Expected: PASS (2 testes)

- [ ] **Step 6: Commit**

```bash
cd site && git add -A && git commit -m "feat: ticker de tratamentos reagindo a velocidade do scroll"
```

---

