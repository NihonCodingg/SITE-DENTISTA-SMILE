# React Bits — componentes vendorizados

> Os relatórios e guias citados por nome aqui e nos comentários do código (`design-guidance.md`,
> `task-19-report.md`, `ux-guidance.md`, …) vivem todos em
> `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/`, na raiz do repositório.

O registry do shadcn (`npx shadcn add @react-bits/...`) não funciona (devolve o HTML do site, não
JSON — ver `reactbits-vendoring.md`). Os arquivos
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
  6. **`aria: 'hidden'` passado ao construtor de `GSAPSplitText`** (Task 18, A1). O original
     deixa o default do GSAP (`aria: 'auto'`), que escreve `aria-label` com o texto original no
     próprio elemento fatiado — aqui um `<span class="split-parent">` sem role, onde `aria-label`
     é proibido (axe `aria-prohibited-attr`, WCAG 4.1.2; reprovava o Lighthouse de acessibilidade
     em mobile e desktop). Com `'hidden'`, os filhos fatiados ficam `aria-hidden` e nenhum
     `aria-label` é escrito no span; o nome acessível vai para o heading que envolve o split
     (`Hero.tsx` → `SectionHeading` prop `tituloAriaLabel`, só no ramo `podeAnimar`), onde é
     válido — o leitor de tela lê a frase inteira uma vez, em vez de palavra por palavra.
     `__tests__/hero.test.tsx` trava as duas pontas (atributo no `<h1>`, ausente no
     `.split-parent`).

### `DepthCarousel.tsx`

- **Origem:** `src/ts-tailwind/Components/DepthCarousel/DepthCarousel.tsx` (branch `main`)
- **Usado em:** Task 20 — seção "Resultados reais" (`components/sections/AntesDepois.tsx`), no lugar
  do scroller horizontal com `clip-path` que a Task 14 tinha construído. Pedido do dono do projeto.
- **Dependências que arrasta:** `gsap` (já no projeto) e `next/image` (ver modificação nº5).
  Nenhuma dependência nova.
- **Rede:** **o original faz** — os `DEFAULT_ITEMS` apontavam para `picsum.photos`. Removidos
  (modificação nº1); hoje o componente não tem default e nenhuma URL de terceiro.
- **`matchMedia`/reduced-motion:** o original consultava por conta própria. Virou prop
  `reducedMotion`, alimentada por `useCapability().podeAnimar` no chamador (modificação nº2) —
  fonte única preservada.
- **Cleanup:** o `useEffect` do autoplay já limpava o próprio `setInterval`; os listeners de
  ponteiro são registrados no elemento e removidos no mesmo efeito. Nada a consertar.
- **Só `transform`/`opacity`/`filter`:** o layout dos cartões anima `transform`, `opacity` e
  `filter: blur()` via GSAP — `filter` entra na mesma categoria de exceção aceita que o
  `background-position` do `GlareHover` (composto pela GPU, não causa reflow).
- **Modificações:**
  1. **`DEFAULT_ITEMS` removido** e `items` virou prop obrigatória — o default original eram seis
     imagens de `picsum.photos`, chamada de rede a host de terceiro, proibida neste projeto.
  2. **`reducedMotion` virou prop** em vez de `window.matchMedia` interno.
  3. `'use client'` adicionado no topo (o original não declara).
  4. **Escrita de ref movida do corpo do render para `useLayoutEffect`** — a regra
     `react-hooks/refs` do eslint do Next 16 reprova escrever ref durante o render (mesmo motivo
     que já mudou `SplitText` e `Magnet` na Task 8).
  5. **`<img>` trocado por `next/image`** — o original serve o arquivo cru; aqui as fotos passam
     pelo otimizador (AVIF, tamanho certo), como o resto do site.

### `OptionWheel.tsx`

- **Origem:** `src/ts-tailwind/Components/OptionWheel/OptionWheel.tsx` (branch `main`)
- **Usado em:** Task 20 — "Soluções que transformam sorrisos"
  (`components/sections/TratamentosSeletor.tsx`), no lugar das sete linhas de tratamento. Pedido
  do dono do projeto.
