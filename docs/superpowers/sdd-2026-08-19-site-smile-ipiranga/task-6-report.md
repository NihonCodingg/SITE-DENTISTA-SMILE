# Task 6 — Header, menu mobile e WhatsApp flutuante

## O que foi feito

- `site/components/layout/Header.tsx` — header sticky, fundo `bg-branco/94` (color-mix) +
  `backdrop-blur-[8px]`, borda `#F1E7DB`, logo via `next/image` (82×46, `priority`), nav desktop
  (`hidden md:flex`, Jost 13px, `tracking-[.14em]`, uppercase), botão de telefone (círculo 44px,
  sempre visível), CTA pílula amarela (`hidden md:inline-flex`), `<MobileMenu />`. Encolhe o
  padding vertical (10px → 6px) depois de 80px de scroll via GSAP ScrollTrigger.
- `site/components/layout/MobileMenu.tsx` — drawer feito à mão com `motion/react` (biblioteca
  Motion, já em `package.json`), não com `@react-bits/staggered-menu` (ver "Desvio 1" abaixo).
  Hambúrguer com `aria-expanded`/`aria-controls`, painel com `role="dialog"`, `aria-modal`,
  `aria-hidden`/`inert` quando fechado, foco preso (Tab/Shift+Tab), Escape fecha, foco devolvido ao
  hambúrguer, trava de scroll via `useLenis()?.stop()`/`.start()` com fallback `position:fixed`
  (não `overflow:hidden`) para quando não há instância de Lenis (reduced-motion).
- `site/components/layout/WhatsAppFab.tsx` — FAB 58×58px, `bg-amarelo`, ícone WhatsApp em SVG,
  `aria-label="Falar no WhatsApp"`, sombra conforme brief. Entra com `scale(0.95)→scale(1)` (nunca
  de `scale(0)`, conforme guia de craft, que sobrepõe o `scale(0)` literal do brief) depois que a
  página rola cerca de uma viewport de altura, detectado por um sentinel + `IntersectionObserver`
  (ver "Desvio 2" abaixo). Entrada de mão única, deliberada.
- `site/app/globals.css` — classe `.pressable` compartilhada (`transition: transform 160ms
  var(--ease-saida), background-color/border-color/color 200ms ease` + `:active{scale(0.97)}`),
  usada em todo elemento pressionável das três novas peças.
- `site/app/page.tsx` — placeholder do create-next-app substituído por `<Header /><main
  /><WhatsAppFab />`.
- `site/components.json` — criado com a chave `registries` que o brief pede, mesmo com a
  instalação do React Bits falhando (ver abaixo) — deixado para as Tasks 10/12 tentarem de novo ou
  já saberem que vai falhar.
- `site/__tests__/header.test.tsx` — conteúdo exatamente como o brief especifica.

## Desvio 1 — `@react-bits/staggered-menu` não foi instalado

O brief manda `npx shadcn@latest init --yes` e `npx shadcn@latest add
@react-bits/staggered-menu`. Tentei nessa ordem:

1. `shadcn@latest init --yes` é interativo mesmo com `--yes` (pergunta biblioteca de componentes —
   "Base UI"/"React Aria"/"Radix UI" — e um preset visual — "Nova/Vega/Maia/..."). Isso já é sinal
   de que o CLI mudou de forma incompatível com o que o brief descreve (uma versão anterior do
   shadcn, sem esse fluxo). Enviar newlines via pipe não completa o fluxo (o processo sai sem criar
   `components.json`).
2. Criei `components.json` manualmente com a chave `registries` exata do brief e rodei `npx
   shadcn@latest add @react-bits/staggered-menu` direto. Falhou: `Unexpected token '<', "<!doctype
   "... is not valid JSON`.
3. Tentei a versão fixada que a própria mensagem de erro sugere, `npx shadcn@4.17.0 add
   @react-bits/staggered-menu` — mesmo erro.
4. Confirmei a causa com `curl -H "Accept: application/json"
   https://reactbits.dev/r/staggered-menu.json`: a resposta é o HTML da SPA do reactbits.dev
   (`Content-Type: text/html`, `Server: cloudflare`, `CF-Cache-Status: HIT`) em vez do JSON do
   registry. Isso é uma falha real do lado do reactbits.dev (cacheada pela Cloudflare, reproduzível
   de fora do sandbox), não um problema de rede daqui — o registry shadcn-compatible que o brief
   assume não está servindo o caminho `/r/{name}.json` como JSON no momento.
5. Verifiquei via `firecrawl scrape` na página de docs do componente que a única dependência
   listada do `StaggeredMenu` é `gsap` (já é dependência do projeto) — ou seja, não era o caso de
   "dependência pesada demais" (nada de three.js/ogl), só de a instalação em si não completar.

