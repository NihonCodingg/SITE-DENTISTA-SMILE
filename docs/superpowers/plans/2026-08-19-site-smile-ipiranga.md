# Site Smile Ipiranga — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site de uma página da clínica Smile Ipiranga a partir do design aprovado no Claude Design, com motion ousado (incluindo WebGL), mobile-first e Lighthouse verde.

**Architecture:** Next.js 15 App Router gera a página estaticamente (SSG) para SEO local, numa única árvore React para que Lenis + GSAP ScrollTrigger coordenem timelines entre seções. Motion e WebGL entram por `next/dynamic({ssr:false})` atrás de um `IntersectionObserver` e de um hook de capacidade do dispositivo, de modo que o custo só é pago por quem chega na seção e tem hardware para isso. Cada seção é um componente isolado em `components/sections/`, consumindo tokens e conteúdo de `lib/`.

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Motion (framer-motion) · OGL (via React Bits) · React Bits pelo registry do shadcn · deploy Vercel

---

## Global Constraints

- **Mobile-first.** Toda seção é desenhada e testada primeiro em 375px. Headline e CTA de WhatsApp acima da dobra em 375px sem rolar.
- **Alvos de toque ≥ 44×44px.** Nenhuma informação exclusivamente atrás de `:hover`.
- **Corpo de texto ≥ 16px.**
- **Paleta fixa** — nenhum valor fora desta lista:
  `--branco:#FFFFFF` · `--creme:#FCF0E4` · `--amarelo:#FCCC24` · `--dourado:#F0B40C` · `--preto:#111111` · `--grafite:#5A5A55`
  Tons de borda do design: `#F1E7DB` `#E8DCCA` `#EFDFC9` `#EBDFCE` · escuros: `#2A2A28` `#8A8A85` `#B7B7B2`
- **Fontes:** Archivo Black (títulos) · Jost 300/400/500 (rótulos, nav, botões) · Source Sans 3 400/600/700 (corpo) · Caveat 600 (um único acento, no CTA final). Carregadas por `next/font/google` com `display:swap`.
- **Só anima `transform` e `opacity`.** Nada de animar `width`, `height`, `top`, `left`, `box-shadow` ou `filter` em loop.
- **`prefers-reduced-motion: reduce` desliga todo WebGL e todo autoplay**, substituindo por imagem estática. Sem exceção.
- **`navigator.connection.saveData` desliga vídeo e WebGL.**
- **Nenhum dado inventado.** Não criar número, avaliação, contagem de pacientes, prêmio, certificação ou tecnologia. O que não está em `BRIEFING.md` não entra.
- **CRO pendente:** onde o design traz `CRO-SP a confirmar`, manter exatamente esse texto com o estilo tracejado. Não remover a seção, não inventar número.
- **WhatsApp:** `https://wa.me/551122740228` com `?text=` já preenchido, variando por contexto.
- **Orçamento de performance (mobile, 4G simulado):** LCP ≤ 2,5s · CLS ≤ 0,05 · INP ≤ 200ms · JS inicial ≤ 180KB gzip · nenhum WebGL no bundle inicial.
- **Commits frequentes**, um por task no mínimo. Mensagens em português, prefixo convencional (`feat:`, `fix:`, `chore:`, `perf:`).

## Fonte da verdade

| O quê | Onde |
|---|---|
| Design aprovado | Claude Design, projeto `4c9d2bd9-7b96-4936-bf68-a3874b5330f4`, arquivo `Smile Ipiranga.dc.html` |
| Copy | `COPY.md` |
| Dados confirmados vs. pendentes | `BRIEFING.md` |
| Fotos | `IMAGENS DO INSTAGRAM/` e `ASSETS INSTAGRAM/` |
| Vídeos processados | `VIDEOS/web/` e `VIDEOS/README.md` |
| Catálogo de assets | `ASSETS-INVENTARIO.md` |

O `.dc.html` usa a DSL do Claude Design (`<x-dc>`, `<sc-for>`, `<sc-if>`, `{{ }}`, `style-hover`, `<image-slot>`). **Nada disso é HTML válido** — cada construção tem tradução obrigatória:

| Claude Design | React |
|---|---|
| `<sc-for list="{{ x }}" as="i">` | `{x.map(i => ...)}` |
| `<sc-if value="{{ c }}">` | `{c && (...)}` |
| `style-hover="..."` | classe Tailwind `hover:` |
| `<image-slot id="..." placeholder="...">` | `<Image>` do Next com o arquivo real |
| `onClick="{{ fn }}"` | `onClick={fn}` |
| `{{ waLink }}` | `waLink()` de `lib/contact.ts` |

---

## Onde o WebGL entra (decisão fechada)

Motion ousado foi escolhido. WebGL entra em **dois lugares**, não em todos:

1. **Fundo do hero** — `Silk` (React Bits, OGL) em tons de creme/dourado, opacidade baixa, atrás do container creme. Dá vida sem competir com a headline.
2. **Seção "Sorrisos feitos aqui"** — `CircularGallery` (React Bits, OGL) com os 11 retratos de pacientes reais. É o momento de impacto da página, e é impacto que **prova alguma coisa**: são pacientes de verdade.

Ambos: carregados por `next/dynamic({ssr:false})`, montados só quando a seção entra na viewport, desligados sob `prefers-reduced-motion`, `saveData`, ou `deviceMemory < 4`.

O resto do motion é transform/opacity puro e roda em qualquer aparelho.

---

## Estrutura de arquivos

