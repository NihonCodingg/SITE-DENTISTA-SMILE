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

### `SplitText.tsx` — REMOVIDO na Task 20

> Substituído pelo `MaskedHeading` na headline do hero, que era seu único uso. O histórico abaixo
> fica porque a blindagem de acessibilidade dele (aria no heading, conteúdo fatiado escondido) é o
> padrão que `MaskedHeading` e `ScrollFloat` herdaram.

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
  6. **Controles de 42px passaram a 44px** (Task 21) — tamanho mínimo de alvo de toque do WCAG
     2.5.8, que é a régua do resto do site (`min-h-11` em todo botão).
  7. **A folga lateral de 120px virou a prop `gutter`** (Task 21). A escala do carrossel é
     `largura / (cardWidth + 2·spread + 120)`, com esse 120 cravado. Faz sentido numa tela larga;
     num contêiner de 343px ele sozinho come 35% da largura, e o cartão da frente nascia com 240px
     numa seção de 343 — pequeno, que foi o que o dono do projeto apontou. Com a folga ajustável, o
     celular pede 24 e o cartão passa a 304px (medido).

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
  7. **`touch-action` deixou de ser sempre `none`** (Task 21). O original marca a roda com
     `[touch-action:none]` fixo, mesmo com `draggable` desligado. Num celular isso é uma armadilha
     de rolagem: a roda ocupa boa parte da tela, e o dedo que sobe para rolar a página não move
     nada — parece site travado. Agora o `none` só vale com o arraste ligado; sem ele a roda declara
     `pan-y`, a página rola, e a escolha continua inteira (toque na opção, seta do teclado).
     `TratamentosSeletor.tsx` passa `draggable={pontoFino}`.

### `ScrollExpand.tsx`

- **Origem:** `src/ts-tailwind/Animations/ScrollExpand/ScrollExpand.tsx` (branch `main`)
- **Usado em:** Task 20 — `components/sections/TourExpandido.tsx`, a fachada da clínica se abrindo
  com o scroll logo depois do hero. Pedido do dono do projeto ("teste esse elemento na hero"): o
  componente é uma seção inteira (prende a mídia com `sticky` e consome ~2 viewports de rolagem),
  então entrou como transição DEPOIS do hero, sem desmontar a grade de três colunas aprovada.
- **Dependências que arrasta:** nenhuma além de React e `next/image`.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o original consultava por conta própria; virou prop
  `reducedMotion`, vinda de `useCapability().podeAnimar` (modificação nº2).
- **Cleanup:** o efeito remove os listeners de `scroll`/`resize` e desconecta o `ResizeObserver`;
  o `requestAnimationFrame` é cancelado. Nada a consertar.
- **Só `clip-path`/`transform`/`opacity`:** o percurso anima `clip-path` (na régua do projeto),
  mais `transform` e `opacity` na mídia e nas camadas.