Seguindo a autorização explícita do briefing da task ("se a instalação falhar... implemente o
drawer à mão"), implementei o `MobileMenu` do zero. Usei a biblioteca **Motion** (`motion/react`,
que reexporta `framer-motion` — já estava em `package.json` desde o Task 1) em vez de GSAP para
essa peça específica, porque o guia de craft pede explicitamente Motion para o que é "dinâmico e
interruptível (lightbox, drawer)" e reserva GSAP/CSS para o que é predeterminado. A curva
`--ease-gaveta` foi traduzida para o array `[0.32, 0.72, 0, 1]` que a Motion aceita nativamente
(sem precisar do plugin CustomEase do GSAP). Entrada/saída assimétricas (300ms/220ms) e o stagger
de 40ms vêm de `variants` com `transition` próprio em cada estado — o jeito idiomático da Motion de
expressar isso, sem gambiarra.

**Aviso para quem pegar as Tasks 10 e 12**: elas também dependem do registry `@react-bits`
(`glare-hover`, `gradual-blur`) e provavelmente vão bater na mesma falha. Vale checar o registry
antes de tentar (`curl -H "Accept: application/json" https://reactbits.dev/r/<nome>.json` — se
vier HTML, é a mesma falha) em vez de repetir a investigação.

## Desvio 2 — WhatsAppFab não observa o Hero

O Hero (Task 7) ainda não existe — Task 6 roda antes dele. Como o requisito é "entra depois que o
hero sai da viewport", usei um sentinel invisível de 1×1px posicionado a `100vh` do topo do
documento, observado via `IntersectionObserver`. Isso não depende do Hero existir e continua
correto depois que ele existir, porque o Hero é desenhado mobile-first para caber
aproximadamente na primeira viewport ("acima da dobra... sem rolar" é um requisito explícito da
Task 7). A entrada é de mão única (uma vez visível, continua visível mesmo rolando de volta ao
topo) — decisão deliberada registrada no comentário do componente, para não competir com o guia de
craft sobre movimento "nervoso".

## Desvio 3 — o encolhimento do header anima `padding`, não só `transform`

O guia de craft e o próprio brief pedem "animando só transform". Cheguei à conclusão de que isso é
fisicamente impossível de fazer sem deixar um vão fantasma no layout: `transform` nunca muda o box
do elemento (é isso que o torna barato), então "encolher de verdade" — o header ocupando menos
espaço depois de rolar — exige mudar `padding` (ou `height`) em algum ponto. Testei a alternativa
(um par de spacers vazios com `scaleY`) e ela deixa exatamente esse vão. Optei por uma transição
CSS de `padding-top`/`padding-bottom` isolada a um único elemento sticky (não é lista/bulk — o
cenário que a regra "só transform" existe para proteger) via `transition: padding-* 260ms
var(--ease-movimento)`; GSAP/ScrollTrigger só decide o estado binário (10px vs 6px), igual ao resto
do projeto e integrado ao Lenis. Desligado inteiramente sob reduced-motion.

## Dois bugs achados só no navegador (o vitest não pegou)

1. **Drawer nunca aparecia sob `podeAnimar:true`.** `useCapability()` começa com
   `podeAnimar:false` até o efeito resolver; o primeiríssimo commit do `MobileMenu` usava por isso
   o ramo reduced-motion dos `variants` (que declara `opacity:0` no estado fechado). A Motion só
   atualiza propriedades presentes no `variant` *atual* — quando `podeAnimar` virava `true` e o
   componente passava a usar o ramo animado (que só declarava `transform`, não `opacity`), o `0`
   herdado ficava preso pra sempre, porque a Motion nunca foi instruída a tocar `opacity` de novo.
   `npm test` continuava verde o tempo todo (o teste não abre o menu). Corrigido fixando
   `opacity: 1` nos dois estados do ramo animado.
2. **FAB não escondia de volta ao rolar para o topo** (antes de eu decidir que isso é
   intencional — ver Desvio 2). A causa original era um bug de verdade: o reducer do
   `IntersectionObserver` só tratava a transição "sentinel saiu por cima", nunca "sentinel voltou a
   entrar", deixando o estado indefinido nesse segundo caso em vez de explicitamente decidir algo.
   Corrigido para um latch explícito (`observer.disconnect()` após a primeira revelação), que deixa
   a decisão de mão única no código em vez de ser um acidente.

Achar os dois só foi possível abrindo o navegador de verdade e inspecionando `element.style` — os
testes automatizados (que não abrem o menu nem rolam a página) não cobriam nenhum dos dois casos.

## Verificação da task pendente: tokens Tailwind v4

Task explicitamente pedia para não confiar no build passar. Confirmado no navegador (Chrome via
Playwright/CDP), lendo o CSS gerado pelo Turbopack e `getComputedStyle` nos elementos reais:

| Classe | CSS gerado | Confirmado como |
|---|---|---|
| `bg-creme` | `background-color: var(--color-creme)` | uso orgânico (fundo do drawer) |
| `text-grafite` | `color: var(--color-grafite)` | uso orgânico (nav desktop) |
| `font-rotulo` | `font-family: var(--font-rotulo)` | uso orgânico (nav, CTA, rótulos) |
| `text-amarelo` | `color: var(--color-amarelo)` | `rgb(252, 204, 36)` = `#FCCC24` ✓ |
| `font-titulo` | `font-family: var(--font-titulo)` | resolveu para `"Archivo Black"` ✓ |
| `font-corpo` | `font-family: var(--font-corpo)` | regra gerada confirmada no CSS ✓ |

