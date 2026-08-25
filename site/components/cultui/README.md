# cult-ui — componentes vendorizados

> Os relatórios e guias citados por nome aqui e nos comentários do código (`design-guidance.md`,
> `ux-guidance.md`, …) vivem em `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/`, na raiz do
> repositório.

Pedido do dono do projeto na Task 21: dois componentes do [cult-ui](https://www.cult-ui.com) —
o `Expandable` (no CTA "Agendar minha avaliação") e o `DynamicIsland`.

O caminho oficial de instalação é `npx shadcn@latest add https://cult-ui.com/r/<componente>.json`.
**Não funciona aqui**, por dois motivos independentes:

1. `cult-ui.com` responde por trás do "Vercel Security Checkpoint" — um `curl` no endereço do
   registry devolve a página HTML do desafio, não JSON. É o mesmo sintoma que o registry do React
   Bits já tinha dado (ver `reactbits-vendoring.md`), por causa diferente.
2. Os componentes do cult-ui assumem a base do shadcn: `cn()` de `@/lib/utils` (clsx +
   tailwind-merge) e tokens de tema (`hsl(var(--border))`, `bg-muted`, `ring-border`). Este
   projeto não usa shadcn e tem paleta própria (`app/globals.css`), então o instalador traria
   dependências e variáveis que não existem.

Os arquivos abaixo foram baixados direto do repositório oficial e adaptados. Ficam nesta pasta com
a licença ao lado por exigência dela (MIT: o aviso de copyright acompanha o código — ver
`LICENSE.md`).

Repositório: https://github.com/nolly-studio/cult-ui
Caminho no repositório: `apps/www/registry/default/ui/`
Baixado em: 2026-08-24 (branch `main`)

## Arquivos e modificações

### `Expandable.tsx`

- **Origem:** `apps/www/registry/default/ui/expandable.tsx`
- **Usado em:** Task 21 — `components/ui/CtaAgendamento.tsx`, o CTA "Agendar minha avaliação" do
  hero e da seção de Tratamentos.
- **Dependências que arrasta:** `motion` (já no projeto — `MobileMenu.tsx` e `Faq.tsx` já usam).
  O original também importa `react-use-measure`; não veio, ver modificação 2.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** virou a prop `reducedMotion`, alimentada por
  `useCapability().podeAnimar`. Sob movimento reduzido a abertura é imediata em vez de mola —
  reduzir, não zerar.
- **Só `transform`/`opacity`: NÃO — exceção consciente.** O componente anima altura, que é layout.
  Altura É o mecanismo aqui: é o que "expandir" significa. A exceção é limitada — acontece por
  clique (nunca por scroll), num bloco só, e o que se desloca é o fluxo abaixo dele, que é o
  comportamento esperado de um conteúdo que se revela.
- **Modificações:**
  1. **`ExpandableCard` e os três `ExpandableCard*` não vieram.** São cascas de estilo do shadcn
     (`cn()`, `hsl(var(--border))`, `bg-muted`, `ring-border`) — nada disso existe neste projeto.
     Todo o comportamento mora em `Expandable`, `ExpandableTrigger` e `ExpandableContent`; o
     visual é do site.
  2. **`react-use-measure` trocado por um hook local** (`useAltura`, com `ResizeObserver`) — o
     pacote só media a altura do conteúdo. Mesmo critério do `SplitText` na Task 8, onde
     `@gsap/react` virou `useEffect`: sem pacote novo para o que o navegador já faz.
  3. **O gatilho virou `<button>` nativo.** O original é um `<div role="button" tabIndex={0}>` com
     um `onKeyDown` reimplementando Enter e Espaço. O botão nativo traz isso, mais foco visível e
     o `type` certo. Ganhou `aria-expanded` e `aria-controls`, que o original não tem — sem eles
     não há como saber, por leitor de tela, que o botão abre algo nem se está aberto.
  4. **`aria-label="Toggle expand"` removido.** Além do inglês, ele APAGAVA o rótulo do botão:
     "Agendar minha avaliação" virava "Toggle expand" para quem usa leitor de tela.
  5. **`reducedMotion` virou prop** (ver acima).
  6. **`any` eliminado** dos tipos de animação (passaram a `TargetAndTransition` do motion); o
     tipo `AnimationConfig`, declarado e nunca usado no original, não veio.

### `DynamicIsland.tsx`

- **Origem:** `apps/www/registry/default/ui/dynamic-island.tsx`
- **Usado em:** Task 21 — `components/layout/IlhaContato.tsx`, a pílula flutuante de contato. Ela
  **substituiu** o `WhatsAppFab` (Task 6) em vez de somar a ele: dois elementos flutuantes
  disputando a mesma tela é o acúmulo que o guia de craft pede para evitar. A ilha herdou o
  contrato do FAB — só aparece depois do hero, para não competir com o CTA de lá, e a entrada é de
  mão única.
- **Dependências que arrasta:** `motion` (já no projeto).
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** virou a prop `reducedMotion`, alimentada por
  `useCapability().podeAnimar`. Sob movimento reduzido as trocas viram transições curtas em vez de
  mola — a ilha continua mudando de forma e de conteúdo.
- **Só `transform`/`opacity`: NÃO — exceção consciente.** A ilha anima largura, altura e raio; a
  forma É o componente. A exceção fica contida porque ela é `position: fixed` (mudar o tamanho
  dela não reorganiza nada do documento) e porque muda de forma poucas vezes por visita — as
  trocas estão presas a SEÇÕES, não a pixels de scroll.
- **Modificações:**
  1. **`clipPath: url(#squircle-…)` removido.** O original termina cada transição aplicando
     `clip-path: url(#squircle-<tamanho>)`, apontando para `<clipPath>` de SVG que vivem no arquivo
     de demonstração do cult-ui e **não vêm com o componente**. Referência de `clip-path` que não
     resolve não é ignorada pelo Chrome — ela recorta tudo, e a ilha simplesmente some. Sem os
     SVGs, a linha só podia sair.
  2. **Cores viraram props/`className`** — o original crava `bg-black`, `border-black/10` e
     variantes `dark:` do shadcn.
  3. **`flex` adicionado ao contêiner animado** — o original põe `items-center justify-center` num
     elemento sem `display:flex`, então as duas classes não faziam nada.
  4. **`setSize` destravado e estável.** O guard do original é
     `previousSize !== newSize && newSize !== size`: a primeira metade impede voltar ao tamanho
     anterior, então `compact → long → compact` trava no terceiro passo e a ilha fica presa. O
     guard virou checagem de idempotência dentro do reducer — o que, além de destravar a volta,
     tira `state.size` das dependências de `setSize`. Com a identidade estável, o
     `IntersectionObserver` que descobre a seção em leitura não é destruído e recriado a cada troca
     de tamanho.
  5. **A fila de animações agendada ganhou cancelamento** — o original percorre a fila com
     `await setTimeout` num `useEffect` sem cleanup; desmontar no meio deixa os `dispatch`
     seguintes saindo.
  6. **Largura presa à janela.** Os presets são pixels fixos (`long` e `medium` medem 371px); numa
     tela de 360px a ilha encostaria nas duas bordas. Agora a largura nunca passa de
     `innerWidth - 32`, e a altura sai da proporção do preset aplicada à largura já limitada.
     Medido num celular de 375px: 343px de largura, 16px de folga de cada lado.
  7. **`reducedMotion` virou prop** (ver acima).
  8. **`any` eliminado** (`willChange`, o `[key: string]: any` do `DynamicIslandContent`).

**Uma coisa que ficou de fora, de propósito:** os presets altos (`medium` mede 210px, `ultra` e
`massive` mais ainda). Medido num celular de 667px de altura, um painel de 210px cobre quase um
terço da tela — muito para um elemento que a pessoa não pediu. Todos os estados da IlhaContato têm
no máximo 84px, e nenhum tem link dentro de link.
