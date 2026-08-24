### Task 12: A Clínica e Depoimentos

**Files:**
- Create: `site/components/sections/Clinica.tsx`, `site/components/sections/Depoimentos.tsx`
- Create: `site/__tests__/clinica.test.tsx`
- Modify: `site/app/page.tsx`

**Interfaces:**
- Consumes: `<VideoCard>`, `<Lightbox>` da Task 11; `DEPOIMENTOS` da Task 4

O design manda o card de vídeo da clínica para fora, no Instagram. **Isso muda:** agora temos o vídeo da recepção local, então ele abre no lightbox. Um clique que sai do site é um clique perdido.

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/clinica.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Clinica } from '@/components/sections/Clinica';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', class {
  observe() {} unobserve() {} disconnect() {}
});

describe('Clinica', () => {
  it('mantem o texto do ambiente', () => {
    render(<Clinica onAbrirVideo={() => {}} />);
    expect(screen.getByRole('heading', { level: 2 }))
      .toHaveTextContent(/Um lugar onde dá vontade de sentar e conversar/i);
  });

  it('nao manda o usuario para fora do site', () => {
    const { container } = render(<Clinica onAbrirVideo={() => {}} />);
    const externos = Array.from(container.querySelectorAll('a[target="_blank"]'));
    expect(externos).toHaveLength(0);
  });

  it('abre o video da recepcao no lightbox', () => {
    const abrir = vi.fn();
    render(<Clinica onAbrirVideo={abrir} />);
    screen.getByRole('button', { name: /recepção/i }).click();
    expect(abrir).toHaveBeenCalledWith('recepcao');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- clinica`
Expected: FAIL

- [ ] **Step 3: Implementar A Clínica**

Duas colunas `repeat(auto-fit,minmax(min(320px,100%),1fr))`, gap em clamp, `align-items:center`:
- Esquerda: sobretítulo "O ambiente", `<h2>`, parágrafo (copy de `COPY.md`, sem alterar)
- Direita: `<VideoCard slug="recepcao">` 9:16, `width:min(360px,100%)`, `rounded-[24px]`, com gradiente inferior e rótulo "Vídeo / Conheça a recepção"

- [ ] **Step 4: Implementar Depoimentos**

Carrossel horizontal com `scroll-snap-type:x mandatory`, três `<VideoCard>` de `DEPOIMENTOS`. Cada card `flex:0 0 min(260px,78vw)`, aspecto 9/14.

Adicionar `GradualBlur` do React Bits nas bordas do scroller para indicar que continua:

```bash
cd site && npx shadcn@latest add @react-bits/gradual-blur
```

Remover o parágrafo do design "Arraste o frame de cada vídeo para o quadro; o player entra quando os arquivos chegarem" — era instrução para o designer, não copy do site. Trocar por nada.

- [ ] **Step 5: Ligar o Lightbox na página**

Em `app/page.tsx`, manter o estado `videoAberto: string | null` e passar `onAbrirVideo` para Hero, Clinica e Depoimentos. Um único `<Lightbox>` na raiz.

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `cd site && npm test -- clinica`
Expected: PASS (3 testes)

- [ ] **Step 7: Commit**

```bash
cd site && git add -A && git commit -m "feat: secoes da clinica e depoimentos com video local"
```

---

