# Task 18 — relatório da re-review escopada (única)

Re-review dos commits `ac966a1..b51783d` (12 commits, um por item, na ordem A1, A2, B, C, D, E1,
E2, F1, F2, F3a, F3b, F4) da branch `feat/site`, HEAD `b51783d`. Nenhuma correção feita aqui:
só verificação e veredito. Toda evidência abaixo foi produzida nesta sessão (comando + valor);
o `task-18-fix-report.md` foi tratado como alegação e re-medido.

**Resultado: 12 ADDRESSED · 0 PARTIAL · 0 NOT ADDRESSED.** Fechamento completo (✓ em tudo).
Recomendação: **seguir para a review final da branch**.

## Como medi

- Build próprio: `npm run build` (Next 16.3.1, Turbopack, exit 0) + `npm run start -- -p 4701`
  (PID 35376, fechado ao final; `netstat` confirmou porta livre). Servidor 4173 intocado
  (PID 2220, ainda escutando ao final). `.claude/launch.json` sem diff.
- Suíte: `npx vitest run --no-file-parallelism` em primeiro plano.
- Lighthouse 13.4.1 via Edge (`CHROME_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"`,
  `--throttling-method=simulate --quiet --chrome-flags="--headless=new"`), mobile e desktop
  sequenciais, saída em `site/lh-rereview-mobile.json` e `site/lh-rereview-desktop.json`
  (ignorados pelo `site/.gitignore:47`, não commitados). O CLI sai com código 1 pelo erro de
  `chrome-launcher` ao limpar o temp **depois** de gravar o JSON — os dois relatórios estão
  completos (`runtimeError: null`, `runWarnings: none`, `finalDisplayedUrl http://localhost:4701/`).
- Ao vivo: painel do navegador (`mcp__Claude_Browser`) com `javascript_tool` em 1280, 768, 800,
  820, 834, 900, 1023, 1024, 375 e 320.

### Limitação declarada do painel

`document.hidden === true`, `visibilityState: "hidden"`, **0 ticks de `requestAnimationFrame`
em 1 s** (timers também estrangulados para ~1 s). Consequência: GSAP (drawer), Motion
(backdrop, saída do indicador do lightbox) e Lenis (rolagem suave) ficam no estado inicial.
Tudo que é síncrono (DOM, atributos, `getBoundingClientRect`, `getComputedStyle`,
`elementFromPoint`, foco síncrono, `defaultPrevented`) foi medido de verdade. Nada dirigido por
rAF foi "visto" — está dito item a item onde isso pesa, e está coberto pela suíte (jsdom).

## Por item

### A1 — `aria-prohibited-attr` · `1b08ec1` · **ADDRESSED**

- Código: `SplitText.tsx` passa `aria: 'hidden'` ao `GSAPSplitText`; `Hero.tsx` passa
  `tituloAriaLabel={podeAnimar ? HEADLINE : undefined}` ao `SectionHeading`, que escreve
  `aria-label` na tag do título (o `<h1>`). README de reactbits, modificação 6 do SplitText.
- Teste: `hero.test.tsx` — `.split-parent` **sem** `aria-label`, `<h1>` com
  `aria-label="Seu novo sorriso começa aqui"` (igualdade exata), `getByRole('heading',{level:1,name})`
  resolve no mesmo nó; ramo reduced-motion sem `aria-label`. Verde na suíte.
- Ao vivo (1280, `podeAnimar` = true: `prefers-reduced-motion` false):
  `h1.getAttribute('aria-label')` → `"Seu novo sorriso começa aqui"`;
  `h1 .split-parent` existe e `getAttribute('aria-label')` → `null`; os filhos fatiados têm
  `aria-hidden="true"`; nenhum `span/div/p` sem role carrega `aria-label` na página; 1 só `<h1>`.
- Lighthouse: `aria-prohibited-attr` = 1 (mobile e desktop).

### A2 — `heading-order` · `c426133` · **ADDRESSED**

- Código: `Pilares.tsx` usa `<p className="font-titulo text-[17px] text-preto"><strong className="font-normal">`.
  O commit toca só `Pilares.tsx` e `tratamentos.test.tsx` — `profissional.test.tsx` **não** está
  no commit (`git show --stat c426133`); ele só ganhou o teste do item C no commit `a03c0c5`,
  sem tocar nas asserções de heading.
