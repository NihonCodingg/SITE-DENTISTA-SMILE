# Task 13 — Sorrisos feitos aqui (galeria WebGL de retratos)

## STATUS: completo

## Arquivos

- `site/components/reactbits/CircularGallery.tsx` (novo, vendorizado do React Bits com modificações)
- `site/components/reactbits/README.md` (modificado — proveniência e todas as modificações do
  CircularGallery documentadas)
- `site/components/sections/Sorrisos.tsx` (novo) — Server Component: fundo `#111111`, sobretítulo
  amarelo + `<h2>` branco
- `site/components/sections/SorrisosGaleria.tsx` (novo) — `'use client'`, decide WebGL vs. fallback
  via `useCapability()`
- `site/components/ui/SectionHeading.tsx` (modificado) — prop `tema` (`'claro'` default inalterado,
  `'escuro'` novo) para fundo escuro
- `site/components/sections/PaginaComVideo.tsx` (modificado) — prop `sorrisos`, renderizada entre
  `<Clinica>` e `<Depoimentos>`
- `site/app/page.tsx` (modificado) — importa `<Sorrisos />` e passa por prop
- `site/__tests__/circularGallery.test.tsx` (novo, 8 testes)
- `site/__tests__/sorrisos.test.tsx` (novo, 10 testes)
- `.superpowers/sdd/2026-08-19-site-smile-ipiranga/task-13-brief.md` (novo) — o brief não existia no
  workspace; reconstruído a partir da mensagem de orientação recebida, que já continha o brief
  completo, no mesmo formato dos demais `task-N-brief.md`

## Commits

- `835a04d` — feat: secao Sorrisos feitos aqui com galeria WebGL (CircularGallery) e fallback
  acessivel

## Testes

149/149 (`npx vitest run --no-file-parallelism`, subindo de 131 no fim da Task 12/assets extra),
ESLint limpo (`npx eslint .`), `npm run build` limpo (Next 16.3.1 / Turbopack, TypeScript sem erro).

## O que o `CircularGallery` original arrastava

Lido inteiro (826 linhas, `src/ts-tailwind/Components/CircularGallery/CircularGallery.tsx`, commit
`4e0e030193b563be6be33d928f77d0d01cefe237` — o mesmo já fixado no README para os outros
vendorizados; conferido que é idêntico ao HEAD atual de `main`) antes de decidir usar:

1. **Chamada de rede real.** `loadFontFromStylesheet()` buscava
   `https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&display=swap` toda vez que o
   componente montava, para desenhar a legenda de cada item em canvas (`Title`/`createTextTexture`).
   Viola a política deste projeto ("nada de rede" em componente vendorizado).
2. **Loop de render sem pausa nenhuma.** `App.update()` chamava `renderer.render(...)` a cada
   `requestAnimationFrame`, incondicionalmente, para sempre enquanto o componente estivesse
   montado — o mesmo problema que já reprovou o `ScrollVelocity` na Task 9. Exigência dura desta
   task: pausar fora da viewport e com `document.hidden`.
3. **`destroy()` incompleto.** Cancelava o `rAF` e removia listeners, mas nunca liberava o contexto
   WebGL (`WEBGL_lose_context`).
4. **Gestos globais.** `mousedown`/`wheel`/`touchstart` registrados em `window` inteiro — rolar a
   página ou clicar em qualquer lugar do site empurrava `scroll.target` da galeria mesmo com ela
   fora da tela.
5. **Sem proteção contra falha de WebGL.** Se `ogl` não conseguisse criar o contexto (GPU
   bloqueada, política do navegador), o próprio código do componente lançaria um `TypeError` não
   tratado, fora de qualquer Error Boundary.
6. **`role="region"` + `tabIndex={0}` + navegação por seta**, com um `aria-label` em inglês —
   expõe o canvas ao foco de teclado sem que um leitor de tela consiga perceber nada dentro dele.

