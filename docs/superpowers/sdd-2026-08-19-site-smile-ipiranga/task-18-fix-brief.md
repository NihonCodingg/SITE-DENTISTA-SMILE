# Task 18 — brief de correção (UM despacho, depois UMA re-review)

> Montado a partir da síntese dual-agent (`task-18-critique.md`): Avaliação A + Avaliação B +
> um achado da própria síntese (F3a). **Completo — pode despachar.**

A `impeccable` é explícita: inspecionar em lote uma vez, **corrigir tudo de uma vez**, confirmar
com no máximo mais uma rodada, parar. Este brief é o "corrigir tudo de uma vez".

**Diretório:** `D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA`
**Leia antes:** `design-guidance.md` (régua de motion), `task-18-fix-notes.md` (receitas dos 2 P1
de acessibilidade — siga-as), `task-18-A-report.md` (o contexto de cada item abaixo).
**Testes:** `npx vitest run --no-file-parallelism` de `site/`. Git na raiz, branch `feat/site`,
commits da raiz com `git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -m "..."`
terminando com linha em branco e `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
**Não altere `.claude/launch.json`.** Servidor em `http://localhost:4173` é de build antigo —
para verificar ao vivo, suba outro em porta livre com `npm run build && npm run start -- -p 4700`.

**Regra geral:** nenhum dado inventado; nenhuma copy nova além da que a marca já usa; só
`transform`/`opacity`/`clip-path` animam; `useCapability()` é a única fonte de `matchMedia`.
**Cada item: um commit, com o teste que o trava e a prova por quebra proposital.**

---

## A — os dois P1 de acessibilidade (WCAG AA, confirmados pelo axe)

Receitas completas em `task-18-fix-notes.md`. Resumo:

**A1. `aria-prohibited-attr`** — `aria: "hidden"` no `GSAPSplitText` vendorizado; `aria-label`
com a headline no próprio `<h1>` (só no ramo `podeAnimar`); reescrever `hero.test.tsx` para
igualdade exata **no `<h1>`** e ausência no `.split-parent`; registrar no README de reactbits.

**A2. `heading-order`** — Pilares de `<h3>` para `<p><strong>` (mesmas classes, visual
idêntico); reescrever o teste dos Pilares em `tratamentos.test.tsx` para afirmar os 4 rótulos
por texto e **ausência** de heading nível 3 na seção. **Não toque** em `profissional.test.tsx`
(é Como Funciona, que tem `<h2>` acima — está certo).

Verificação: Lighthouse mobile no final **sem** `aria-prohibited-attr` nem `heading-order`.

---

## B — motion do menu mobile (P2-1 de A, elevado a obrigatório pelo parceiro)

`components/reactbits/StaggeredMenu.tsx`. Hoje, pelo código: painel entra em 0,15s + 0,55s,
itens começam em ~0,23s e animam 0,8s com stagger de 0,06s → último item assenta em **~1,3s**.
Fechamento com `ease: 'power3.in'`. O guia define, para **este** componente: **300ms abrindo,
220ms fechando, stagger ~40ms, curva `--ease-gaveta`** (`cubic-bezier(0.32, 0.72, 0, 1)`),
saída mais rápida que a entrada, **nunca `ease-in`**.

Correção:
1. Registre a curva do token no GSAP com `CustomEase` (já é gratuito no GSAP 3.13+; confira que
   `gsap/CustomEase` existe em `node_modules/gsap`):
   `CustomEase.create('gaveta', '0.32,0.72,0,1')` — uma vez, no mesmo lugar onde o ScrollTrigger
   é registrado. Assim `--ease-gaveta` deixa de ser token órfão: CSS e GSAP usam a mesma curva.
2. Abertura: painel ~0,3s com `'gaveta'`; itens entram com stagger de **0,04s**, duração
   ~0,28s cada, começando junto com o painel (não 0,23s depois). Último item assenta em
   ≤ 0,45s — abaixo do teto para o conjunto, e o painel em si nos 300ms.
3. Fechamento: **0,22s**, curva de desaceleração (`'gaveta'` ou `power2.out`). **Apague
   `power3.in`.**
4. Sob `!podeAnimar`: abre e fecha sem stagger (já é assim — não regrida).
5. Preserve **tudo** que a Task 6 e a Task 19 conquistaram: foco preso nas duas direções, foco
   devolvido, `Escape`, `aria-expanded`/`aria-controls`, `inert` correto na reabertura rápida,
   `lenis.stop()`, `whileTap`, `scrollWidth === outerWidth`, `elementFromPoint` no painel. Os
   testes de `header.test.tsx` travam isso — rode-os.
6. Teste novo: afirme que as durações/stagger configurados ficam dentro do teto (exporte as
   constantes e teste os números; não mocke o GSAP para "ver animar").