- Teste: `tratamentos.test.tsx` — os 4 rótulos por `getByText`, `tagName === 'STRONG'`, zero
  `h3` e zero headings na seção. Verde.
- Ao vivo (1280): sequência `h1..h6` da página: `1 → 2 ×7 → 3 ×4 (Como Funciona, sob o h2 da
  seção) → 2 ×3` — **zero saltos**. Seção dos pilares: 0 headings; os 4 `p > strong` renderizam
  `font-weight 400`, `Archivo Black`, `17px` (o `font-normal` segurou o `bolder` do preflight).
- Lighthouse: `heading-order` = 1 (mobile e desktop).

### B — motion do menu · `98a7aaf` · **ADDRESSED** (ao vivo não verificável)

- Código: `lib/easeGaveta.ts` — `CustomEase.create('gaveta', '0.32,0.72,0,1')` idempotente
  (flag de módulo), chamado em `MotionProvider` (`lib/motion.tsx`) na linha seguinte ao
  `registerPlugin(ScrollTrigger)` e, por segurança, em `buildOpenTimeline`/`playClose` do
  `StaggeredMenu`. `MOTION_GAVETA` exportado: abertura 0,30 (`'gaveta'`), fechamento 0,22
  (`'gaveta'`), itens 0,28 com stagger 0,04 começando em t=0 (junto com o painel), contador
  0,28 `power2.out`, camadas 0,22/0,26. `tempoUltimoItem(4)` = 3×0,04 + 0,28 = **0,40 s**
  ≤ 0,45. `gsap` 3.15.0 e `node_modules/gsap/CustomEase.js` presentes.
- `grep -rnE "ease:\s*['\"][a-zA-Z0-9]+\.(in|inOut)['\"]" site/components` → **vazio**. A
  string literal `power3.in` ainda aparece em 2 lugares, **ambos comentário/doc** (README l.326
  e o cabeçalho de `StaggeredMenu.tsx` l.89, descrevendo o original) — nenhum uso em código.
- `--ease-gaveta`: não é consumido por `var()` em CSS nenhum (continua só em `globals.css:27`),
  mas deixa de ser órfão pelo caminho que o brief aceita: documentado como a mesma curva do GSAP
  (`easeGaveta.ts`, README mod. 12) **e** travado por teste — `staggeredMenu.test.ts` lê os 4
  pontos do `cubic-bezier` de `globals.css`, compara com `EASE_GAVETA_PONTOS` e avalia a curva
  registrada no GSAP contra a bezier do CSS em 5 pontos (tolerância 0,01).
- `!podeAnimar`: ramo `reducedMotion` do `StaggeredMenu` intocado pelo diff — o `useEffect`
  de open/close retorna cedo, o painel só transiciona `opacity` (200 ms), sem stagger.
- Testes: `staggeredMenu.test.ts` 6/6 (abertura ≤ 0,30; fechamento ≤ 0,22 e < abertura;
  stagger 30–80 ms ≈ 40; último item ≤ 0,45; curva = CSS; nenhum `ease-in` no fonte);
  `header.test.tsx` inteiro verde na suíte (foco preso, retorno, Escape, `aria-expanded`/
  `aria-controls`, `inert` na reabertura rápida, `lenis.stop`, reduced-motion).
- Ao vivo: **não verificável** — com o drawer aberto o painel ficou em
  `transform: matrix(1,0,0,1,320,0)` (inline `translate(100%, 0%)`, `xPercent: 100`), i.e. a
  timeline do GSAP não avançou um frame. Declarado, não inferido.

### C — Como Funciona em branco · `a03c0c5` · **ADDRESSED**

- Código: `ComoFunciona.tsx` `bg-creme → bg-branco` (uma classe; comentário interno ajustado).
- Teste: `profissional.test.tsx` (describe ComoFunciona) — `section#como-funciona` com
  `bg-branco` e sem `bg-creme`. Verde.