- **Modificações:**
  1. `'use client'` no topo (o original não declara).
  2. **`reducedMotion` virou prop** em vez de `window.matchMedia` interno.
  3. **`<img>` trocado por `next/image`** — é a maior imagem da página quando aberta, então passar
     pelo otimizador não é detalhe. **O modo `video` foi removido junto** (props `mediaType` e
     `poster`): o site não hospeda vídeo desde 24/08, e manter o ramo convidaria a reintroduzir um.
  4. **Escrita de ref movida do render para `useLayoutEffect`** (regra `react-hooks/refs`, mesma
     correção do `DepthCarousel` e do `OptionWheel`).
  5. **Slot `midia`.** O original só sabe expandir uma imagem. Aqui quem se abre é o HERO INTEIRO —
     card creme, headline, foto do doutor, colunas — com a foto parada no lugar onde o design a
     colocou. Com `midia`, o que cresce é conteúdo, não um arquivo.
  6. **`startOffsetY`** (pontos percentuais) desloca o quadro inicial para baixo, decaindo até zero
     na abertura. O original só sabe centralizar.
  7. **`title` e `scrollHint` aceitam nó, não só string** — o hero passa o próprio `<h1>` (o
     original renderizava um `<div>`, o que custaria o heading da página) e decide a cor da dica de
     scroll (o original cravava branco, ilegível sobre o creme da marca).
  8. **Altura da pista e do palco vem do CSS, antes de o JS medir.** No original os dois nascem
     com zero e só ganham altura no efeito: a página saltava ~2 telas depois da hidratação, o que
     rendeu **0,96 de CLS** no Lighthouse mobile (medido). O `measure()` continua mandando — só
     não há mais um quadro com altura zero.
  9. **O overlay fica inerte enquanto está invisível** (Task 21). O bloco do CTA é desenhado com
     `opacity` vinda do scroll, mas no original continua clicável e focável em `opacity: 0` — do
     topo da página existe um botão transparente exatamente por cima da headline, que o Tab
     alcança e que o toque acerta sem querer. `pointer-events: none` + `inert` passaram a
     acompanhar a opacidade. Ficou visível ao pôr um cartão que abre nesse botão (Task 21), mas o
     defeito já estava lá desde a Task 20.
  10. **A geometria entra nas dependências do efeito** (Task 21). O original só reage a scroll e
      resize; trocar `startWidth`/`startHeight` em tempo de execução — que é como o hero muda o
      tamanho da moldura entre celular e desktop — não repinta nada, e a moldura fica com a
      porcentagem da faixa anterior até o próximo evento de scroll.
  11. **`fadeTitle` e `overlayClassName`** (Task 22). O original apaga o título conforme a moldura
      abre e centraliza os `children` no palco — os dois ocupam o mesmo lugar de propósito, um
      substituindo o outro. Este hero precisa dos dois JUNTOS no fim da abertura: a headline em
      cima e o CTA embaixo dela. Atenção a uma armadilha que já custou uma rodada: `padding` em
      porcentagem se resolve contra a LARGURA do contêiner, nunca contra a altura.
  12. **Teto em pixels para a moldura fechada** (`maxStartWidthPx`/`maxStartHeightPx`, Task 24). O
      original só aceita porcentagem da janela, e porcentagem cresce junto com a tela: num monitor
      largo a moldura afastava-se do texto que ela deveria emoldurar (achado do dono do projeto —
      "tem como deixar o quadrado menor, mais próximo do texto?"). Medido em 1600×900: a moldura
      passou de 704px de largura para 614, com 40px de folga de cada lado do bloco de título. A
      conversão de pixels para porcentagem acontece DENTRO do componente, onde o palco já é medido
      — em quem chama, ler a janela durante o render produziria um número no servidor e outro no
      cliente.
  13. **Fallback de largura do palco corrigido** (Task 24). Quando `clientWidth` é zero, o original
      cai para a ALTURA do palco — um número sem relação nenhuma com largura. Não incomodava
      ninguém até a moldura ganhar teto em pixels, que converte usando essa medida; aí virou 10% de
      recuo onde deviam ser 7. Com `useWindowScroll`, o palco ocupa a janela, e a janela é o
      fallback certo.

**Restrições deste componente, descobertas medindo — quem for mexer no hero precisa saber:**

- **O conteúdo do palco tem que caber numa tela.** O palco é `sticky` com a altura da janela.
  Tentei encaixar a grade de três colunas do hero antigo ali dentro: ela media 1296px numa tela de
  900px e nascia cortada. Por isso o palco hoje leva só headline e CTA — cabe em qualquer tela,
  inclusive no celular, sem variante nem exceção; o resto do hero desceu para a faixa logo abaixo.
- **Nada de conteúdo centralizado que mude de tamanho depois da primeira pintura.** As duas fontes
  da marca terminam de carregar depois dela; com o bloco do título centralizado, cada uma o movia,
  e isso valia **0,176 de CLS** em dois saltos (medido, um por fonte). Com o topo ANCORADO
  (`absolute top-[30%]`) o texto só cresce para baixo — a distância de deslocamento é zero, que é
  o que o CLS mede. Caiu para 0,071.