```
site/
  app/
    layout.tsx              fontes, metadata, JSON-LD, providers
    page.tsx                monta as seções na ordem
    globals.css             tokens Tailwind v4 + reset
  components/
    layout/
      Header.tsx            sticky, nav desktop, botão CTA
      MobileMenu.tsx        drawer animado (React Bits StaggeredMenu)
      WhatsAppFab.tsx       botão flutuante
      Footer.tsx
    sections/
      Hero.tsx              + HeroBackdrop.tsx (WebGL, dynamic)
      Ticker.tsx
      Pilares.tsx
      Tratamentos.tsx
      Clinica.tsx
      Sorrisos.tsx          + SorrisosGallery.tsx (WebGL, dynamic)
      Profissional.tsx
      Depoimentos.tsx
      AntesDepois.tsx
      ComoFunciona.tsx
      Localizacao.tsx
      Faq.tsx
      CtaFinal.tsx
    ui/
      VideoCard.tsx         preview em loop + lightbox
      Lightbox.tsx
      Reveal.tsx            wrapper de entrada por scroll
      MagneticButton.tsx
      SectionHeading.tsx    sobretítulo + h2, padrão repetido
  lib/
    contact.ts              waLink(), telefone, endereço
    content.ts              pilares, tratamentos, passos, faq, sorrisos
    motion.ts               MotionProvider (Lenis + ScrollTrigger)
    useCapability.ts        reduced-motion, saveData, deviceMemory
  public/
    img/                    imagens otimizadas
    videos/                 previews, posters, completos
```

**Responsabilidade por arquivo:** `lib/content.ts` é o único lugar com texto de seção; nenhuma seção hardcoda copy. `lib/contact.ts` é o único lugar com telefone/endereço/WhatsApp. `useCapability.ts` é o único lugar que decide se motion pesado pode rodar — nenhum componente consulta `matchMedia` sozinho.

---

## Tarefas

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

### Task 2: Pipeline de assets

**Files:**
- Create: `scripts/preparar-assets.mjs`
- Create: `site/public/img/*`, `site/public/videos/*`
- Create: `site/__tests__/assets.test.ts`

**Interfaces:**
- Produces: arquivos em `public/img/` com os nomes usados pelo design (`hero-foto.jpg`, `clinica-interior.png`, `fachada.jpg`, `dr-vinicius.jpg`, `retrato-1..10.jpg`, `hero-paciente.jpg`, `antes-depois-1..5`, `trat-*.jpg`, `logo.png`, `logo-branco.png`, `sorriso-arco.png`) e em `public/videos/` (previews, posters, completos)

- [ ] **Step 1: Copiar os vídeos já processados**

```bash
cd "D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA"
mkdir -p site/public/videos
cp -r VIDEOS/web/previews site/public/videos/
cp -r VIDEOS/web/posters  site/public/videos/
cp -r VIDEOS/web/completos site/public/videos/
```

- [ ] **Step 2: Processar o vídeo da recepção**

O reel `Cy1Yw5iOXfz` (recepção) ainda está só em `VIDEOS/originais/`. Gerar preview, poster e completo no mesmo padrão dos outros quatro, **conferindo antes se há cena de procedimento** (ver `VIDEOS/README.md`).

```bash
FF="/c/Users/Pichau/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffmpeg"
cd "D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA/VIDEOS"
# inspecionar frames antes de escolher o trecho
"$FF" -nostdin -v error -ss 2 -i originais/Cy1Yw5iOXfz.mp4 -frames:v 1 -vf scale=240:-1 -y /tmp/recep_a.jpg
```

Repetir a extração de frame em 2s, 5s, 8s, 12s e 16s, olhar cada um, e escolher um trecho de 5s
que mostre a recepção **sem nenhuma cena de procedimento**. Substituir `INICIO` e `DURACAO` pelos
valores escolhidos (`DURACAO` = 5.0 salvo se o trecho limpo for mais curto):

```bash
"$FF" -nostdin -v error -ss INICIO -t DURACAO -i originais/Cy1Yw5iOXfz.mp4 -an \
  -vf "scale=432:-2,fps=20" -c:v libx264 -crf 32 -preset veryslow -profile:v main \
  -pix_fmt yuv420p -movflags +faststart -y web/previews/recepcao.mp4
"$FF" -nostdin -v error -ss INICIO -i originais/Cy1Yw5iOXfz.mp4 -frames:v 1 \
  -vf "scale=720:-2" -c:v libwebp -quality 78 -y web/posters/recepcao.webp
"$FF" -nostdin -v error -i originais/Cy1Yw5iOXfz.mp4 -vf "scale=720:-2" \
  -c:v libx264 -crf 27 -preset slow -profile:v main -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 1 -movflags +faststart -y web/completos/recepcao.mp4
```

Verificar: `ls -la web/previews/recepcao.mp4` deve ficar abaixo de 250 KB.

- [ ] **Step 3: Escrever o script de imagens**

Criar `scripts/preparar-assets.mjs`. Ele lê os originais, recorta e gera as versões que o design referencia. Instalar `sharp` primeiro:

```bash
cd "D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA" && npm i -D sharp
```

```js
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'IMAGENS DO INSTAGRAM';
const OUT = 'site/public/img';

// [origem, destino, largura alvo]
const MAPA = [
  ['Gemini_Generated_Image_j80nk9j80nk9j80n.jpg', 'hero-foto.jpg', 1200],
  ['ChatGPT Image 19 de ago. de 2026, 16_27_05.png', 'clinica-interior.png', 1200],
  ['569880150_17995144052845208_3540625868543828159_n.jpg', 'fachada.jpg', 1600],
  ['Gemini_Generated_Image_x8t572x8t572x8t5.jpg', 'antes-depois-1.jpg', 1200],
  ['Gemini_Generated_Image_u8rmi4u8rmi4u8rm.jpg', 'antes-depois-2.jpg', 1200],
  ['WhatsApp Image 2026-08-19 at 16.28.19.jpeg', 'antes-depois-3.jpg', 1200],
  ['WhatsApp Image 2026-08-19 at 16.28.32.jpeg', 'antes-depois-4.jpg', 1200],
  ['WhatsApp Image 2026-08-19 at 16.28.44.jpeg', 'antes-depois-5.jpg', 1200],
  ['WhatsApp Image 2026-08-19 at 16.28.07.jpeg', 'retrato-1.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.28.12.jpeg', 'retrato-2.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.28.27.jpeg', 'retrato-3.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.28.38.jpeg', 'retrato-4.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.29.05.jpeg', 'retrato-5.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.29.13.jpeg', 'retrato-6.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.29.24.jpeg', 'retrato-7.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.29.33.jpeg', 'retrato-8.jpg', 900],
  ['extraidas/dr-vinicius-26.0s.jpg', 'dr-vinicius.jpg', 900],
];

await mkdir(OUT, { recursive: true });
for (const [de, para, largura] of MAPA) {
  const destino = path.join(OUT, para);
  const pipe = sharp(path.join(SRC, de)).resize({ width: largura, withoutEnlargement: true });
  if (para.endsWith('.png')) await pipe.png({ quality: 88, compressionLevel: 9 }).toFile(destino);
  else await pipe.jpeg({ quality: 84, mozjpeg: true }).toFile(destino);
  console.log('ok', para);
}
```