Nenhuma dependência nova (só `ogl`, já usado pelo `Silk` desde a Task 8), sem `matchMedia` interno,
sem `three`.

## O que foi modificado, e por quê

Detalhado item a item (com referência aos testes que provam cada um) em
`site/components/reactbits/README.md`. Resumo:

1. **Removido todo o sistema de legenda em canvas** (`Title`, `createTextTexture`, `resolveFont` e
   as 3 outras funções de carregamento de fonte, `DEFAULT_FONT_URL`). Elimina a chamada de rede E
   resolve de raiz o risco de "nunca inventar nome de paciente" — não existe mais nenhum caminho de
   código que desenhe texto arbitrário por cima de um retrato. Efeito colateral bom: cada item para
   de criar uma segunda textura/mesh (a do texto), reduzindo objetos WebGL por retrato de 2 para 1.
2. **Pausa por `IntersectionObserver` + `document.hidden`**, mesmo padrão de `components/ui/Silk.tsx`
   (Task 8): o `rAF` continua sendo reagendado a cada quadro, mas o corpo pesado (lerp, update dos
   planos, `renderer.render`) só roda quando a seção está visível e a aba em primeiro plano.
3. **Redimensionamento por `ResizeObserver`** no container, no lugar de `window.resize`.
4. **`destroy()` libera o contexto WebGL** (`WEBGL_lose_context`).
5. **Gestos rescopados**: início (`wheel`/`mousedown`/`touchstart`) só no container;
   continuação (`mousemove`/`mouseup`/`touchmove`/`touchend`) em `window` de propósito, para o
   arraste não travar se o cursor sair da caixa no meio do gesto.
6. **`new App(...)` em `try/catch`**, com prop `onError?: (falhou: boolean) => void` nova — se o
   WebGL falhar mesmo num aparelho "pesado" (`useCapability()` não prevê GPU bloqueada), quem chama
   troca para o fallback em vez de a árvore de React inteira quebrar.
7. **Container do canvas virou puramente decorativo**: só `aria-hidden="true"`, sem `role`,
   `tabIndex` ou navegação por seta — ver seção de acessibilidade abaixo.
8. `any` implícitos desapareceram junto com o código que os usava (a função `autoBind` só existia
   para a classe `Title`, removida no item 1).
9. `items` mudou de `{ image: string; text: string }[]` para `{ image: string }[]`.

**Custo real registrado para a Task 17 medir:** o design original (mantido) duplica a lista de itens
(`galleryItems.concat(galleryItems)`) para o loop parecer contínuo — os 9 retratos viram 18 planos
com textura própria na GPU. A rede não dobra (mesma URL, cache do navegador serve a segunda cópia),
mas a memória de GPU sim. Não foi removido porque tirar a duplicação quebraria o efeito circular que
a task pediu — é o preço de um anel contínuo com poucos itens.

## Prova de que `ogl` está fora do first-load JS da rota

`npm run build` (Next 16.3.1 / Turbopack) — saída real:

```
Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

O formato de saída do Next 16 não lista mais um "First Load JS" por rota como versões antigas, então
a prova foi direto nos artefatos gerados:

1. **Nenhum dos 4 arquivos "root main" da rota `/`** (`.next/server/app/page/build-manifest.json` →
   `rootMainFiles`, mais o `polyfillFiles`) contém qualquer símbolo do `ogl`
   (`generateMipmaps`, `WEBGL_lose_context`, `class Renderer`, `updateMatrixWorld`) — confirmado
   com `grep` direto nos 5 arquivos.
2. **`ogl` inteiro vive em chunks separados**, referenciados só via
   `.next/server/app/page/react-loadable-manifest.json` (o mecanismo do Next para `next/dynamic`):
   - id `7536` → `Silk` (`2s5x5ltdnekj_.js`, 4KB, tem `WEBGL_lose_context`)
   - id `9951` → `CircularGallery` (`431-xf3vn_zad.js`, 18KB, tem `CircularGallery`,
     `generateMipmaps`, `WEBGL_lose_context`)
   - ambos compartilham `0b14_348vvzzv.js` (44KB) — o pacote `ogl` propriamente dito (confirmado
     pela assinatura `updateMatrixWorld`, método exclusivo da classe `Transform` do ogl).
3. **Ao vivo** (`npm run dev -- -p 4000`, Browser pane real, não jsdom): a aba de rede mostra os
   chunks `node_modules_ogl_src_*.js` e `components_reactbits_CircularGallery_tsx_*.js` chegando
   bem depois do lote inicial de ~24 requisições que montam a página — só depois que
   `useCapability()` resolve `podePesado` no cliente e o `next/dynamic({ssr:false})` dispara.

## Acessibilidade — a solução

O WebGL não é acessível a leitor de tela: um `<canvas>` é uma caixa preta para tecnologia
assistiva, e nenhuma combinação de `role`/`aria-label` faria um leitor de tela "ver" os 9 retratos
dentro dele. Duas peças resolvem isso juntas:

1. **O host do canvas é puramente decorativo** (`aria-hidden="true"`, sem `role`, sem `tabIndex`,
   sem navegação por seta). Um elemento focável com `aria-hidden="true"` é o anti-padrão "buraco
   negro de foco" — pior que não ter nada ali. Nenhum conteúdo se perde ao remover o foco: os 9
   retratos já estão **todos visíveis simultaneamente** no anel da galeria (arrastar só gira o anel
   para explorar, nunca revela um item que estava escondido), então quem navega por teclado sem
   mouse não perde nenhuma informação por não conseguir focar o canvas — só a animação decorativa,
   que já está marcada como tal.
2. **Equivalente textual sempre presente quando o WebGL está ativo.** `SorrisosGaleria.tsx` renderiza
   um parágrafo `sr-only` ("Galeria com 9 fotos de pacientes reais da Smile Ipiranga sorrindo,
   resultado dos tratamentos feitos na clínica.") como irmão do host do canvas, sempre que
   `mostrarWebgl` é verdadeiro. Não é uma cópia das 9 imagens (evitaria carregá-las duas vezes) — é
   a contagem e o contexto, o suficiente para quem usa leitor de tela saber que a seção existe e o
   que ela mostra.
3. **No modo fallback** (scroller `next/image`), a acessibilidade não precisa de nenhuma camada
   extra: cada `<Image>` já é conteúdo real e visível, com `alt="Paciente da Smile sorrindo"` — o
   mesmo texto nos 9, porque não existe nome de paciente confirmado e inventar está fora de questão.

O conteúdo do cabeçalho (sobretítulo + `<h2>`) nasce no HTML do servidor (`Sorrisos.tsx` é Server
Component) nos dois modos — nunca depende de JS para existir, disponível a crawler e a leitor de
tela desde o primeiro byte.

## Arquitetura — onde a seção entra

`Sorrisos.tsx` não precisa do estado "qual vídeo está aberto" que `PaginaComVideo.tsx` gerencia
(Task 12) — só a decisão WebGL/fallback, isolada em `SorrisosGaleria.tsx`. Por isso segue o mesmo
padrão que `Ticker`/`Pilares`/`Tratamentos` já usam: `page.tsx` (Server Component) renderiza
`<Sorrisos />` e passa por prop para `PaginaComVideo` (`'use client'`), que a intercala na posição
certa. O brief pedia "montar em `page.tsx`, depois de `<Clinica />` e antes de `<Depoimentos />`" —
essas duas já vivem **dentro** de `PaginaComVideo` desde a Task 12 (não mais soltas em `page.tsx`),
então a posição real pedida virou "entre as duas dentro de `PaginaComVideo`", que é exatamente onde
a seção está — a mesma posição visual final, adaptada à arquitetura que já existia.

`SectionHeading` ganhou uma prop `tema` (`'claro'` por default, idêntico ao comportamento anterior;
`'escuro'` novo) em vez de um componente duplicado, porque só a cor muda entre fundo claro e escuro —
fonte, tracking e espaçamento são idênticos. É a primeira seção de fundo escuro do site.

## Verificação ao vivo (Browser pane, `localhost:4000`)

O aviso da task sobre "ambiente pode não compositar frames" **não se confirmou nesta sessão** —
`screenshot` funcionou normalmente e capturou conteúdo real, não uma tela em branco. Registrando o
que foi de fato observado, sem exagerar:

- **1280px**: seção com fundo `rgb(17,17,17)` (`#111111`), sobretítulo "Pacientes reais" em
  `rgb(252,204,36)` (`#FCCC24`, `--color-amarelo`), `<h2>` "Sorrisos feitos aqui" em
  `rgb(255,255,255)`. Canvas presente dentro do host `aria-hidden`, com retratos reais visíveis
  (confirmado por screenshot — a foto "SMILE" do hero e outros retratos apareceram no anel).
  Arraste com o mouse (`left_click_drag`) girou o anel e trocou os retratos visíveis — inércia e
  interação confirmadas ao vivo, não só no shader.
