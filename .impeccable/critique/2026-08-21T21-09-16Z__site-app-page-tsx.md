---
method: dual-agent
agent_a: aaef2b1365bac5552
agent_b: a8c05b05bd4dc3af9
heuristics: 28
heuristics_max: 32
motion: 3
audit: 15
audit_max: 20
p0: 0
p1: 3
p2: 7
p3: 4
build: ce7c58d
timestamp: 2026-08-21T21-09-16Z
slug: site-app-page-tsx
---
# Critique — Smile Ipiranga (`site/app/page.tsx`, build `ce7c58d`)

**Method: dual-agent (A: aaef2b1365bac5552 · B: a8c05b05bd4dc3af9)**

Avaliação A (design, não-ancorada: sem detector, sem Lighthouse) e Avaliação B (evidência mecânica,
sem julgamento de design) rodaram em paralelo, isoladas, contra o mesmo servidor de produção
(`localhost:4173`). Esta síntese lê A primeiro, B depois, e só então cruza. Limitação declarada
pelas duas: o painel do navegador não compositou frames (`document.hidden=true`), então tudo que
é dirigido por `requestAnimationFrame` (GSAP, Motion, Lenis) foi medido **no código e em repouso**,
não sentido tocando. Nenhuma das duas alegou ter visto o que não viu.

## Veredito

É o site **desta** clínica — paleta, fotos reais, vídeos, CNPJ, `@smileipiranga`, a voz da copy
batem com o feed. Execução acima da média em integridade (zero dado inventado), disciplina de
motion (só `transform`/`opacity`, tokens de easing, reduced-motion que reduz e não zera) e
acessibilidade dos overlays (lightbox com trap bidirecional, retorno de foco e `Escape`
confirmados ao vivo). Os furos são específicos e corrigíveis em uma passada: **três violações
WCAG AA** (duas já conhecidas do axe + alvos do nav pequenos), o **menu mobile ~4× mais lento que
o teto do próprio guia** com a curva que o guia proíbe, e um trecho de **cinco seções em creme**
que esfria a página logo após o pico.

## Notas

| Dimensão | Nota | Fonte |
|---|---|---|
| Heurísticas de Nielsen (modo Persuade, 7 e 10 n/a) | **28/32** | A |
| Motion (dimensão própria) | **3/4** | A |
| Audit técnico (A11y 2 · Perf 3 · Tema 4 · Responsivo 2 · Integridade 4) | **15/20 — Bom** | B |
| Detector mecânico `impeccable` | `[]` limpo | B |
| Lighthouse mobile / desktop | Perf 0.64 / 0.99 · A11y 0.94 / 0.94 · BP 1.00 · SEO 1.00 | B |

## Achados consolidados (A antes de B; duplicatas cruzadas)

| # | Sev | Achado | Fonte | Destino |
|---|---|---|---|---|
| 1 | **P1** | `aria-prohibited-attr`: `aria-label` no `span.split-parent` do `<h1>` (WCAG 4.1.2) | B (axe, conhecido) — A tocou nele ao vivo | fix **A1** |
| 2 | **P1** | `heading-order`: `h1` → `h3` nos Pilares sem `h2` (WCAG 1.3.1) | B (axe, conhecido) | fix **A2** |
| 3 | **P1** | Links do nav desktop com **19,5px** de altura em 768–1920px (WCAG 2.5.8, mínimo 24px; régua do projeto 44px) | B (novo, medido) | fix **F1** |
| 4 | P2 | `StaggeredMenu`: abertura ~1,3s no código vs teto de 300ms do guia para este componente; fechamento `power3.in`; `--ease-gaveta` órfão | A (P2-1) | fix **B** (obrigatório — exigência de motion do parceiro) |
| 5 | P2 | Cinco seções seguidas em `bg-creme` (~3470px no mobile) logo após o pico preto de Sorrisos | A (P2-2) | fix **C** |
| 6 | P2 | Lightbox sem feedback de carregamento enquanto o `.mp4` baixa no clique (3G: player parado, sem sinal) | A (heurística 1 / persona Casey) | fix **D** |
| 7 | P2 | FAQ com 2 perguntas, no plural, logo antes do CTA final — composição fina; o conteúdo é pendência do cliente, não inventar | A (P2-3) | **decisão do parceiro** (deferred) |
| 8 | P2 | Overflow horizontal de 8px em **768px**, rastreado ao CTA do header (`right 760.9` vs `clientWidth 753`) | B (medido) | fix **F2** |
| 9 | P2 | Com o drawer aberto, `<main>`/`<header>`/`<footer>` **não ficam `inert`** — leitor de tela em cursor virtual alcança o fundo | B (medido + código) | fix **F3b** |
| 10 | P2 | **[síntese]** O painel do drawer **não tem botão de fechar**: o ✕ do header fica sob o backdrop (`z-65`) e sob o painel de 320px (`z-70`); fecha-se só pela faixa de backdrop (55px em 375, 45px em 320), por item ou `Escape`. A deu 4/4 em "Controle e liberdade" citando "botão" sem ter visto a tela (sem compositing); a leitura do código de `StaggeredMenu.tsx` (toggle removido na vendorização) e dos z-index em `MobileMenu.tsx`/`Header.tsx` mostra que o botão visível não existe. Pré-requisito do #9: sem ✕ dentro do painel, deixar o header inerte tiraria o único controle nomeado de fechar | síntese (código) | fix **F3a** |
| 11 | P3 | "Sorriso com propósito" só na meta description — assinatura mais repetida do feed, invisível no site | A (P3-1) | fix **E1** |
| 12 | P3 | Logo do header com `href="#"` (jump nativo, excluído do interceptador) | A (P3-2) | fix **E2** |
| 13 | P3 | Subtítulo do hero em `font-corpo` a **15px** — 1px abaixo do mínimo de corpo do próprio projeto | B (medido) | fix **F4** |
| 14 | P3 | Bloco de contato do rodapé em 13–14px sem `font-rotulo` explícito | B (ambíguo) | **aceito como exceção** (microcopy de rodapé é rótulo por natureza; registrado em `deferred-minors.md`) |