- **Dependências que arrasta:** nenhuma além de React.
- **Rede:** nenhuma chamada (depois da modificação nº4 — o original podia baixar um arquivo de som).
- **`matchMedia`/reduced-motion:** o componente não consulta nada por conta própria; quem chama
  passa `blur`/`smoothing` já decididos por `useCapability().podeAnimar`.
- **Cleanup:** o `useEffect` final cancela o `requestAnimationFrame`; o listener de `wheel` é
  removido no mesmo efeito que o registra. Nada a consertar.
- **Só `transform`/`opacity`/`filter`:** cada opção recebe `transform`, `opacity` e `filter:
  blur()` — mesma categoria de exceção aceita do `DepthCarousel`.
- **Modificações:**
  1. `'use client'` no topo (o original não declara).
  2. **Rótulo acessível por prop** (`rotulo`) — o original cravava `aria-label="Option wheel"`, em
     inglês, num site em português.
  3. **`aria-activedescendant`** no `role="listbox"`, com `id` em cada `role="option"`. Sem isso o
     leitor de tela lia a lista mas não anunciava a mudança de seleção pelas setas.
  4. **Som removido.** O original aceita `soundUrl`/`soundVolume` e toca um clique a cada passo,
     criando um `new Audio(...)`. A prop e o código de áudio saíram inteiros: som que a pessoa não
     pediu, num site de clínica, é ruído — e deixar a porta aberta convida a ligá-la sem pensar.
  5. **Escrita de ref movida do render para `useLayoutEffect`** (regra `react-hooks/refs`, mesma
     correção do `DepthCarousel`).
  6. **Laço de animação virou expressão de função nomeada.** O original agendava
     `requestAnimationFrame(runFrame)` de dentro do próprio `runFrame` — uso antes da declaração,
     que o eslint deste Next reprova. Um nome próprio (`quadro`) resolve sem ref intermediário.

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
  (mesmo padrão que `Silk.tsx`) — corrigidas nas modificações nº2 e nº4
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
     `document.hidden`, mesma ideia do `Silk.tsx` (que consegue expressá-la pelo `frameloop` do
     R3F, sem `rAF` próprio): o `rAF` continua sendo
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
     tela).
     **Correção pós-review — a justificativa abaixo estava errada numa versão anterior deste
     documento, que afirmava que os 9 retratos ficam todos visíveis ao mesmo tempo no anel.** É
     falso: com `bend=2`, FOV 45° e câmera em `z=20`, a conta de `App.onResize()` dá só ~4 dos 18
     planos (9 retratos duplicados) dentro da viewport a cada instante — arrastar É necessário pra
     ver a maioria dos retratos. Remover o foco do teclado deixa uma barreira real: quem navega só
     por teclado (com ou sem leitor de tela) não consegue girar o anel pra ver os outros. A decisão
     de marcar como decorativo mesmo assim se sustenta por outro motivo — não por "nada se perde":
     nenhuma das 9 fotos tem `alt` individual distinto nem no fallback (todas usam o mesmo
     "Paciente da Smile sorrindo" — não existe nome nem tratamento por foto pra diferenciar uma da
     outra). O parágrafo `sr-only` que `SorrisosGaleria.tsx` mantém ao lado do canvas transmite
     exatamente a mesma informação que a galeria transmite visualmente: existem 9 fotos reais de
     pacientes sorrindo. Expor o canvas ao foco não acrescentaria nenhum detalhe a mais — só
     trocaria "sem informação por foto" por "sem informação por foto, e ainda focável", que é pior.
  8. Todos os `any` implícitos do original (`debounce<T extends (...args: any[]) => void>`,
     `autoBind(instance: any)`) desapareceram junto com o código que os usava — a função `autoBind`
     inteira era só para a classe `Title`, removida no item 1. Nada precisou de tipagem `any` no
     restante do arquivo.
  9. `items` mudou de `{ image: string; text: string }[]` para `{ image: string }[]` (sem `text`,
     consistente com o item 1). Os 9 itens de `SORRISOS` (`lib/content.ts`) viram
     `{ image: s.img }` em `SorrisosGaleria.tsx`.
  10. **Três defaults numéricos mudaram do original para valores mais calmos** (julgamento de
      craft, não correção de bug — `design-guidance.md`: a marca é "quente, cuidadoso, pessoal",
      não uma agência): `bend` 3→2 (anel menos curvado), `scrollEase` 0.05→0.06 (lerp um pouco
      mais amortecido, menos nervoso) e **`borderRadius` 0.05→0.04** (cantos levemente menos
      arredondados nos planos). Os três aparecem nos defaults de `App`'s `AppConfig` e do
      `CircularGallery` exportado. Nenhum dos três foi validado contra uma referência visual do
      parceiro — ver `task-13-report.md`, seção "Concerns".