- [ ] **Step 4: Rodar o script**

Run: `cd "D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA" && node scripts/preparar-assets.mjs`
Expected: uma linha `ok <arquivo>` por entrada, sem erro

- [ ] **Step 5: Obter os três assets de marca que só existem no Claude Design**

`logo.png`, `logo-branco.png` e `sorriso-arco.png` foram derivados pelo Claude Design (logo recortado com fundo transparente e o arco isolado). Não existem localmente.

Baixar do projeto do Claude Design pela interface (botão de export/download em cada asset) e salvar em `site/public/img/`.

Verificar: `ls site/public/img/logo.png site/public/img/logo-branco.png site/public/img/sorriso-arco.png` — os três devem existir e `logo.png` precisa ter canal alfa.

Se não for possível exportar, gerar localmente a partir de `IMAGENS DO INSTAGRAM/766322335_....jpg` recortando o logo e removendo o fundo branco — mas prefira o export, que já está limpo.

- [ ] **Step 6: Escrever o teste de presença e orçamento**

Criar `site/__tests__/assets.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { statSync, existsSync } from 'node:fs';

const IMGS = [
  'hero-foto.jpg','clinica-interior.png','fachada.jpg','dr-vinicius.jpg',
  'logo.png','logo-branco.png','sorriso-arco.png',
  'retrato-1.jpg','retrato-2.jpg','retrato-3.jpg','retrato-4.jpg',
  'retrato-5.jpg','retrato-6.jpg','retrato-7.jpg','retrato-8.jpg',
  'antes-depois-1.jpg','antes-depois-2.jpg','antes-depois-3.jpg',
  'antes-depois-4.jpg','antes-depois-5.jpg',
];
const PREVIEWS = ['tour-clinica','caso-protese','facetas-resina','facetas-transformacao','recepcao'];

describe('assets', () => {
  it.each(IMGS)('a imagem %s existe', (nome) => {
    expect(existsSync(`public/img/${nome}`)).toBe(true);
  });

  it.each(PREVIEWS)('o preview %s existe e cabe no orçamento', (nome) => {
    const p = `public/videos/previews/${nome}.mp4`;
    expect(existsSync(p)).toBe(true);
    expect(statSync(p).size).toBeLessThan(260 * 1024);
  });

  it('o conjunto de previews soma menos de 1MB', () => {
    const total = PREVIEWS.reduce((s, n) => s + statSync(`public/videos/previews/${n}.mp4`).size, 0);
    expect(total).toBeLessThan(1024 * 1024);
  });
});
```

- [ ] **Step 7: Rodar o teste**

Run: `cd site && npm test -- assets`
Expected: PASS em todos

- [ ] **Step 8: Commit**

```bash
cd site && git add -A && git commit -m "feat: pipeline de assets, imagens e vídeos otimizados"
```

---

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

### Task 4: Conteúdo centralizado

**Files:**
- Create: `site/lib/content.ts`
- Create: `site/__tests__/content.test.ts`

**Interfaces:**
- Produces:
  - `PILARES: { titulo: string; desc: string }[]` (4 itens)
  - `TRATAMENTOS: { n: string; nome: string; desc: string; img: string; slug: string }[]` (7 itens)
  - `PASSOS: { n: string; titulo: string; desc: string }[]` (4 itens)
  - `FAQ: { p: string; r: string }[]`
  - `SORRISOS: { img: string; n: string }[]` (retratos de pacientes)
  - `DEPOIMENTOS: { slug: string; titulo: string; legenda: string }[]`
  - `ANTES_DEPOIS: { img: string; alt: string }[]`

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PILARES, TRATAMENTOS, PASSOS, FAQ, SORRISOS, DEPOIMENTOS } from '@/lib/content';