- Ao vivo (1280): `getComputedStyle(#como-funciona).backgroundColor` = `rgb(255,255,255)`.
  Contraste calculado (WCAG, luminância relativa) sobre esse fundo:
  `h2` e `h3` `rgb(17,17,17)` → **18,88:1**; `p` `rgb(90,90,85)` 16px → **6,93:1** — AA com folga.
  O número `01…04` em `rgb(252,204,36)` 40px → 1,52:1 — decorativo (o `h3` ao lado carrega a
  informação), pré-existente (era ~1,36:1 sobre creme) e `color-contrast` = 1 no Lighthouse
  antes e depois. Não é regressão deste item.

### D — feedback de carregamento no lightbox · `f4a3966` · **ADDRESSED** (fade não observável)

- Código: `<video poster={/videos/posters/${slug}.webp} onCanPlay={aoPoderTocar}>`;
  `<motion.p role="status">Carregando vídeo…</motion.p>` em `font-rotulo`, `pointer-events-none`,
  dentro de `AnimatePresence` com `exit` em `opacity` (`duration: podeAnimar ? 0.2 : 0`). Estado
  é o slug pronto (`slugPronto !== ultimo.slug`), então o indicador volta ao trocar de vídeo. Só
  `opacity` anima. `Z_INDEX_BACKDROP` continua exportado (`Lightbox.tsx:37`) e importado por
  `depoimentos.test.tsx`. Posters `.webp` existem para os 5 slugs em `public/videos/posters/`.
- Teste: `lightbox.test.tsx` — `poster` correto, `role="status"` com o texto, `fireEvent.canPlay`
  → indicador some, troca de slug → volta. Verde.
- Ao vivo (375, abrindo pelo botão real "Tour pela clínica"): `poster` =
  `/videos/posters/tour-clinica.webp` (HEAD → `200 image/webp`), `src` =
  `/videos/completos/tour-clinica.mp4`, `preload="metadata"`; `[role=status]` com
  "Carregando vídeo…", fonte `Jost` (= `font-rotulo`), `pointer-events: none`, em
  `left 36 / top 325.8`, 176,5×32,3 px. Listener próprio registrou `loadeddata` e
  **`canplay` com `readyState 4`**. Depois disso o indicador **continuou no DOM com
  `opacity: 1`** e `document.getAnimations().length === 0` — a saída da `AnimatePresence` é rAF
  e não roda com o painel oculto. O caminho `canplay → some` está provado só no jsdom.

### E1 — "Sorriso com propósito" · `b0fd804` · **ADDRESSED**

- Código: `Footer.tsx`, `<p className="font-rotulo text-[13px] tracking-[.06em] text-escuro-texto">`
  sob "Saúde & Estética Orofacial", na mesma coluna do logo. `CtaFinal.tsx` não aparece no
  diffstat do intervalo (intocado).
- Teste: `rodape.test.tsx` — texto exato, `font-rotulo`, `text-escuro-texto`, mesmo pai do
  `<img alt="Smile Ipiranga">`. Verde.
- Ao vivo (320): elemento no `<footer>`, `Jost` 13px, `rgb(183,183,178)` sobre `rgb(17,17,17)`
  → **9,38:1**; mesmo pai do logo e `top` abaixo do `bottom` do logo; **1** ocorrência visível no
  `body.innerText` (a outra é a meta description). Último `h2` do `main` continua
  "Vamos cuidar do seu sorriso?".
- Copy: ver fechamento — nenhum outro texto visível entrou.

### E2 — logo do header · `d939902` · **ADDRESSED**

- Código: `ANCORA_TOPO = '#topo'` exportado de `Header.tsx`, `href={ANCORA_TOPO}` no logo,
  `<main id="topo">` em `app/page.tsx`. Caminho `#topo` (alternativa que o brief reserva para o
  caso de `/` recarregar) — o interceptador de `lib/motion.tsx:187-193` exclui só `#` e exige
  que `document.querySelector(href)` exista.
- Teste: `header.test.tsx` — `ANCORA_TOPO` começa com `#`, logo com esse `href`, `page.tsx`
  contém `<main id="topo"`. Verde.
- Ao vivo (1280): `href="#topo"`, `main.id === "topo"`, alvo existe; clique sintético no logo
  → `defaultPrevented: true`, `location.href` antes e depois `http://localhost:4701/`; a marca
  `window.__marcaE2 = "rereview-1787349120190"` gravada antes do clique **sobreviveu** à leitura
  feita em 768 (vários minutos e 7 resizes depois) — **não recarregou**. A rolagem suave
  (Lenis/rAF) não é observável aqui.

