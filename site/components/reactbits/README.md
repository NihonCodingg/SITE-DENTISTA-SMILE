# React Bits — componentes vendorizados

O registry do shadcn (`npx shadcn add @react-bits/...`) não funciona (devolve o HTML do site, não
JSON — ver `.superpowers/sdd/2026-08-19-site-smile-ipiranga/reactbits-vendoring.md`). Os arquivos
abaixo foram baixados direto do repositório oficial, variante TypeScript + Tailwind
(`src/ts-tailwind/...`), e vivem aqui por exigência da licença (MIT + Commons Clause: o aviso de
copyright tem que acompanhar o código — ver `LICENSE.md` nesta pasta).

Repositório: https://github.com/DavidHDev/react-bits
Commit de referência: `4e0e030193b563be6be33d928f77d0d01cefe237` (branch `main`, 2026-08-15)

## Arquivos e modificações

### `SplitText.tsx`

- **Origem:** `src/ts-tailwind/TextAnimations/SplitText/SplitText.tsx`
- **Usado em:** Task 8 (reveal da headline do Hero)
- **Dependências que arrasta:** `gsap` + `gsap/ScrollTrigger` + `gsap/SplitText` (todas já no
  projeto — `gsap@3.15.0` inclui o `SplitText` de graça desde a versão 3.13, não é mais plugin
  pago) e, no original, `@gsap/react` (pacote novo, **não** trazido — ver modificação abaixo).
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o componente não consulta nada por conta própria — quem decide
  se ele deve existir na árvore é o chamador, via `useCapability().podeAnimar` (ver
  `components/sections/Hero.tsx`). Fonte única preservada.
- **Modificações:**
  1. Trocado o hook `useGSAP` (de `@gsap/react`, dependência que este projeto não tinha) por
     `useEffect` + cleanup manual — o mesmo idioma que `components/ui/Reveal.tsx` já usa para
     gsap. Evita adicionar um pacote novo para o que o React já resolve nativamente. O estado de
     `document.fonts` (que o original lia via `useState` dentro de um `useEffect`) virou
     `useSyncExternalStore`: setState síncrono dentro do corpo de um efeito é o que a regra
     `set-state-in-effect` do eslint-plugin-react-hooks do Next 16 reprova — mesmo padrão que
     `lib/motion.tsx` já usa para o Lenis.
  2. Removidas as opções `linesClass`/`wordsClass`/`charsClass` passadas ao construtor de
     `GSAPSplitText`: conferido em `node_modules/gsap/SplitText.js` (v3.15.0) que essa build não
     tem essas chaves de configuração — ficariam mortas no código. As classes que o GSAP aplica
     por padrão (`.char`/`.word`/`.line`) já bastam, já que nada no site as consulta.
  3. Removido `overflow-hidden` do `split-parent`: útil no split original para mascarar
     `splitType="lines"` (linhas entrando de baixo pra cima), mas a Hero usa `splitType="words"`
     com `y: '0.4em'`, e o `leading-[0.96]` bem apertado da headline (mais a cedilha de "começa")
     cria risco real de corte com uma caixa `overflow-hidden` ajustada ao texto. Decisão preventiva
     por análise, não por defeito observado: com o `overflow-hidden` já removido, a Task 8 conferiu
     no Chrome real (`getComputedStyle` do `.split-parent` → `overflow: visible`) que não há corte.
     Ver `task-8-report.md`.
  4. Registro de `gsap.registerPlugin(ScrollTrigger, GSAPSplitText)` movido do escopo do módulo
     (onde o React Bits original registra) para dentro do efeito — mesmo padrão que
     `components/ui/Reveal.tsx` já usa. `ScrollTrigger.register` toca `matchMedia` internamente, e
     um módulo é avaliado antes de qualquer stub de `matchMedia` rodar; no navegador real `window.
     matchMedia` sempre existe, mas em SSR/testes isso quebra por um gap do ambiente, não do
     código — corrigido pela mesma razão do padrão já estabelecido no projeto.
  5. Adicionado `'use client'` no topo (o original não declara; como só é importado por Client
     Components neste projeto, é redundante, mas mantém o padrão explícito do resto do código).

### `Magnet.tsx`

- **Origem:** `src/ts-tailwind/Animations/Magnet/Magnet.tsx`
- **Usado em:** Task 8 (efeito magnético nos CTAs do Hero)
- **Dependências que arrasta:** nenhuma além de React.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** idem — não consulta nada sozinho. O gate (`podeAnimar` **e**
  `pontoFino`, os dois vindos de `useCapability()`) é passado de fora via a prop `disabled` já
  existente no componente original. Nenhuma modificação necessária para isso.
- **Cleanup:** o `mousemove` no `window` já tinha remoção correta no `useEffect` original — nada a
  consertar.
