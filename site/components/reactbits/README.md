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

### `CircularGallery.tsx`

- **Origem:** `src/ts-tailwind/Components/CircularGallery/CircularGallery.tsx`
- **Usado em:** Task 13 (seção "Sorrisos feitos aqui" — os 9 retratos de pacientes reais)
- **Dependências que arrasta:** `ogl` (já no projeto desde a Task 8, para o `Silk`). Nenhuma
  dependência nova.
- **Rede:** o original **fazia** uma chamada de rede — `loadFontFromStylesheet()` buscava
  `https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&display=swap` toda vez que o
  componente montava, para desenhar a legenda de cada item em canvas. **Removida** (ver
  modificação nº1 abaixo) — a política deste projeto veta chamada de rede em componente
  vendorizado, e a Task 13 não tem texto nenhum pra desenhar (não existe nome de paciente
  confirmado; inventar está fora de questão).
- **`matchMedia`/reduced-motion:** o componente não consulta nada por conta própria — quem decide
  se ele deve existir na árvore é `SorrisosGaleria.tsx`, via `useCapability().podePesado`, no mesmo
  padrão que `HeroBackdrop.tsx` (Task 8) já usa para o `Silk`. Fonte única preservada.
- **Cleanup:** o `destroy()` original cancelava o `rAF` e removia os listeners de
  window/canvas — mas **nunca** liberava o contexto WebGL (`WEBGL_lose_context`) nem pausava o
  loop de render fora da viewport ou com a aba oculta. As duas são exigências duras desta task
  (mesmo padrão que `components/ui/Silk.tsx`, Task 8) — corrigidas nas modificações nº2 e nº4
  abaixo.
- **Só `transform`/`opacity`:** o componente inteiro é desenhado em WebGL (shader), não CSS — a
  regra "só transform e opacity" do `design-guidance.md` fala de propriedades CSS animadas fora do
  canvas, então não se aplica ao desenho interno do shader.
