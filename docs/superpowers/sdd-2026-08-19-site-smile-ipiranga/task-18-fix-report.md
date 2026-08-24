# Task 18 — relatório da rodada de correção

Única rodada de correção do QA/critique (`task-18-fix-brief.md`), executada na ordem A1, A2, B, C, D,
E1, E2, F1, F2, F3a, F3b, F4 — um commit por item, cada um com o teste que o trava e a prova por
quebra proposital (correção revertida → teste falha → correção restaurada → teste passa).
Branch `feat/site`, base `ac966a1`.

**STATUS: COMPLETO** — os 12 itens feitos como descritos no brief. Nenhuma redução de escopo.

## Fechamento

| Verificação | Resultado |
|---|---|
| `npx vitest run --no-file-parallelism` | **26 arquivos (25 ✓, 1 ✗) · 243 testes (242 ✓, 1 ✗)** — única falha `orcamento.test.ts` (LCP simulado, vermelho de propósito, intocado). Baseline: 24 arquivos / 221 testes (220 ✓) — **+2 arquivos, +22 testes**, mesma única falha. |
| `npm run build` | ✓ (Next 16.3.1, Turbopack; TypeScript limpo) |
| `npx eslint .` | ✓ exit 0, zero avisos |
| Lighthouse mobile (4700) | a11y **0.94 → 1.00** · perf 0.64 → 0.78 (2ª amostra 0.73) · BP 1.00 · SEO 1.00 |
| Lighthouse desktop (4700) | a11y **0.94 → 1.00** · perf 0.99 → 0.99 · BP 1.00 · SEO 1.00 |
| `.claude/launch.json` | não tocado |
| Servidor 4173 | não tocado; o 4700 foi subido para a verificação e fechado ao final |
| `lh-fix-*.json` | gerados em `site/`, ignorados pelo git (`site/.gitignore:47`), não commitados |

### Lighthouse antes/depois

| | Perf | A11y | BP | SEO | Reprovados de a11y | LCP sim. | TBT | bytes |
|---|---|---|---|---|---|---|---|---|
| mobile **antes** (`lh-final-mobile.json`, ce7c58d) | 0.64 | 0.94 | 1.00 | 1.00 | `aria-prohibited-attr`, `heading-order` | 3893 ms | 1116 ms | 1 025 764 |
| mobile antes, outra amostra do mesmo dia (`lh-mobile.json`) | 0.80 | 0.94 | 1.00 | 1.00 | idem | 3847 ms | 366 ms | 1 025 757 |
| mobile **depois** (`lh-fix-mobile.json`) | 0.78 | **1.00** | 1.00 | 1.00 | **nenhum** | 3854 ms | 432 ms | 1 029 634 |
| mobile depois, 2ª amostra (`lh-fix-mobile-2.json`) | 0.73 | **1.00** | — | — | nenhum | 3617 ms | 672 ms | 1 029 634 |
| desktop **antes** (`lh-final-desktop.json`) | 0.99 | 0.94 | 1.00 | 1.00 | `aria-prohibited-attr`, `heading-order` | — | — | — |
| desktop **depois** (`lh-fix-desktop.json`) | 0.99 | **1.00** | 1.00 | 1.00 | **nenhum** | 895 ms | 3 ms | — |

- `aria-prohibited-attr` → 1, `heading-order` → 1, `target-size` → 1, `color-contrast` → 1 nos dois
  fatores de forma. A11y **1.00 / 1.00**.
- Performance mobile: o baseline do próprio projeto é bimodal na mesma build (0.64 e 0.80 no mesmo
  dia, diferença toda em TBT: 1116 vs 366 ms; LCP idêntico em 3,85–3,89 s — ver `task-17-report.md`
  e a síntese). As duas amostras pós-correção (0.78, 0.73; LCP 3,85 e 3,62 s) caem dentro dessa
  faixa. Não é regressão; a variação é a já conhecida de TBT. Peso total +3,9 KB (CustomEase +
  código novo). Desktop idêntico (0.99).
