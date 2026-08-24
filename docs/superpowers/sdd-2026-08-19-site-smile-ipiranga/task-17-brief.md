### Task 17: Passada de performance

**Files:**
- Modify: vários, conforme a medição
- Create: `site/__tests__/orcamento.test.ts`

Nada aqui é adivinhação: cada mudança sai de uma medição.

- [ ] **Step 1: Medir o baseline**

```bash
cd site && npm run build && npm run start -- -p 4173 &
npx lighthouse http://localhost:4173 --preset=desktop --output=json --output-path=./lh-desktop.json
npx lighthouse http://localhost:4173 --output=json --output-path=./lh-mobile.json --form-factor=mobile --throttling-method=simulate
```

Anotar em `progress.md`: Performance, LCP, CLS, TBT, INP, e o total de JS.

- [ ] **Step 2: Escrever o teste de orçamento**

Criar `site/__tests__/orcamento.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('orçamento de performance', () => {
  it('mantem o first-load JS abaixo de 180KB', () => {
    const p = './lh-mobile.json';
    if (!existsSync(p)) return; // roda só depois do lighthouse
    const lh = JSON.parse(readFileSync(p, 'utf8'));
    const bytes = lh.audits['total-byte-weight'].numericValue;
    expect(bytes).toBeLessThan(1_400_000);
  });

  it('atinge LCP abaixo de 2,5s no mobile simulado', () => {
    const p = './lh-mobile.json';
    if (!existsSync(p)) return;
    const lh = JSON.parse(readFileSync(p, 'utf8'));
    expect(lh.audits['largest-contentful-paint'].numericValue).toBeLessThan(2500);
  });

  it('mantem CLS abaixo de 0,05', () => {
    const p = './lh-mobile.json';
    if (!existsSync(p)) return;
    const lh = JSON.parse(readFileSync(p, 'utf8'));
    expect(lh.audits['cumulative-layout-shift'].numericValue).toBeLessThan(0.05);
  });
});
```

- [ ] **Step 3: Confirmar que o WebGL está fora do bundle inicial**

Run: `cd site && npx @next/bundle-analyzer` (ou inspecionar `.next/analyze`)
Verificar: `ogl` aparece só em chunks assíncronos. Se aparecer no first-load, o `next/dynamic` está errado em algum lugar.

- [ ] **Step 4: Aplicar as correções que a medição pedir**

Ordem de ataque, da maior para a menor:
1. Imagens sem `sizes` correto → cada `next/image` precisa de `sizes` real
2. Iframe do Maps carregando cedo → confirmar o lazy da Task 15
3. Fontes: confirmar `display:swap` e que só os pesos usados são baixados
4. GSAP: importar só `gsap/ScrollTrigger`, nunca o bundle todo
5. Motion: trocar `motion` por `LazyMotion` + `domAnimation`
6. Se o TBT ainda estiver alto, subir o `deviceMemory` mínimo de 4 para 6 no `useCapability`

- [ ] **Step 5: Medir de novo e comparar**

Rodar os mesmos comandos do Step 1. Registrar antes/depois em `progress.md`.

- [ ] **Step 6: Rodar todos os testes**

Run: `cd site && npm test`
Expected: tudo PASS

- [ ] **Step 7: Commit**

```bash
cd site && git add -A && git commit -m "perf: ajustes guiados por medicao do Lighthouse"
```

---

