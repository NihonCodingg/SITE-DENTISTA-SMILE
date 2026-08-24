# Task 5 — Fundação de motion (Lenis + GSAP ScrollTrigger) — Relatório

## Entregue

- `site/lib/motion.tsx` — `<MotionProvider>` e `useLenis(): Lenis | null`
- `site/components/ui/Reveal.tsx` — `<Reveal as="div" delay={0} y={24} className="">`
- `site/app/globals.css` — 3 tokens de easing no bloco `@theme`
- `site/app/layout.tsx` — `{children}` envolvido por `<MotionProvider>`
- `site/__tests__/reveal.test.tsx` — 4 testes (3 do brief + 1 novo, ajustados)
- `site/__tests__/motion.test.tsx` — 4 testes novos, não pedidos pelo brief mas
  adicionados para travar o comportamento do provider (ver seção "Desvios")
- `site/vitest.setup.ts` — stub de `ResizeObserver` (gap do jsdom, ver abaixo)

## O que a doc local do Next 16 dizia sobre providers no App Router

Antes de tocar `layout.tsx`, li `site/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`,
seção "Context providers" (linhas ~347–419), e `03-api-reference/03-file-conventions/layout.md`.
Pontos que guiaram a implementação:

- React Context não é suportado em Server Components; o padrão é criar um Client
  Component (`'use client'`) que aceita `children` e faz `<Ctx.Provider>`. Isso já
  era exatamente o que o brief pedia para `MotionProvider`, então nenhuma mudança
  de forma foi necessária.
- Citação literal da doc: **"You should render providers as deep as possible in
  the tree – notice how `ThemeProvider` only wraps `{children}` instead of the
  entire `<html>` document. This makes it easier for Next.js to optimize the
  static parts of your Server Components."** — segui isso ao pé da letra:
  `RootLayout` continua um Server Component comum (sem `'use client'`), e
  `<MotionProvider>` envolve só `{children}` dentro de `<body>`, nunca `<html>`.
- `layout.md` confirma que o root layout **deve** definir `<html>`/`<body>` e que
  não se deve adicionar `<head>` manual (isso é da Task 16, `metadata`) — não mexi
  nisso.
- Nada na doc sugere uma API nova/diferente para Client Components ou Context em
  relação ao que eu já esperava; a única mudança de comportamento real que a
  versão 16 trouxe e que afetou esta task foi no **tooling de lint** (abaixo), não
  na API do Next em si.

## Decisões e desvios do código exato do brief

O brief deu código "exato" para `motion.tsx`, mas ele **não passa em `npm run
lint`** neste projeto: `eslint-config-next` 16.3.1 traz `eslint-plugin-react-hooks`
7.1.1, que inclui a regra nova `react-hooks/set-state-in-effect`
(voltada para compatibilidade com o React Compiler). Ela reprova
`setLenis(l)` chamado direto dentro do `useEffect`, com a mensagem sugerindo
três saídas — a que se aplica aqui é a terceira: *"Force update / external sync:
use `useSyncExternalStore`"*.

Reescrevi `useLenis`/`MotionProvider` preservando exatamente a interface pública
(`<MotionProvider>`, `useLenis(): Lenis | null`) mas trocando o par
`useState`+`setLenis` dentro do efeito por um pequeno store externo
(`getSnapshot`/`subscribe`/`set`) consumido via `useSyncExternalStore`. O próprio
Lenis é um objeto que vive fora do React (mexe em DOM/rAF diretamente), então essa
é a modelagem correta, não só um jeito de calar o lint.

Isso, por sua vez, esbarrou numa segunda regra nova, `react-hooks/refs`: o padrão
óbvio de "criar o store uma vez com `useRef` + lazy init" é aceito pelo lint
**só** na linha de inicialização (`if (ref.current == null) { ref.current = ... }`
é o padrão exato que ela reconhece) — mas ler `ref.current` de novo para usar no
JSX (`<Ctx.Provider value={store}>`) já conta como "ler ref durante a
renderização" e é reprovado. Troquei o ref por `useState(() => createLenisStore())`
(inicializador preguiçoso, executa uma vez só): o valor pode ser lido durante o
render sem restrição, e o setter do `useState` nunca é chamado de novo — quem
muda é o objeto externo via `store.set(...)`.

