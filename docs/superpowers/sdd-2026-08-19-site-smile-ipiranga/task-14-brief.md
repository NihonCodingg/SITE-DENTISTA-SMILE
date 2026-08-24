### Task 14: Profissional, Antes e Depois, Como Funciona

**Files:**
- Create: `site/components/sections/Profissional.tsx`, `AntesDepois.tsx`, `ComoFunciona.tsx`
- Create: `site/__tests__/profissional.test.tsx`

**Interfaces:**
- Consumes: `PASSOS`, `ANTES_DEPOIS` da Task 4; `<Reveal>`

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/profissional.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Profissional } from '@/components/sections/Profissional';
import { AntesDepois } from '@/components/sections/AntesDepois';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Profissional', () => {
  it('mostra o nome confirmado do responsavel', () => {
    render(<Profissional />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Dr. Vinicius Aracena');
  });

  it('mantem o CRO marcado como pendente, sem inventar numero', () => {
    render(<Profissional />);
    expect(screen.getByText(/CRO-SP a confirmar/i)).toBeInTheDocument();
    expect(screen.queryByText(/CRO-SP\s*\d/)).toBeNull();
  });
});

describe('AntesDepois', () => {
  it('exibe o aviso legal exigido', () => {
    render(<AntesDepois />);
    expect(screen.getByText(/publicadas com autorização dos pacientes/i)).toBeInTheDocument();
    expect(screen.getByText(/Cada caso é único/i)).toBeInTheDocument();
  });

  it('nao promete resultado', () => {
    const { container } = render(<AntesDepois />);
    expect(container.textContent).not.toMatch(/garantid|melhor resultado|sempre funciona/i);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- profissional`
Expected: FAIL

- [ ] **Step 3: Implementar Profissional**

Fundo creme. Duas colunas, `max-width:1080px`. Esquerda: `/img/dr-vinicius.jpg` em `aspect-[4/5]`, `rounded-[24px]`, `max-width:380px`. Direita: sobretítulo, `<h2>Dr. Vinicius Aracena</h2>`, linha "Ortodontista · CRO-SP a confirmar" com `border-bottom:2px dashed #F0B40C` no trecho pendente, e o parágrafo.

> **Bloqueio de publicação:** esta seção não vai ao ar com o CRO pendente. Está desenhada e construída; só falta o dado. Ver `PERGUNTAS-CLIENTE.md`.

- [ ] **Step 4: Implementar Antes e Depois**

Fundo creme, scroller horizontal com snap, 5 imagens quadradas `min(300px,80vw)`, `rounded-[20px]`. O aviso legal abaixo, 13.5px, grafite, `max-width:72ch` — **texto exato de `COPY.md`, sem encurtar**.

Renderizar a seção só quando `ANTES_DEPOIS.length > 0`, para que remover as imagens remova a seção limpa.

- [ ] **Step 5: Implementar Como Funciona**

Grid `repeat(auto-fit,minmax(min(230px,100%),1fr))`, gap 24px. Cada passo: borda superior, número em Archivo Black 40px amarelo, `<h3>` 17px, descrição 16px. `<Reveal delay={i * 0.1} />`.

Com `podeAnimar`: uma linha de progresso vertical ligando os quatro números, desenhada com ScrollTrigger (`scaleY` de 0 a 1 conforme a seção passa). Só `transform`.

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `cd site && npm test -- profissional`
Expected: PASS (4 testes)

- [ ] **Step 7: Commit**

```bash
cd site && git add -A && git commit -m "feat: secoes do profissional, antes e depois e como funciona"
```

---

