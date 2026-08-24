# Task 18 — re-review escopada da rodada única de correção

Você revisa a correção da Task 18 (QA/critique) do site da clínica Smile Ipiranga. É a
**única** re-review: depois dela o projeto vai para a review final da branch. Você **não corrige
nada** — verifica e dá veredito por item.

**Diretório:** `D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA` (raiz do git,
branch `feat/site`). App em `site/`. Commits a revisar: `ac966a1..b51783d`
(`git log --oneline ac966a1..b51783d` e `git diff ac966a1..b51783d -- site`).

**Leia antes:**
1. `.superpowers/sdd/2026-08-19-site-smile-ipiranga/task-18-fix-brief.md` — o contrato: 12 itens
   (A1, A2, B, C, D, E1, E2, F1, F2, F3a, F3b, F4), cada um com correção, teste e prova exigidos.
2. `.superpowers/sdd/2026-08-19-site-smile-ipiranga/task-18-fix-report.md` — o que o agente de
   correção diz ter feito. **Desconfie por padrão**: verifique cada alegação de forma independente.
3. `.superpowers/sdd/2026-08-19-site-smile-ipiranga/task-18-critique.md` — por que cada item
   existe (síntese dual-agent).
4. `.superpowers/sdd/2026-08-19-site-smile-ipiranga/design-guidance.md` — régua de motion (item B).

**Regras:** não altere `.claude/launch.json`; não toque no servidor 4173; para medir ao vivo,
suba `npm run build && npm run start -- -p 4701` de `site/` e feche ao final. Testes:
`npx vitest run --no-file-parallelism` de `site/` (`npm test` trava). `orcamento.test.ts` vermelho
é esperado. Se o painel não compositar (`document.hidden=true`), o `javascript_tool` ainda mede
DOM/CSS — use-o e declare a limitação; nunca alegue ter visto o que não viu.

## Por item — o que verificar (código + teste + ao vivo)

- **A1** `aria-prohibited-attr`: `SplitText.tsx` passa `aria: "hidden"`; `Hero.tsx` põe
  `aria-label` no `<h1>` só no ramo `podeAnimar`; `hero.test.tsx` afirma igualdade exata no `<h1>`
  **e** ausência no `.split-parent`; README de reactbits registra. Ao vivo:
  `document.querySelector('h1 .split-parent')?.getAttribute('aria-label') === null` e
  `h1.getAttribute('aria-label')` é a headline. Prova por quebra descrita no relatório.
- **A2** `heading-order`: `Pilares.tsx` sem `<h3>` (usa `<p><strong>`, mesmas classes);
  `tratamentos.test.tsx` afirma os 4 rótulos por texto e ausência de heading nível 3 na seção;
  `profissional.test.tsx` **intocado**. Ao vivo: sequência de `h1..h6` da página sem salto.
- **B** motion do menu: `CustomEase.create('gaveta','0.32,0.72,0,1')` registrado uma vez junto do
  ScrollTrigger; painel ~0,3s com `'gaveta'`; itens stagger 0,04s / ~0,28s começando junto com o
  painel; fechamento 0,22s com curva de desaceleração; **nenhum `power3.in`**
  (`grep -rn "power3.in" site/components` vazio); constantes exportadas e testadas contra o teto;
  `header.test.tsx` inteiro verde; `--ease-gaveta` deixa de ser órfão (referenciado ou
  documentado como a mesma curva do GSAP); README registra. Sob `!podeAnimar`, sem stagger.