Documente no README de reactbits o que mudou em relação ao original do React Bits e por quê.

---

## C — ritmo da página (P2-2 de A)

Cinco seções seguidas em `bg-creme`: Profissional → Depoimentos → Antes/Depois → Como Funciona →
Localização. Troque **Como Funciona** para `bg-branco` (é a mais utilitária do bloco e já fica
entre dois cremes, quebrando o trecho ao meio). Mudança de uma classe. Confira que o contraste
dos textos dela continua AA sobre branco (preto e grafite sobre branco passam).

---

## D — feedback de carregamento no lightbox (heurística 1 / persona Casey)

`components/ui/Lightbox.tsx`. Ao abrir, o `.mp4` completo só começa a baixar no clique — em 3G
a pessoa vê um player parado sem saber se algo acontece. Mostre o **poster** do vídeo
(`/videos/posters/<slug>.webp`, já existe) como fundo do `<video>` e um indicador discreto de
carregamento (texto "Carregando vídeo…" em `font-rotulo`, ou um spinner em CSS só com
`transform`) até o evento `canplay`; depois some com fade de ~200ms. Sob `!podeAnimar`, sem
fade. Teste: dispara `canplay` no jsdom e afirma que o indicador sumiu.

---

## E — pequenos (P3 de A)

**E1.** `"Sorriso com propósito"` visível: acrescente como linha discreta sob o logo no
**rodapé** (`Footer.tsx`), em `font-rotulo`, cor `escuro-texto`. É a assinatura que a própria
marca usa (`BRIEFING.md` §7) — copy existente, não nova. Atualize o teste do rodapé.
**Não** mexa no CTA final.

**E2.** Logo do header: `href="#"` → `href="/"`. O interceptador de âncora em `motion.tsx`
exclui `#` de propósito; com `/` o clique vira navegação normal para o topo. Confira que não
recarrega a página de forma perceptível (é a mesma rota; se recarregar, use `#topo` com um
`id="topo"` no `<main>` — que o interceptador trata com Lenis).

---

## F — Itens de B (medidos no navegador) + um da síntese