### F1 — alvos do nav desktop · `09ed968` · **ADDRESSED**

- Código: `inline-flex min-h-11 items-center` nos 4 `<a>`; fonte 13px, tracking, cor e gap
  inalterados no diff.
- Teste: `header.test.tsx` — as 3 classes nos 4 links. Verde.
- Ao vivo — `getBoundingClientRect().height` dos 4 links (`display: flex`, `min-height: 44px`):

| viewport | Tratamentos | A Clínica | Depoimentos | Como Chegar | header |
|---|---|---|---|---|---|
| 768 | 44 | 44 | 44 | 44 | 67 px |
| 800 | 44 | 44 | 44 | 44 | — |
| 820 | 44 | 44 | 44 | 44 | — |
| 834 | 44 | 44 | 44 | 44 | — |
| 900 | 44 | 44 | 44 | 44 | — |
| 1023 | 44 | 44 | 44 | 44 | — |
| 1024 | 44 | 44 | 44 | 44 | — |
| 1280 | 44 | 44 | 44 | 44 | 67 px |

- Lighthouse: `target-size` = 1 nos dois.

### F2 — overflow em 768 · `410345c` · **ADDRESSED**

- Código: `<nav className="hidden md:flex items-center gap-6 lg:gap-8">`; CTA sem mudança de
  `px`. O corte do drawer continua em `md` (em 375 o `nav` está `display: none` e o hambúrguer
  visível; em 768+ o `nav` está `flex`).
- Teste: `header.test.tsx` — `gap-6`, `lg:gap-8`, sem `gap-8` solto. Verde.
- Ao vivo — altura 900:

| viewport | `documentElement` scroll / client | `header` scroll / client | gap do nav | overflow |
|---|---|---|---|---|
| 768 | 753 / 753 | 753 / 753 | 24 px | não (CTA `right` 736,9) |
| 800 | 785 / 785 | 785 / 785 | 24 px | não |
| 820 | 805 / 805 | 805 / 805 | 24 px | não |
| 834 | 819 / 819 | 819 / 819 | 24 px | não |
| 900 | 885 / 885 | 885 / 885 | 24 px | não |
| 1023 | 1008 / 1008 | 1008 / 1008 | 24 px | não |
| 1024 | 1009 / 1009 | 1009 / 1009 | 32 px | não |
| 1280 | 1265 / 1265 | 1265 / 1265 | 32 px | não |
| 375 | 375 / 375 | — (nav oculto) | — | não |
| 320 | 320 / 320 | — | — | não |

### F3a — botão "Fechar menu" no painel · `919d4c7` · **ADDRESSED** (posição final forçada à mão)

- Código: `StaggeredMenu` ganhou `cabecalho?: React.ReactNode`, renderizado no painel antes da
  `<ul>`; `MobileMenu` passa `<button type="button" aria-label="Fechar menu" onClick={fechar}
  className="pressable flex h-11 w-11 … rounded-full border border-borda-forte">` com
  `<HamburgerIcon aberto />`. README mod. 13.
- Teste: `header.test.tsx` — botão dentro do `dialog`, `pressable`/`h-11`/`w-11`, foco inicial
  nele, clicar fecha + foco no hambúrguer + `aria-expanded=false`; trap ajustado (primeiro
  focável = ✕, último = CTA). Verde.
- Ao vivo (375, drawer aberto pelo hambúrguer real): `aria-expanded="true"`, `aria-controls`
  resolve para o `dialog`; botão existe dentro do `role="dialog"`, **44×44**, classes
  `pressable … h-11 w-11 rounded-full border border-borda-forte`, `<path d="M5 5L15 15M15 5L5 15">`
  (o mesmo ✕ do `HamburgerIcon`); focáveis do painel na ordem
  `["Fechar menu", Tratamentos, A Clínica, Depoimentos, Como Chegar, "Agendar avaliação"]`.