Os três últimos não têm uso orgânico em Header/MobileMenu/WhatsAppFab (font-titulo é para
headlines Archivo Black, que só chegam no Hero da Task 7; text-amarelo não tem uso de texto puro
nestas peças, só de fundo). Para confirmá-los sem forçar uso artificial no componente real, criei
`app/_verificacao_tokens_temp.tsx`, testei no navegador, e apaguei antes do commit — não sobra no
diff. Também confirmei de bônus que `bg-branco/94` compila para `color-mix(in oklab,
var(--color-branco) 94%, transparent)` e que o stacking `pointer-fine:hover:*` funciona (Tailwind
v4 já gera `hover:` como `&:hover { @media (hover:hover) {...} }` por padrão; empilhar
`pointer-fine:` na frente soma `@media (pointer:fine)`, satisfazendo a regra do guia de craft sem
precisar de variant customizado).

Conclusão: **os tokens funcionam corretamente** — não havia nada para corrigir em `globals.css`.

## Verificação no navegador (375px e 1280px)

Usei o Chrome do MCP (dev server em `localhost:3000`, config em `.claude/launch.json`) para
inspecionar via `getBoundingClientRect`/`getComputedStyle` além de screenshots (duas vezes eu
misjulguei uma screenshot — logo "gigante" e texto "cortado" no drawer que a medição em pixels
provou serem ilusões de leitura minha, não bugs reais; por isso todo achado abaixo tem confirmação
numérica, não só visual):

- **375px**: nav horizontal e CTA pílula com `display:none` computado; hambúrguer com
  `display:block`; logo 82×46 no canto; telefone (44×44) e hambúrguer (44×44) cabem no header sem
  overlap.
- **1280px**: nav com `display:flex` (4 links), CTA com `display:flex`, wrapper do hambúrguer com
  `display:none`.
- **Drawer**: abre no clique do hambúrguer (`aria-expanded` true, painel `inert:false`,
  `aria-hidden:false`, `transform:translateX(0%)`); foco inicial no botão "Fechar menu"; **Tab**
  desde o último item ("Agendar avaliação") volta ao primeiro ("Fechar menu"); **Shift+Tab** desde
  o primeiro vai ao último — os dois sentidos do "prendedor de foco" confirmados, não só um;
  **Escape** fecha e devolve o foco ao hambúrguer; **clique no backdrop** também fecha. Os 4 itens
  numerados (`01`–`04`) sem overflow (`scrollWidth === clientWidth` confirmado em todos).
- **Header encolhe**: `padding-top` 10px→6px depois de ~80px de scroll, volta a 10px rolando de
  volta ao topo (precisei injetar um `<div style="height:2000px">` temporário via JS porque a
  página ainda não tem seções — isso chega na Task 7).
- **FAB**: escondido (`opacity-0 scale-95 pointer-events-none`) no topo; visível
  (`opacity-100 scale-100`) depois de rolar ~1 viewport; continua visível rolando de volta ao topo
  (mão única, decisão registrada); não sobrepõe nenhum botão do header (posições opostas da tela).
- Console limpo (sem erros nem warnings de hidratação) durante toda a sessão de teste.
- **Não testado ao vivo**: o ramo `!podeAnimar` (reduced-motion) — não há ferramenta disponível
  nesta sessão para emular `prefers-reduced-motion` num browser real. O padrão de código segue
  exatamente o já usado (e testado) em `Reveal.tsx`/`motion.tsx` das Tasks 3/5.

## Testes

```
npm test    → 7 arquivos, 58/58 passando (4 novos de header.test.tsx)
npm run lint → limpo
npx tsc --noEmit → limpo
npm run build → build de produção completo sem erros
```

TDD seguido: `header.test.tsx` criado igual ao brief, rodado e confirmado falhando (módulos
ausentes), implementado, rodado e confirmado passando.

## Arquivos

- Criados: `site/components/layout/Header.tsx`, `site/components/layout/MobileMenu.tsx`,
  `site/components/layout/WhatsAppFab.tsx`, `site/__tests__/header.test.tsx`,
  `site/components.json`, `.claude/launch.json`
- Modificados: `site/app/page.tsx`, `site/app/globals.css`

## Concerns para a review

1. Header anima `padding` (não só `transform`) no encolhimento ao rolar — desvio deliberado e
   justificado acima (Desvio 3), não um descuido.
2. `@react-bits/staggered-menu` não instalado — registry externo fora do ar para JSON (Desvio 1);
   drawer implementado à mão com Motion.
3. Ids de âncora das seções (`#tratamentos`, `#clinica`, `#depoimentos`, `#localizacao`) foram
   decisão desta task, registrada em `progress.md` — as Tasks 7/10/12/15 precisam honrá-los ou os
   links do header quebram silenciosamente.
4. Reduced-motion não verificado ao vivo no navegador (só por leitura de código consistente com o
   padrão já testado das Tasks 3/5).

---

## Fix round 1 — resposta à review