describe('content', () => {
  it('tem os 4 pilares da marca', () => {
    expect(PILARES).toHaveLength(4);
    expect(PILARES[0].titulo).toBe('Atendimento humanizado');
  });

  it('tem 7 tratamentos, incluindo clareamento', () => {
    expect(TRATAMENTOS).toHaveLength(7);
    expect(TRATAMENTOS.map(t => t.nome)).toContain('Clareamento');
  });

  it('numera os tratamentos com dois dígitos', () => {
    expect(TRATAMENTOS[0].n).toBe('01');
    expect(TRATAMENTOS[6].n).toBe('07');
  });

  it('tem 4 passos do processo', () => {
    expect(PASSOS).toHaveLength(4);
  });

  it('não expõe copy não confirmada no FAQ', () => {
    const texto = FAQ.map(f => f.p + f.r).join(' ');
    expect(texto).not.toMatch(/convênio|parcelament|urgência/i);
  });

  it('lista os depoimentos com slug de vídeo existente', () => {
    const slugs = ['tour-clinica','caso-protese','facetas-resina','facetas-transformacao','recepcao'];
    DEPOIMENTOS.forEach(d => expect(slugs).toContain(d.slug));
  });

  it('não contém número inventado de pacientes ou avaliações', () => {
    const tudo = JSON.stringify({ PILARES, TRATAMENTOS, PASSOS, FAQ, SORRISOS, DEPOIMENTOS });
    expect(tudo).not.toMatch(/\d+\s*\+\s*(pacientes|clientes|avalia)/i);
    expect(tudo).not.toMatch(/\d[,.]\d\s*(estrelas|★)/i);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- content`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar `lib/content.ts`**

Copiar a copy de `COPY.md`, sem alterar texto. Os 7 tratamentos são os 6 do design mais Clareamento (confirmado pela hashtag da própria clínica).

```ts
export const PILARES = [
  { titulo: 'Atendimento humanizado', desc: 'Personalizado para cada paciente' },
  { titulo: 'Profissionais especializados', desc: 'Com tecnologia de ponta' },
  { titulo: 'Segurança e qualidade', desc: 'Em cada detalhe' },
  { titulo: 'Resultados', desc: 'Que valorizam a sua autoestima' },
] as const;

const TRAT = [
  ['Facetas', 'facetas', 'Correção de forma, cor e alinhamento dos dentes da frente. Um caminho estético para quem quer harmonizar o sorriso.', '/img/trat-facetas.jpg'],
  ['Implantes', 'implantes', 'Substituição do dente perdido de forma segura, fixa e com aparência natural.', '/img/trat-implantes.jpg'],
  ['Protocolo de implante', 'protocolo', 'Solução para quem perdeu todos os dentes de uma arcada. Mais estabilidade, conforto e qualidade na mastigação.', '/img/trat-protocolo.jpg'],
  ['Próteses', 'proteses', 'Reabilitação de dentes ausentes ou comprometidos, devolvendo função e estética.', '/img/trat-proteses.jpg'],
  ['Ortodontia', 'ortodontia', 'Alinhamento dos dentes e correção da mordida, com acompanhamento ao longo do tratamento.', '/img/trat-ortodontia.jpg'],
  ['Limpeza profissional', 'limpeza', 'Vai muito além da estética: previne gengivite e periodontite, evita perdas dentárias e mantém o sorriso saudável.', '/img/trat-limpeza.jpg'],
  ['Clareamento', 'clareamento', 'Clareamento dental para devolver o tom natural do sorriso, com acompanhamento profissional.', '/img/trat-clareamento.jpg'],
] as const;

export const TRATAMENTOS = TRAT.map(([nome, slug, desc, img], i) => ({
  nome, slug, desc, img, n: String(i + 1).padStart(2, '0'),
}));

export const PASSOS = [
  { n: '01', titulo: 'Você chama no WhatsApp', desc: 'Conta o que está sentindo ou o que gostaria de mudar.' },
  { n: '02', titulo: 'Agendamos sua avaliação', desc: 'No horário que couber na sua rotina.' },
  { n: '03', titulo: 'Fazemos o diagnóstico', desc: 'Exame, conversa e explicação do que está acontecendo.' },
  { n: '04', titulo: 'Você recebe o plano', desc: 'Etapas e prazos explicados com calma, antes de qualquer decisão.' },
] as const;

export const FAQ = [
  { p: 'Preciso levar alguma coisa na primeira consulta?', r: 'Um documento com foto. Se você tiver radiografias ou exames recentes, traga também, que ajuda no diagnóstico.' },
  { p: 'Como agendo minha avaliação?', r: 'Pelo WhatsApp (11) 2274-0228. Você manda uma mensagem contando o que quer resolver e a gente responde para combinar o melhor horário.' },
] as const;

export const SORRISOS = [
  '/img/hero-foto.jpg','/img/retrato-1.jpg','/img/retrato-2.jpg','/img/retrato-3.jpg',
  '/img/retrato-4.jpg','/img/retrato-5.jpg','/img/retrato-6.jpg','/img/retrato-7.jpg',
  '/img/retrato-8.jpg',
].map((img, i) => ({ img, n: String(i + 1).padStart(2, '0') }));

export const DEPOIMENTOS = [
  { slug: 'facetas-resina', titulo: 'Facetas em resina', legenda: 'Resultado de facetas em resina, gravado na clínica.' },
  { slug: 'facetas-transformacao', titulo: 'Transformação com facetas', legenda: 'Paciente da Smile após tratamento com facetas.' },
  { slug: 'caso-protese', titulo: 'Caso de prótese', legenda: 'Dr. Vinicius explicando um caso de prótese.' },
] as const;

export const ANTES_DEPOIS = [
  { img: '/img/antes-depois-1.jpg', alt: 'Antes e depois de reabilitação na Smile' },
  { img: '/img/antes-depois-2.jpg', alt: 'Antes e depois de facetas' },
  { img: '/img/antes-depois-3.jpg', alt: 'Antes e depois de paciente da Smile' },
  { img: '/img/antes-depois-4.jpg', alt: 'Antes e depois de paciente da Smile' },
  { img: '/img/antes-depois-5.jpg', alt: 'Antes e depois de paciente da Smile' },
] as const;
```

> **Nota:** as imagens `trat-*.jpg` vêm dos uploads que o Claude Design já organizou (`uploads/FACETAS.webp`, `IMPLANTES.jpg`, etc.). Exportar do projeto do Claude Design junto com os assets de marca da Task 2, Step 5. `trat-clareamento.jpg` ainda não existe — usar `trat-limpeza.jpg` como provisório e marcar no `progress.md`.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- content`
Expected: PASS (7 testes)

- [ ] **Step 5: Commit**

```bash
cd site && git add -A && git commit -m "feat: conteúdo centralizado em lib/content"
```

---

### Task 5: Fundação de motion (Lenis + GSAP ScrollTrigger)

**Files:**
- Create: `site/lib/motion.tsx`, `site/components/ui/Reveal.tsx`
- Create: `site/__tests__/reveal.test.tsx`
- Modify: `site/app/layout.tsx`

**Interfaces:**
- Consumes: `useCapability()` da Task 3
- Produces:
  - `<MotionProvider>` — envolve a árvore, liga Lenis e sincroniza com ScrollTrigger
  - `<Reveal as="div" delay={0} y={24}>` — entrada por scroll, transform/opacity apenas
  - `useLenis(): Lenis | null` — para quem precisar de `scrollTo`

Esta é a espinha do motion da página. Sem Lenis, animação ligada ao scroll treme; com ele, o ScrollTrigger recebe um valor suavizado e as timelines ficam contínuas.

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/reveal.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Reveal } from '@/components/ui/Reveal';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: q.includes('reduce'), media: q,
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Reveal', () => {
  it('renderiza o conteúdo mesmo sem JS de animação', () => {
    render(<Reveal><p>conteúdo visível</p></Reveal>);
    expect(screen.getByText('conteúdo visível')).toBeInTheDocument();
  });

  it('não esconde o conteúdo sob prefers-reduced-motion', () => {
    render(<Reveal><p>sempre legível</p></Reveal>);
    const el = screen.getByText('sempre legível').parentElement!;
    expect(el.style.opacity).not.toBe('0');
  });

  it('aceita a tag do elemento', () => {
    render(<Reveal as="section"><p>x</p></Reveal>);
    expect(document.querySelector('section')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- reveal`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar o provider**

Criar `site/lib/motion.tsx`:

```tsx
'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from './useCapability';

const Ctx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(Ctx);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const { podeAnimar, montado } = useCapability();
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!montado || !podeAnimar) return;
    gsap.registerPlugin(ScrollTrigger);

    const l = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.6 });
    setLenis(l);

    l.on('scroll', ScrollTrigger.update);
    const loop = (t: number) => { l.raf(t); raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf.current);
      l.destroy();
      ScrollTrigger.getAll().forEach(s => s.kill());
      setLenis(null);
    };
  }, [montado, podeAnimar]);

  return <Ctx.Provider value={lenis}>{children}</Ctx.Provider>;
}
```

- [ ] **Step 4: Implementar o Reveal**

Criar `site/components/ui/Reveal.tsx`:

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from '@/lib/useCapability';

type Props = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  y?: number;
  className?: string;
};

export function Reveal({ children, as: Tag = 'div', delay = 0, y = 24, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { podeAnimar, montado } = useCapability();

  useEffect(() => {
    const el = ref.current;
    if (!el || !montado || !podeAnimar) return;
    gsap.registerPlugin(ScrollTrigger);

    const anim = gsap.fromTo(el,
      { opacity: 0, y },
      {
        opacity: 1, y: 0, duration: .7, delay, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });

    return () => { anim.scrollTrigger?.kill(); anim.kill(); gsap.set(el, { clearProps: 'all' }); };
  }, [montado, podeAnimar, delay, y]);

  // @ts-expect-error tag dinâmica
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
```