Contexto completo em `task-18-B-report.md` (seções 3 e 4.2) e `task-18-critique.md` (#3, #8, #9,
#10, #13).

**F1 (P1 — WCAG 2.5.8). Alvos do nav desktop com 19,5px de altura.** `components/layout/Header.tsx`
l.26-33: os 4 `<a>` do `<nav>` são texto puro. Acrescente `inline-flex min-h-11 items-center` a
cada um (44px — a mesma régua do CTA `min-h-11` do mesmo header; o mínimo WCAG é 24px, o do
projeto é 44). **Não mude** fonte, tamanho, tracking, cor nem o `gap` por causa disto (o gap é F2).
A altura do header não muda: a fileira já tem 44px por causa do botão de telefone. Teste em
`header.test.tsx`: os 4 links de nav carregam `min-h-11` (classe — jsdom não mede). Prova ao
vivo, no seu build em 4700: em 768, 1024 e 1280, `getBoundingClientRect().height >= 44` para os
4 links — registre os números no relatório.

**F2 (P2). Overflow horizontal de 8px em 768px.** `Header.tsx`: `header.scrollWidth 761` vs
`clientWidth 753`, elemento mais à direita é o CTA "Agendar avaliação". Correção: `<nav>` de
`gap-8` para `gap-6 lg:gap-8` (−24px em `md`, nada muda em `lg+`). Se ainda sobrar em alguma
largura de 768 a 1023, **então** CTA `px-5 lg:px-6`. **Não** mova o corte do drawer de `md` para
`lg` (tablet paisagem com mouse perderia o nav). Prova ao vivo: laço de `resize_window` em
**768, 800, 820, 834, 900, 1023, 1024** — `document.documentElement.scrollWidth ===
document.documentElement.clientWidth` **e** `header.scrollWidth === header.clientWidth` em todas.
Tabela no relatório.

**F3a (P2 — síntese). O painel do drawer não tem botão de fechar.** Com o drawer aberto, o ✕ do
header (`MobileMenu.tsx` l.127-137, `z-50` via header) fica **sob** o backdrop (`z-[65]`) e sob o
painel de `min(320px,86vw)` (`z-[70]`) — invisível e inalcançável por toque. Hoje fecha-se só pela
faixa do backdrop (55px em 375), por item, ou `Escape`. Correção: um botão **dentro do painel**,
no topo direito, `aria-label="Fechar menu"`, `pressable`, 44×44 (`h-11 w-11 rounded-full border
border-borda-forte`), o mesmo `<path>` de ✕ do `HamburgerIcon`. Implementação: `StaggeredMenu`
ganha uma prop `cabecalho?: ReactNode` renderizada antes da lista (como já faz `footer` depois);
`MobileMenu` passa o botão com `onClick={fechar}`. Ele vira o **primeiro focável** do painel —
o foco inicial cai nele (é o que um diálogo faz); o trap Tab/Shift+Tab continua cobrindo
primeiro↔último. O hambúrguer do header mantém `aria-expanded`/`aria-controls` e continua
recebendo o foco de volta ao fechar. Testes em `header.test.tsx`: "painel tem botão 'Fechar menu';
clicar nele fecha e devolve o foco ao hambúrguer"; ajuste o teste do trap (l.155) se ele assumia
que o primeiro focável era um item. README de reactbits: registre a prop nova.

**F3b (P2). Fundo não fica `inert` com overlay aberto — nos DOIS overlays.** B mediu com o drawer
aberto: `main.inert=false`, `mainAriaHidden=null`. O Lightbox tem a mesma lacuna (só isola o
próprio painel, `Lightbox.tsx` l.96-97/134-135). Correção, **um helper compartilhado**
`lib/fundoInerte.ts`:
```ts
export function isolarFundo(manter: Iterable<Element | null>): () => void
```
Percorre `document.body.children`; para cada elemento que **não** está em `manter` e não é
`SCRIPT/STYLE/LINK/TEMPLATE/NEXT-ROUTE-ANNOUNCER`: guarda o estado anterior de `inert` e
`aria-hidden`, aplica `setAttribute('inert','')` + `aria-hidden="true"`; devolve uma função que
restaura exatamente o estado anterior (idempotente — chamar duas vezes não quebra).
- `MobileMenu.tsx`: envolva backdrop + wrapper do painel num único `<div ref={portalRef}>` (sem
  classes — os filhos são `fixed`, o wrapper não entra no layout). No `useEffect([aberto])` já
  existente: `restaurarRef.current = isolarFundo([portalRef.current])`; no cleanup, restaure.
  **Ordem em `fechar()`:** restaure o fundo **antes** de `botaoRef.current?.focus()` — com o
  header inerte, `focus()` é no-op e o teste "Escape devolve o foco ao hambúrguer" quebra.
- `Lightbox.tsx`: mesmo padrão no `useEffect([aberto, montado])` e em `fechar()` antes de
  `gatilhoRef.current?.focus()`. `Z_INDEX_BACKDROP` continua exportado (o teste do GradualBlur
  importa).
- Testes: `header.test.tsx` — "com o drawer aberto, `header`, `main` e `footer` ficam
  `inert` + `aria-hidden`; ao fechar, voltam ao estado anterior"; teste equivalente no arquivo do
  Lightbox; e um teste unitário do helper (restaura `aria-hidden` pré-existente, ignora `script`).
  Siga o que `header.test.tsx:73` já faz para `inert` no jsdom (atributo, não propriedade).
- Sob `!podeAnimar` tudo igual — isolamento não é motion.

**F4 (P3). Subtítulo do hero a 15px em `font-corpo`.** `components/sections/Hero.tsx` l.148:
`text-[15px]` → `text-[16px]`. Mantenha `max-w-[32ch]`. Nada mais muda (l.152 é legenda de apoio
— não toque). Sem teste (classe pura); confira no build que não estoura linha em 320px.

Item 14 da síntese (microcopy do rodapé em 13–14px) foi **aceito como exceção** — não mexa.
Item 7 (FAQ) é decisão do parceiro — não mexa.

---

## Ao terminar

`npx vitest run --no-file-parallelism`, `npm run build`, `npx eslint .`. Lighthouse mobile **e
desktop** no build final (4700): confirme a11y **100** (os 2 P1 do axe eram os únicos reprovados;
`target-size` também precisa passar) e que performance não regrediu além do ruído (±0.03).
Relatório em `task-18-fix-report.md` com: a tabela de F2, as alturas de F1, e o Lighthouse
antes/depois. Na resposta: STATUS, commits (um por item: A1, A2, B, C, D, E1, E2, F1, F2, F3a,
F3b, F4), linha de testes, e a nota de acessibilidade antes/depois. Feche o servidor 4700 ao
final; **não** toque no 4173.

---

## Fatos verificados antes do despacho (não precisa redescobrir)

- `gsap` 3.15.0 instalado; `node_modules/gsap/CustomEase.js` **existe** — importe de `gsap/CustomEase`.
- `StaggeredMenu.tsx` hoje: camadas `duration 0.5 power4.out` a cada 0,07s (l.182); painel
  `panelDuration` com `power4.out` (l.189); itens `duration 0.8, power4.out, stagger 0.06`
  começando em `panelInsertTime + panelDuration*0.15` (l.192-196); contador `duration 0.5`
  (l.201); fechamento `duration 0.28, ease 'power3.in'` (l.229-230). São esses os números a mudar.
- `--ease-gaveta` **não é referenciado** em nenhum `.tsx/.ts/.css` fora do `globals.css` — órfão.