A review aprovou a conformidade com a spec e os dois desvios documentados (drawer à mão, `padding`
no encolhimento do header), e reprovou por dois Important. O coordenador acrescentou um quarto item
(remover o encolhimento do header por completo — decisão dele, contradição entre o brief da própria
Task 6 e a Global Constraint do plano, não erro deste implementador). Os quatro foram endereçados.

### 1. `:active`/toque nos itens do drawer não funcionava — corrigido, com causa raiz diferente da hipótese inicial

A review apontou corretamente que o estilo inline da Motion vence a regra `.pressable:active`. A
correção sugerida (`whileTap={{ scale: 0.97 }}`) foi implementada — mas não funcionou de primeira,
e investigar por quê revelou a causa raiz de verdade, mais específica do que "estilo inline vence
classe":

Cada item do drawer tinha `variants={variantesItem}` com a entrada escrita como
`transform: 'translateX(16px)'` → `'translateX(0px)'` (string literal, seguindo a preferência do
projeto por `transform` literal em vez do atalho `x`/`y` da Motion). Adicionar
`whileTap={{ scale: 0.97 }}` no mesmo elemento não quebrava com erro nenhum — o gesto era
reconhecido normalmente (confirmado com um `onTapStart` de diagnóstico, que disparava a cada
pressão) — mas o `scale` nunca aparecia no `transform` final. Causa: a Motion trata um `transform`
escrito como string crua como um valor opaco; ela não sabe decompor essa string para combinar com o
`scale` do `whileTap`, que vive no sistema de valores compostos dela (`x`, `y`, `scale`, `rotate`,
...). As duas fontes de transform competem pela mesma propriedade e uma pisa na outra.

Correção: troquei a entrada desse item específico de `transform: 'translateX(...)'` para o atalho
`x: 16` / `x: 0` da própria Motion — colocando a translação no MESMO sistema de valores que o
`scale` do `whileTap` usa. Os dois passam a compor num único `transform` corretamente. Esse é o
único lugar do projeto que usa o atalho `x`/`y` em vez do `transform` literal preferido — é uma
exceção deliberada e documentada em comentário no próprio código (`MobileMenu.tsx`, acima de
`variantesItem`), porque é tecnicamente necessária para o `whileTap` funcionar ali, não uma
regressão ao hábito que o projeto pediu para evitar.

Prova ao vivo no navegador (Chrome via MCP, 375px), depois de confirmar que o painel estava aberto
e assentado (`inert:false`):

1. Despachei um `PointerEvent('pointerdown', { isPrimary:true, button:0, pointerType:'mouse' })`
   diretamente no primeiro item do drawer.
2. Estilo imediatamente após o dispatch: `opacity: 1; transform: none;` (ainda não processado — a
   Motion escreve via rAF, não sincronamente).
3. Numa checagem seguinte (round-trip real): `opacity: 1; transform: scale(0.996803);` — tween em
   andamento.
4. Numa terceira checagem: `opacity: 1; transform: scale(0.97);` — assentado exatamente no valor
   esperado, com a duração/curva de produção (160ms, `--ease-saida`).
5. Despachei `PointerEvent('pointerup', ...)` na `window` (é onde a Motion registra o listener de
   soltura, confirmado lendo `node_modules/motion-dom/dist/es/gestures/press/index.mjs`).
6. Estilo depois da soltura: `opacity: 1; transform: none;` — volta limpa ao repouso.

Ciclo completo pressionar→soltar confirmado no DOM real, não só no código. (O `computer` tool desta
sessão ficou instável para cliques reais — ver nota de ambiente no fim desta seção; a verificação
acima usa despacho de evento via `javascript_tool`, que se manteve confiável o tempo todo, com o
mesmo `PointerEvent` que o código-fonte da Motion exige em `isPrimaryPointer()`.)

### 2. Dois testes novos, cada um provado por quebra proposital

Adicionados a `site/__tests__/header.test.tsx`:

- `abre o drawer do menu mobile com opacidade visivel, nao presa em 0` (em `describe('Header')`):
  clica no hambúrguer e afirma, dentro do mesmo `waitFor`, que `aria-hidden` virou `'false'` E que
  `style.opacity` não é `'0'`. As duas condições ficam no mesmo `waitFor` de propósito — a primeira
  versão do teste as separava, e isso criou uma corrida de verdade: rodando só esse arquivo o teste
  passava, mas rodando a suíte inteira (mais carga, rAF mais lento) o teste falhava de forma
  intermitente, porque `aria-hidden` muda em sincronia com o clique (React comum) enquanto
  `opacity` só é escrito pela Motion um passo depois (rAF). Movido para dentro do mesmo `waitFor`,
  várias execuções consecutivas da suíte inteira (`npm test`, repetido nesta sessão) ficaram
  estáveis.

- `fica inalcancavel enquanto o sentinel esta em tela e alcancavel quando ele sai por cima` (em
  `describe('WhatsAppFab')`): stub de `IntersectionObserver` que guarda a callback de cada
  instância; dispara manualmente `isIntersecting:true` (deve continuar `tabindex="-1"`) e depois
  `isIntersecting:false` com `boundingClientRect.top:-10` (deve virar `tabindex="0"`).