Validei toda a reescrita com um teste de fumaça (`__tests__/motion.test.tsx`,
4 casos) antes de aceitar como pronta: sem provider `useLenis()` devolve `null`
sem quebrar; sob reduced-motion o Lenis nunca é criado; sob capacidade plena
`useLenis()` reflete o Lenis criado de forma reativa (confirma que o
`useSyncExternalStore` propaga a mudança); e o desmonte não lança erro. Também
confirmei em navegador real (`next dev`, ver seção de verificação) que
`document.documentElement` ganha a classe `lenis` que a própria lib adiciona
quando está ativa — prova de ponta a ponta de que o provider realmente inicializa
o scroll suave fora do ambiente de teste.

`Reveal.tsx` e `layout.tsx` passaram no lint sem qualquer ajuste — o código do
brief para eles já estava limpo.

### Gap de ambiente encontrado: `ResizeObserver` no jsdom

O construtor do `Lenis` chama `ResizeObserver` internamente e **lança** se a API
não existir. jsdom não implementa `ResizeObserver`. Sem isso, qualquer teste
futuro que monte `<MotionProvider>` com `podeAnimar=true` quebraria — não é um bug
do código, é uma lacuna do ambiente de teste. Adicionei um stub mínimo
(`observe`/`unobserve`/`disconnect` vazios) em `site/vitest.setup.ts`, guardado
por `typeof globalThis.ResizeObserver === 'undefined'`. Isso é puramente
infraestrutura de teste; não muda nenhuma asserção existente e evita que as
próximas 10 tasks tropecem no mesmo obstáculo ao testar componentes que consomem
`useLenis()`.

## Como tratei o `prefers-reduced-motion` (emenda ao brief)

O brief original fazia `<Reveal>` pular a animação inteira quando
`podeAnimar === false` (`if (!el || !montado || !podeAnimar) return;`). A emenda
do guia de craft mandou trocar isso: reduzir não é zerar. Implementei dois ramos
dentro do mesmo `useEffect`:

- **`podeAnimar === true`** (código igual ao brief): `gsap.fromTo(el, {opacity:0,
  y}, {opacity:1, y:0, duration:.7, delay, ease:'power2.out',
  scrollTrigger:{trigger:el, start:'top 88%', once:true}})`.
- **`podeAnimar === false`**: mesmo `scrollTrigger` (mesmo gatilho de posição,
  `top 88%`, `once:true` — só a marca do movimento muda, não quando ele
  acontece), mas só anima `opacity` (nunca `y`), com `duration:.2` e
  **`immediateRender:false`**.

O `immediateRender:false` no ramo reduzido não é cosmético — é o que garante o
requisito real de acessibilidade. Por padrão, `gsap.fromTo()` renderiza o estado
"de" (`opacity:0`) **de forma síncrona** no instante em que a tween é criada,
independente do `scrollTrigger` — isso é o mecanismo por trás de "nasce visível
no HTML, e o JS esconde-e-revela depois que confirma que pode animar" no ramo de
movimento completo, e é desejado ali. Sob reduced-motion, esse mesmo
comportamento hoje esconderia o conteúdo mesmo estando ele fora da área de
disparo do scroll — com `immediateRender:false`, o gsap só toca o elemento
quando o `ScrollTrigger` de fato dispara (a posição real de scroll cruzou `top
88%`), então quem usa reduced-motion nunca vê o conteúdo desaparecer antes da
hora; ele só recebe, no momento do scroll, um fade curto de opacidade sem
nenhum `translateY`.

Cheguei nesse desenho fazendo um spike empírico direto com `gsap`+`ScrollTrigger`
sob jsdom antes de escrever o componente (não por memória — o próprio brief avisa
para não presumir), porque o comportamento de `immediateRender` combinado com
`ScrollTrigger` tem uma pegadinha real: jsdom não faz layout, então
`getBoundingClientRect()` de qualquer elemento é zerado por padrão, e isso faz o
`ScrollTrigger` concluir, no instante da criação, que o elemento **já passou** do
ponto de disparo — o que dispara renderizações síncronas inesperadas e teria
feito o teste de acessibilidade falhar por um artefato do ambiente, não por um
bug real. A correção não foi enfraquecer a asserção do teste; foi tornar o mock
de `getBoundingClientRect` realista (elemento abaixo da dobra, fora da viewport
de 768px do jsdom — exatamente como o `<Reveal>` aparece de verdade em produção
no primeiro render). Deixei esse mock e o comentário explicando o motivo dentro
de `reveal.test.tsx`.