- Comando (Chrome não instalado; Edge): `CHROME_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" npx lighthouse http://localhost:4700 --output=json --output-path=./lh-fix-mobile.json --form-factor=mobile --throttling-method=simulate --quiet --chrome-flags="--headless=new"` e `--preset=desktop`. O CLI sai com código 1 por um erro do `chrome-launcher` ao matar o Edge **depois** de gravar o JSON (stack em `chrome-launcher.js:39 Object.kill`) — os relatórios estão completos (`fetchTime`, categorias e auditorias presentes).

### Limitação declarada do painel do navegador

Como nas Avaliações A e B, o painel não compositou frames: `document.hidden === true` em todas as
medições, `requestAnimationFrame` parado. Consequências concretas, registradas item a item abaixo:
o painel do drawer (GSAP) não desliza para dentro (fica em `xPercent: 100`), o foco inicial por
`requestAnimationFrame` não roda, e as saídas da `AnimatePresence` (Motion) não completam. Tudo que
é síncrono (DOM, atributos, `getBoundingClientRect`, `getComputedStyle`, foco síncrono,
`defaultPrevented`) foi medido de verdade e está registrado. Nada do que depende de rAF foi
"visto" — está coberto pela suíte (jsdom) e pela leitura do código, e dito como tal.

## Itens

### A1 — `aria-prohibited-attr` · commit `1b08ec1`

- **Correção:** `GSAPSplitText` vendorizado instanciado com `aria: 'hidden'` (nenhum `aria-label`
  no `span.split-parent`); `SectionHeading` ganhou a prop `tituloAriaLabel`, que a Hero passa com a
  headline **só no ramo `podeAnimar`** (no ramo de texto puro o conteúdo já é o nome). Registrado em
  `components/reactbits/README.md` (SplitText, modificação 6).
- **Teste:** `hero.test.tsx` — igualdade exata `aria-label="Seu novo sorriso começa aqui"` **no
  `<h1>`**, `.split-parent` **sem** `aria-label`, `getByRole('heading',{level:1,name})` resolve; no
  ramo reduced-motion o `<h1>` não carrega `aria-label` (seria redundante).
- **Prova por quebra:** `aria: 'auto'` → falha em `expect(splitParent).not.toHaveAttribute('aria-label')`. Restaurado → 6/6.
- **Lighthouse:** `aria-prohibited-attr` 0 → 1 (mobile e desktop).

### A2 — `heading-order` · commit `c426133`

- **Correção:** os 4 pilares de `<h3>` para `<p><strong class="font-normal">` com as mesmas classes
  (`font-titulo text-[17px] text-preto`). `font-normal` no `<strong>` porque o preflight aplicaria
  `bolder` e a Archivo Black só carrega o peso 400 — um bold sintetizado mudaria o que a pessoa vê.
  `profissional.test.tsx` (Como Funciona) **não foi tocado** nas asserções de heading (só ganhou o
  teste do item C, abaixo).
- **Teste:** `tratamentos.test.tsx` — os 4 rótulos por texto (`getByText`), `tagName === 'STRONG'`,
  **zero** headings de nível 3 (e zero headings de qualquer nível) na seção.
- **Prova por quebra:** volta `<h3>` → 2 falhas (`expected [Array(4)] to have length 0`, `expected 'H3' to be 'STRONG'`). Restaurado → 10/10.
- **Lighthouse:** `heading-order` 0 → 1 (mobile e desktop).

### B — motion do menu mobile · commit `98a7aaf`

- **Correção:** `lib/easeGaveta.ts` registra `--ease-gaveta` (`0.32,0.72,0,1`) no GSAP como
  `'gaveta'` via `gsap/CustomEase` (confirmado `node_modules/gsap/CustomEase.js`), idempotente —
  chamado no `MotionProvider` junto do `registerPlugin(ScrollTrigger)` e, por segurança, pelo
  próprio `StaggeredMenu` (o efeito do filho roda antes do efeito do provider; sem isso o GSAP
  cairia em silêncio no ease default). `StaggeredMenu.tsx`: painel **0,30 s** `'gaveta'`; itens
  0,28 s com stagger **0,04 s**, partindo em t=0 junto com o painel (último item assenta em
  **0,40 s** ≤ 0,45 s); camadas de cor 0,22/0,26 s (partem junto, chegam antes — rastro mantido);
  fechamento **0,22 s** `'gaveta'`; **`power3.in` apagado**. Sob `reducedMotion` inalterado (só
  opacity, sem stagger). Constantes exportadas em `MOTION_GAVETA`. Registrado no README de
  reactbits (StaggeredMenu, modificação 12) com os números do original e o porquê.
