# Task 11 — Sistema de vídeo: VideoCard e Lightbox

## STATUS: completo

## Arquivos

- `site/components/ui/VideoCard.tsx` (novo)
- `site/components/ui/Lightbox.tsx` (novo)
- `site/__tests__/videoCard.test.tsx` (novo — os 6 testes exatos do brief + 3 testes
  adicionais de reprodução coordenada por viewport)
- `site/__tests__/lightbox.test.tsx` (novo — 14 testes de diálogo/foco/scroll, não
  pedidos explicitamente pelo brief mas escritos no mesmo padrão rigoroso de
  `__tests__/header.test.tsx` para o MobileMenu, dada a densidade desta task)
- `site/vitest.setup.ts` (modificado — stub de `HTMLMediaElement.play/pause/load`,
  mesma categoria dos stubs já existentes de ResizeObserver/IntersectionObserver/
  document.fonts)

## Commits

- `feat: sistema de video com preview sob demanda e lightbox` (site/)

## Testes

115/115 passam (`npx vitest run --no-file-parallelism`), TypeScript limpo
(`npx tsc --noEmit`), ESLint limpo (`npx eslint .`).

## O que foi implementado

**VideoCard**: `<video preload="none" muted loop playsInline poster=".../SLUG.webp">`
sem `<source>` no primeiro render. Um `IntersectionObserver` por card observa a si
mesmo; ao entrar na viewport (qualquer proporção), anexa `<source>` via DOM e chama
`.load()` — necessário porque adicionar `<source>` a um `<video>` que já passou pela
seleção de recurso não é notado pelo browser sozinho, achado confirmando o próprio
código de referência do brief estava incompleto nesse ponto. Reprodução (`play()`) só
acontece acima de 60% de interseção, e só para o card mais centralizado: um
coordenador de módulo (`Map<HTMLVideoElement, proporção>`, compartilhado por todas as
instâncias) reavalia a cada mudança e só chama `play()` no de maior proporção,
pausando os demais mesmo que também tenham passado do próprio limiar — resolve o "um
por vez" de verdade em vez de confiar só na heurística por card que o brief
sancionava como aceitável. `!podePesado` (reduced-motion, economia de dados, aparelho
fraco) nunca monta `<video>` — cai num `<Image>` com o poster.

**Lightbox**: portal para `document.body` (mesmo motivo do MobileMenu: escapar do
containing block do header). `role="dialog"`, `aria-modal="true"`,
`aria-label={legenda}`. Entrada `scale(0.95)+opacity 0` → `scale(1)+opacity 1` em
300ms `--ease-saida`; saída em 200ms; fundo com transição de opacidade própria, sem
escala. Foco preso (Tab/Shift+Tab), Escape fecha, foco devolvido ao elemento que
tinha foco no instante da abertura (captura `document.activeElement`, já que o
contrato de props não inclui uma ref do gatilho). `lenis.stop()`/`start()` com
fallback `position:fixed` sem Lenis, mesmo padrão do MobileMenu. Retém o último
slug/legenda abertos em estado (ajustado durante a renderização, não em efeito) para
o `<video>` não perder o `src` no meio da animação de saída.

## Achados/decisões que valem registro

1. **Bug real no rascunho do brief**: `v.play().catch(...)` quebra se `play()` não
   devolver Promise (jsdom devolve `undefined`). Corrigido com `v.play()?.catch(...)`
   e um stub em `vitest.setup.ts` para poder espionar as chamadas em teste.
2. **`muted` é caso especial do React**: `<video muted>` só escreve a propriedade JS
   (`node.muted`), nunca o atributo HTML — confirmado empiricamente com um teste
   isolado em jsdom. O atributo é setado explicitamente via `setAttribute` para
   satisfazer o teste do brief e para o HTML de SSR carregar o estado antes da
   hidratação.
3. **Poster em `.webp`, não `.jpg`, no fallback de `<Image>`**: `recepcao.jpg` não
   existe em `site/public/videos/posters/` (só `recepcao.webp` — foi processado
   depois dos outros 4, às 21:01 contra 16:52). Usar `.jpg` no fallback (como o
   rascunho do brief sugeria) quebraria a imagem de reduced-motion/economia-de-dados
   especificamente para o card de recepção. Padronizei em `.webp` para os 5 slugs,
   tanto no `poster` do `<video>` quanto no fallback `<Image>`. **Concern**: vale
   gerar o `.jpg` de recepção para manter o par completo, mesmo não sendo mais
   estritamente necessário para o componente.
