### Task 10: Pilares e Tratamentos

**Files:**
- Create: `site/components/sections/Pilares.tsx`, `site/components/sections/Tratamentos.tsx`
- Create: `site/__tests__/tratamentos.test.tsx`

**Interfaces:**
- Consumes: `PILARES`, `TRATAMENTOS` da Task 4; `waLink()`; `<Reveal>` da Task 5

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/tratamentos.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pilares } from '@/components/sections/Pilares';
import { Tratamentos } from '@/components/sections/Tratamentos';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Pilares', () => {
  it('mostra os quatro pilares como h3', () => {
    render(<Pilares />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  });
});

describe('Tratamentos', () => {
  it('lista os sete tratamentos mais o CTA', () => {
    render(<Tratamentos />);
    expect(screen.getAllByRole('link')).toHaveLength(8);
  });

  it('cada tratamento abre o WhatsApp com mensagem propria', () => {
    render(<Tratamentos />);
    const facetas = screen.getByRole('link', { name: /Facetas/i });
    expect(facetas.getAttribute('href')).toContain('facetas');
    expect(facetas.getAttribute('href')).toContain('wa.me/551122740228');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- tratamentos`
Expected: FAIL

- [ ] **Step 3: Implementar Pilares**

Grid `repeat(auto-fit,minmax(min(220px,100%),1fr))`, gap 28px. Cada item: borda superior 3px amarela, `<h3>` Archivo Black 17px, descrição 16px grafite. Envolver cada um em `<Reveal delay={i * 0.08} />` para entrada escalonada.

- [ ] **Step 4: Implementar Tratamentos**

Fundo creme. **Lista de linhas, não cards** — é assim no design. Cada linha é um `<a>` com grid `auto auto 1fr auto`:
- número em Jost dourado
- miniatura quadrada `clamp(60px,8vw,92px)`, `rounded-[14px]`
- nome em Archivo Black `clamp(21px,3vw,34px)` + descrição
- círculo 46px com seta, borda 1.5px preta

`hover:bg-branco` com `transition:background .25s`. No mobile, a coluna `1fr` precisa de `min-w-0` para não estourar. Cada linha com `min-h-[44px]`.

Com `podeAnimar` e `(pointer:fine)`: `GlareHover` do React Bits em cada linha.

```bash
cd site && npx shadcn@latest add @react-bits/glare-hover
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `cd site && npm test -- tratamentos`
Expected: PASS (3 testes)

- [ ] **Step 6: Commit**

```bash
cd site && git add -A && git commit -m "feat: secoes de pilares e tratamentos"
```

---

