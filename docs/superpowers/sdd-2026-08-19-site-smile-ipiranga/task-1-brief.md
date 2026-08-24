### Task 1: Scaffold, tokens e fontes

**Files:**
- Create: `site/` (via create-next-app), `site/app/globals.css`, `site/app/layout.tsx`, `site/lib/contact.ts`
- Create: `site/__tests__/tokens.test.tsx`

**Interfaces:**
- Produces: tokens CSS `--cor-*`; `waLink(msg?: string): string`, `TELEFONE`, `WHATSAPP_DISPLAY`, `ENDERECO` de `lib/contact.ts`

- [ ] **Step 1: Criar o projeto e o repositório**

```bash
cd "D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA"
npx create-next-app@latest site --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*" --turbopack --no-install
cd site && npm install
git init && git add -A && git commit -m "chore: scaffold Next.js 15 + TypeScript + Tailwind"
```

- [ ] **Step 2: Instalar dependências de teste e motion**

```bash
cd site
npm i gsap lenis motion
npm i -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configurar o Vitest**

Criar `site/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
```

Criar `site/vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Adicionar em `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 4: Escrever o teste que falha**

Criar `site/__tests__/contact.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { waLink, TELEFONE, WHATSAPP_DISPLAY, ENDERECO } from '@/lib/contact';

describe('contact', () => {
  it('monta o link do WhatsApp com o número correto', () => {
    expect(waLink()).toContain('https://wa.me/551122740228');
  });

  it('codifica a mensagem no parâmetro text', () => {
    expect(waLink('Olá, tudo bem?')).toContain('text=Ol%C3%A1%2C%20tudo%20bem%3F');
  });

  it('expõe telefone e endereço confirmados', () => {
    expect(TELEFONE).toBe('+5511981691210');
    expect(WHATSAPP_DISPLAY).toBe('(11) 2274-0228');
    expect(ENDERECO.numero).toBe('507');
    expect(ENDERECO.cep).toBe('04216-060');
  });
});
```

- [ ] **Step 5: Rodar o teste e confirmar que falha**

Run: `cd site && npm test -- contact`
Expected: FAIL — `Cannot find module '@/lib/contact'`

- [ ] **Step 6: Implementar `lib/contact.ts`**

```ts
export const TELEFONE = '+5511981691210';
export const TELEFONE_DISPLAY = '(11) 98169-1210';
export const WHATSAPP_E164 = '551122740228';
export const WHATSAPP_DISPLAY = '(11) 2274-0228';

export const ENDERECO = {
  rua: 'Rua Clemente Pereira',
  numero: '507',
  bairro: 'Ipiranga',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '04216-060',
  referencia: 'região da Rua Silva Bueno',
} as const;

export const INSTAGRAM = 'https://www.instagram.com/smileipiranga';

export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Rua Clemente Pereira, 507, Ipiranga, São Paulo');

export function waLink(mensagem = 'Olá! Quero agendar uma avaliação.'): string {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(mensagem)}`;
}
```

- [ ] **Step 7: Rodar o teste e confirmar que passa**

Run: `cd site && npm test -- contact`
Expected: PASS (3 testes)

- [ ] **Step 8: Definir tokens e fontes**

Substituir `site/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-branco: #FFFFFF;
  --color-creme: #FCF0E4;
  --color-amarelo: #FCCC24;
  --color-dourado: #F0B40C;
  --color-preto: #111111;
  --color-grafite: #5A5A55;
  --color-borda: #EBDFCE;
  --color-borda-forte: #E8DCCA;
  --color-escuro-linha: #2A2A28;
  --color-escuro-texto: #B7B7B2;
  --color-escuro-fraco: #8A8A85;

  --font-titulo: var(--fonte-archivo), sans-serif;
  --font-rotulo: var(--fonte-jost), sans-serif;
  --font-corpo: var(--fonte-source), sans-serif;
  --font-script: var(--fonte-caveat), cursive;

  --radius-bloco: 32px;
  --radius-card: 24px;
  --radius-mini: 16px;
}

html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--color-branco);
  color: var(--color-preto);
  font-family: var(--font-corpo);
  -webkit-font-smoothing: antialiased;
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

- [ ] **Step 9: Carregar as fontes no layout**

Em `site/app/layout.tsx`:

```tsx
import { Archivo_Black, Jost, Source_Sans_3, Caveat } from 'next/font/google';
import './globals.css';

const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--fonte-archivo', display: 'swap' });
const jost = Jost({ subsets: ['latin'], weight: ['300','400','500'], variable: '--fonte-jost', display: 'swap' });
const source = Source_Sans_3({ subsets: ['latin'], weight: ['400','600','700'], variable: '--fonte-source', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], weight: '600', variable: '--fonte-caveat', display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${jost.variable} ${source.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Rodar build e testes**

Run: `cd site && npm test && npm run build`
Expected: testes PASS, build sem erro

- [ ] **Step 11: Commit**

```bash
cd site && git add -A && git commit -m "feat: tokens de design, fontes e dados de contato"
```

---