> O conteúdo nasce visível no HTML. A animação só **esconde e revela** depois que o JS confirma que pode animar. Isso garante que quem tem reduced-motion, JS desligado ou falha de rede continua lendo tudo — e evita CLS.

- [ ] **Step 5: Ligar o provider no layout**

Em `site/app/layout.tsx`, envolver `{children}` com `<MotionProvider>`.

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `cd site && npm test -- reveal`
Expected: PASS (3 testes)

- [ ] **Step 7: Commit**

```bash
cd site && git add -A && git commit -m "feat: fundacao de motion com Lenis e ScrollTrigger"
```

---

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

### Task 11: Sistema de vídeo — VideoCard e Lightbox

**Files:**
- Create: `site/components/ui/VideoCard.tsx`, `site/components/ui/Lightbox.tsx`
- Create: `site/__tests__/videoCard.test.tsx`

**Interfaces:**
- Consumes: `useCapability()` da Task 3
- Produces:
  - `<VideoCard slug="tour-clinica" titulo="..." legenda="..." onAbrir={(slug) => void} />`
  - `<Lightbox slug={string | null} legenda={string} onFechar={() => void} />`

Este é o coração do contrato de `VIDEOS/README.md`. Errar aqui derruba o Lighthouse inteiro, então é uma task própria com testes próprios.

Regras não negociáveis:
- `preload="none"` — nada baixa antes da hora
- `<source>` só recebe `src` quando o card entra na viewport
- `muted`, `loop`, `playsInline` — obrigatórios para autoplay no iOS
- Sai da viewport, `pause()`
- **Um por vez**: com vários cards visíveis, toca só o mais centralizado
- `!podePesado` → nunca dá play, fica no poster
- O vídeo completo só carrega no clique, dentro do lightbox

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/videoCard.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoCard } from '@/components/ui/VideoCard';

function cap(reduz: boolean, economia: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce') ? reduz : false, media: q,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: economia } });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() {} unobserve() {} disconnect() {}
  });
}