4. **Bug de dependência de efeito no Lightbox**: o efeito de foco/trap dependia só de
   `[aberto]`; se o pai montasse `Lightbox` com `slug` já preenchido (não o fluxo
   normal, mas testável e não impossível), o efeito rodava uma vez com `montado`
   ainda falso (portal nem existia) e nunca de novo quando `montado` virava
   verdadeiro, porque `aberto` não mudava entre os dois renders — foco inicial nunca
   alcançava o painel. Corrigido incluindo `montado` nas dependências. Achado pelos
   próprios testes (não pelo brief, que não cobria esse cenário).
5. **`<video controls>` sem `tabIndex` explícito não é focalizável em jsdom** (e a
   focalizabilidade nativa por Tab varia entre browsers reais, Safari incluído).
   Adicionado `tabIndex={0}` no vídeo do lightbox — corrige o teste E remove
   ambiguidade cross-browser real, não é só contorno de ambiente de teste.

## Verificação no navegador

`npm run dev -- -p 3500` numa rota harness temporária (`app/dev-video-harness/`,
removida antes do commit) montando os 3 `VideoCard` de `DEPOIMENTOS` empilhados
verticalmente com espaçamento de 120vh entre eles, mais o `Lightbox`.

- **Carga inicial**: nenhum `.mp4` requisitado (só os `.webp` de poster, que
  carregam sempre — é esperado, é o atributo `poster` nativo do `<video>`,
  independente de `preload`).
- **Scroll até um card**: só o `previews/<slug>.mp4` daquele card foi requisitado;
  os outros dois cards (fora da viewport) continuaram sem `<source>` no DOM.
  `currentTime` do vídeo avançou de 0, confirmando que `play()` teve efeito real.
- **Clique**: abriu o lightbox com `aria-label` e `<video src>` corretos
  (`/videos/completos/<slug>.mp4`), inclusive para um card que nunca tinha sido
  scrollado/pré-carregado — confirma que o completo só carrega no clique,
  independente do estado da prévia.
- **Escape**: fechou o diálogo (aria-hidden/inert setados na hora; a remoção do nó
  do DOM demorou mais que o esperado — ver concern abaixo).

**Concern sobre o ambiente de verificação**: a aba do navegador desta sessão ficou em
`document.visibilityState: "hidden"` o tempo todo (a Browser Pane não é exibida para
um agente em background), o que faz o Chrome atrasar/agrupar a entrega de callbacks
de `IntersectionObserver` e desacelerar bastante o loop de `requestAnimationFrame`
que a Motion usa para a animação de saída do lightbox. Isso não é um problema do
código — é uma limitação da automação de navegador nesta sessão — mas significa que
o *timing* exato (quão rápido o preview começa a tocar, quão rápido o diálogo some do
DOM após Escape) não pôde ser cronometrado com confiança neste ambiente, só a
*corretude* do que cada ação dispara. `lenis.scrollTo()` teve que ser usado no lugar
de `window.scrollTo()`/scroll de mouse simulado, porque o Lenis intercepta e
sobrescreve scroll nativo/sintético que não passa pela sua própria API.

## Concerns gerais

- A regra "um por vez, toca só o mais centralizado" foi implementada com um
  coordenador real (Map de módulo), mais rígida do que o brief exigia como mínimo
  aceitável (ele sancionava dois cards tocando juntos em telas largas como
  aceitável). Vale confirmar que esse comportamento mais estrito é mesmo desejado
  antes de reusar o mesmo padrão em outro lugar do site.
- `recepcao.jpg` ausente em `VIDEOS/web/posters/` e `site/public/videos/posters/`
  (ver item 3 acima) — não bloqueia esta task porque o componente não depende mais
  dele, mas é uma lacuna no pipeline de assets que vale fechar.
- Esta task não monta `VideoCard`/`Lightbox` em `page.tsx`, por escopo (Tasks 12/13).
  Os nomes exportados batem exatamente com o contrato pedido:
  `<VideoCard slug titulo legenda onAbrir />` e `<Lightbox slug legenda onFechar />`.