- **Custo real registrado para a Task 17 medir:** o original (mantido) duplica a lista de itens
  (`galleryItems.concat(galleryItems)`) para o loop parecer contínuo — 9 retratos viram 18 planos
  com textura própria na GPU. A rede não dobra (mesma URL, cache do navegador serve a segunda
  cópia), mas a memória de GPU sim. É o preço de um "loop circular" com poucos itens; não foi
  alterado porque removê-lo quebraria o efeito que a task pediu.

## Task 19 — "maximizar React Bits": os quatro recusados voltaram

Os quatro componentes abaixo (`StaggeredMenu`, `Silk`, `ScrollVelocity`, `GlareHover`) tinham sido
**recusados** nas Tasks 6, 8, 9 e 10 — cada seção deste README documentava, até a Task 19, por que
cada um não tinha entrado. O parceiro revisou o acumulado desses quatro motivos técnicos e decidiu
reverter, em 20/08/2026: *"Pode forçar o máximo possível, depois que o projeto finalizar se houver
muitos custos técnicos podemos resolver."* (registrado em `emenda-reactbits-e-skills.md`). Os
quatro foram vendorizados na Task 19 — as implementações à mão que os substituíam
(a antiga `components/ui/Silk.tsx` em `ogl`, o `rAF` manual do antigo `Ticker.tsx`, o CSS de
`.linha-tratamento::after`) foram removidas. O custo medido da troca (KB, chunks, first-load JS)
está em `task-19-report.md`.

### `StaggeredMenu.tsx`

- **Origem:** `src/ts-tailwind/Components/StaggeredMenu/StaggeredMenu.tsx`
- **Histórico:** recusado na Task 6 porque o registry do shadcn estava fora do ar (a forma de
  vendorizar direto do GitHub só foi descoberta na Task 8) — ele nunca chegou a ser avaliado pelo
  mérito, só ficou de fora por um acidente de disponibilidade. Recuperado na Task 19 por decisão do
  parceiro.
- **Usado em:** Task 19 — painel do drawer do menu mobile, dentro de `components/layout/
  MobileMenu.tsx`.
- **Dependências que arrasta:** `gsap` (já no projeto desde a Task 8, para o `SplitText`).
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o componente não consulta nada por conta própria — recebe uma
  prop `reducedMotion` já resolvida por `useCapability()` em `MobileMenu.tsx`. Quando `true`, a
  timeline GSAP inteira não roda: o painel abre/fecha só por `opacity` (CSS, sob o reset global de
  `prefers-reduced-motion` de `globals.css`), sem nenhum deslocamento — os prelayers decorativos
  nem renderizam, e itens/números já nascem na posição final.
- **Cleanup:** o original nunca matava `openTlRef`/`closeTweenRef` incondicionalmente no unmount —
  só em pontos de entrada específicos (`buildOpenTimeline`, `playClose`, o efeito de
  `reducedMotion`). Corrigido na rodada de correção pós-review: `useEffect` de cleanup dedicado que
  mata os dois no unmount, incondicional. Hoje isso não corrige um vazamento observado (o
  componente nunca desmonta neste app — `MobileMenu.tsx` mantém o painel sempre montado, controlado
  pela prop `open`), mas é o que a política de vendorização exige de qualquer componente que segura
  referência a timeline/tween do GSAP.
- **Só `transform`/`opacity`:** a coreografia de abertura anima `xPercent`/`yPercent`/`rotate` via
  GSAP (equivalentes a `transform`) e a custom property `--sm-num-opacity` (equivalente a
  `opacity`, lida por uma regra CSS) — dentro da regra.