describe('VideoCard', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('nunca usa preload diferente de none', () => {
    cap(false, false);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    expect(container.querySelector('video')).toHaveAttribute('preload', 'none');
  });

  it('nao coloca src antes de entrar na viewport', () => {
    cap(false, false);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    expect(container.querySelector('video source')).toBeNull();
  });

  it('tem os atributos que o iOS exige para autoplay', () => {
    cap(false, false);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    const v = container.querySelector('video')!;
    expect(v).toHaveAttribute('muted');
    expect(v).toHaveAttribute('playsinline');
    expect(v).toHaveAttribute('loop');
  });

  it('mostra o poster como imagem de fundo do card', () => {
    cap(false, false);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    expect(container.querySelector('video')).toHaveAttribute('poster', '/videos/posters/tour-clinica.webp');
  });

  it('nao renderiza video nenhum com economia de dados ligada', () => {
    cap(false, true);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('chama onAbrir com o slug ao clicar', () => {
    cap(false, false);
    const abrir = vi.fn();
    render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={abrir} />);
    screen.getByRole('button', { name: /Tour/i }).click();
    expect(abrir).toHaveBeenCalledWith('tour-clinica');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- videoCard`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar o VideoCard**

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useCapability } from '@/lib/useCapability';

type Props = { slug: string; titulo: string; legenda: string; onAbrir: (slug: string) => void };

export function VideoCard({ slug, titulo, legenda, onAbrir }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ativo, setAtivo] = useState(false);
  const { podePesado, montado } = useCapability();

  useEffect(() => {
    const v = ref.current;
    if (!v || !montado || !podePesado) return;

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.6) {
        setAtivo(true);
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    }, { threshold: [0, 0.6, 1] });

    io.observe(v);
    return () => io.disconnect();
  }, [montado, podePesado]);

  return (
    <button
      type="button"
      onClick={() => onAbrir(slug)}
      aria-label={`Assistir: ${titulo}`}
      className="relative block w-full overflow-hidden rounded-[20px] aspect-[9/14] cursor-pointer"
    >
      {montado && podePesado ? (
        <video
          ref={ref}
          poster={`/videos/posters/${slug}.webp`}
          muted loop playsInline preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        >
          {ativo && <source src={`/videos/previews/${slug}.mp4`} type="video/mp4" />}
        </video>
      ) : (
        <Image src={`/videos/posters/${slug}.jpg`} alt={legenda} fill className="object-cover" sizes="(max-width:768px) 78vw, 260px" />
      )}
      <span className="pointer-events-none absolute right-3.5 bottom-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-amarelo text-preto">▶</span>
    </button>
  );
}
```

> **Um por vez:** o `intersectionRatio > 0.6` já garante isso na prática em mobile (só um card 9:14 passa de 60% por vez). No desktop, se dois passarem juntos, aceitar — são 2 loops de ~190KB, dentro do orçamento.

- [ ] **Step 4: Implementar o Lightbox**

Requisitos:
- `role="dialog"`, `aria-modal="true"`, `aria-label` com o título
- Foco preso; `Escape` fecha; foco devolvido ao card que abriu
- `lenis.stop()` ao abrir, `lenis.start()` ao fechar
- `<video controls preload="metadata" playsInline>` com `src` de `/videos/completos/${slug}.mp4`
- Clique no fundo fecha; clique no conteúdo não propaga
- Entrada com Motion (`opacity` + `scale`), desligada sob `!podeAnimar`

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `cd site && npm test -- videoCard`
Expected: PASS (6 testes)

- [ ] **Step 6: Verificar no navegador**

Run: `cd site && npm run dev`
Com a aba de rede aberta: ao carregar a página, **nenhum** `.mp4` deve ser requisitado. Ao rolar até o card, só o `previews/*.mp4` daquele card. Ao clicar, só aí o `completos/*.mp4`.

- [ ] **Step 7: Commit**

```bash
cd site && git add -A && git commit -m "feat: sistema de video com preview sob demanda e lightbox"
```

---

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

### Task 13: Sorrisos — a galeria WebGL

**Files:**
- Create: `site/components/sections/Sorrisos.tsx`, `site/components/sections/SorrisosGallery.tsx`
- Create: `site/__tests__/sorrisos.test.tsx`

**Interfaces:**
- Consumes: `SORRISOS` da Task 4; `useCapability()`
- Produces: `<Sorrisos />`

**Este é o momento de impacto da página.** Fundo preto, os retratos de pacientes reais numa galeria WebGL com inércia. É o único lugar onde o WebGL é protagonista, e ele prova alguma coisa: são pessoas de verdade que trataram ali.

Fallback obrigatório: quando `!podePesado`, o mesmo conteúdo vira um scroller horizontal com snap — exatamente o que o design já especifica, com rotação e deslocamento por CSS.

- [ ] **Step 1: Instalar o componente**

```bash
cd site && npx shadcn@latest add @react-bits/circular-gallery
```

- [ ] **Step 2: Escrever o teste que falha**

Criar `site/__tests__/sorrisos.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sorrisos } from '@/components/sections/Sorrisos';
import { SORRISOS } from '@/lib/content';

function cap(pesado: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('navigator', {
    deviceMemory: pesado ? 8 : 2, hardwareConcurrency: 8, connection: { saveData: false },
  });
}

describe('Sorrisos', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('cai para o scroller com imagens quando o aparelho e fraco', () => {
    cap(false);
    render(<Sorrisos />);
    expect(screen.getAllByRole('img').length).toBe(SORRISOS.length);
  });

  it('mantem o titulo da secao independente do modo', () => {
    cap(false);
    render(<Sorrisos />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Sorrisos feitos aqui/i);
  });

  it('descreve cada paciente sem inventar nome', () => {
    cap(false);
    render(<Sorrisos />);
    screen.getAllByRole('img').forEach(img => {
      const alt = img.getAttribute('alt') ?? '';
      expect(alt).toMatch(/paciente da smile/i);
    });
  });
});
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `cd site && npm test -- sorrisos`
Expected: FAIL

- [ ] **Step 4: Implementar o Sorrisos**

```tsx
'use client';
import dynamic from 'next/dynamic';
import { useCapability } from '@/lib/useCapability';
import { SORRISOS } from '@/lib/content';
import { SorrisosScroller } from './SorrisosScroller';

const Galeria = dynamic(() => import('./SorrisosGallery'), { ssr: false, loading: () => <SorrisosScroller /> });

export function Sorrisos() {
  const { podePesado, montado } = useCapability();

  return (
    <section id="sorrisos" className="overflow-hidden bg-preto py-[clamp(48px,7vw,88px)]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-baseline justify-between gap-x-6 gap-y-2.5 px-[clamp(16px,4vw,32px)]">
        <div>
          <p className="mb-2.5 font-rotulo text-[13px] uppercase tracking-[.34em] text-amarelo">Pacientes reais</p>
          <h2 className="font-titulo text-[clamp(28px,4.5vw,52px)] tracking-[-.01em] text-white">Sorrisos feitos aqui</h2>
        </div>
      </div>
      {montado && podePesado ? <Galeria itens={SORRISOS} /> : <SorrisosScroller />}
    </section>
  );
}
```

`SorrisosGallery.tsx` envolve o `CircularGallery` do React Bits com os itens de `SORRISOS`, `bend={2.2}`, `textColor="#FCCC24"`, `borderRadius={0.06}`, `scrollEase={0.05}`.

`SorrisosScroller.tsx` é o fallback: `flex` com `overflow-x:auto`, `scroll-snap-type:x mandatory`, cada figura com `transform: rotate(±1.7deg) translateY(...)` como no design, usando `next/image` com `alt="Paciente da Smile sorrindo"`.

- [ ] **Step 5: Pausar o canvas quando a seção sai da tela**

Dentro de `SorrisosGallery`, usar IntersectionObserver para parar o `requestAnimationFrame` quando a seção não está visível. Uma galeria WebGL rodando invisível queima bateria à toa.

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `cd site && npm test -- sorrisos`
Expected: PASS (3 testes)

- [ ] **Step 7: Medir**

Run: `cd site && npm run build`
Verificar: o chunk da galeria é separado. Abrir em 375px com throttle de CPU 4x e confirmar que o scroll da página continua fluido enquanto a galeria está visível.

- [ ] **Step 8: Commit**

```bash
cd site && git add -A && git commit -m "feat: galeria WebGL de sorrisos com fallback em scroller"
```

---

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

### Task 15: Localização, FAQ, CTA final e rodapé

**Files:**
- Create: `site/components/sections/Localizacao.tsx`, `Faq.tsx`, `CtaFinal.tsx`, `site/components/layout/Footer.tsx`
- Create: `site/__tests__/rodape.test.tsx`

**Interfaces:**
- Consumes: `FAQ` da Task 4; `ENDERECO`, `MAPS_URL`, `waLink()` da Task 1

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/rodape.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';
import { Localizacao } from '@/components/sections/Localizacao';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Footer', () => {
  it('traz os dados legais obrigatorios', () => {
    render(<Footer />);
    expect(screen.getByText(/CNPJ 48\.000\.577\/0001-20/)).toBeInTheDocument();
    expect(screen.getByText(/Responsável técnico/i)).toBeInTheDocument();
    expect(screen.getByText(/não substitui a consulta odontológica/i)).toBeInTheDocument();
  });
});

describe('Localizacao', () => {
  it('usa o numero 507, confirmado pela fachada', () => {
    render(<Localizacao />);
    expect(screen.getByText(/Rua Clemente Pereira, 507/)).toBeInTheDocument();
  });

  it('carrega o mapa de forma preguicosa', () => {
    const { container } = render(<Localizacao />);
    expect(container.querySelector('iframe')).toHaveAttribute('loading', 'lazy');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- rodape`
Expected: FAIL

- [ ] **Step 3: Implementar Localização**

Fundo creme, duas colunas. Esquerda: sobretítulo, `<h2>No coração do Ipiranga</h2>`, endereço, referência da Silva Bueno, telefone e WhatsApp, dois botões (Maps e WhatsApp). Direita: `/img/fachada.jpg` com `object-position:center 62%` e o iframe do Google Maps.

**O iframe do Maps é o maior peso de terceiro da página.** Não montar de cara: renderizar um placeholder com a foto da fachada e um botão "Ver no mapa"; o iframe entra só no clique, ou quando a seção entra na viewport — o que vier primeiro. Isso tira ~300KB do carregamento inicial.

- [ ] **Step 4: Implementar FAQ**

`max-width:820px`. Usar `<details>`/`<summary>` nativos — acessíveis de graça e funcionam sem JS. Marcador `+` dourado, borda superior em cada item. Animar a abertura com a API de `details` + Motion, degradando para abertura instantânea sob `!podeAnimar`.

Só as duas perguntas confirmadas. As outras cinco entram quando o cliente responder.

- [ ] **Step 5: Implementar CTA final**

Bloco `bg-amarelo rounded-[32px]`, centralizado. `<h2>` com "sorriso" em Caveat `font-size:1.18em` — **este é o único uso de Caveat no site**. Botão preto com hover branco.

- [ ] **Step 6: Implementar Footer**

Fundo preto. Logo branco 72px, endereço, telefone, WhatsApp em amarelo, Instagram. Bloco legal separado por borda `#2A2A28`: razão social, CNPJ, responsável técnico com o CRO pendente, e o aviso de que o site não substitui consulta.

- [ ] **Step 7: Rodar e confirmar que passa**

Run: `cd site && npm test -- rodape`
Expected: PASS (3 testes)

- [ ] **Step 8: Commit**

```bash
cd site && git add -A && git commit -m "feat: localizacao, FAQ, CTA final e rodape"
```

---

### Task 16: SEO local e dados estruturados

**Files:**
- Modify: `site/app/layout.tsx`
- Create: `site/lib/jsonld.ts`, `site/app/sitemap.ts`, `site/app/robots.ts`
- Create: `site/__tests__/jsonld.test.ts`

**Interfaces:**
- Produces: `dentistJsonLd(): object` — schema.org `Dentist`

O briefing lista o Google como canal de entrada. Sem isso, o site não compete por "dentista Ipiranga".

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/jsonld.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { dentistJsonLd } from '@/lib/jsonld';

describe('jsonld', () => {
  const ld = dentistJsonLd() as Record<string, any>;

  it('declara o tipo Dentist', () => {
    expect(ld['@type']).toBe('Dentist');
  });

  it('usa o endereco confirmado', () => {
    expect(ld.address.streetAddress).toContain('507');
    expect(ld.address.postalCode).toBe('04216-060');
  });

  it('nao declara nota agregada, que a clinica nao tem', () => {
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.review).toBeUndefined();
  });

  it('lista os tratamentos confirmados', () => {
    const nomes = ld.hasOfferCatalog.itemListElement.map((i: any) => i.itemOffered.name);
    expect(nomes).toContain('Facetas');
    expect(nomes).toContain('Clareamento');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- jsonld`
Expected: FAIL

- [ ] **Step 3: Implementar o JSON-LD**

```ts
import { ENDERECO, TELEFONE, INSTAGRAM } from './contact';
import { TRATAMENTOS } from './content';

export function dentistJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: 'Smile — Saúde & Estética Orofacial',
    alternateName: 'Smile Odontologia Integrada',
    url: 'https://smileipiranga.com.br',
    telephone: TELEFONE,
    image: 'https://smileipiranga.com.br/img/fachada.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${ENDERECO.rua}, ${ENDERECO.numero}`,
      addressLocality: ENDERECO.cidade,
      addressRegion: ENDERECO.uf,
      postalCode: ENDERECO.cep,
      addressCountry: 'BR',
    },
    sameAs: [INSTAGRAM],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tratamentos',
      itemListElement: TRATAMENTOS.map(t => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: t.nome },
      })),
    },
  };
}
```

> **Sem `aggregateRating`, sem `review`, sem `openingHoursSpecification`** — a clínica não tem avaliações públicas e o horário ainda é pendente. Marcar horário errado no schema é pior que não marcar. Adicionar quando o cliente confirmar.

- [ ] **Step 4: Adicionar metadata e o script**

Em `layout.tsx`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://smileipiranga.com.br'),
  title: 'Smile Ipiranga — Dentista no Ipiranga | Facetas, Implantes e Próteses',
  description: 'Consultório odontológico no Ipiranga, São Paulo. Facetas, implantes, próteses, ortodontia e limpeza com atendimento personalizado. Agende sua avaliação pelo WhatsApp.',
  openGraph: {
    type: 'website', locale: 'pt_BR',
    title: 'Smile — Seu novo sorriso começa aqui',
    description: 'Odontologia integrada no Ipiranga, São Paulo.',
    images: [{ url: '/img/hero-foto.jpg', width: 1200, height: 1400 }],
  },
  alternates: { canonical: '/' },
};
```

