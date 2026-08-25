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