Contagem consolidada: **P0 0 · P1 3 · P2 7 · P3 4** (A: 0/0/3/2 + heurística 1; B: 0/3/2/2;
síntese: +1 P2). Nenhum achado de A foi contradito por B; nenhum de B foi contradito por A. Os
dois convergiram de forma independente sobre o mesmo par header/drawer como a região mais fraca.

## Padrões sistêmicos (o que se repete)

- **Header em 768px é o ponto cego do mobile-first.** O nav desktop ativa em `md:` com conteúdo
  dimensionado para ≥1024 (overflow) e alvos de toque de texto puro (19,5px). A e B não
  precisaram se ver para chegar nisso: A via ritmo/motion do drawer, B via medição. Um ajuste de
  `gap` + `min-h-11` resolve #3 e #8 juntos.
- **Os dois overlays não seguem o mesmo padrão.** Lightbox: foco síncrono, trap confirmado ao
  vivo, retorno exato — exemplar. Drawer: foco via `requestAnimationFrame`, sem ✕ no painel, sem
  `inert` no fundo. **Nenhum dos dois** isola o fundo — o helper de isolamento deve ser um só,
  compartilhado (#9/#10 corrigem os dois).
- **Motion: craft real, um furo numérico.** Ticker calibrado (40px/s, boost capado em 2,5×),
  stagger dos tratamentos capado em 5 (`STAGGER_MAX`), fallback do `CircularGallery` com
  dignidade, FAB que entra/sai. O menu mobile é a exceção, e é o componente de maior frequência
  de uso no dispositivo prioritário.
- **Integridade é o ponto mais forte e mais consistente**: grep de dados inventados vazio,
  paleta sem violação real (3 hex fora são comentário/default não usado/grafia), pendências do
  cliente visíveis como pendências.

## O que NÃO é defeito (reafirmado pelas duas)

Pendências marcadas (CRO, "Ortodontista", horário); ausência de avaliações/estrelas; sem dark
mode; `THREE.Clock deprecated` no console (lib, deferred); `orcamento.test.ts` vermelho de
propósito (LCP simulado 3,85–3,89s vs real 2,21s — decisão do parceiro no fechamento); ticker
parado com a aba oculta (comportamento desenhado na Task 19).

## Não verificável nesta rodada (declarado, não inferido)

`getAnimations()` após scroll completo, long tasks durante scroll, `prefers-reduced-motion`
ao vivo, latência real de reabertura < 220ms, sensação tática do `Magnet`/`GlareHover`/
`SplitText` — todos bloqueados por `document.hidden=true` no harness. Cobertos por leitura de
código (guardas `podeAnimar`/`podePesado`, `:active` fora do bloco de reduced-motion) e pela
suíte (220/221). A re-review escopada deve tentar de novo com o painel compositando; se não
compositar, registrar como limitação, não como aprovação.

## Perguntas provocativas de A (para o parceiro, não para o fix)

- E se o FAQ só existisse quando o cliente responder as 3 perguntas pendentes — a seção hoje
  promete mais do que entrega?
- "Sorriso com propósito" devia ser a segunda linha manuscrita do CTA final, e não só o rodapé?
- O hero precisa do `Silk` para parecer vivo, ou o ticker já dá esse papel com 1/10 do custo?

## Plano

Um despacho de correção (`task-18-fix-brief.md`: itens A1, A2, B, C, D, E1, E2, F1–F4), uma
re-review escopada, parar. Itens 7 e 14 ficam registrados para decisão do parceiro.