- **Modificações:**
  1. **Removido todo o sistema de legenda em canvas** — a classe `Title`, `createTextTexture()`,
     `getFontSize()`, `DEFAULT_FONT`/`DEFAULT_FONT_URL`, e as quatro funções de carregamento de
     fonte (`loadFontFromStylesheet`, `loadFontFromFile`, `loadCustomFont`, `resolveFont`,
     `deriveFontFamilyFromUrl`). Três motivos: (a) a chamada de rede ao Google Fonts, vetada pela
     política de vendorização; (b) não existe texto nenhum pra desenhar — os 9 itens de
     `SORRISOS` (`lib/content.ts`) não têm nome de paciente, e inventar um está fora de questão;
     (c) efeito colateral: cada item também deixa de criar uma segunda textura/mesh (a do texto),
     o que reduz o número de objetos WebGL por retrato de 2 para 1. `Media`/`MediaProps` perderam
     os campos `text`/`textColor`/`font` (não usados mais), e `App`/`AppConfig` os campos
     `font`/`fontUrl`/`textColor` correspondentes.
  2. **O loop de render (`App.update`) agora pausa fora da viewport e com a aba oculta.** O
     original chamava `renderer.render(...)` a cada `requestAnimationFrame`, incondicionalmente,
     pra sempre enquanto o componente estivesse montado — o mesmo problema que
     `reactbits-vendoring.md` já registrou pro `ScrollVelocity` (Task 9) e que este README explica
     acima. Adicionado um `IntersectionObserver` no container (`visivel`) e uma checagem de
     `document.hidden`, exatamente como `components/ui/Silk.tsx` (Task 8): o `rAF` continua sendo
     reagendado a cada quadro (retomar precisa ser instantâneo), mas o corpo pesado (`lerp`,
     `media.update`, `renderer.render`) só roda quando a seção está visível e a aba em primeiro
     plano. Provado por teste com `rAF`/`IntersectionObserver` mockados —
     `__tests__/circularGallery.test.tsx`.
  3. **Redimensionamento trocou de `window.resize` para `ResizeObserver` no container** — mesmo
     padrão de `Silk.tsx`. Reage à seção mudando de tamanho (ex.: rotação de tela, sidebar) sem
     depender só do viewport inteiro mudar.
  4. **`destroy()` agora libera o contexto WebGL** (`gl.getExtension('WEBGL_lose_context')?.
     loseContext()`), que o original não fazia — cleanup incompleto era exatamente o tipo de bug
     que esta task pede pra consertar antes de aceitar o componente. Provado por teste
     (`__tests__/circularGallery.test.tsx`: "libera o contexto WebGL... no unmount").
  5. **Gestos de arraste/roda começam só no container, não em `window` inteiro.** O original
     registrava `mousedown`/`wheel`/`touchstart` no `window`: rolar a página em qualquer lugar do
     site, ou clicar em qualquer elemento, empurrava o `scroll.target` da galeria mesmo com ela
     fora da tela — desperdício de trabalho e um bug sutil (a galeria já chegaria "deslocada" na
     primeira vez que entrasse na viewport). Agora `wheel`/`mousedown`/`touchstart` ficam no
     container; `mousemove`/`mouseup`/`touchmove`/`touchend` continuam em `window` de propósito
     (padrão padrão de arraste: se o cursor sair da caixa no meio do gesto, o arraste não pode
     travar ali).
  6. **`new App(...)` entra em `try/catch`**, com uma prop `onError?: (falhou: boolean) => void`
     nova. `useCapability().podePesado` prevê memória/núcleos/rede, mas não prevê uma GPU
     bloqueada ou WebGL desligado por política do navegador — casos em que o `ogl` real não lança
     (só faz `console.error` e deixa `gl` nulo/quebrado internamente), mas o código deste arquivo
     que lê `this.gl.clearColor(...)` logo em seguida lançaria um `TypeError`. Sem o catch, esse
     erro derrubaria a árvore de React inteira (não há Error Boundary por perto) — e a exigência
     do brief ("ninguém pode ficar sem ver os pacientes") quebraria justo no pior caso. Quem chama
     (`SorrisosGaleria.tsx`) usa `onError` pra trocar pro scroller de fallback. Provado por teste
     (mock do `ogl` lançando na construção do `Renderer`).
  7. **Removidos `role="region"`, `tabIndex={0}`, o `aria-label` em inglês e a navegação por
     `ArrowLeft`/`ArrowRight`** (`onKeyDown`, `boundOnKeyDown`). O host do canvas agora só tem
     `aria-hidden="true"`: o WebGL não é acessível a leitor de tela (a task pediu para pensar
     nisso explicitamente), e um elemento focável com `aria-hidden="true"` é um anti-padrão de
     acessibilidade (cria um "buraco negro" de foco pra quem navega por teclado com leitor de
     tela). O equivalente textual dos 9 retratos — o que a task pede como mínimo de
     acessibilidade — vive em `SorrisosGaleria.tsx`, fora deste arquivo: um parágrafo `sr-only`
     que descreve a galeria, presente no DOM sempre que o canvas está ativo. Nenhum conteúdo se
     perde: os 9 retratos já estão todos visíveis no anel da galeria (a interação de
     arraste/scroll só gira o anel pra explorar, não revela itens escondidos), então um usuário de
     teclado sem mouse não perde nenhuma informação por não conseguir focar o canvas — só a
     animação decorativa, que já está marcada como tal.
  8. Todos os `any` implícitos do original (`debounce<T extends (...args: any[]) => void>`,
     `autoBind(instance: any)`) desapareceram junto com o código que os usava — a função `autoBind`
     inteira era só para a classe `Title`, removida no item 1. Nada precisou de tipagem `any` no
     restante do arquivo.
  9. `items` mudou de `{ image: string; text: string }[]` para `{ image: string }[]` (sem `text`,
     consistente com o item 1). Os 9 itens de `SORRISOS` (`lib/content.ts`) viram
     `{ image: s.img }` em `SorrisosGaleria.tsx`.
- **Custo real registrado para a Task 17 medir:** o original (mantido) duplica a lista de itens
  (`galleryItems.concat(galleryItems)`) para o loop parecer contínuo — 9 retratos viram 18 planos
  com textura própria na GPU. A rede não dobra (mesma URL, cache do navegador serve a segunda
  cópia), mas a memória de GPU sim. É o preço de um "loop circular" com poucos itens; não foi
  alterado porque removê-lo quebraria o efeito que a task pediu.

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