- **375px**: `document.documentElement.scrollWidth === window.innerWidth` (375 === 375) — **sem**
  overflow horizontal. Seção renderiza com o mesmo layout (mesmas cores, canvas presente), sem
  quebra visual.
- **Achado usado a favor da verificação**: `document.hidden` neste harness de automação lê `true`
  mesmo com a aba aparentemente "em foco". Aproveitei isso para uma prova ao vivo da pausa por aba
  oculta: comparei o canvas via `canvas.toDataURL()` antes e depois de 600ms parado — **não mudou**
  (`mudouEmView: false`), confirmando que o `if (!visivel || document.hidden) return;` está
  realmente impedindo `renderer.render()` de rodar num browser real sob essa condição, não só no
  teste com `rAF` mockado.
- **Não verificado ao vivo**: o scroller de fallback (reduced-motion/pouca memória/economia de
  dados). Este harness de Browser pane não expõe emulação de `prefers-reduced-motion` nem
  `navigator.deviceMemory` (sem acesso ao painel de emulação do DevTools) — forçar isso exigiria
  reescrever `navigator`/`matchMedia` antes da hidratação, o que o `javascript_tool` não alcança.
  A lógica de gate é a mesma `useCapability()` já em produção desde a Task 8 (Silk/HeroBackdrop);
  o comportamento do fallback tem cobertura direta e determinística em `sorrisos.test.tsx` (os três
  gatilhos — reduced-motion, pouca memória, economia de dados — testados separadamente, cada um
  verificando as 9 imagens com `alt` correto e nenhum canvas).

## Testes escritos

**`circularGallery.test.tsx`** (8) — `ogl` mockado (jsdom não tem WebGL real), prova
deterministicamente: nenhuma chamada de `fetch`; canvas monta dentro de um host `aria-hidden`, sem
`role`/`tabIndex`; 9 itens viram 18 `Program` (planos com textura); `destroy()` chama
`WEBGL_lose_context` e remove o canvas; `onError` é chamado (sem lançar) se o `Renderer` falhar na
construção; e — o mais importante — `renderer.render()` só é chamado enquanto
`IntersectionObserver` reporta visível **e** `document.hidden` é falso, com um teste que simula sair
da viewport, depois voltar com a aba oculta, depois voltar com a aba visível, checando a contagem de
chamadas em cada estágio.