- **Teste novo:** `staggeredMenu.test.ts` (6 testes) — abertura ≤ 0,30; fechamento ≤ 0,22 e <
  abertura; stagger em 30–80 ms (~40); `tempoUltimoItem(4)` ≤ 0,45; os 4 pontos do `cubic-bezier`
  do `globals.css` iguais aos do JS **e** a curva registrada no GSAP avalia igual à bezier do CSS em
  5 pontos (tolerância 0,01, resolvida por bissecção); nenhum `ease: '*.in'`/`'*.inOut'` no fonte.
  `header.test.tsx` (foco preso, retorno, Escape, `aria-expanded`/`aria-controls`, `inert` na
  reabertura rápida, `lenis.stop`, reduced-motion) e `motion.test.tsx` continuam verdes.
- **Prova por quebra:** `fechamento: 0.28` + `ease: 'power3.in'` → 2 falhas (`fecha em no máximo 220ms`, `nenhum ease-in`). Restaurado → 6/6 + 12/12 do header.
- **Ao vivo:** não verificável (rAF parado — o painel ficou em `xPercent: 100`, botão de fechar medido em `left: 527` num viewport de 320). Declarado, não inferido.

### C — ritmo da página · commit `a03c0c5`

- **Correção:** `ComoFunciona.tsx` `bg-creme` → `bg-branco` (uma classe; comentário interno que
  citava o fundo creme atualizado). Contraste sobre branco: preto `#111111` **18,9:1**, grafite
  `#5A5A55` **6,9:1** — AA com folga. O número amarelo (`text-amarelo`, 40 px, decorativo com o
  título ao lado) já tinha contraste baixo sobre creme (1,36:1) e continua baixo sobre branco
  (1,52:1) — **pré-existente e não sinalizado pelo axe** (`color-contrast` = 1 antes e depois).
- **Teste:** `profissional.test.tsx` (describe ComoFunciona) — `section#como-funciona` tem
  `bg-branco` e não tem `bg-creme`.
- **Prova por quebra:** volta `bg-creme` → 1 falha. Restaurado → 15/15.

### D — feedback de carregamento no lightbox · commit `f4a3966`

- **Correção:** `<video poster="/videos/posters/<slug>.webp">` (existe para os 5 slugs) +
  `<motion.p role="status">Carregando vídeo…</motion.p>` em `font-rotulo`, canto superior esquerdo
  (o ✕ fica à direita, os controles embaixo), `pointer-events-none`, some com fade de 200 ms no
  `canplay` (`AnimatePresence`); sob `!podeAnimar` a saída tem `duration: 0`. Estado é o slug que
  já pode tocar (não um booleano) — o indicador volta sozinho quando outro vídeo abre, sem efeito
  de reset.
- **Teste:** `lightbox.test.tsx` — `poster` correto, `role="status"` com o texto, `fireEvent.canPlay`
  → indicador some; troca de slug → indicador volta.
- **Prova por quebra:** `onCanPlay={undefined}` → 2 falhas. Restaurado → 16/16.
- **Ao vivo:** ao abrir, `poster` e `src` corretos, indicador presente em Jost (`font-rotulo`)
  em `left 34.6 / top 284.4`, 176×32 px. O vídeo chegou a `readyState 4`, mas o indicador
  permaneceu com `opacity: 1` e `document.getAnimations().length === 0` — a saída da
  `AnimatePresence` (Motion, rAF) não roda com `document.hidden`; o mesmo bloqueio que impede a
  entrada/saída do próprio painel neste harness. O caminho `canplay → some` está provado no jsdom.

### E1 — "Sorriso com propósito" · commit `b0fd804`