- `elementFromPoint`: com o painel parado em `translate(100%, 0%)` (rAF), o botão estava em
  `left 627` — fora do viewport, `elementFromPoint` → `null`. **Forcei o estado final da
  animação** (`dialog.style.transform = 'translate(0%, 0%)'`, restaurado em seguida —
  `inlineTransformRestored: true`): painel em `left 55 / right 375`, botão em
  `left 307 / top 24`, 44×44; `elementFromPoint(329, 46)` → **`path` dentro do botão**
  (`elementsFromPoint`: `path → svg → button.pressable → div`). Backdrop `z-index 65`,
  `pointer-events: auto` (ficou em `opacity 0` pelo mesmo rAF, irrelevante para hit-test);
  painel `z-index 10` dentro do wrapper `z-[70]`. Ou seja: na posição em que o GSAP o deixa, o
  botão está acima do backdrop e do painel e é alcançável por toque — o que o item pede.
- Clique real no botão: `aria-expanded` → `"false"`, `dialog` volta a `aria-hidden="true"` +
  `inert`, `document.activeElement` = botão "Abrir menu" (foco síncrono). O **foco inicial** no ✕
  (via `requestAnimationFrame`) não rodou aqui — `activeElement` ficou em `BODY` com o drawer
  aberto; coberto pelo teste.

### F3b — fundo inerte nos dois overlays · `a2c86b1` · **ADDRESSED**

- Código: `lib/fundoInerte.ts` — `isolarFundo(manter)` percorre `document.body.children`, pula
  `SCRIPT/STYLE/LINK/TEMPLATE/NEXT-ROUTE-ANNOUNCER` e quem é/contém um elemento de `manter`,
  guarda `inert`/`aria-hidden` anteriores, aplica os dois, devolve restauração exata e
  idempotente (flag `restaurado`). `MobileMenu.tsx` e `Lightbox.tsx` envolvem backdrop+painel em
  `<div ref={portalRef}>`, isolam no efeito de abertura, restauram no cleanup **e** em `fechar()`
  na linha imediatamente anterior ao `focus()` de retorno (`MobileMenu.tsx` l.105-107,
  `Lightbox.tsx` l.542-544 do diff).
- Testes: `fundoInerte.test.ts` 5/5 (aplica, portal aninhado, preserva `aria-hidden`
  pré-existente, ignora script/style/link/template/announcer, idempotente + `null`);
  `header.test.tsx` e `lightbox.test.tsx` com o fundo inerte/restaurado e a ordem
  restaurar→focar via spy em `HTMLElement.prototype.focus`. Verdes.
- Ao vivo (375) — **drawer**: antes `[false,false,false]`; aberto →
  `['header','main','footer']` com `inert` + `aria-hidden="true"` = **`[true,true,true]`**;
  `body.children` completo: os `div`s (FAB e portal do lightbox) inertes, os 4 `<script>` e o
  `<next-route-announcer>` intocados, o `div` que contém o `dialog` livre. Fechado pelo ✕ do
  painel → **`[false,false,false]`**, nenhum filho do `body` com `inert`; o único `aria-hidden`
  restante é o `div` sentinela do FAB, que já o tinha (preservado). Spy em `focus()` no
  instante do foco do hambúrguer: `header inert at focus = false` (restaurou **antes**).
  `activeElement` = hambúrguer.
- Ao vivo (375) — **lightbox** (aberto por clique real em "Tour pela clínica", gatilho focado
  antes): `header/main/footer` → `inert=true, aria-hidden=true`; wrapper do portal do lightbox
  livre; portal do drawer inerte. Foco dentro do diálogo (`"Fechar vídeo"`). `Escape` → spy:
  `main inert at focus = false`; `[false,false,false]`; `activeElement` = gatilho
  "Tour pela clínica"; `dialog` com `aria-hidden="true"` + `inert` (ainda no DOM porque a saída
  da `AnimatePresence` é rAF — mesmo comportamento de antes da Task 18).

### F4 — subtítulo do hero · `b51783d` · **ADDRESSED**