- **Modificações** (a versão vendorizada tem 410 linhas contra as 588 do original — o que foi
  cortado está listado junto com o motivo):
  1. **`<header>` interno removido** (logo + botão hambúrguer com morph de ícone/texto, e o
     `gsap.timeline` de ~150 linhas que animava esse morph). `MobileMenu.tsx` já tem seu próprio
     botão hambúrguer, que já morfa para X — duplicar o controle seria dois triggers para uma coisa
     só, e nenhuma exigência de acessibilidade estava em jogo nesse código.
  2. **Virou controlado por uma prop `open`** — o original tinha estado e `onClick` de toggle
     próprios. `MobileMenu.tsx` continua dono do estado, do foco preso, do `Escape` e da trava de
     scroll, exatamente como antes da troca; um `useEffect` interno só observa `open` e decide
     entre `playOpen()`/`playClose()`.
  3. **`aria-hidden`/`inert` viraram props diretas amarradas a `open`** — o painel nunca desmonta
     (GSAP anima o mesmo nó para sempre), então não existe a corrida de timing que o
     `motion.div`+`AnimatePresence` do drawer anterior tinha.
  4. **Bug corrigido: `busyRef` assimétrico.** O original só fazia `playOpen()` respeitar uma flag
     "já tem animação em voo" — `playClose()` não. Numa sequência abrir→fechar→abrir rápida (a
     exigência de reabertura em menos de 220ms desta task), o segundo `playOpen()` podia chegar com
     `busyRef` ainda `true` (setado pelo close em voo) e virar no-op: o estado React dizia "aberto"
     mas o GSAP nunca tocava a timeline, painel preso fora da tela. Removida a flag; cada chamada
     já mata (`.kill()`) a timeline/tween anterior antes de construir a nova, suficiente para
     reentrância segura.
  5. **Fallback do contador de números trocou** `var(--sm-num-opacity, 0)` → `var(--sm-num-opacity,
     1)`: sob reduced motion a variável nunca é tocada por JS, e com fallback `0` os números
     ficariam invisíveis para sempre.
  6. **Item do painel (`.sm-panel-item`) ganhou a classe `pressable`** (`globals.css`, escala 0.97
     no `:active`) para feedback de toque — o GSAP anima só o `<span class="sm-panel-itemLabel">`
     filho, então os dois transforms (CSS no pai, GSAP no filho) compõem por aninhamento normal,
     sem competir pela mesma propriedade do mesmo elemento.
  7. **Paleta placeholder removida** (`#5227FF` roxo, `#ff0000` vermelho de fallback, painel
     branco) — painel usa `var(--color-creme)`, texto `var(--color-preto)`, accent
     `var(--color-dourado)`, tudo por prop, sem tocar a lógica.
  8. **`backdrop-filter` do painel original removido** — o painel de hoje é sólido, sem blur; não
     tem relação com o bug de containing-block do `<header>` (Task 6), que continua resolvido pelo
     portal em `MobileMenu.tsx`, inalterado.
  9. **Props sem uso neste projeto removidas:** `socialItems`, `displaySocials`, `logoUrl`,
     `menuButtonColor`, `openMenuButtonColor`, `changeMenuColorOnOpen`, `isFixed`,
     `closeOnClickAway`, `onMenuOpen`, `onMenuClose` — o CTA do WhatsApp entra via prop `footer`, o
     clique-fora já é tratado pelo backdrop em `MobileMenu.tsx`.
  10. `--sm-num-opacity` continua sendo uma custom property por item (`.sm-panel-item`), não numa
      var no elemento pai — não recalcula estilo de irmãos, dentro da regra de performance do
      `design-guidance.md`.
  11. **Cleanup incondicional no unmount** — ver acima.
  12. **Tempos e curva refeitos pela régua do projeto (Task 18, B).** No original a abertura
      levava ~1,3s até o último item assentar (camadas `0.5s power4.out` a cada 0,07s; painel
      `0.55s power4.out` entrando em 0,15s; itens `0.8s power4.out` com stagger 0,06s começando
      em 0,23s) e o fechamento era `0.28s power3.in` — 4× o teto de 300ms que `design-guidance.md`
      fixa para o drawer, com a curva `ease-in` que ele proíbe em UI. Agora: painel **0,3s**,
      fechamento **0,22s** (saída mais rápida que a entrada), itens 0,28s com stagger **0,04s**,
      camadas 0,22s/0,26s — tudo partindo de t=0 (as camadas chegam antes por serem mais curtas,
      mantendo o rastro colorido à frente do painel), último item assentado em 0,40s (≤ 0,45s).
      A curva é a `--ease-gaveta` do `globals.css`, registrada no GSAP como `'gaveta'` via
      `CustomEase` (`lib/easeGaveta.ts`, gratuito no GSAP ≥ 3.13) — CSS e GSAP na mesma curva, o
      token deixa de ser órfão. Os números vivem em `MOTION_GAVETA` (exportado) e
      `__tests__/staggeredMenu.test.ts` os trava contra os tetos e contra o token do CSS.
      Sob `reducedMotion` nada disso roda (inalterado: só opacity, sem stagger).
  13. **Prop `cabecalho?: ReactNode` (Task 18, F3a)** — slot renderizado dentro do painel, antes
      da lista (simétrico ao `footer`, que já existia depois dela). Consequência da modificação
      nº 1: ao remover o `<header>` interno (e com ele o toggle), o único ✕ que sobrou era o do
      header da página — que, com o drawer aberto, fica **sob** o backdrop (`z-[65]`) e o painel
      (`z-[70]`), invisível e inalcançável por toque. `MobileMenu.tsx` passa por este slot um botão
      `aria-label="Fechar menu"`, `pressable`, 44×44, com o mesmo `<path>` de ✕ do `HamburgerIcon`.
      Por vir antes da lista no DOM, é o primeiro focável do painel: o foco inicial cai nele (como
      num diálogo) e o trap Tab/Shift+Tab continua cobrindo primeiro↔último. O hambúrguer do header
      mantém `aria-expanded`/`aria-controls` e continua recebendo o foco de volta ao fechar.