**`sorrisos.test.tsx`** (10) — `CircularGallery` trocado por um stub (as internas WebGL já estão
cobertas acima; aqui o que importa é a decisão de veículo): título/sobretítulo idênticos nos dois
modos; `id="sorrisos"`; os três gatilhos de fallback (reduced-motion, pouca memória, economia de
dados) cada um mostrando as 9 imagens com `alt="Paciente da Smile sorrindo"` e nenhum canvas;
`overflow-x-auto` só no `.sorrisos-scroller`, nunca na seção; com capacidade plena monta o WebGL e
**nenhuma** `<img alt="Paciente da Smile sorrindo">` visível (evita duplicar conteúdo no DOM);
parágrafo `sr-only` presente e mencionando "9" quando o WebGL está ativo; e se o `CircularGallery`
chamar `onError`, a seção cai de volta no fallback acessível.

## Craft

Curva/duração do `<Reveal>` no cabeçalho: padrão do projeto (`--ease-saida`, `power2.out` via GSAP,
700ms), sem alteração. Dentro do shader não existe CSS animando — é desenho WebGL por quadro, fora
do escopo da regra "só `transform`/`opacity`" (que fala de propriedades CSS). No fallback, a
rotação/deslocamento de cada retrato (`rotate-[Ndeg] translate-y-Npx`, ciclando 3 valores) usa só
`transform`, aplicado por classe Tailwind estática (não anima — é um estado de layout fixo, não
uma transição), então nenhuma das armadilhas de performance do `design-guidance.md` se aplica aqui.

## Concerns / pendências

- O scroller de fallback não foi visualmente confirmado num browser real (só via teste + inspeção de
  DOM) — recomendo checar manualmente em um dispositivo com "reduzir movimento" ligado, ou no
  DevTools do Chrome com emulação de `prefers-reduced-motion`, antes de considerar a Task 13
  encerrada de vez.
- O `bend`/`scrollEase`/`borderRadius` do `CircularGallery` foram ajustados para valores mais
  calmos que o default do React Bits (`bend: 3→2`, `scrollEase: 0.05→0.06`, `borderRadius:
  0.05→0.04`) por julgamento de craft (marca "quente, cuidadoso, pessoal", não uma agência) — sem
  uma referência visual do parceiro para conferir contra, é uma escolha razoável mas não validada
  externamente. (Correção pós-review: `borderRadius` tinha mudado junto dos outros dois mas ficou
  fora desta lista na primeira versão do relatório — ver "Correções pós-review" no fim deste
  arquivo.)
- Custo de GPU da duplicação de itens (18 planos para 9 retratos) fica registrado aqui e no README
  para a Task 17 medir com números reais (Lighthouse/profiler), como o parceiro pediu.

---

## Correções pós-review

O revisor aprovou spec e qualidade, baixou o `CircularGallery` original do GitHub e confirmou linha
a linha a chamada de rede ao Google Fonts no original (e sua ausência no vendorizado), o build do
zero (`ogl` fora dos 5 `rootMainFiles`), e cada uma das outras modificações (pausa, `WEBGL_lose_
context`, gestos rescopados, try/catch). Três coisas precisaram de correção:

### 1. (Important) A justificativa de acessibilidade estava factualmente errada

A versão anterior deste relatório, do comentário em `CircularGallery.tsx` e do item 7 do README
afirmava que **os 9 retratos ficam todos visíveis ao mesmo tempo no anel**, e usava isso para
concluir que remover o foco do teclado não tira informação de ninguém. **Isso é falso.** O revisor
fez a conta com a matemática do próprio `App.onResize()`: com `bend=2`, FOV 45°, câmera em `z=20` e
um container de ~1265×504px, só **~4 dos 18 planos** (9 retratos duplicados) cabem na viewport de
uma vez — não 9, e muito menos os 18. Arrastar é necessário pra ver a maioria dos retratos.

**A barreira de teclado é real:** quem navega só por teclado (com ou sem leitor de tela) não
consegue girar o anel pra ver os retratos que não estão na janela de ~4 visíveis no momento. Isso
não existia na minha alegação original, que dizia "nenhuma informação se perde".