- **Só `transform`:** já animava só `transform: translate3d(...)` — dentro da regra.
- **Modificações:**
  1. Os defaults de `activeTransition`/`inactiveTransition` trocaram `ease-out 0.3s`/`ease-in-out
     0.5s` (curvas nativas do CSS, valores do React Bits) pelos tokens da marca
     `var(--ease-movimento)` (entrada, puxado pelo cursor, 200ms) e `var(--ease-saida)` (saída,
     solta e volta, 150ms) — `design-guidance.md` veta curva nativa em qualquer lugar do site, e
     manda a saída mais rápida que a entrada ("a saída é sempre mais rápida que a entrada"). Numa
     primeira versão inverti sem querer a duração (entrada 200ms, saída 400ms — saída mais lenta
     que a entrada, direção errada); corrigido na review da Task 8.
  2. O ramo `disabled` do efeito original chamava `setPosition({x:0,y:0})` de forma síncrona
     dentro do corpo do efeito — a regra `set-state-in-effect` do eslint-plugin-react-hooks do
     Next 16 reprova isso (mesma regra documentada em `lib/motion.tsx`). Troquei por: o efeito só
     retorna cedo sem registrar o listener, e o valor renderizado (`posAgora`/`activeAgora`) é
     forçado a `{0,0}`/`false` diretamente quando `disabled`, sem depender de resetar estado de
     dentro do efeito.
  3. Adicionado `'use client'` no topo, mesma razão do `SplitText.tsx`.

### `GradualBlur.tsx`

- **Origem:** `src/ts-tailwind/Animations/GradualBlur/GradualBlur.tsx`
- **Usado em:** Task 12 (bordas do carrossel de Depoimentos, indicando que o scroller continua)
- **Dependências que arrasta:** nenhuma além de React.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o componente não consulta nada por conta própria. Não precisou
  de gate por `useCapability()` na chamada (Depoimentos.tsx): nesta task ele é usado sem a prop
  `animated`, então nada nele anima — é uma máscara de `backdrop-filter` estática, mesma categoria
  de custo do `backdrop-blur-[8px]` que o Header (Task 6) e o botão do tour do Hero (Task 8) já usam
  sem gate. Se uma task futura ligar `animated`/`hoverIntensity`, revisitar essa decisão.
- **Cleanup:** os dois efeitos com listener (`useResponsiveDimension` para redimensionar,
  `useIntersectionObserver` para o modo `animated="scroll"`) já tinham `return` de limpeza
  corretos no original. Nenhum dos dois chega a registrar listener no uso desta task
  (`responsive`/`animated` não são passados), mas o cleanup foi mantido intacto para quem vier a
  usar essas variantes depois.
- **Só `transform`/`opacity` quando anima:** o componente pode animar `backdrop-filter` e `opacity`
  quando a prop `animated` está ligada — não usado nesta task (ver acima). O `opacity` que ele usa
  (para o modo `animated="scroll"`) está dentro da regra; `backdrop-filter` não é `transform`, mas
  só entra em transição com `animated` ligado, o que este projeto não aciona.
- **Modificações:**
  1. Removidos todos os `any` do arquivo original (`@typescript-eslint/no-explicit-any` é erro
     neste projeto — `eslint.config.mjs` via `eslint-config-next/typescript`). O uso mais
     específico (`useResponsiveDimension` concatenando `'mobile' + Cap(key)` como string dinâmica
     tipada `any`) virou uma tabela fechada `RESPONSIVE_FIELDS: Record<'height'|'width', {...}>`
     com as três chaves (`mobileHeight`/`tabletHeight`/`desktopHeight` e as três de `width`)
     explícitas — mesmo comportamento, sem indexação dinâmica não tipada. O
     `(config as any)` do destructuring de `hoverIntensity`/`animated`/`onAnimationComplete`/
     `duration` foi removido puro e simples: `config` já é `Required<GradualBlurProps>`, o cast
     era desnecessário.
  2. Removidos os dois `(GradualBlurMemo as any).PRESETS = ...` / `.CURVE_FUNCTIONS = ...`
     (propriedades estáticas anexadas ao componente memoizado para consumidores avançados da lib
     original). Não usados em lugar nenhum deste projeto; exigiam `any` para existir.
  3. **Removida a função `injectStyles()` e sua chamada em escopo de módulo** (o original injeta
     `<style id="gradual-blur-styles">{'.gradual-blur{pointer-events:none;transition:opacity .3s
     ease-out}'}</style>` em `document.head` na primeira vez que o arquivo é importado no
     cliente). Dois motivos: (a) é um efeito colateral de import — muta o DOM global fora do ciclo
     de vida de qualquer componente, sem relação com o React de quem está lendo o arquivo; a classe
     `.gradual-blur` já recebe `pointer-events:none` inline via `containerStyle` quando
     `hoverIntensity` não está setado (nosso caso), tornando a regra CSS redundante; (b) a
     transição injetada usa `ease-out` nativo do CSS em TODO elemento `.gradual-blur` da página,
     incondicionalmente — `design-guidance.md` proíbe curva nativa em qualquer lugar do site. Como
     este projeto nunca liga `animated`, essa transição nunca dispararia de verdade, mas remover a
     injeção evita uma folha de estilo global "invisível" (fora do Tailwind, fora de qualquer
     arquivo `.css` rastreado) que um mantenedor futuro precisaria descobrir sozinho.