- **Não convive com o fundo WebGL** se o conteúdo for escalado: o canvas do R3F se dimensiona pelo
  retângulo JÁ ESCALADO do container (medido: 859px num card de 1022) e a escala muda a cada
  quadro. Não é problema no arranjo atual — o `Silk` não está dentro do palco.
### `TextLoop.tsx`

- **Origem:** `src/ts-tailwind/TextAnimations/TextLoop/TextLoop.tsx` (branch `main`)
- **Usado em:** Task 20 — a faixa dos tratamentos (`components/sections/Ticker.tsx`). Pedido do
  dono do projeto: a faixa reta virou uma FITA curva, com os tratamentos correndo por ela.
  Substituiu o `ScrollVelocity`, que era o que rolava a faixa antes e saiu do projeto junto.
- **Dependências que arrasta:** `gsap` (já no projeto). Nenhuma nova.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o original consultava por conta própria; virou prop
  `reducedMotion`, vinda de `useCapability().podeAnimar`.
- **Cleanup:** o tween é morto no cleanup, junto do observer e do listener acrescentados.
- **Só `transform`/atributo de SVG:** o texto corre mudando o `startOffset` do `<textPath>` — não
  há propriedade de layout animada.
- **Modificações:**
  1. `'use client'` no topo (o original não declara).
  2. **`reducedMotion` virou prop** em vez de `window.matchMedia` interno.
  3. **Pausa fora da viewport e com a aba oculta.** O original roda a animação para sempre
     enquanto montado — mesma correção que `CircularGallery` levou na Task 19. ⚠️ Não é
     verificável em jsdom: o tween (e com ele o observer) só nasce depois de o componente MEDIR o
     caminho do SVG, e o jsdom devolve zero. Ver a nota em `__tests__/ticker.test.tsx`.
  - **CORREÇÃO NA REVISÃO DE ENTREGA (Task 25).** A pausa que este projeto acrescentou nascia
    LIGADA (`visivel = true`) e só parava quando a primeira entrada do `IntersectionObserver`
    chegava. Essa entrada é entregue numa tarefa posterior, que durante o carregamento entra na
    fila atrás da hidratação — então a fita animava durante a janela em que o TBT é contado, mesmo
    estando três telas abaixo da dobra. Cada quadro reescreve `startOffset` de dois `textPath`, o
    que força o navegador a recalcular texto sobre curva. Agora `visivel` nasce `false` e quem liga
    é o observador.

    **O tamanho do ganho, medido direito:** ~90 a 130ms de TBT e 3 a 5 pontos de performance.
    Lighthouse mobile, servidor de produção reiniciado do zero a cada lado, duas amostras cada:
      com a fita animando: perf 71-73 · TBT 530-600ms
      sem a fita:          perf 74-78 · TBT 440-470ms
    A primeira medição que fiz desta correção dizia "TBT de 680ms para 40ms" e estava ERRADA: o
    servidor de produção tinha sido reconstruído por baixo de um processo ainda vivo, então parte
    dos chunks respondia 500 e o navegador executava menos JavaScript do que executaria de verdade.
    Qualquer medição futura precisa DERRUBAR o servidor antes de reconstruir — no Windows, `pkill`
    do Git Bash não mata o processo; é preciso `Stop-Process` do PowerShell.

### `ScrollFloat.tsx`

- **Origem:** `src/ts-tailwind/TextAnimations/ScrollFloat/ScrollFloat.tsx` (branch `main`)
- **Usado em:** Task 20 — os títulos de seção ("os textos importantes"), via
  `components/ui/TituloFlutuante.tsx` e a prop `flutuar` do `SectionHeading`. Oito seções.
- **Dependências que arrasta:** `gsap` + `gsap/ScrollTrigger` (já no projeto).
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o componente não consulta nada; `TituloFlutuante` decide por
  `useCapability().podeAnimar` — sob reduced-motion o texto nem é fatiado.