### `Silk.tsx`

- **Origem:** `src/ts-tailwind/Backgrounds/Silk/Silk.tsx`
- **Histórico:** recusado na Task 8 porque toda variante do componente no repositório
  (`ts-tailwind`, `tailwind`, `ts-default`, `default` — conferido inclusive no commit inicial do
  arquivo, maio/2025) usa `@react-three/fiber` + `three`, não `ogl`, e a política do projeto
  (`reactbits-vendoring.md`) era explícita: *"se um componente exigir three, pare e reporte: three.js
  num site de clínica não se paga."* No lugar entrou `components/ui/Silk.tsx`, uma reimplementação
  própria em `ogl` reaproveitando a mesma matemática de ruído do shader original (GLSL, MIT +
  Commons Clause) — só o motor de render mudava. Recuperado na Task 19 por decisão do parceiro; o
  `ui/Silk.tsx` em `ogl` foi **removido** (código morto depois da troca).
- **Usado em:** Task 8/19 — fundo do Hero, via `components/sections/HeroBackdrop.tsx`.
- **Dependências que arrasta:** `three` + `@react-three/fiber` (novas nesta task; `@types/three`
  como dev dependency) — o custo está medido em `task-19-report.md`. `three` nunca entra no
  first-load JS da rota: `HeroBackdrop.tsx` importa este arquivo via `next/dynamic({ssr:false})` e
  só monta quando `useCapability().podePesado` é `true`.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o componente não consulta nada por conta própria — quem decide
  se ele existe na árvore é `HeroBackdrop.tsx`, via `useCapability().podePesado` (fonte única,
  inalterado pela troca do `ogl` para o `three`).
- **Cleanup:** o `<Canvas>` do R3F já chama `gl.forceContextLoss()` automaticamente ao desmontar
  (confirmado no fonte instalado, `@react-three/fiber/dist/events-*.cjs.dev.js`, grep por
  `forceContextLoss`) — não precisou de código próprio aqui, diferente do `ui/Silk.tsx` (`ogl`),
  que precisava fazer isso à mão.
- **Só `transform`/`opacity`:** o componente inteiro é desenhado em WebGL (shader), não CSS — a
  regra "só transform e opacity" fala de propriedades CSS animadas fora do canvas, não se aplica ao
  desenho interno do shader.