O teste "não esconde o conteúdo sob prefers-reduced-motion" do brief foi mantido
palavra por palavra (mesma asserção, `el.style.opacity` não pode ser `'0'`) e
continua passando. Acrescentei um quarto teste, "não desloca o conteúdo sob
prefers-reduced-motion", que verifica `el.style.transform === ''` — essa é a
prova real do requisito de acessibilidade (quem tem sensibilidade vestibular é
machucado pelo deslocamento, não pela mudança de opacidade).

## Sobre os tokens de easing e o `ease` usado no GSAP

Os 3 tokens (`--ease-saida`, `--ease-movimento`, `--ease-gaveta`) foram
adicionados ao bloco `@theme` de `globals.css` exatamente como especificado na
emenda. Mantive `ease: 'power2.out'` nas duas tweens do `<Reveal>` (em vez de
converter `--ease-saida` para o formato do GSAP): são curvas nativas do GSAP,
já profissionalmente calibradas e sem `ease-in` (a regra que a emenda proíbe),
e o guia de craft enquadra os tokens CSS como a base para `transition`/`animation`
em CSS puro — que é onde as tasks seguintes (botões, dropdown, drawer do menu
mobile) vão consumi-los via `var(--ease-saida)` etc. Nada no `<Reveal>` usa CSS
transition, então não havia onde aplicar os tokens ali sem forçar uma
equivalência que o GSAP não pede.

## Saída real dos testes

Suite completa (`npm test`, de `site/`):

```
 Test Files  6 passed (6)
      Tests  53 passed (53)
```

(45 pré-existentes + 4 de `reveal.test.tsx` + 4 de `motion.test.tsx`.)

Rodada isolada do arquivo do brief (`npm test -- reveal`):

```
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

Confirmação de falha antes de implementar (`npm test -- reveal`, só com o teste
escrito, sem `Reveal.tsx`):

```
Error: Failed to resolve import "@/components/ui/Reveal" from
"__tests__/reveal.test.tsx". Does the file exist?
 Test Files  1 failed (1)
      Tests  no tests
```

`npx tsc --noEmit`: limpo, sem erros.
`npm run lint`: limpo, sem erros/warnings.

## Verificação em navegador real

Subi `next dev -p 3101` (3000 e 3100 já ocupados) e abri no Browser pane:

- Console sem erros (só o aviso padrão do React DevTools e `[HMR] connected`).
- `document.documentElement.className` inclui `lenis` — a própria lib do Lenis
  adiciona essa classe quando está ativa, confirmando que `MotionProvider`
  inicializou o scroll suave de ponta a ponta fora do ambiente de teste.
- Servidor de verificação encerrado ao final.

## Commit

```
cd site && git add -A && git commit -m "feat: fundacao de motion com Lenis e ScrollTrigger"
```

## Concerns / atenção para as próximas tasks

- `useLenis()` agora é reativo via `useSyncExternalStore` — componentes que
  fizerem `useEffect(() => {...}, [lenis])` vão re-rodar corretamente quando o
  Lenis for criado/destruído, igual ao contrato original do brief.
- Qualquer teste futuro que monte `<MotionProvider>` com `podeAnimar=true`
  depende do stub de `ResizeObserver` em `vitest.setup.ts` — já está lá, não
  precisa repetir por arquivo de teste.
- Componentes de scroll-reveal futuros que testem posição/visibilidade sob jsdom
  devem lembrar do artefato de `getBoundingClientRect` zerado (documentado com
  comentário em `reveal.test.tsx`) — mockar uma posição realista evita falsos
  positivos/negativos.

---

## Adendo — correção do Important da review

**Achado da review:** o teste "não desloca o conteúdo sob prefers-reduced-motion"
usava um elemento fora da viewport (`top: 2000`) para evitar o artefato do jsdom
onde o `ScrollTrigger` dispara sozinho na criação. Efeito colateral: o gatilho
**nunca disparava** durante esse teste, então as asserções de `opacity`/`transform`
capturavam o estado anterior a qualquer tween tocar o elemento — o teste provava
"nada rodou antes da hora", não "o fade roda sem deslocar". Um regressão que
reintroduzisse `y` no ramo `!podeAnimar` (mantendo `immediateRender: false`)
passaria verde.

**Correção:** adicionado `site/__tests__/reveal.test.tsx` → `'quando o gatilho
dispara de verdade sob reduced-motion, o fade roda até o fim sem tocar
transform'`. Ele:

1. Reposiciona o elemento **dentro** da zona de disparo (`top: 100`, contra o
   limite de `top 88%` de uma viewport jsdom de 768px = 676px) — o oposto do
   `beforeEach` padrão do arquivo.
2. Chama `ScrollTrigger.refresh()` dentro de `act()`, forçando o GSAP a
   reavaliar posições e disparar `onEnter` → `play()` de verdade.
3. Localiza o `ScrollTrigger` do elemento via `ScrollTrigger.getAll()` e chama
   `trigger.animation.progress(1)` (dentro de `act()`) para avançar a tween de
   200ms até o fim. Preferi isso a fake timers + `requestAnimationFrame`: o
   ticker do gsap pode capturar a referência real do rAF antes de qualquer
   `vi.useFakeTimers()` no setup deste projeto, o que tornaria o avanço por
   tempo falso não-confiável; `progress(1)` na animation ligada ao trigger é
   determinístico.
4. Afirma **duas coisas**, não uma: `opacity` chegou a `'1'` (prova que a
   animação rodou até completar, não que foi pulada) **e** `transform`
   continua `''` (prova ausência de deslocamento). A primeira asserção é o
   que dá valor à segunda — sem ela, "transform vazio" ficaria ambíguo entre
   "não deslocou" e "não rodou".

O teste "não desloca..." original foi mantido (ainda tem valor: protege contra
a remoção acidental de `immediateRender: false`), só ganhou um comentário
deixando explícito o que ele prova e o que não prova, apontando para o teste
novo.

### Verificação de que o teste pega o bug

Reintroduzi temporariamente `y`/`y: 0` no ramo `!podeAnimar` de
`site/components/ui/Reveal.tsx` (o exato bug que a review descreveu — displacement
reintroduzido mantendo `immediateRender: false`) e rodei `npm test -- reveal`:

```
 ❯ __tests__/reveal.test.tsx (5 tests | 1 failed) 231ms
     × quando o gatilho dispara de verdade sob reduced-motion, o fade roda até
       o fim sem tocar transform

AssertionError: expected 'translate(0, 0)' to be '' // Object.is equality
- Expected
+ Received
+ translate(0, 0)

 Test Files  1 failed (1)
      Tests  1 failed | 4 passed (5)
```

O teste novo falhou exatamente como esperado — e é revelador que o `transform`
"quebrado" não é `translate(0, 24px)` (o valor do `y` inicial), e sim
`translate(0, 0)`: no fim da animação (`progress(1)`) o gsap já resolveu `y`
para o valor de repouso, mas **escreveu a propriedade** `transform` mesmo
assim, porque `y` estava presente nos vars. É exatamente essa escrita —
presente ou ausente — que distingue "nunca tocou transform" de "tocou e
terminou em zero", e é o que a asserção `toBe('')` captura.

Revertido o arquivo para o estado do commit anterior (`diff` contra a cópia de
backup confirmou binário idêntico) e rodei de novo:

```
 Test Files  1 passed (1)
      Tests  5 passed (5)
```

`Reveal.tsx` e `motion.tsx` **não foram alterados** nesta correção — só
`reveal.test.tsx` mudou (`git diff --stat`: 1 arquivo, 51 inserções).

### Saída final

```
npm test   (de site/)
 Test Files  6 passed (6)
      Tests  54 passed (54)
```

(53 anteriores + 1 teste novo.) `npm run lint` e `npx tsc --noEmit`: limpos.

### Commit

```
cd site && git add __tests__/reveal.test.tsx && git commit -m "test: prova que o fade reduzido roda ate o fim sem deslocar (Important da review)"
```