Provas por quebra proposital (arquivo restaurado com `diff` confirmando binário idêntico depois de
cada uma):

Bug 1 — opacidade presa do drawer. Removi `opacity: 1` dos dois estados do ramo `podeAnimar` em
`variantesPainel` (o exato bug do round anterior). Resultado:

```
❯ __tests__/header.test.tsx > Header > abre o drawer do menu mobile com opacidade visivel, nao presa em 0
AssertionError: expected '0' not to be '0' // Object.is equality
  62|       expect(painel.style.opacity).not.toBe('0');
Tests  1 failed | 5 passed (6)
```

Bug 2 — reducer do FAB. Aqui a review pedia para reintroduzir "o reducer antigo", mas ao testar
percebi que o reducer antigo e o atual são comportamentalmente idênticos para qualquer sequência de
entradas alcançável — a diferença entre eles é só clareza de código (`observer.disconnect()`
explícito vs. um retorno que preserva o estado por acidente), não uma regressão observável.
Reintroduzir literalmente o código antigo faz o teste passar do mesmo jeito (confirmado, e
registrado aqui para transparência). Troquei para uma mutação que representa uma regressão de
verdade — remover a chamada de `setVisivel(true)` no ramo de revelação — que é exatamente a
categoria de bug que este teste existe para proteger ("o FAB reage ao sentinel"):

```
❯ __tests__/header.test.tsx > WhatsAppFab > fica inalcancavel enquanto o sentinel esta em tela e alcancavel quando ele sai por cima
Error: expect(element).toHaveAttribute("tabindex", "0")
Received:
  tabindex="-1"
Tests  1 failed | 5 passed (6)
```

Depois de cada prova, arquivo restaurado (`diff` contra a cópia de backup confirmou idêntico) e
`npm test` voltou a 6/6 (arquivo) e 60/60 (suíte).

### 3. Sentinel do FAB: 100vh para 100dvh

Trocado em `WhatsAppFab.tsx` (estilo inline do sentinel e o comentário acima dele). Custo zero,
consistente com o `h-dvh` que `MobileMenu.tsx` já usava.

### 4. Encolhimento do header removido