- **Modificações:**
  1. **Pausa fora da viewport e com a aba oculta** — o original usa `<Canvas frameloop="always">`,
     que roda o loop de render do R3F para sempre enquanto o componente está montado, sem checar
     visibilidade nenhuma. `frameloop` do R3F é reativo — este arquivo alterna entre `"always"` e
     `"never"` via um `IntersectionObserver` no container mais uma checagem de `document.hidden`,
     mesmo padrão de `Ticker.tsx`/`CircularGallery.tsx`. Alternar `frameloop` pausa/retoma o loop
     de render SEM destruir o contexto WebGL nem desmontar o `<Canvas>`, então entrar/sair da
     viewport repetidamente (o hero é a primeira seção da página) não recria o shader a cada vez.
  2. `'use client'` adicionado no topo (o original não declara).
  3. Nada do shader (vertex/fragment GLSL) foi tocado — é a mesma matemática de ruído que
     `ui/Silk.tsx` já usava (adaptada para `ogl` na Task 8); aqui está no formato original, rodando
     em `three.js` de fato.
  4. Os uniforms do `ShaderMaterial` são mutados por uma fábrica com closure própria
     (`criarUniformsStore`, mesmo padrão de `createLenisStore()` em `lib/motion.tsx`) em vez de
     atribuição direta a um valor de `useState`/`useMemo` — `react-hooks/immutability`
     (eslint-plugin-react-hooks, era do React Compiler) reprova `<algo>.prop = valor` quando
     `<algo>` remonta ao retorno direto de um hook dentro do próprio componente.

### `ScrollVelocity.tsx`

- **Origem:** `src/ts-tailwind/TextAnimations/ScrollVelocity/ScrollVelocity.tsx`
- **Histórico:** recusado na Task 9 porque **não pausa fora da viewport nem com a aba oculta** —
  monta seis hooks do `motion/react` (`useScroll`+`useVelocity`+`useSpring`+`useTransform`+
  `useMotionValue`+`useAnimationFrame`) que ficam ativos para sempre enquanto montado, e nenhum
  deles verifica visibilidade; e porque `design-guidance.md` nomeia "ticker" explicitamente como
  caso que deve preferir CSS/JS direto a Motion. No lugar entrou `components/sections/Ticker.tsx`,
  implementado à mão com `rAF` e aceleração lida do `velocity` que o próprio Lenis calculava.
  Recuperado na Task 19 por decisão do parceiro; a implementação à mão foi removida — `Ticker.tsx`
  hoje é uma casca fina em volta deste componente (tipografia e textos por prop, ver
  `components/sections/Ticker.tsx`).
- **Usado em:** Task 9/19 — faixa de tratamentos abaixo do Hero, via
  `components/sections/Ticker.tsx`.
- **Dependências que arrasta:** `motion/react` (já no projeto desde a Task 6).
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o componente não consulta nada por conta própria — quem decide
  se ele existe na árvore é `Ticker.tsx`, via `useCapability().podeAnimar` (fonte única,
  inalterado).
- **Cleanup:** o `IntersectionObserver` adicionado (ver modificação nº1) é desconectado no
  `return` do `useLayoutEffect` que o registra.
- **Só `transform`/`opacity`:** anima só o `x` do Motion (aplicado como `style.transform` — mesmo
  caminho de GPU que uma string literal, confirmado no fonte do `motion-dom` na Task 6) — dentro da
  regra.
- **Modificações:**
  1. **Pausa fora da viewport e com a aba oculta.** O original monta `useAnimationFrame`
     incondicionalmente — o motivo pelo qual não tinha sido vendorizado antes. Adicionado um
     `IntersectionObserver` no container (`parallax`) e uma checagem de `document.hidden`, mesmo
     padrão de `Silk.tsx`/`Ticker.tsx`: o callback do `useAnimationFrame` continua sendo chamado a
     cada frame pelo ticker global da Motion (não dá para cancelar o registro sem desmontar o
     hook), mas agora só atualiza `baseX` quando visível e com a aba em primeiro plano — fora
     disso é um retorno antecipado, custo desprezível.
  2. **Tipografia do original removida do template fixo.** `scrollerClassName` entrava concatenado
     a classes hardcoded (`text-4xl font-bold tracking-[-0.02em] drop-shadow md:text-[5rem]
     md:leading-[5rem]`) — cascata do Tailwind não garante que uma classe externa vença uma classe
     de tamanho igual já presente no template. Removidas; a tipografia agora é 100%
     responsabilidade de quem chama (`Ticker.tsx` passa as classes da pílula amarela existente por
     herança de CSS, sem prop nenhuma).
  3. `scrollContainerRef?: React.RefObject<HTMLElement>` virou `RefObject<HTMLElement | null>` — o
     React 19 mudou o retorno de `useRef<T>(null)` para `RefObject<T | null>`; o tipo antigo não
     aceitava a maioria dos refs reais criados com `useRef`.
  4. `'use client'` explicitado no topo — já estava implícito pelo uso de hooks, sem mudança de
     comportamento.
  5. `VelocityText` movido para escopo de módulo — no original era definido dentro do corpo de
     `ScrollVelocity`, uma nova definição de componente a cada render do pai. Não chegava a quebrar
     nada aqui (as props de `ScrollVelocity` não mudam depois do mount), mas é o tipo de padrão que
     remonta os filhos à toa se o pai re-renderizar por outro motivo.