- **Só `transform`/`opacity`:** as letras animam `yPercent`/`scale`/`opacity`.
- **Modificações:**
  1. `'use client'` no topo (o original não declara).
  2. **Cleanup adicionado** — o original cria tween + ScrollTrigger e nunca os mata; cada
     desmontagem vazava um trigger vivo apontando para um nó morto.
  3. **`registerPlugin` movido para dentro do efeito** (mesmo motivo do `SplitText`, Task 8).
  4. **Render neutro** — o original renderizava um `<h2>` próprio com tamanho cravado; virou
     `<span>` que herda a tipografia do heading que o `SectionHeading` já constrói.
  5. **`aria-hidden` no contêiner fatiado** — texto em letras é lido letra por letra (a violação
     do axe da Task 18, A1); o nome acessível vai no heading pai, automático quando `flutuar`
     está ligado.
  6. **Letras agrupadas por palavra** (Task 21). O original solta cada caractere — inclusive o
     espaço — num `inline-block` próprio, e o navegador passa a poder quebrar a linha ENTRE DUAS
     LETRAS da mesma palavra. Estava visível na seção de depoimentos: "As histórias valem mais d
     / o que qualquer anúncio". Cada palavra virou um `inline-block whitespace-nowrap`, com o
     espaço como nó de texto FORA do invólucro (dentro dele o `nowrap` o impediria de ser ponto
     de quebra). O GSAP passou a mirar `.sf-letra`, porque `.inline-block` agora casaria também
     com os invólucros de palavra.

### `AccordionGallery.tsx`

- **Origem:** `src/ts-tailwind/Components/AccordionGallery/AccordionGallery.tsx` (branch `main`)
- **Usado em:** Task 21 — a seção de Depoimentos, no lugar do carrossel horizontal + `GradualBlur`
  (pedido do dono do projeto). Três painéis: um aberto, dois comprimidos; cada um é um link para o
  reel no Instagram.
- **Dependências que arrasta:** `gsap` (já no projeto). Nenhum plugin.
- **Rede:** o original embutia cinco fotos do `picsum.photos` como `items` padrão — removido, ver
  modificação 3.
- **`matchMedia`/reduced-motion:** virou a prop `reducedMotion`, alimentada por
  `useCapability().podeAnimar` em `Depoimentos.tsx`.
- **Só `transform`/`opacity`: NÃO — exceção consciente.** O mecanismo do componente é animar
  `flex-grow`, que é layout. É por isso que ele existe, então a exceção é o próprio pedido. O que
  foi feito para segurar o custo: `contain: layout` na raiz (o recálculo não sobe para a página),
  três painéis apenas, e nada disso é disparado por scroll — só por hover, toque, foco ou seta.
- **Modificações:**
  1. `'use client'` no topo (o original não declara).
  2. **`reducedMotion` virou prop** — o original chama `window.matchMedia` no corpo do componente.
  3. **`DEFAULT_ITEMS` removido** — eram cinco URLs de `picsum.photos`, rede a terceiro embutida
     no default. `items` passou a ser obrigatório.
  4. **`<img>` → `next/image`** (`fill` + `sizes`), como em todo componente vendorizado aqui.
  5. **`role="list"`/`role="listitem"` removidos.** No original cada painel é um `<a>` marcado
     como `listitem` — o role sobrescreve a semântica de link e o leitor de tela deixa de anunciar
     que aquilo abre alguma coisa. Como aqui cada painel É um link para fora do site, ser
     anunciado como link é justamente o que importa. O nome acessível vem de `ariaLabel` no item,
     em português.
  6. **`target`/`rel` opcionais** (`abrirEmNovaAba`) — o original só navega na mesma aba.
  7. **`--ag-dim` passou a ser escrito no PAINEL, não na mídia.** Bug do original: a variável era
     escrita no `<span>` da mídia e lida no `<span>` do overlay, que é IRMÃO dela. A herança nunca
     chegava, então o overlay ficava para sempre no fallback `0.35` e o painel aberto era
     escurecido igual aos fechados. Escrita no painel — ancestral dos dois — a variável cascateia
     e o escurecimento passa a funcionar.
  8. **Saltos `max-[520px]:` removidos.** O original vira coluna abaixo de 520px por classe, mas
     mantém a altura da linha e o `width: var(--ag-media-size)` da mídia em estilo inline, que
     media query nenhuma alcança — no celular a mídia continuava dimensionada como se a sanfona
     fosse horizontal. Aqui `orientation`, `height` e `expandRatio` vêm de quem chama, que mede a
     tela (mesmo idioma de `AntesDepois.tsx`).
  9. **`selo`** — nó opcional desenhado por cima de todo painel. Estes painéis são pôsteres de
     vídeo: sem um indicador de play, nada diz que o clique abre um reel.
  10. **`contain: layout`** na raiz — ver a nota de exceção acima.
  11. **`willChange` só quando há movimento.** O CSS do original removia a dica sob
      `prefers-reduced-motion`; a variante Tailwind perdeu isso ao transformá-la em estilo inline.