- **Correção:** `Footer.tsx`, linha sob o logo e sob "Saúde & Estética Orofacial", `font-rotulo
  text-[13px] tracking-[.06em] text-escuro-texto` (~9,4:1 sobre `#111111`, tabela já no arquivo).
  Copy da própria marca (`BRIEFING.md` §7). CTA final intocado.
- **Teste:** `rodape.test.tsx` — texto exato, classes, e mesma coluna do `<img alt="Smile Ipiranga">`.
- **Prova por quebra:** linha removida → 1 falha. Restaurado → 15/15.
- **Ao vivo:** HTML do build contém a string 2× (meta description + rodapé).

### E2 — logo do header · commit `d939902`

- **Correção:** `href="#"` → `href={ANCORA_TOPO}` (`'#topo'`) + `<main id="topo">` em
  `app/page.tsx`. O brief pedia `"/"` e conferir se recarrega: numa `<a>` comum, `"/"` é
  navegação de documento inteiro (não passa pelo router do Next, que só intercepta `<Link>`) —
  recarrega por construção (flash branco, re-hidratação, Silk de novo). Fui direto ao caminho que
  o brief reserva para esse caso: `#topo`, tratado pelo interceptador com Lenis.
- **Teste:** `header.test.tsx` — `ANCORA_TOPO` começa com `#`, o logo carrega exatamente esse
  `href`, e `app/page.tsx` contém `<main id="topo"`.
- **Prova por quebra:** volta `href="#"` → 1 falha. Restaurado → 13/13.
- **Ao vivo (1280):** `window.__marcaE2` gravado, clique sintético no logo: `defaultPrevented:
  true` (interceptado pelo `aoClicarAncora` → `lenis.scrollTo`), `location.href` inalterado
  (`http://localhost:4700/` antes e depois), marca **sobreviveu** nas duas leituras seguintes (em
  320 px, ~40 s depois) — **não recarregou**. A rolagem suave em si é rAF (não observável aqui).

### F1 — alvos do nav desktop (WCAG 2.5.8) · commit `09ed968`

- **Correção:** `inline-flex min-h-11 items-center` nos 4 `<a>` do `<nav>`; fonte, tamanho,
  tracking, cor e gap inalterados.
- **Teste:** `header.test.tsx` — os 4 links carregam `min-h-11`, `inline-flex`, `items-center`.
- **Prova por quebra:** classes removidas → 1 falha. Restaurado → 14/14.
- **Ao vivo — `getBoundingClientRect().height` dos 4 links:**

| viewport | Tratamentos | A Clínica | Depoimentos | Como Chegar | header |
|---|---|---|---|---|---|
| 768 | 44 | 44 | 44 | 44 | 67 px |
| 1024 | 44 | 44 | 44 | 44 | — |
| 1280 | 44 | 44 | 44 | 44 | — |

(44 px também em 800, 820, 834, 900 e 1023.) Era 19,5 px. Altura do header não mudou.

### F2 — overflow horizontal em 768 · commit `410345c`

- **Correção:** `<nav>` `gap-8` → `gap-6 lg:gap-8`. Bastou — **não** foi preciso mexer no `px` do
  CTA. Corte do drawer continua em `md`.
- **Teste:** `header.test.tsx` — `nav` tem `gap-6` e `lg:gap-8`, e não tem `gap-8` solto.
- **Prova por quebra:** `gap-8` fixo → 1 falha. Restaurado → 15/15.
- **Ao vivo — laço de `resize_window`, altura 900:**

| viewport | `documentElement` scroll / client | `header` scroll / client | gap do nav | overflow |
|---|---|---|---|---|
| 768 | 753 / 753 | 753 / 753 | 24 px | **não** (era 761 / 753) |
| 800 | 785 / 785 | 785 / 785 | 24 px | não |
| 820 | 805 / 805 | 805 / 805 | 24 px | não |
| 834 | 819 / 819 | 819 / 819 | 24 px | não |
| 900 | 885 / 885 | 885 / 885 | 24 px | não |
| 1023 | 1008 / 1008 | 1008 / 1008 | 24 px | não |
| 1024 | 1009 / 1009 | 1009 / 1009 | 32 px | não |
| 1280 | 1265 / 1265 | 1265 / 1265 | 32 px | não |
| 320 | 320 / 320 | — (nav oculto) | — | não |