### `GlareHover.tsx`

- **Origem:** `src/ts-tailwind/Animations/GlareHover/GlareHover.tsx`
- **Histórico:** recusado na Task 10 porque anima `background-position` (não `transform`/`opacity`
  — viola a regra "só transform e opacity animam" do `design-guidance.md`) e porque força seu
  próprio container (`display:grid;place-items:center`, `border`, `cursor-pointer`),
  incompatível com o grid de 4 colunas que a linha de tratamento precisa. No lugar entraram
  `.linha-tratamento`/`.linha-tratamento::after` em `globals.css`, um reflexo em CSS puro atrás de
  `@media (hover: hover) and (pointer: fine)`. Recuperado na Task 19: o parceiro decidiu
  explicitamente aceitar que este componente anima `background-position`, fora da regra do resto
  do projeto — o custo está medido em `task-19-report.md`. O CSS que o substituía foi removido de
  `globals.css`.
- **Usado em:** Task 10/19 — reflexo de hover em cada linha de Tratamentos, via
  `components/sections/TratamentoLinha.tsx`.
- **Dependências que arrasta:** nenhuma além de React.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o componente não consulta nada por conta própria. Como ele usa
  handlers de mouse (`onMouseEnter`/`onMouseLeave`), não `:hover` de CSS, e em `pointer:coarse`
  (touch) navegadores mobile podem disparar um `mouseenter`/`mouseleave` sintético sem um jeito
  confiável de "sair" do hover depois, `TratamentoLinha.tsx` passa uma prop `disabled={!pontoFino}`
  (`useCapability()`, fonte única) — atrás de `pointer:fine`, exigência do `design-guidance.md`
  para qualquer efeito de hover.
- **Cleanup:** nenhum necessário — o componente só reage a dois eventos de mouse e escreve
  `style.transition`/`style.backgroundPosition` diretamente, sem `requestAnimationFrame` nem
  observer, exatamente como o original.
- **Modificações:**
  1. **Container deixou de forçar o próprio layout.** O original renderiza `className="relative
     grid place-items-center overflow-hidden border cursor-pointer ${className}"` — pensado para
     envolver um único filho decorativo isolado, incompatível com um elemento que já tem layout
     próprio (a linha de tratamento é um grid de 4 colunas: número, miniatura, texto, seta).
     Removidas `grid place-items-center`, `border` e `cursor-pointer`; ficou só `relative
     overflow-hidden` — o mínimo que o efeito precisa (`position:relative` para o overlay
     absoluto, `overflow:hidden` para não vazar o brilho para fora da caixa). O layout do
     `children` passa a ser 100% responsabilidade de quem usa o componente.
  2. **Defaults deixaram de ser um box de demonstração.** O original tinha `width:'500px'
     height:'500px' background:'#000' borderRadius:'10px' borderColor:'#333'` — um quadrado preto
     opaco de 500px. Trocado para `width:'100%' height:'100%' background:'transparent'
     borderRadius:'0' borderColor:'transparent'` — um wrapper transparente que preenche o pai e não
     desenha nada por conta própria, mais seguro como default.
  3. **Prop `disabled` nova** — mesmo padrão de `Magnet.tsx` (Task 8): não registra
     `onMouseEnter`/`onMouseLeave` nem renderiza o `<div>` de overlay quando `disabled` (ver
     `matchMedia`/reduced-motion acima).
  4. `React.FC`/`interface` trocados por `function`/`type` — consistência de estilo com os outros
     arquivos deste diretório, comportamento idêntico.