- **C** `ComoFunciona.tsx` em `bg-branco`; contraste dos textos AA sobre branco (meça
  `getComputedStyle` das cores e calcule, ou cite os tokens preto/grafite sobre #FFFFFF).
- **D** `Lightbox.tsx`: poster `/videos/posters/<slug>.webp` como fundo; indicador
  "Carregando vídeo…" em `font-rotulo` até `canplay`; some com fade ~200ms (sem fade sob
  `!podeAnimar`); teste dispara `canplay` no jsdom e afirma que o indicador sumiu;
  `Z_INDEX_BACKDROP` continua exportado. Nenhuma animação fora de `transform`/`opacity`.
- **E1** `Footer.tsx` mostra "Sorriso com propósito" sob o logo em `font-rotulo`; teste do rodapé
  atualizado; **CTA final intocado**; nenhuma outra copy nova (`git diff` em texto visível).
- **E2** logo do header `href="/"` (ou `#topo` com `id="topo"` no `<main>`); teste; sem reload
  perceptível.
- **F1** os 4 `<a>` do nav desktop com `inline-flex min-h-11 items-center`; teste de classe; **ao
  vivo** em 768/1024/1280: `getBoundingClientRect().height >= 44` nos 4 — meça você, não aceite a
  tabela do relatório.
- **F2** `<nav>` com `gap-6 lg:gap-8` (e CTA `px-5 lg:px-6` só se precisou); **ao vivo** em
  768, 800, 820, 834, 900, 1023, 1024: `document.documentElement.scrollWidth === clientWidth` e
  `header.scrollWidth === header.clientWidth`. O corte do drawer **continua em `md`**.
- **F3a** botão "Fechar menu" **dentro do painel** (prop `cabecalho` do `StaggeredMenu`), 44×44,
  `pressable`, primeiro focável; clicar fecha e devolve foco ao hambúrguer (teste); o hambúrguer
  do header mantém `aria-expanded`/`aria-controls`. **Ao vivo em 375 com o drawer aberto:**
  `elementFromPoint` nas coordenadas centrais do botão retorna o próprio botão (ou filho dele) —
  prova de que é visível e alcançável acima do backdrop e do painel. README registra a prop.
- **F3b** `lib/fundoInerte.ts` com `isolarFundo(manter)` que devolve restauração idempotente e
  ignora `SCRIPT/STYLE/LINK/TEMPLATE/NEXT-ROUTE-ANNOUNCER`; usado por `MobileMenu.tsx` **e**
  `Lightbox.tsx`; restauração acontece **antes** do `focus()` de retorno nos dois `fechar()`;
  testes: header (header/main/footer inertes com drawer aberto, restaurados ao fechar), lightbox
  (idem), unitário do helper (restaura `aria-hidden` pré-existente, ignora `script`). **Ao vivo
  em 375 com o drawer aberto:**
  `['header','main','footer'].map(s => document.querySelector(s).hasAttribute('inert'))` →
  `[true,true,true]`; fechado → `[false,false,false]`; o hambúrguer recebe o foco após fechar
  (`document.activeElement`). Mesmo para o lightbox (abra por clique real num VideoCard, se
  conseguir rolar; senão, por código + teste).
- **F4** `Hero.tsx` subtítulo `text-[16px]`, `max-w-[32ch]` mantido, l.152 intocada.

## Fechamento

- `npx vitest run --no-file-parallelism`: só `orcamento.test.ts` vermelho; total de testes **maior**
  que 221 (houve testes novos em A1, A2, B, D, E1, E2, F1, F3a, F3b e do helper).
- `npm run build` e `npx eslint .` limpos.
- Lighthouse mobile e desktop no 4701 (Chrome não está instalado: use
  `CHROME_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"`, `--quiet`, saída em
  `lh-rereview-*.json`, **não commitar**): a11y **1.00** nos dois, zero audits de a11y reprovados
  (`aria-prohibited-attr`, `heading-order`, `target-size` ausentes); performance dentro de ±0.03
  de mobile 0.64 / desktop 0.99.
- `git status` limpo; `.claude/launch.json` sem diff; nenhum `lh-*.json` commitado; um commit por
  item na ordem do brief.
- Copy: `git diff ac966a1..b51783d -- site/components site/lib/content.ts` não introduz texto
  visível além de "Sorriso com propósito" e "Carregando vídeo…"/"Fechar menu" (rótulos de UI).

## Relatório

`.superpowers/sdd/2026-08-19-site-smile-ipiranga/task-18-rereview-report.md`: por item,
**ADDRESSED / PARTIAL / NOT ADDRESSED** com a evidência que **você** produziu (comando + valor),
não a do relatório do agente; depois a lista de fechamento com ✓/✗; limitações declaradas.
Na resposta final, retorne APENAS: contagem ADDRESSED/PARTIAL/NOT por item, a linha da suíte, a
nota de a11y mobile/desktop, e se recomenda seguir para a review final da branch (SIM/NÃO + motivo).