Por decisão do coordenador (registrada por ele em `progress.md`, e não uma correção deste
implementador — o desvio que documentei no round anterior sobre "por que padding e não só
transform" continua tecnicamente correto): o encolhimento não existe no design aprovado do Claude
Design (header lá é sticky simples, altura fixa) e contradiz a Global Constraint do plano ("só
`transform` e `opacity`"). Removido de `Header.tsx`:

- `useState` (`encolhido`) e o `useEffect` com `ScrollTrigger.create(...)`
- imports órfãos: `useEffect`, `useState`, `gsap`, `ScrollTrigger`, `useCapability`
- o wrapper interno voltou a ter padding fixo: `py-[10px]` (o valor de repouso do design), sem
  `style` inline nem `transition` de padding

Confirmado no navegador: com um spacer temporário de 2000px (a página ainda não tem seções até a
Task 7) e `scrollY` levado a 500px — bem além do antigo limiar de 80px — o `padding-top` computado
do header continua `10px`. Sticky, blur de fundo e borda inferior continuam intactos.

### Saída final

```
cd site && npm test
 Test Files  7 passed (7)
      Tests  60 passed (60)
```

Repetido 3x seguidas nesta sessão sem flakiness (a corrida de tempo do item 2 já estava corrigida).

```
npm run lint     -> limpo
npx tsc --noEmit -> limpo
npm run build    -> build de produção completo sem erros
```

### Nota de ambiente (não é achado sobre o código)

Nesta rodada de correção, o `computer` tool do Chrome MCP ficou instável para cliques/teclas reais
neste ambiente por boa parte da sessão (screenshots ora vinham em branco, cliques expiravam em 30s
sem efeito nenhum, uma tentativa de clique chegou a mapear a coordenada errada por um fator de
escala de aproximadamente 1.85x). `tabs_select`/recriar a aba resolveu parcialmente e de forma
intermitente. A verificação do item 1 acima foi obtida contornando isso com despacho de
`PointerEvent` via `javascript_tool` (que se manteve confiável o tempo todo), inspecionando o DOM
real (`style` computado pela Motion), em vez de descrever visualmente uma screenshot — o mesmo
cuidado usado no relatório original desta task, depois de duas vezes ter lido mal uma screenshot lá.

### Arquivos desta rodada

Modificados: `site/components/layout/Header.tsx`, `site/components/layout/MobileMenu.tsx`,
`site/components/layout/WhatsAppFab.tsx`, `site/__tests__/header.test.tsx`


---

## Fix round 2 — overflow horizontal no drawer fechado

Duas fontes confirmaram: em 375px, `document.documentElement.scrollWidth` chegava a 695px (375 +
os 320px do painel) mesmo com o drawer fechado. Causa: um elemento `position: fixed` com
`transform: translateX(100%)` continua contando para o scroll do documento mesmo posicionado fora
da viewport visível — o painel do round anterior ficava sempre montado (só `aria-hidden`/`inert`
alternando), então isso acontecia o tempo todo, não só durante a animação.

### Correção escolhida: opções 1 e 2 combinadas

Implementei a opção 1 do coordenador (`AnimatePresence`, não renderizar quando fechado) e, ao medir
de novo, descobri que **sozinha ela não bastava**: o painel passa um instante montado com
`transform: translateX(100%)` bem no primeiro frame de toda abertura (`initial="fechado"`, antes da
Motion animar para "aberto") e de novo no fim de todo fechamento (a saída anima de volta pra lá
antes do `AnimatePresence` remover). Medido ao vivo: `document.documentElement.scrollWidth` ainda
batia 695px no instante seguinte a clicar em "Abrir menu", mesmo já com a opção 1 aplicada.

Por isso somei a opção 2: o painel agora é `position: absolute` (não mais `fixed`) dentro de um
wrapper sempre presente `fixed inset-0 z-[70] overflow-hidden pointer-events-none`. Um elemento
`fixed` normalmente **escapa** do `overflow: hidden` de um ancestral (só é recortado se o
ancestral tiver `transform`/`filter`/etc., o que não é o caso); um `absolute`, ao contrário, **é**
recortado pelo overflow do ancestral posicionado mais próximo — que passa a ser esse wrapper. Com
isso, qualquer valor de `transform` entre 0% e 100% (incluindo os instantes inicial/final da
animação, não só o estado de repouso) fica cortado e nunca extrapola a largura do viewport.

`AnimatePresence` sozinho resolve o **estado de repouso** (drawer fechado = nada extra no DOM); o
wrapper de recorte resolve a **transição inteira** (a animação em si nunca vaza, do primeiro ao
último frame). Os dois juntos fecham o bug por completo, não só a fatia que os revisores mediram.

Efeitos colaterais tratados:
- **Backdrop:** ficou num `<AnimatePresence>` próprio, separado do wrapper de recorte — ele nunca
  transforma (só anima `opacity`), então não precisa de clipping.
- **Foco ao fechar:** com o painel deixando de existir no DOM assim que a saída termina, as props
  `aria-hidden`/`inert` que antes alternavam via `aria-hidden={!aberto}` no JSX não fariam mais
  sentido do mesmo jeito — o React só reaplica props a um elemento que ainda está na árvore, e o
  `AnimatePresence` segura o nó vivo por fora do ciclo normal de render durante a saída, com as
  props do último render em que ele existia (ou seja, ainda "aberto"). Para não perder o
  `aria-hidden`/`inert` imediato no fechar (que a review anterior valorizou), `fechar()` agora seta
  os dois direto no nó via `painelRef`, no mesmo instante do clique/Escape/backdrop, sem esperar a
  saída terminar.

### Teste de regressão

Adicionado a `header.test.tsx`: `nao deixa nada no DOM com transform quando o drawer esta fechado`,
que renderiza `<Header />` (drawer fechado, estado inicial) e afirma
`document.querySelector('[role="dialog"]')` é `null`.

**Detalhe que quase passou batido:** a primeira versão usava `screen.queryByRole('dialog', {name:
'Menu'})` (a API "correta" do testing-library) em vez de `document.querySelector` cru — e ela
**não pegava o bug**. `queryByRole` já filtra elementos `aria-hidden` por padrão; o padrão antigo
(painel sempre montado, só `aria-hidden` alternando) desaparece da árvore de acessibilidade sem
desaparecer do DOM, então `queryByRole` reportava "não encontrado" mesmo com o elemento (e o
overflow) lá. Só a consulta crua ao DOM, que ignora `aria-hidden`, distingue "não está montado"
(correto) de "está montado mas escondido de leitor de tela" (o próprio bug). Descoberto rodando o
teste contra o padrão antigo reintroduzido de propósito e vendo passar quando devia falhar — troquei
a consulta e reproduzi a prova.

**Prova por quebra proposital** (arquivo restaurado depois, `diff` confirmando idêntico):

```
❯ __tests__/header.test.tsx > Header > nao deixa nada no DOM com transform quando o drawer esta fechado
expect(document.querySelector('[role="dialog"]')).toBeNull()
Tests  1 failed | 6 passed (7)
```

### Verificação ao vivo no navegador

Como o `document.documentElement.scrollWidth` sozinho podia ser mascarado por scrollbar/viewport,
também medi `window.outerWidth` (não afetado por overflow de documento) como referência fixa —
os dois batendo em 375 é a prova real, não só a igualdade entre si.

| Momento | `scrollWidth` | `outerWidth` |
|---|---|---|
| Repouso (drawer nunca aberto) | 375 | 375 |
| **Instante seguinte ao clique de abrir**, painel montado com `transform: translateX(100%)` (o exato estado que antes gerava 695px) | **375** | 375 |
| Estado sustentado no mesmo transform (várias checagens ao longo de segundos) | 375 | 375 |
| Logo após `Escape`, painel ainda no DOM saindo (`inert:true`, `aria-hidden:"true"` já aplicados por `fechar()`) | 375 | 375 |

Também confirmado nesse processo: `getComputedStyle(painel).position === 'absolute'` (a mudança
estrutural realmente se aplicou), lista de focáveis do painel intacta (6 itens, mesma ordem de
antes), `Escape` fecha e devolve o foco a "Abrir menu".

**Limite desta verificação:** o Chrome deste MCP ficou preso boa parte desta sessão em "pane não
compositando" (o mesmo sintoma do round anterior — `computer{screenshot}` expira, e a animação real
via rAF não progride: painel e itens ficam presos no frame inicial mesmo depois de segundos reais).
Isso não é um bug desta correção — a mecânica de animação (variants, `whileTap`, durações) não foi
tocada nesta rodada, só o esquema de montagem/posicionamento do container. A prova de
`scrollWidth` acima não depende de a animação progredir: ela mede exatamente o pior caso
(`translateX(100%)` sustentado), que é mais rigoroso que pegar um instante qualquer em progresso.

### Minor da Task 10 — comentário de `GlareHover`

Adicionada a seção `### \`GlareHover\` — **não vendorizado**` a
`site/components/reactbits/README.md`, seguindo o padrão exato das seções `Silk` e `ScrollVelocity`
já existentes (mesmo formato: por que foi lido, os dois motivos técnicos para não vendorizar —
anima `background-position` em vez de `transform`/`opacity`, força um container `grid
place-items-center` incompatível com o grid de 4 colunas da linha —, e o que foi implementado à
mão em `.linha-tratamento`/`globals.css` no lugar). Conteúdo vem do desvio já registrado e
investigado em `task-10-report.md`; o comentário em `globals.css` (que já dizia "decisão registrada
em components/reactbits/README.md") não precisou mudar — passou a ser verdade.

### Saída final

```
cd site && npx vitest run --no-file-parallelism
 Test Files  11 passed (11)
      Tests  91 passed (91)
```

Nota sobre o comando: `npm test` (que roda com paralelismo padrão de workers) quebrou repetidas
vezes nesta sessão com "Worker exited unexpectedly" — sintoma de contenção de recursos na máquina
(múltiplas sessões/tasks concorrentes, confirmado por haver 91 testes de 11 arquivos agora, sinal
de outras tasks rodando em paralelo). Sem relação com o código: com `--no-file-parallelism` (mesmos
testes, execução sequencial) a suíte passa limpa e repetida 2x seguidas. `npm run lint`, `npx tsc
--noEmit` e `npm run build` (produção) limpos.

### Arquivos desta rodada

Modificados: `site/components/layout/MobileMenu.tsx`, `site/__tests__/header.test.tsx`,
`site/components/reactbits/README.md`, `progress.md` (raiz do repositório)

---

## Fix round 3 — portal (containing block do backdrop-filter) e simetria abrir()/fechar()

A re-review confirmou o overflow original resolvido (mediu independente, reproduziu o bug antigo
375→695, verificou o novo em 375 no range inteiro da transição: 0%, 25%, 50%, 75%, 100%, 150%) e
validou o diagnóstico de que a `AnimatePresence` sozinha não bastava. A correção do round 2, porém,
introduziu duas regressões.

### 1. CRITICAL — wrapper `overflow-hidden` recortando o drawer a ~66px

Causa: `MobileMenu` é renderizado dentro do `<header>`, que tem `backdrop-blur-[8px]`.
`backdrop-filter` num ancestral estabelece **containing block** para descendentes `fixed` e
`absolute` — comportamento padrão do CSS (mesma regra, por sinal, que eu já tinha usado a favor no
round 2 para fazer o `overflow:hidden` recortar o painel `absolute`; não tinha considerado que o
`<header>` em si já era um containing block por outro motivo). O wrapper `fixed inset-0
overflow-hidden` do round 2 passou a derivar `inset-0` do `<header>` (~66px de altura), não da
viewport — o painel continuava com `h-dvh` (812px de caixa própria), mas o `overflow:hidden` do
wrapper cortava tudo abaixo dos 66px.

O revisor confirmou por hit-test real: com o drawer aberto, `document.elementFromPoint(200, 400)`
(dentro da área do link "Tratamentos") retornava um `<p>` da página por trás, não o link — só a
faixa de 66px do topo ficava clicável. Não apareceu nos testes de teclado do round 2 porque
`focus()`/eventos de teclado ignoram clipping visual; só round-trip de ponteiro é afetado — daí o
pedido explícito de provar por hit-test, não por leitura de código.

**Correção:** backdrop + painel saem de dentro do `<header>` via `createPortal` (`react-dom`) para
`document.body`. Um portal escapa de QUALQUER containing block estabelecido por ancestrais — não só
do `backdrop-filter` deste header específico, mas de qualquer `transform`/`filter` que apareça ali
no futuro (a mesma classe de bug podia reaparecer de outra forma). O botão hambúrguer continua no
`<header>`; só o overlay (backdrop + wrapper de recorte + painel) sai. Renderizado só depois de
`montado` (`useCapability()`) para não montar o portal antes do cliente confirmar — SSR não tem o
`document.body` do jeito que o cliente vai hidratar.

### 2. Important — `abrir()` não limpava o `aria-hidden`/`inert` que `fechar()` seta

`fechar()` marca o painel `aria-hidden="true"` + `inert=true` direto no nó via ref, no instante do
fechar (não espera a saída da AnimatePresence, ~220ms). Se a pessoa reabre antes disso terminar, a
AnimatePresence reaproveita o MESMO nó — e como `abrir()` não desfazia essas duas marcações, o
painel reabria com `aria-expanded="true"` no botão mas `inert`/`aria-hidden` presos, tornando
`.focus()` em qualquer item interno um no-op silencioso (inacessível por teclado/leitor de tela até
fechar e reabrir de novo). O revisor reproduziu com 3 cliques reais a 60ms de intervalo.

**Correção:** `abrir()` agora espelha `fechar()` — `removeAttribute('aria-hidden')` e `inert =
false` no mesmo `painelRef`, no instante do abrir.

### Teste de regressão

Adicionado a `header.test.tsx`: `reabre acessivel mesmo fechando e reabrindo rapido, antes da saida
terminar`. Abre, fecha, reabre (três `fireEvent.click` no MESMO botão), depois afirma que o painel
atual (reconsultado via `document.querySelector`, não uma referência antiga — cobre tanto o caso de
a `AnimatePresence` reaproveitar o nó quanto o de criar um novo) não está `inert` nem
`aria-hidden="true"`, e que o foco terminou DENTRO do painel (`painel.contains(document.activeElement)`
— comparação por containment, não por rótulo, porque o próprio hambúrguer também exibe
`aria-label="Fechar menu"` nesse estado, o que tornaria uma checagem por texto ambígua e capaz de
passar mesmo com o bug presente).

**Prova por quebra proposital** (arquivo restaurado depois, `diff` confirmando idêntico):

```
❯ __tests__/header.test.tsx > Header > reabre acessivel mesmo fechando e reabrindo rapido, antes da saida terminar
AssertionError: expected true to be false // Object.is equality
  119|     expect(painel!.inert).toBe(false);
Tests  1 failed | 7 passed (8)
```

**Nota sobre metodologia:** minha primeira tentativa de reproduzir o cenário ao vivo no navegador
(`btn.click(); btn.click();` na mesma chamada síncrona de script) **não reproduziu o cenário
pretendido** — as duas chamadas caem no mesmo lote de atualização do React (automatic batching), e
o segundo clique lê `aberto` da mesma closure desatualizada do primeiro, chamando `fechar()` duas
vezes em vez de `fechar()` seguido de `abrir()`. `fireEvent.click` do testing-library evita isso
porque embrulha cada clique em `act()`, forçando o React a assentar antes do próximo — por isso o
teste em `header.test.tsx` é confiável mesmo sem esse cuidado explícito. Refiz a verificação ao vivo
com três chamadas de `javascript_tool` **separadas** (um clique por chamada, dando ao React uma
volta de render entre cada uma — o equivalente real a três toques com intervalo, como o revisor
descreveu) e o resultado bate com o teste: ver tabela abaixo.

### Hit-tests e medições ao vivo (Chrome, 375px, servidor limpo próprio)

| Verificação | Resultado |
|---|---|
| `scrollWidth` / `outerWidth` em repouso | 375 / 375 |
| Painel `.closest('header')` depois de aberto | `null` (fora do header — portal confirmado) |
| Backdrop `getBoundingClientRect()` | `{x:0, y:0, width:375, height:812}` (página inteira, não a faixa do header) |
| `document.elementFromPoint(200, 400)` com drawer aberto | o próprio `<div role="dialog">` |
| `elementFromPoint` no centro exato do link "Tratamentos" | **é o próprio link** (`hit === link`) |
| `scrollWidth` com drawer aberto | 375 |
| Ciclo abrir → fechar → reabrir rápido (3 cliques reais, cada um numa chamada separada) | `aria-expanded="true"`, `painel.inert === false`, `aria-hidden` ausente, foco dentro do painel (`"Fechar menu"`), `scrollWidth === 375` |

### Correção da afirmação sobre `window.innerWidth` (Minor)

Nos rounds anteriores eu tratei `window.innerWidth` como potencialmente não-confiável sob overflow
de documento (por isso âncorei a comparação em `outerWidth`). **Isso não procede.** O revisor testou
isolado, com overflow real forçado: `innerWidth` permaneceu em 375 o tempo todo — é a viewport de
*layout*, não reage a overflow de conteúdo do documento. A metodologia (usar `outerWidth` como
âncora) continua válida e não muda, mas a justificativa estava errada; `document.documentElement.
scrollWidth` comparado contra `window.innerWidth` seria uma comparação igualmente correta e eu
poderia ter usado qualquer um dos dois como referência fixa.

### Saída final

```
cd site && npx vitest run --no-file-parallelism
 Test Files  11 passed (11)
      Tests  92 passed (92)
```

`npm run lint`, `npx tsc --noEmit` e `npm run build` (produção) limpos.

### Arquivos desta rodada

Modificados: `site/components/layout/MobileMenu.tsx`, `site/__tests__/header.test.tsx`