Em 768 o CTA "Agendar avaliação" termina em `right: 736.9` (antes 760.9) contra `clientWidth 753`.

### F3a — botão de fechar dentro do painel · commit `919d4c7`

- **Correção:** `StaggeredMenu` ganhou `cabecalho?: ReactNode`, renderizado dentro do painel antes
  da lista (simétrico ao `footer`); `MobileMenu` passa `<button aria-label="Fechar menu"
  onClick={fechar}>` `pressable`, `h-11 w-11 rounded-full border border-borda-forte`, com
  `<HamburgerIcon aberto />` (o mesmo `<path>` de ✕). Vira o primeiro focável: o foco inicial cai
  nele. Hambúrguer do header mantém `aria-expanded`/`aria-controls` e recebe o foco de volta.
  README de reactbits: StaggeredMenu, modificação 13.
- **Teste:** `header.test.tsx` — "painel tem botão 'Fechar menu' (within o dialog), pressable,
  44×44; foco inicial cai nele; clicar fecha, devolve o foco ao hambúrguer e `aria-expanded`
  volta a false". Teste do trap ajustado: afirma explicitamente que o primeiro focável é o ✕ e o
  último é o CTA do WhatsApp.
- **Prova por quebra:** `cabecalho` removido → 2 falhas (botão + trap). Restaurado → 16/16.
- **Ao vivo (320):** botão existe dentro do `role="dialog"`, `44×44`, `pressable`, é o primeiro
  dos focáveis (último: "Agendar avaliação"); clicar nele fecha (`aria-expanded` true → false,
  dialog volta a `aria-hidden`+`inert`) e o foco volta ao hambúrguer (`activeElement` = "Abrir
  menu", foco síncrono). O que **não** foi observável: a posição final do painel (GSAP/rAF parado —
  botão medido em `left 527`, fora do viewport de 320, porque o painel ficou em `xPercent: 100`) e o
  foco inicial (via `requestAnimationFrame`). Os dois estão cobertos pela suíte.

### F3b — fundo inerte com overlay aberto · commit `a2c86b1`

- **Correção:** `lib/fundoInerte.ts` — `isolarFundo(manter): () => void`: percorre
  `document.body.children`, pula `SCRIPT/STYLE/LINK/TEMPLATE/NEXT-ROUTE-ANNOUNCER` e qualquer filho
  que seja (ou contenha) um elemento de `manter`, guarda `inert`/`aria-hidden` anteriores, aplica
  `setAttribute('inert','')` + `aria-hidden="true"`, devolve restauração exata e idempotente.
  `MobileMenu` e `Lightbox` envolvem backdrop + painel num `<div ref={portalRef}>` (sem classes),
  isolam no efeito de abertura, restauram no cleanup **e** em `fechar()` **antes** de
  `focus()` no hambúrguer/gatilho. `Z_INDEX_BACKDROP` continua exportado.
- **Testes:** `fundoInerte.test.ts` (5: aplica, mantém portal aninhado, preserva `aria-hidden`
  pré-existente, ignora script/style/link/template/announcer, idempotente + aceita `null`);
  `header.test.tsx` — com o drawer aberto o wrapper do header, `main` e `footer` ficam
  `inert`+`aria-hidden`, o portal fica de fora, ao fechar voltam ao estado anterior (`aria-hidden`
  pré-existente do footer preservado) **e** a ordem restaurar→focar é provada com um spy em
  `HTMLElement.prototype.focus` (registra se o fundo ainda estava inerte no instante do
  `focus()` do hambúrguer → `[false]`); `lightbox.test.tsx` — equivalente (fechamento pelo pai
  zerando `slug` e por Escape), inclusive a ordem restaurar→focar no gatilho.
- **Prova por quebra:** drawer passa `body.children` inteiro em `manter` (não isola nada) +
  lightbox foca antes de restaurar → 2 falhas (uma em cada arquivo). Restaurado → 46/46 nos 4 arquivos.
