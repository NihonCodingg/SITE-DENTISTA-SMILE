### Task 7: Hero estático

**Files:**
- Create: `site/components/sections/Hero.tsx`, `site/components/ui/SectionHeading.tsx`
- Create: `site/__tests__/hero.test.tsx`
- Modify: `site/app/page.tsx`

**Interfaces:**
- Consumes: `waLink()`, `useCapability()`
- Produces: `<Hero onAbrirVideo={(slug: string) => void} />`

Motion e WebGL ficam para a Task 8. Aqui a estrutura precisa estar correta e a dobra de 375px precisa passar.

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/hero.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/sections/Hero';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Hero', () => {
  it('usa a headline da marca como h1 unico', () => {
    render(<Hero onAbrirVideo={() => {}} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Seu novo sorriso começa aqui/i);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leva o CTA principal ao WhatsApp', () => {
    render(<Hero onAbrirVideo={() => {}} />);
    expect(screen.getByRole('link', { name: /Agendar minha avaliação/i }))
      .toHaveAttribute('href', expect.stringContaining('wa.me/551122740228'));
  });

  it('dispara o tour ao clicar no card de video', () => {
    const abrir = vi.fn();
    render(<Hero onAbrirVideo={abrir} />);
    screen.getByRole('button', { name: /Tour pela clínica/i }).click();
    expect(abrir).toHaveBeenCalledOnce();
  });

  it('descreve a foto do hero para leitor de tela', () => {
    render(<Hero onAbrirVideo={() => {}} />);
    expect(screen.getByAltText(/Paciente sorrindo na Smile/i)).toBeInTheDocument();
  });

  it('nao afirma numero que a clinica nao tem', () => {
    const { container } = render(<Hero onAbrirVideo={() => {}} />);
    expect(container.textContent).not.toMatch(/\d+\s*\+/);
    expect(container.textContent).not.toMatch(/★|estrelas/);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- hero`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar o Hero**

Traduzir a `<section data-screen-label="Hero">` do `.dc.html`, fiel ao design:
- Container `bg-creme rounded-[32px]`, `max-width:1360px`, padding em `clamp`
- Sobretítulo centralizado, Jost 13px, `tracking-[.34em]`, uppercase, grafite
- `/img/sorriso-arco.png` centralizado, `height:clamp(24px,3.2vw,44px)`, `alt=""`
- `<h1>` Archivo Black, `clamp(42px,7.6vw,104px)`, `leading-[.96]`, uppercase, `text-wrap:balance`, `max-w-[14ch]`
- Grid `repeat(auto-fit,minmax(min(300px,100%),1fr))` com `align-items:end`
- Coluna 1: subtítulo, CTA preto, link "Conhecer a clínica", "Resposta pelo WhatsApp"
- Coluna 2: `next/image` de `/img/hero-foto.jpg` mais o botão-card do tour sobreposto
- Coluna 3: "Facetas • Implantes • Próteses", a frase da cadeira única, endereço, @smileipiranga

**A foto do hero é o LCP.** Obrigatório `priority`, `fetchPriority="high"` e `sizes="(max-width:768px) 100vw, 460px"`.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- hero`
Expected: PASS (5 testes)

- [ ] **Step 5: Verificar a dobra em 375px**

Run: `cd site && npm run dev`
Verificar em 375x812: `<h1>` e o botão "Agendar minha avaliação" visíveis **sem rolar**. Se não estiverem, reduzir o mínimo do clamp da h1 de 42px para 38px e depois o padding superior — nessa ordem, sem mexer no resto.

- [ ] **Step 6: Commit**

```bash
cd site && git add -A && git commit -m "feat: secao hero estatica, fiel ao design"
```

---