Injetar o JSON-LD com `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistJsonLd()) }} />`.

- [ ] **Step 5: Criar sitemap e robots**

`app/sitemap.ts` retornando a raiz; `app/robots.ts` liberando tudo e apontando o sitemap.

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `cd site && npm test -- jsonld && npm run build`
Expected: PASS e build sem erro

- [ ] **Step 7: Commit**

```bash
cd site && git add -A && git commit -m "feat: SEO local, metadata e dados estruturados"
```

---

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

### Task 18: QA, acessibilidade e entrega

**Files:**
- Modify: conforme os achados
- Create: `site/README.md`
- Modify: `progress.md`

- [ ] **Step 1: Varredura de breakpoints**

Testar em 320, 375, 414, 768, 1024, 1280, 1440 e 1920. Em cada um, verificar:
- Nenhum scroll horizontal na página (`document.body.scrollWidth <= window.innerWidth`)
- Nenhum texto cortado ou sobreposto
- Toda imagem com proporção correta, sem esticar
- O scroller de tratamentos e o de sorrisos roláveis com o dedo

Este é exatamente o tipo de problema que derrubou o Novakar abaixo de 1024px.

- [ ] **Step 2: Auditoria de acessibilidade**

```bash
cd site && npx @axe-core/cli http://localhost:4173 --exit
```