### `MaskedHeading.tsx` — REMOVIDO na mesma Task 20 em que entrou

> Tentado na headline do hero (letras preenchidas pela foto da marca) e desfeito por decisão do
> dono do projeto ("se não puder centralizar, desfaça"). O recorte é desenhado em coordenadas
> absolutas de um `<text>` de SVG dentro de um palco que escala e centra por flex — duas rodadas
> de calibragem medida (tamanho pela palavra mais larga, raiz em bloco) não assentaram a
> composição. A headline voltou a texto preto puro. O histórico abaixo fica pelas lições:
> conteúdo de span precisa de `block` para o autoajuste não afundar no piso, o texto tem de ir
> em maiúsculas (o SVG não passa pelo `text-transform`), e as palavras sem espaço real exigem a
> blindagem de aria (nº3).

- **Origem:** `src/ts-tailwind/TextAnimations/MaskedHeading/MaskedHeading.tsx` (branch `main`)
- **Usado em:** Task 20 — a headline do hero: as letras viram o recorte por onde a foto da marca
  aparece, com reveal de subida por palavra. Substituiu o `SplitText`, que era o reveal anterior
  da mesma headline e saiu do projeto junto (era o único uso).
- **Dependências que arrasta:** `gsap` e `next/image` (já no projeto).
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** virou prop `reducedMotion` (`useCapability().podeAnimar`) — sob
  redução não há reveal, deriva nem parallax; o preenchimento fica, estático.
- **Detalhe de uso obrigatório (aprendido medindo):** com `tag="span"` a raiz é inline e o
  `w-full` do componente não vale — o autoajuste (`fontSize = largura × textScale`) mede a própria
  caixa de texto, entra em retroalimentação e afunda no piso de 20px. Quem usa como span passa
  `className="block"`. E o texto deve ir **já em maiúsculas**: o recorte é um `<text>` de SVG, que
  não passa pelo `text-transform` do CSS — minúsculas no fonte desenhariam glifos diferentes da
  medida.
- **Modificações:**
  1. `'use client'` no topo (o original não declara).
  2. **`reducedMotion` virou prop.**
  3. **`aria-hidden` no conteúdo visual** — as palavras ficam em spans SEM espaço real (o espaço é
     `content` de CSS): um leitor de tela leria "SEUNOVOSORRISO…". O nome acessível vai no heading
     que envolve o componente (`tituloAriaLabel`), como o `SplitText` já fazia (Task 18, A1).
  4. **O laço de `requestAnimationFrame` pausa** fora da viewport, com a aba oculta e sob
     `reducedMotion` — o original roda para sempre.
  5. **Modo `video` removido** (o site não hospeda vídeo) e **`<img>` → `next/image`**.
  6. **Escrita de ref movida do render para `useLayoutEffect`** (regra `react-hooks/refs`).

### `DriftWall.tsx`

- **Origem:** `src/ts-tailwind/Components/DriftWall/DriftWall.tsx` (branch `main`)
- **Usado em:** Task 20 — a parede de fotos derivando no fundo amarelo do hero (dentro do palco do
  `ScrollExpand`, sobre o Silk, atrás da headline). Só monta com `podeAnimar`, e só usa fotos que o
  site já exibe em outras seções — as pendências de autorização de imagem não mudam.