### `Silk` — **não vendorizado**

O brief pedia o `Silk` do React Bits para o fundo do Hero. Não foi trazido: toda variante do
componente no repositório (`ts-tailwind`, `tailwind`, `ts-default`, `default` — conferido inclusive
no commit inicial do arquivo, maio/2025) usa `@react-three/fiber` + `three`, não `ogl`. A política
deste projeto (`reactbits-vendoring.md`) é explícita: *"se um componente exigir three, pare e
reporte: three.js num site de clínica não se paga."*

Em vez disso, `site/components/ui/Silk.tsx` é uma implementação própria com `ogl` (a dependência
leve que o orçamento de performance desta task já previa), reaproveitando a mesma matemática de
ruído do shader original do React Bits (GLSL, MIT + Commons Clause) — só o motor de render mudou.
Detalhes e o porquê no `task-8-report.md`.

### `ScrollVelocity` — **não vendorizado**

O brief (Task 9) pedia o `ScrollVelocity` do React Bits
(`src/ts-tailwind/TextAnimations/ScrollVelocity/ScrollVelocity.tsx`) para a faixa de tratamentos
abaixo do Hero. Foi lido inteiro antes de decidir — sem `matchMedia` próprio, sem chamada de rede,
sem dependência nova (usa só `motion/react`, já no projeto) — mas **não foi trazido**:

1. **Não pausa fora da viewport nem com a aba oculta.** Monta seis hooks do `motion/react`
   (`useScroll` + `useVelocity` + `useSpring` + `useTransform` + `useMotionValue` +
   `useAnimationFrame`) que ficam ativos pra sempre enquanto o componente está montado — nenhum
   deles verifica visibilidade. Essa é uma exigência dura desta task ("Um ticker que roda para
   sempre é o candidato número um a queimar bateria"), e não dava pra cumprir sem reescrever a
   peça central do componente (o loop de `useAnimationFrame`), o que não é mais "vendorizar com
   modificação pontual" (o que foi feito em `SplitText.tsx`/`Magnet.tsx`) — é reescrever o
   componente por dentro.
2. **`design-guidance.md` nomeia "ticker" explicitamente** como candidato a preferir CSS/JS direto
   a Motion: *"Para o que é predeterminado (reveal, hover, ticker), prefira CSS. Guarde o Motion
   para o que é dinâmico e interrompível (lightbox, drawer)."* Um texto correndo em looping infinito
   com velocidade reativa ao scroll é exatamente o caso descrito.

Em vez disso, `site/components/sections/Ticker.tsx` implementa a trilha à mão: um `rAF` que escreve
`element.style.transform` diretamente (nunca uma custom property no elemento pai — mesma regra de
performance do `design-guidance.md`), com pausa por `IntersectionObserver` + `document.hidden`
**no mesmo padrão exato do `Silk.tsx`** (Task 8), e aceleração vinda do `velocity` que o próprio
Lenis já calcula a cada evento de `scroll` (`lib/motion.tsx`) — em vez de recalcular a velocidade
de novo com `useScroll`/`useVelocity` do `motion/react`, reaproveita o Lenis como fonte única sobre
o estado do scroll (o mesmo Lenis que já move a página inteira). Detalhes e o porquê no
`task-9-report.md`.

### `GlareHover` — **não vendorizado**

O brief da Task 10 pedia `GlareHover` do React Bits
(`src/ts-tailwind/Animations/GlareHover/GlareHover.tsx`) para o reflexo de hover nas linhas de
Tratamentos. Lido inteiro (109 linhas, mesmo commit fixado acima) antes de decidir — sem
dependência nova, sem chamada de rede, sem `matchMedia` interno, esses três pontos estavam OK —
mas **não foi trazido**:

1. **Anima `background-position`**, não `transform`/`opacity` — viola direto a regra deste projeto
   ("só transform e opacity animam", repetida em `design-guidance.md` e no brief da própria task).
2. **Força seu próprio container** (`className="relative grid place-items-center overflow-hidden
   border cursor-pointer ..."`) com `border` sempre visível e `display:grid;place-items:center` —
   incompatível com o grid `auto auto 1fr auto` que a linha de tratamento precisa (a linha tem 4
   colunas com papéis distintos: número, miniatura, texto, seta; o `GlareHover` espera um
   único filho centralizado num box de dimensão fixa).

Em vez disso, `.linha-tratamento`/`.linha-tratamento::after` em `site/app/globals.css` implementam
o reflexo à mão em CSS puro: uma faixa de luz diagonal (`skewX(-20deg)`) que translada de fora da
linha pra fora do outro lado, só `transform` na transição (550ms, `var(--ease-movimento)`), atrás
de `@media (hover: hover) and (pointer: fine)` — `pointer:fine` já exclui touch estruturalmente
(toque não tem essa media feature), e o reset global de `prefers-reduced-motion` já deixa a
transição praticamente instantânea sob esse modo, sem precisar de `useCapability()` para um efeito
que só existe atrás de `:hover`. Detalhes e o porquê no `task-10-report.md`.