- **Ao vivo (320):** drawer aberto → `header`, `main#topo`, `footer`, o wrapper do FAB e os demais
  `div`s do body com `inert` + `aria-hidden="true"`; `next-route-announcer` e o portal do drawer
  intocados. Fechado → tudo restaurado, inclusive o `div` sentinela do FAB que já tinha
  `aria-hidden="true"` antes (continuou com ele, sem `inert`). Lightbox aberto (tour) → `header`,
  `main`, `footer` inertes; Escape → restaurados e **foco de volta ao botão "Tour pela clínica"**
  (gatilho focado antes do clique). Isolamento não é motion — idêntico sob reduced-motion.

### F4 — subtítulo do hero · commit `b51783d`

- **Correção:** `text-[15px]` → `text-[16px]` só na linha "Consultório de cadeira única…"
  (`max-w-[32ch]` mantido); a legenda de apoio abaixo (l.152) intocada.
- **Teste:** nenhum (classe pura, conforme o brief).
- **Ao vivo (320):** `font-size: 16px`, `line-height 24px`, 3 linhas (72 px), `scrollWidth ===
  clientWidth === 254` (sem palavra estourando), `documentElement` 320/320 — **não estoura**.

## Itens do brief que não mudaram de propósito

- Item 14 da síntese (microcopy do rodapé em 13–14 px): exceção aceita, não mexi.
- Item 7 (FAQ): decisão do parceiro, não mexi.
- `orcamento.test.ts`: vermelho de propósito, não mexi.
- `profissional.test.tsx` (asserções de `<h3>` de Como Funciona): não mexi — só ganhou o teste do item C.

## Commits

| Item | Hash | Mensagem |
|---|---|---|
| A1 | `1b08ec1` | fix(Task 18 A1): aria-label sai do span fatiado e vai para o h1 (aria-prohibited-attr) |
| A2 | `c426133` | fix(Task 18 A2): pilares de h3 para p/strong (heading-order) |
| B | `98a7aaf` | feat(Task 18 B): drawer na régua do guia — 300ms/220ms, stagger 40ms, curva --ease-gaveta no GSAP |
| C | `a03c0c5` | fix(Task 18 C): Como Funciona em bg-branco quebra o bloco de cinco seções em creme |
| D | `f4a3966` | feat(Task 18 D): lightbox mostra poster e "Carregando vídeo…" até o canplay |
| E1 | `b0fd804` | feat(Task 18 E1): "Sorriso com propósito" visível no rodapé, sob o logo |
| E2 | `d939902` | fix(Task 18 E2): logo do header aponta para #topo (main id="topo"), não "#" |
| F1 | `09ed968` | fix(Task 18 F1): links do nav desktop com alvo de 44px (min-h-11), WCAG 2.5.8 |
| F2 | `410345c` | fix(Task 18 F2): nav desktop gap-6 em md, gap-8 só de lg (overflow de 8px em 768) |
| F3a | `919d4c7` | feat(Task 18 F3a): botão "Fechar menu" dentro do painel do drawer |
| F3b | `a2c86b1` | fix(Task 18 F3b): fundo inert + aria-hidden com drawer ou lightbox abertos |
| F4 | `b51783d` | fix(Task 18 F4): subtítulo do hero de 15px para 16px (mínimo de corpo do projeto) |

Nenhum `git add -A`: cada commit adicionou só os arquivos do item (`git status` conferido antes);
`.next/` e `lh-*.json` nunca entraram.

## Para a re-review escopada

- Tentar de novo com o painel compositando: abertura do drawer em ≤ 0,45 s até o último item,
  fechamento 0,22 s, foco inicial no ✕ do painel, fade do "Carregando vídeo…" no `canplay`, rolagem
  suave do logo. Se não compositar, registrar como limitação — como aqui.
- `target-size` já passava no axe antes (texto puro de 19,5 px não é sinalizado pelo Lighthouse por
  ter espaçamento suficiente); a correção de F1 é pela WCAG 2.5.8/régua do projeto, não por nota.