- **Dependências que arrasta:** `next/image` (já no projeto). Nenhuma nova.
- **Rede:** **o original faz** — os `DEFAULT_ITEMS` eram 15 imagens de `picsum.photos`. Removidos;
  `items` é obrigatória.
- **`matchMedia`/reduced-motion:** o original consultava em DOIS lugares; virou prop
  `reducedMotion`. Sob redução, o quadro é aplicado uma vez e o laço PARA — o original seguia
  rodando rAF para sempre mesmo reduzido.
- **Cleanup:** rAF, observer e listener saem no cleanup (o rAF e o ResizeObserver o original já
  limpava; o observer de viewport e o `visibilitychange` são das modificações).
- **Só `transform`/`opacity`:** colunas e plano animam `translate3d`/`rotate*`; o realce do
  azulejo é `transform`+`opacity` por classe.
- **Modificações:** as sete listadas no cabeçalho do arquivo — as de política: itens obrigatórios
  (rede), `reducedMotion` por prop, pausa por viewport/aba, **modo `decorativo`** (o original põe
  `tabIndex={0} role="button"` em cada azulejo mesmo sem ação — dezenas de falsos botões na
  tabulação; decorativo os torna `<div>` puros e esconde o contêiner do leitor de tela),
  `next/image`, `overlayColor` sem default fora da paleta, rótulo sem inglês cravado.

### `Magnet.tsx` — REMOVIDO na Task 23

> Era o efeito de o botão do hero SEGUIR o cursor. Saiu a pedido do dono do projeto, no mesmo
> pedido em que o `SpecularButton` entrou: os dois juntos dariam dois motivos diferentes para a
> mesma peça reagir ao ponteiro — um movendo o botão de lugar, outro correndo luz pela borda dele.
> O arquivo foi apagado em vez de ficar como código morto; a nota abaixo fica porque o padrão de
> gate por prop `disabled` que ele estabeleceu continua valendo (o `GlareHover` o segue).

- **Origem:** `src/ts-tailwind/Animations/Magnet/Magnet.tsx`
- **Usado em:** Task 8 (efeito magnético nos CTAs do Hero) — até a Task 23
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

### `GradualBlur.tsx` — REMOVIDO na Task 21

> Seu único uso eram as duas faixas nas bordas do carrossel de Depoimentos, dizendo "o scroller
> continua". Na Task 21 aquele carrossel virou a `AccordionGallery` (pedido do dono do projeto):
> os três painéis cabem na largura da seção, não existe mais scroller, e uma borda esfumada
> passou a apontar para conteúdo que não existe. O arquivo foi apagado em vez de ficar como
> código morto — a nota abaixo fica porque a régua de z-index que ela documenta continua valendo
> para qualquer decoração futura.

- **Origem:** `src/ts-tailwind/Animations/GradualBlur/GradualBlur.tsx`
- **Usado em:** Task 12 (bordas do carrossel de Depoimentos, indicando que o scroller continua) —
  até a Task 21
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

### `SpecularButton.tsx`

- **Origem:** `src/ts-tailwind/Components/SpecularButton/SpecularButton.tsx` (branch `main`)
- **Usado em:** Task 23 — o CTA "Agendar minha avaliação" do hero, via `ui/CtaAgendamento.tsx`
  (pedido do dono do projeto, no mesmo pedido que tirou o `Magnet`).
- **Dependências que arrasta:** `ogl` (já no projeto — a `CircularGallery` usa). Nenhuma nova.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** virou a prop `reducedMotion`, alimentada por
  `useCapability().podeAnimar` (o original não tem noção nenhuma de movimento reduzido).
- **Só `transform`/`opacity`:** o desenho é WebGL num canvas próprio — não toca layout da página.
  O que ele custa é GPU e um laço de `requestAnimationFrame`, não reflow.
- **Quando monta, e por quê:** só com ponteiro fino **e** `podePesado`. Não é economia arbitrária —
  o reflexo é literalmente guiado pelo ponteiro. Em aparelho de toque não existe ponteiro para
  seguir, o brilho nunca acenderia (`bright` fica em zero) e o que sobraria seria um contexto WebGL
  desenhando um contorno parado a 60 quadros por segundo. Quem decide é `ui/CtaAgendamento.tsx`,
  que renderiza um `<button>` comum com as MESMAS classes e o MESMO `aria` no outro caminho.