- Código: só a linha do subtítulo muda (`text-[15px] → text-[16px]`), `max-w-[32ch]` mantido;
  o diff do commit tem 1 linha. A legenda de apoio abaixo (hoje l.156-158, "Rua Clemente
  Pereira…", `text-[14px]`) está fora dos dois hunks de `Hero.tsx` no intervalo.
- Teste: nenhum (classe pura, como o brief pede).
- Ao vivo (320): `font-size 16px`, `line-height 24px`, `Source Sans 3`, `max-width 254,46px`;
  3 linhas (72 px); `scrollWidth/clientWidth` 254/254; `right` 286,5 ≤ 320;
  `documentElement` 320/320 — **não estoura**. Rótulo acima 13px e legenda abaixo 14px intocados.

## Fechamento

| Verificação | | Resultado que medi |
|---|---|---|
| `npx vitest run --no-file-parallelism` | ✓ | **26 arquivos (25 ✓, 1 ✗) · 243 testes (242 ✓, 1 ✗)** — único vermelho `orcamento.test.ts` (`expected 3847.0693 to be less than 2500`, LCP simulado lido do `lh-mobile.json` pré-existente). 243 > 221. |
| `npm run build` | ✓ | exit 0, TypeScript limpo |
| `npx eslint .` | ✓ | exit 0, sem saída |
| Lighthouse **mobile** (4701) | ✓ | perf **0.74** · a11y **1.00** · BP 1.00 · SEO 1.00 · LCP sim. **3846 ms** · TBT 555 ms · FCP 911 · SI 2560 · CLS 0,00003 · 1 029 634 bytes |
| Lighthouse **desktop** (4701) | ✓ | perf **0.99** · a11y **1.00** · BP 1.00 · SEO 1.00 · LCP 917 ms · TBT 13 ms |
| Audits de a11y reprovados | ✓ | **nenhum** nos dois; `aria-prohibited-attr` 1, `heading-order` 1, `target-size` 1, `color-contrast` 1 |
| Tolerância de performance (baseline bimodal 0.64/0.80; regressão = LCP mobile > 4,1 s ou desktop < 0.96) | ✓ | mobile 0.74 ∈ [0.61, 0.83], LCP 3,85 s < 4,1 s (idêntico ao baseline de 3,85–3,89 s); desktop 0.99 ≥ 0.96 — **sem regressão** |
| `git status` limpo | ✓ | vazio antes e depois (os `lh-rereview-*.json` aparecem só com `--ignored`) |
| `.claude/launch.json` sem diff | ✓ | `git diff --quiet` |
| Nenhum `lh-*.json` commitado | ✓ | `git ls-files | grep lh-` vazio; nada fora de `site/` no intervalo |
| Um commit por item, na ordem do brief | ✓ | 12 commits `1b08ec1 → b51783d`, cada um só com os arquivos do item |
| Copy nova | ✓ | Texto visível adicionado em `site/components` + `site/lib/content.ts` (este intocado): **"Sorriso com propósito"** (rodapé), **"Carregando vídeo…"** (status), **`aria-label="Fechar menu"`** (rótulo de UI) e `aria-label={tituloAriaLabel}` (= a headline já existente). Nada mais. |
| Servidor 4701 fechado / 4173 intocado | ✓ | `taskkill` no PID 35376; 4173 (PID 2220) segue escutando |

## Limitações

1. **Sem compositing**: `document.hidden=true`, 0 ticks de rAF. Não vi: abertura/fechamento do
   drawer nos tempos de B, foco inicial no ✕ do painel (rAF), fade do "Carregando vídeo…" (D),
   rolagem suave do logo (E2), saída visual dos overlays. Tudo isso está coberto pela suíte e
   pelos números do código, e está marcado como tal acima.
2. Para F3a, o `elementFromPoint` foi feito com o painel **colocado à mão** no estado final da
   animação (`translate(0%,0%)`) e depois restaurado — prova de z-order e alcance na posição
   final, não do movimento até lá.
3. A nota de performance mobile continua bimodal por TBT (aqui 555 ms); LCP simulado é o mesmo
   3,85 s de antes — a Task 18 não mexeu no caminho crítico.
4. Duas observações que não mudam veredito: a string `power3.in` sobrevive em 2 comentários
   (README e cabeçalho do `StaggeredMenu`) descrevendo o original — nenhum uso; e
   `--ease-gaveta` não é consumido por `var()` em CSS — deixa de ser órfão pela documentação +
   teste de equivalência, que é a alternativa que o brief aceita.
