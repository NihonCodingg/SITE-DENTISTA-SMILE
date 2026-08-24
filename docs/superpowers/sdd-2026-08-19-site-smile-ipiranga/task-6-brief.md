### Task 6: Header, menu mobile e WhatsApp flutuante

**Files:**
- Create: `site/components/layout/Header.tsx`, `MobileMenu.tsx`, `WhatsAppFab.tsx`
- Create: `site/__tests__/header.test.tsx`
- Modify: `site/app/page.tsx`

**Interfaces:**
- Consumes: `waLink()`, `TELEFONE` da Task 1; `useCapability()` da Task 3
- Produces: `<Header />`, `<WhatsAppFab />`

O design não tem menu mobile — a nav dele quebra em `flex-basis:100%` e empilha quatro links, o que em 375px come a dobra. **Esta task corrige isso**: nav horizontal só no desktop, drawer no mobile.

- [ ] **Step 1: Configurar o registry do React Bits e instalar o menu**

```bash
cd site && npx shadcn@latest init --yes
```

Adicionar em `components.json`:

```json
{ "registries": { "@react-bits": "https://reactbits.dev/r/{name}.json" } }
```

```bash
cd site && npx shadcn@latest add @react-bits/staggered-menu
```

- [ ] **Step 2: Escrever o teste que falha**

Criar `site/__tests__/header.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Header', () => {
  it('mostra as quatro ancoras de navegacao', () => {
    render(<Header />);
    ['Tratamentos','A Clínica','Depoimentos','Como Chegar'].forEach(t =>
      expect(screen.getByRole('link', { name: t })).toBeInTheDocument());
  });

  it('aponta o CTA para o WhatsApp certo', () => {
    render(<Header />);
    const cta = screen.getByRole('link', { name: /Agendar avaliação/i });
    expect(cta).toHaveAttribute('href', expect.stringContaining('wa.me/551122740228'));
  });

  it('tem link de telefone acessivel', () => {
    render(<Header />);
    expect(screen.getByLabelText('Ligar para a Smile')).toHaveAttribute('href', 'tel:+5511981691210');
  });
});

describe('WhatsAppFab', () => {
  it('tem rotulo acessivel', () => {
    render(<WhatsAppFab />);
    expect(screen.getByLabelText('Falar no WhatsApp')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `cd site && npm test -- header`
Expected: FAIL — módulos não encontrados

- [ ] **Step 4: Implementar o Header**

Traduzir o `<header>` do `.dc.html`. Pontos obrigatórios:
- `sticky top-0 z-50`, fundo `rgba(255,255,255,.94)` com `backdrop-blur-[8px]`, borda inferior `#F1E7DB`
- Logo `/img/logo.png` com `next/image`, `height={46}`, `priority`
- Nav com as 4 âncoras: `hidden md:flex`, Jost 13px, `tracking-[.14em]`, uppercase
- Botão de telefone: círculo 44px, borda `#E8DCCA`, `aria-label="Ligar para a Smile"`
- CTA pílula: fundo `#FCCC24`, texto `#111`, `hover:bg-[#F0B40C]`, `min-h-[44px]`
- `<MobileMenu />` visível só em `md:hidden`

O header encolhe ao rolar: ScrollTrigger reduz o padding vertical de 10px para 6px depois de 80px de scroll, animando só `transform` do wrapper interno.

- [ ] **Step 5: Implementar o MobileMenu**

Usar `StaggeredMenu` do React Bits, com as 4 âncoras mais "Agendar avaliação". Requisitos:
- Botão hambúrguer com `aria-expanded` e `aria-controls`
- `Escape` fecha
- Foco preso enquanto aberto, devolvido ao botão ao fechar
- Trava o scroll do body enquanto aberto (`lenis.stop()` / `lenis.start()`)
- Sob `!podeAnimar`, abre sem escalonamento

- [ ] **Step 6: Implementar o WhatsAppFab**

`fixed right-4 bottom-4 z-[60]`, 58x58px, círculo `#FCCC24`, ícone SVG do WhatsApp em `#111`, `aria-label="Falar no WhatsApp"`, sombra `0 12px 30px rgba(17,17,17,.28)`.

Entra com `scale(0) -> scale(1)` depois que o hero sai da viewport, para não competir com o CTA do hero. Sob `!podeAnimar`, aparece direto.

- [ ] **Step 7: Rodar e confirmar que passa**

Run: `cd site && npm test -- header`
Expected: PASS (4 testes)

- [ ] **Step 8: Conferir no navegador em 375px**

Run: `cd site && npm run dev`
Verificar: em 375px a nav horizontal some, o hambúrguer aparece, o drawer abre e fecha, e o FAB não cobre nenhum botão.

- [ ] **Step 9: Commit**

```bash
cd site && git add -A && git commit -m "feat: header sticky, menu mobile e botao flutuante de WhatsApp"
```

---