- **Modificações:**
  1. `'use client'` no topo (o original não declara).
  2. **Escrita de ref movida do render para `useLayoutEffect`** — `propsRef.current = {...}` no
     corpo do componente, a mesma correção que `DepthCarousel`, `OptionWheel` e `ScrollExpand`
     levaram (regra `react-hooks/refs`).
  3. **`reducedMotion` virou prop.** Sem ela o laço de rAF roda para sempre. Com ela o laço não é
     criado: desenha-se UM quadro, com o reflexo parado numa diagonal. Reduzir, não zerar — a borda
     continua com luz, ela só não persegue mais nada.
  4. **Pausa fora da viewport e com a aba oculta.** O original mantém o laço vivo o tempo todo, e um
     CTA no hero passa a maior parte da visita fora de tela. Mesma correção que `TextLoop`,
     `DriftWall` e `CircularGallery` já precisaram.
  5. **`size="livre"`** — o original só tem `sm`/`md`/`lg`, cada um com padding e tamanho de fonte
     próprios, que brigariam com as classes de botão deste site.
  6. **`...rest` e `forwardRef`.** O original não repassa props extras nem a ref, e aqui o botão
     PRECISA carregar `aria-expanded`/`aria-controls`: ele é o gatilho do cartão de agendamento, e
     sem isso quem usa leitor de tela não sabe que ele abre algo.
  7. **`window.pointermove` só quando há para quem seguir** — o original registra o listener global
     mesmo com `followMouse` desligado.
  8. **Estreitamento explícito de `pointerAngle`** — o original conta com o TypeScript inferir
     não-nulo a partir de outra variável booleana, o que o modo estrito deste projeto não aceita.

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

### `StaggeredMenu.tsx` — REMOVIDO na Task 23

> Substituído pelo `BubbleMenu` no menu do celular, a pedido do dono do projeto. A casca que o
> segurava (`layout/MobileMenu.tsx` — foco preso, `Escape`, retorno de foco, trava de scroll,
> portal) não mudou uma linha: era exatamente para isso que o painel tinha virado um componente
> controlado por `open`, e a troca provou que valeu. A régua de motion que ele estabeleceu
> (`MOTION_GAVETA`, Task 18/B) também sobreviveu — virou `MOTION_BOLHAS`, com os mesmos tetos.

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

### `BubbleMenu.tsx`

- **Origem:** `src/ts-tailwind/Components/BubbleMenu/BubbleMenu.tsx` (branch `main`)
- **Usado em:** Task 23 — o menu do celular, via `layout/MobileMenu.tsx`, no lugar do
  `StaggeredMenu` (pedido do dono do projeto).
- **Dependencias que arrasta:** `gsap` (ja no projeto).
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** virou a prop `reducedMotion`, alimentada por
  `useCapability().podeAnimar`. Sob movimento reduzido as pilulas aparecem sem o estouro — o menu
  continua abrindo e fechando.
- **So `transform`/`opacity`:** `scale` nas bolhas e `y`/`autoAlpha` nos rotulos.
- **Regua de motion:** `MOTION_BOLHAS`, travada por `__tests__/bubbleMenu.test.ts`. Os defaults do
  original ficavam TODOS fora dela — 500ms de entrada contra o teto de 300, 120ms de passo contra a
  janela de 30-80, 860ms ate o ultimo item contra o teto de 450. A regua e do projeto (Task 18/B) e
  e anterior a este componente; quem se ajustou foi ele. O passo aqui e 50ms e nao os 40ms do
  drawer anterior, porque neste menu a SEQUENCIA e o efeito: 50ms e o maior valor que ainda cabe no
  teto com os quatro itens do nav (3 x 50 + 280 = 430ms).
- **Layout:** segue o CSS do original na faixa de celular (`max-width: 899px`), a unica em que este
  menu aparece — bolhas de 48px no topo com 2em de folga, lista comecando a 120px, pilulas de
  largura cheia com 80px de altura minima e `row-gap` de 16px.
