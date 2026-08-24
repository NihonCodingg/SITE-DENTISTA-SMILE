# Task 10 — Pilares e Tratamentos

## O que foi feito

- **`site/components/sections/Pilares.tsx`** (novo) — Server Component puro (sem `'use client'`).
  Grid `repeat(auto-fit,minmax(min(220px,100%),1fr))`, `gap-[28px]`. Cada um dos 4 `PILARES`
  (Task 4) envolvido em `<Reveal delay={i * 0.08}>` (o próprio `<Reveal>` já carrega
  `'use client'`; nada em `Pilares.tsx` precisa da fronteira). `<h3>` em Archivo Black 17px,
  descrição 16px grafite, borda superior 3px amarela.
- **`site/components/sections/Tratamentos.tsx`** (novo) — também Server Component puro. Lista de
  7 linhas (`<a>` para o WhatsApp, grid `auto auto 1fr auto`) + 1 CTA final ("Agendar minha
  avaliação", mesma copy do CTA da Hero). Cada linha: número Jost dourado, miniatura quadrada
  `clamp(60px,8vw,92px)` `rounded-[14px]`, nome Archivo Black `clamp(21px,3vw,34px)` + descrição,
  círculo 46px com seta e borda 1.5px preta. `id="tratamentos"` — a âncora que o `Header` (Task 6)
  já linkava em `#tratamentos` e que ficava morta até agora.
- **`site/__tests__/tratamentos.test.tsx`** (novo) — os 3 testes do brief + 6 que escrevi para
  cobrir os requisitos de craft que o brief não testava explicitamente (ver "Testes" abaixo). 9
  testes, todos passando.
- **`site/app/globals.css`** — nova regra `.linha-tratamento` (glare hover à mão, ver "Desvio"
  abaixo).
- **`site/app/page.tsx`** — montei `<Ticker />`, `<Pilares />`, `<Tratamentos />` logo depois de
  `<HeroSection />`, nessa ordem. `page.tsx` continua sem `'use client'`
  (`grep -n "use client" site/app/page.tsx` → vazio) — e, na prática, **nenhum** dos três
  componentes novos precisou da diretiva: motivo detalhado abaixo.

## Por que Pilares e Tratamentos não precisaram de `'use client'`

O brief original (`task-10-brief.md`) pedia `GlareHover` condicionado a `podeAnimar` +
`pointer:fine`, o que sugeria `useCapability()` — e portanto `'use client'` — em `Tratamentos`.
Ao decidir *não* vendorizar o `GlareHover` (ver "Desvio" abaixo) e implementar o reflexo à mão,
percebi que o gate inteiro dá pra fazer em CSS puro:

- `pointer: fine` é uma media feature — toque nunca a satisfaz estruturalmente, sem precisar de
  JS pra excluir touch.
- O reset global de `prefers-reduced-motion` em `globals.css` (`*, *::before, *::after {
  transition-duration: .01ms !important }`) já neutraliza a duração da transição do glare sob
  reduced-motion — e como o efeito só dispara em `:hover` (nunca autoplay), fica no mesmo balde
  que "transição de cor no hover → manter" do `design-guidance.md`, não no balde de "parallax →
  remover".

Sem esse gate JS, nada mais em nenhuma das duas seções precisa de interatividade client-side: o
fallback de miniatura é decidido no servidor (`fs.existsSync`, ver abaixo), `.pressable` e
`pointer-fine:hover:` são CSS puro, e `<Reveal>` já é seu próprio Client Component. Resultado:
`Pilares` e `Tratamentos` ficaram Server Components de ponta a ponta — menos JS enviado ao
cliente, zero risco de mismatch de hidratação, e o fallback de imagem decidido no HTML que o
servidor manda, não depois, no cliente.

## Fallback das miniaturas — decisão de design deliberada

As 7 imagens `trat-*.jpg` não existem em `public/img/` (confirmado: `ls public/img/` não lista
nenhuma). Em vez de renderizar `<Image>` e reagir a um evento `onError` no cliente (a abordagem
mais comum, mas que causa um flash do ícone de imagem quebrada do navegador antes do fallback
assumir), `Tratamentos.tsx` roda `fs.existsSync(path.join(process.cwd(), 'public', t.img))` **no
servidor**, durante o render — só é possível porque o componente não tem `'use client'`. A decisão
"tem foto ou não" já está pronta no primeiro HTML que sai do servidor: zero flash, zero estado de
cliente, funciona igual em SSR/SSG. No dia em que o cliente entregar as fotos de verdade, nenhuma
linha de código muda — `existeFoto` passa a devolver `true` e a `<Image>` real assume.

Testado: `container.querySelectorAll('img[src*="trat-"]').length === 0` e o glifo `✦` aparece
exatamente 7 vezes (uma por miniatura). Confirmado visualmente no Chrome (ver "Verificação visual")
— fundo creme com borda sutil (`border border-borda`) e `✦` dourado centralizado, nos dois tamanhos
de tela.

## Desvio — `GlareHover` do React Bits não foi vendorizado

Li o componente inteiro
(`src/ts-tailwind/Animations/GlareHover/GlareHover.tsx`, 109 linhas, baixado do commit fixado em
`components/reactbits/README.md`) antes de decidir. Ele:

1. **Anima `background-position`**, não `transform`/`opacity` — viola direto a regra do projeto
   ("só transform e opacity animam", repetida em `design-guidance.md` e no brief desta task).
2. **Força seu próprio container** (`className="relative grid place-items-center overflow-hidden
   border cursor-pointer ..."`) com `border` sempre visível e `display:grid;place-items:center` —
   incompatível com o grid `auto auto 1fr auto` que a linha de tratamento precisa (a linha tem 4
   colunas com papéis distintos: número, miniatura, texto, seta; o `GlareHover` espera um único
   filho centralizado num box de dimensão fixa).
3. Sem dependência nova, sem rede, sem `matchMedia` interno — nesses três pontos ele estava OK.

Não vendorizado. Implementado à mão em CSS puro (`.linha-tratamento` + `::after` em
`globals.css`): uma faixa de luz diagonal (`skewX(-20deg)`) que translada de fora da linha pra
fora do outro lado, só `transform` na transição (`transform: skewX(-20deg) translateX(...)`,
550ms, `var(--ease-movimento)`), atrás de `@media (hover: hover) and (pointer: fine)`. Registrado
em `components/reactbits/README.md` seguiria o padrão dos desvios anteriores, mas como o arquivo
nunca chegou a ser criado em `components/reactbits/` (mesmo precedente do `Silk` e do
`ScrollVelocity`: quando a decisão é não vendorizar, não entra arquivo na pasta) — a decisão e o
raciocínio completo ficam registrados aqui e no comentário acima da regra CSS em `globals.css`.

**Nota:** o `README.md` de `components/reactbits/` não foi editado com uma seção dedicada ao
`GlareHover` (diferente do que os relatórios das Tasks 8/9 fizeram para `Silk`/`ScrollVelocity`)
porque a decisão nem chegou a gerar um artefato dentro daquela pasta — achei mais honesto deixar o
raciocínio aqui, no relatório da task que tomou a decisão, e no comentário inline em
`globals.css`, do que adicionar uma entrada a um README que documenta arquivos vendorizados
quando este não foi.

## Craft

- **Stagger:** Pilares usa `delay={i * 0.08}` (o valor literal do brief — 80ms, o teto da janela
  de 30-80ms de `design-guidance.md`; só 4 itens, sem necessidade de cap). Tratamentos limita o
  stagger às primeiras 5 linhas (`STAGGER_MAX = 5`, passo de 60ms) — as linhas 6 e 7 herdam o
  mesmo delay da 5ª (`Math.min(i, STAGGER_MAX - 1) * STAGGER_STEP`), entrando junto com ela em vez
  de esticar a cascata, exatamente como `design-guidance.md` pede para listas de 7 itens.
- **Só transform/opacity animam:** `.pressable` (transform + background/border/color já
  existentes em `globals.css`), o glare (`transform` só), a seta no hover
  (`pointer-fine:group-hover:translate-x-0.5 -translate-y-0.5`, também só `transform`). Nenhum
  `padding`/`width`/`height`/`top`/`left` animado em nenhum dos dois componentes.
- **`:hover` sempre atrás de `@media (hover:hover) and (pointer:fine)`** — usei a variante nativa
  `pointer-fine:` do Tailwind v4 (confirmada no fonte, `node_modules/tailwindcss/dist/lib.js`:
  mapeia para `@media (pointer: fine)`), no mesmo padrão já usado em `Hero.tsx`/`Header.tsx`, mais
  o `:hover` do próprio Tailwind — junto, os dois excluem touch estruturalmente.
- **Alvo ≥44px:** cada linha de tratamento leva `min-h-11` (44px) além do conteúdo (que já passa
  disso, dado o texto e a miniatura).
- **Nenhum `transition: all`, nenhum `ease-in`** — grep confirma.

## Bug real encontrado, fora do escopo desta task — não corrigido aqui

Ao verificar "sem overflow horizontal" em 375px (passo explícito da task), encontrei overflow
horizontal real e mensurável no site inteiro, causado pelo drawer do menu mobile
(`site/components/layout/MobileMenu.tsx`, Task 6) — **não** por `Pilares`/`Tratamentos`. Isolado
via `document.documentElement.scrollWidth`: 695px num viewport de 375px (695 = 375 + 320, exatos
320px de largura do painel do drawer). Confirmado que é o drawer: `document.querySelector('[role=
"dialog"]').style.display = 'none'` derruba `scrollWidth` para os 375 corretos.

Causa: o painel fechado usa `position: fixed` + `transform: translateX(100%)` para sair de tela.
`position:fixed` normalmente não contribui pro scroll do documento, mas um `transform` aplicado a
um elemento fixed faz o navegador incluir a geometria pós-transform no overflow rolável do
documento — mesmo com o painel `aria-hidden`/`inert`/visualmente fora da tela. Confirmei que é
**anterior** a esta task: troquei `app/page.tsx` de volta para a versão pré-Task-10 (só
`Header`+`HeroSection`+`WhatsAppFab`, via `git show HEAD:site/app/page.tsx`) e o mesmo
`scrollWidth: 695` reproduziu igual, sem nenhuma das minhas seções montadas.

Como não é um arquivo desta task (`MobileMenu.tsx` é da Task 6, já commitado e já revisado) e uma
correção de verdade merece o mesmo processo (teste que falha primeiro, depois corrige, sem
regredir foco/`inert`/animação do drawer), registrei como task separada via `spawn_task` em vez de
tocar o arquivo aqui. Meu `page.tsx`/`Pilares.tsx`/`Tratamentos.tsx` não contribuem nada ao
overflow: com o drawer neutralizado no DOM (só para medir, sem alterar nenhum arquivo),
`scrollWidth` volta a 375 exatos com as 3 seções novas montadas.

## Testes

`cd site && npm test -- tratamentos` — 9/9 passando. Suíte completa (`npm test`) — 90/90 passando
em 11 arquivos. `npm run build` — compila, typecheck limpo, `/` prerenderizado como estático.
`npm run lint` — limpo.

Um dos 9 testes pegou um bug real durante o TDD: os `<span>` de nome e descrição da linha eram
irmãos sem nenhum nó de texto entre eles no DOM. O nome computado acessível concatenava os dois
sem espaço (`"...implante" + "Solução..." → "...implanteSolução..."`), e como a busca por regex do
Testing Library é case-insensitive, `"implanteS"` colidia com `/Implantes/i`. Corrigido com um
`{' '}` explícito entre os dois `<span>`s — não é só um workaround de teste: sem ele, um leitor de
tela também juntaria as duas palavras sem pausa nenhuma.

## Verificação visual (Chrome real, via Browser pane)

`npm run dev -- -p 3100`, checado em 1280px e 375px.

- **1280px:** Header → Hero → Ticker (faixa amarela rolante) → Pilares (grid de 3 colunas, a
  4ª quebra pra linha de baixo — `auto-fit` correto) → Tratamentos (linhas com miniatura de
  fallback dourada sobre creme, número Jost, nome Archivo Black, círculo com seta). Hover
  testado numa linha: fundo vira `bg-branco`, distinto do `bg-creme` da seção — confirma o
  `pointer-fine:hover:bg-branco`.
- **375px:** mesma ordem. Pilares em coluna única. Tratamentos: nomes longos
  ("PROTOCOLO DE IMPLANTE") quebram em 2 linhas sem estourar a linha — o `min-w-0` na coluna `1fr`
  está fazendo o trabalho. CTA final ("AGENDAR MINHA AVALIAÇÃO") visível e íntegro ao final da
  lista. **Sem overflow horizontal contribuído por estas duas seções** (ver "Bug real encontrado"
  acima sobre o overflow pré-existente do drawer, que não pertence a esta task).
- Console do navegador: só ruído de HMR websocket (esperado em dev); nenhum erro de React/app.

## Concerns

- O bug de overflow do drawer mobile (ver acima) está sinalizado como task separada
  (`task_ebc28e7a`), não corrigido aqui — é pré-existente e fora do escopo dos arquivos desta
  task.
- `GlareHover` do React Bits não foi vendorizado (motivo detalhado acima); a implementação à mão
  não ficou registrada em `components/reactbits/README.md` porque nenhum arquivo chegou a entrar
  naquela pasta — só aqui e no comentário em `globals.css`.