**Texto novo, corrigido** (aplicado em `CircularGallery.tsx` por volta da linha 507 e em
`README.md` no item 7 — mesmo raciocínio nos dois lugares):

> A decisão de marcar como decorativo mesmo assim se sustenta por outro motivo — não por "nada se
> perde", que seria falso: nenhuma das 9 fotos tem `alt` individual distinto nem no fallback (todas
> usam o mesmo "Paciente da Smile sorrindo" — não existe nome nem tratamento por foto pra
> diferenciar uma da outra). O resumo `sr-only` que `SorrisosGaleria.tsx` mantém ao lado do canvas
> transmite exatamente a mesma informação que a galeria transmite visualmente: existem 9 fotos
> reais de pacientes sorrindo. Expor o canvas ao foco não acrescentaria nenhum detalhe a mais — só
> trocaria "sem informação por foto" por "sem informação por foto, e ainda focável", que é pior (um
> canvas com `aria-hidden="true"` focável é o anti-padrão "buraco negro de foco").

**A decisão final (aria-hidden, sem foco) continua de pé** — meu julgamento é que ela se sustenta
pelo motivo corrigido acima (conteúdo homogêneo: todas as 9 fotos carregam exatamente a mesma
informação descritível, então um resumo por contagem é um equivalente fiel, não uma versão
diminuída). Mas a barreira de teclado que ela aceita é real, e vale registrar explicitamente o que
eu faria se o parceiro achar que não é aceitável: adicionar dois botões nativos (`<button>`
"anterior"/"próximo", fora do canvas, sempre focáveis e nunca `aria-hidden`) que nudgeiam
`scroll.target` de fora do componente, cada um atualizando um `aria-live="polite"` com "retrato N de
9". Isso daria equivalência real de teclado sem expor o canvas ilegível ao foco — mas é escopo novo
(controles de UI, fiação do scroll de fora do componente, região `aria-live`), não uma correção dos
três itens pedidos nesta rodada, e não foi implementado.

### 2. (Minor) `borderRadius` não estava documentado

`bend` (3→2) e `scrollEase` (0.05→0.06) já estavam registrados como julgamento de craft na seção
"Concerns" abaixo, mas `borderRadius` (0.05→0.04, nos dois pontos onde `CircularGallery.tsx` tem
esse default) tinha ficado de fora. Adicionado à mesma frase em "Concerns" e como item 10 novo na
lista de modificações do `README.md`.

### 3. (Minor) `items` recriado a cada render, nas deps do efeito que cria o contexto WebGL

Em `SorrisosGaleria.tsx`, `const itens = SORRISOS.map(...)` dentro do corpo do componente gerava uma
referência nova a cada render — e `items` está nas deps do `useEffect` de `CircularGallery.tsx` que
cria/destrói o contexto WebGL, então qualquer re-render futuro do pai destruiria e recriaria o
contexto inteiro à toa. Corrigido hospedando o array em escopo de módulo
(`const ITENS_WEBGL = SORRISOS.map(...)`, fora do componente) em vez de `useMemo` — `SORRISOS` é um
`const` importado que nunca muda em tempo de execução, então uma constante de módulo dá a mesma
referência estável pra sempre, sem overhead de hook nenhum. Mesmo raciocínio que já valia para
`onError` (identidade estável evita recriar o WebGL à toa), documentado no comentário acima da
constante.

### Verificação depois das correções

`npx vitest run --no-file-parallelism`: 149/149 (inalterado — nenhuma das três correções muda
comportamento testável, só comentários/documentação e a origem do array `itens`). `npx eslint .`:
limpo. `npm run build`: limpo, e reconferido que nenhum dos 5 arquivos de `rootMainFiles`/
`polyfillFiles` da rota `/` contém `generateMipmaps`/`WEBGL_lose_context`/`updateMatrixWorld` —
`ogl` continua inteiramente fora do first-load JS depois das mudanças.