- **Modificacoes:**
  1. `'use client'` no topo (o original nao declara).
  2. **O `<nav aria-label="Main navigation">` virou o painel do menu.** O original e um nav proprio,
     fixo, sempre visivel, que convive com o cabecalho da pagina. Este site ja tem um `<Header>` de
     verdade, e um segundo landmark de navegacao disputaria o mesmo papel. As bolhas passaram a
     viver DENTRO do painel que abre.
  3. **O estado de aberto/fechado saiu do componente** e virou as props `open`/`onClose`. Com ele
     guardado dentro, quem esta por fora nao consegue fechar o menu — nem no `Escape`, nem ao
     navegar, nem no toque fora das pilulas.
  4. **`role="dialog"` + `aria-modal` no painel.** Ele E modal (foco preso, `Escape` fecha, resto da
     pagina `inert`); o original nao declara papel nenhum, e sem isso quem usa leitor de tela nao e
     avisado de que entrou num dialogo.
  5. **`role="menu"`/`role="menuitem"` removidos.** Sao papeis de menu de APLICACAO: o leitor de
     tela anuncia "menu" e a pessoa passa a esperar navegacao por setas, que nao existe aqui.
  6. **`aria-pressed` virou `aria-expanded`** no botao. `pressed` e de alternancia; revelar um
     painel e `expanded`.
  7. **O `BubbleMenu.css` nao veio.** Nomes de classe genericos (`.bubble`, `.pill-list`,
     `.pill-link`) que vazam para a pagina inteira, mais um `!important` em `margin-left`. Tudo
     virou utilitario do Tailwind no proprio elemento.
  8. **`reducedMotion` virou prop** (ver acima).
  9. **`aria-hidden`/`inert` amarrados a `open`**, painel que nunca desmonta. O original monta e
     desmonta o overlay por estado e ainda controla a visibilidade com `gsap.set(overlay,
     { display })` — que e o tipo de coisa que deixa `inert` preso ao reabrir antes de a saida
     terminar (o bug que a Task 6 ja tinha cacado uma vez).
  10. **Tempos dentro da regua** (ver acima).
  11. **Nenhum `ease-in`.** O original fecha com `power3.in` nas pilulas e nos rotulos; o guia do
      projeto crava que interface nunca usa ease-IN. A saida passou a usar a mesma `--ease-gaveta`
      do resto do site. A ENTRADA continua em `back.out` de proposito — passar do ponto e voltar e o
      que faz uma bolha parecer bolha, e ease-out nao e o que a regra proibe.
  12. **`height: 10px` inline saiu da pilula.** O original crava 10px de altura no link e devolve o
      tamanho por `min-height` + `padding`: funciona por acidente, e torna qualquer ajuste de
      espacamento um chute.
  13. **A variacao aleatoria no atraso de cada bolha saiu** (`gsap.utils.random(-0.05, 0.05)`). Com
      o passo de 120ms do original ela some no meio; com os 50ms daqui chega a inverter a ordem de
      duas bolhas vizinhas, e o efeito deixa de ser uma sequencia.
  14. **O GSAP escala um INVOLUCRO, nao o elemento clicavel.** No original o `scale` vai direto no
      `<a>` e no `<button>`; os dois escreveriam `transform` no mesmo elemento, e o inline do GSAP
      ganha do `:active` do `.pressable` — a peca perderia o feedback de toque, que e a assinatura
      tatil deste site.
  15. **A rotacao das pilulas continua desligada nesta faixa**, como no CSS original
      (`rotate(var(--item-rot))` so existe a partir de 900px). Nao e esquecimento: pilula de largura
      cheia girada estoura a lateral da tela. A prop segue aceita para um uso futuro em tela larga.

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

### `ScrollVelocity.tsx` — REMOVIDO na Task 20

> Substituído pelo `TextLoop` na faixa dos tratamentos, que era seu único uso. O histórico abaixo
> fica porque explica correções que o `TextLoop` herdou (pausa por viewport, tipografia por
> cascata em vez de props).

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