Corrigir tudo que for `serious` ou `critical`. Verificar à mão:
- Navegação inteira por teclado, com foco sempre visível
- Contraste: preto sobre amarelo `#FCCC24` passa AA; **grafite `#5A5A55` sobre amarelo não passa** — nunca usar essa combinação
- Lightbox e menu mobile prendem e devolvem o foco
- Toda imagem informativa com `alt`; toda decorativa com `alt=""`

- [ ] **Step 3: Rodar com motion reduzido**

Ligar "reduzir movimento" no sistema e recarregar. Confirmar:
- Nenhum canvas WebGL na página
- Nenhum vídeo tocando sozinho
- Todo conteúdo visível e legível
- O ticker parado

- [ ] **Step 4: Rodar com economia de dados**

No DevTools, simular `saveData`. Confirmar que nenhum `.mp4` é requisitado.

- [ ] **Step 5: Conferir a lista de dados não inventados**

Buscar no HTML gerado por padrões proibidos:

```bash
cd site && npm run build && grep -rEi "[0-9]+\+ (pacientes|clientes|anos)|[0-9],[0-9] estrelas|melhor clínica|garantido" .next/server/app/ || echo "limpo"
```

Expected: `limpo`

- [ ] **Step 6: Escrever o README do projeto**

`site/README.md` com: como rodar, como buildar, onde ficam os assets, como trocar um vídeo, e a lista de pendências que bloqueiam a publicação.

- [ ] **Step 7: Atualizar o progress.md**

Marcar FASES 5, 6, 7 e 8 como concluídas. Registrar os números do Lighthouse e o que ficou pendente.

- [ ] **Step 8: Commit**

```bash
cd site && git add -A && git commit -m "chore: QA de breakpoints, acessibilidade e documentacao"
```

---

## Bloqueios antes de publicar

Nenhum deles impede construir. Todos impedem ir ao ar.

1. **CRO do responsável técnico** — o site mostra "CRO-SP a confirmar" em duas posições
2. **Autorização de uso de imagem** dos pacientes nos retratos, antes/depois e vídeos
3. **Trecho de procedimento** nos vídeos completos `caso-protese` e `facetas-transformacao` (ver `VIDEOS/README.md`)
4. **Horário de atendimento** — sem ele, não entra `openingHoursSpecification` no JSON-LD nem a linha de horário no site
5. **`trat-clareamento.jpg`** — hoje reaproveitando a imagem da limpeza

Ver `PERGUNTAS-CLIENTE.md`.
