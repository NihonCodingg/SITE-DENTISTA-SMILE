# Task 19 — Maximizar React Bits (relatório de custo e revisão)

## STATUS: revisado, aprovado — os 4 componentes ficam

## Contexto

A Task 19 vendorizou `StaggeredMenu`, `Silk`, `ScrollVelocity` e `GlareHover` do React Bits,
revertendo as recusas registradas nas Tasks 6, 8, 9 e 10 (ver
`components/reactbits/README.md`) por decisão do parceiro: *"Pode forçar o máximo possível, depois
que o projeto finalizar se houver muitos custos técnicos podemos resolver."* (`emenda-reactbits-e-
skills.md`). `three` + `@react-three/fiber` + `@types/three` entraram como dependência nova (só o
`Silk` exige `three`; os outros três não trazem dependência pesada nenhuma).

O commit `c36436d` entrou como WIP ("pendente de review"). Este documento é o relatório da review
que rodou sobre o range `5920512..c36436d` — o commit anterior à Task 19 (SEO local, último estado
limpo conhecido) contra o commit da Task 19. Os quatro componentes citam este arquivo como fonte do
custo medido (`Silk.tsx:15`, `GlareHover.tsx:15`, `HeroBackdrop.tsx:11,15`); esta é a primeira vez
que os números medidos ficam registrados por escrito.

## Metodologia

Build limpo (`npm run build`, Next 16.3.1/Turbopack) rodado nos dois commits, lendo a saída do
build (tamanho de rota, first-load JS, chunks) e o conteúdo de `.next/static/chunks/` gerado por
cada um. `5920512` foi buildado numa árvore de trabalho limpa (sem o diff da Task 19 aplicado);
`c36436d` é o estado depois da troca.

## Números medidos

| Métrica | `5920512` (antes) | `c36436d` (depois) | Delta |
|---|---|---|---|
| First-load JS da rota `/` (raw) | ~786 KB | ~805 KB | +18,5 KB (+2,4%) |
| First-load JS da rota `/` (gzip) | ~242 KB | ~249 KB | +6,5 KB (+2,7%) |
| Chunk assíncrono do Silk (raw) | 4,0 KB (`ogl` compartilhado à parte) | 888.036 bytes (867 KB) | +862 KB |
| Chunk assíncrono do Silk (gzip) | ~2,0 KB | 234.269 bytes (229 KB) | +226 KB |
| Chunk `ogl`/`CircularGallery` | ~62,8 KB raw | ~61,4 KB raw | ~flat |

O chunk do `ogl` (usado pelo `CircularGallery`, Task 13) não muda de forma relevante — a troca do
`Silk` de `ogl` para `three` não afeta esse chunk irmão, cada um carrega sua própria dependência.

## Leitura dos números

O custo grande da troca — os +226 KB gzip do chunk assíncrono do `Silk` (`three` +
`@react-three/fiber` + o shader) — só é pago por aparelho com `useCapability().podePesado === true`
(memória/núcleos/rede suficientes), de forma **assíncrona** (`next/dynamic({ssr:false})` em
`HeroBackdrop.tsx`), e só **depois do primeiro paint** (o `Canvas` monta depois de
`useCapability()` resolver no cliente). `three` **nunca** entra no first-load JS da rota — o delta
de +18,5 KB raw / +6,5 KB gzip no first-load é o custo combinado do `GlareHover` (síncrono, mas
pequeno — 156 linhas sem dependência) e do `StaggeredMenu` (síncrono, `gsap` já estava no bundle
desde a Task 8) entrando no caminho crítico do menu mobile e da faixa de Tratamentos; o
`ScrollVelocity` usa `motion/react`, também já presente.

Em outras palavras: o aparelho mais fraco (que não qualifica para `podePesado`) nunca baixa `three`
— paga só os ~18,5 KB/6,5 KB do first-load. O aparelho mais forte paga isso mais os ~226 KB gzip do
Silk, de forma assíncrona, sem bloquear LCP/TTI da rota.

## Verificação funcional (revisão ao vivo)

A review rodou o app real (não só leitura de código) contra os critérios de aceitação de
`emenda-reactbits-e-skills.md`.

**Drawer (`StaggeredMenu` via `MobileMenu.tsx`)** — todos os critérios passando ao vivo:
- Foco preso nas duas direções (Tab no último elemento volta ao primeiro; Shift+Tab no primeiro
  vai ao último).
- Foco devolvido ao botão hambúrguer ao fechar.
- `Escape` fecha o drawer.
- `aria-expanded`/`aria-controls` corretos no botão hambúrguer.
- `aria-hidden`/`inert` corretos no painel, inclusive durante a saída e numa reabertura rápida
  (abrir→fechar→abrir em menos de 220ms) — sem ficar preso.
- Scroll travado via `useLenis()?.stop()` (com fallback de `position:fixed` sem Lenis).
- Feedback de toque nos itens (`pressable`, escala 0.97 no `:active`).
- Nenhum overflow horizontal: `scrollWidth === outerWidth` em 375px.
- Nenhum recorte: `elementFromPoint` no meio do painel retorna elemento do drawer (não o recorte a
  66px por containing block de `backdrop-filter` que afetava o header, Task 6).

**Pausa de `Silk` e `ScrollVelocity`** — verificada por snapshot de canvas/transform: fora da
viewport (`IntersectionObserver`) e com a aba oculta (`document.hidden`), o `frameloop` do `Silk`
alterna para `"never"` (canvas para de atualizar entre snapshots) e o `transform` da trilha do
`ScrollVelocity` para de mudar entre quadros — ambos confirmados sem avançar quando fora de
critério, e retomando ao voltar.

**Nenhuma chamada de rede nova** — confirmado que nenhum dos 4 componentes faz `fetch`/carrega
fonte externa (o único caso desse tipo no projeto, o `loadFontFromStylesheet` do `CircularGallery`
original, já tinha sido removido na Task 13).

**Nenhum `matchMedia` próprio** — os 4 recebem a decisão de `useCapability()` por prop
(`reducedMotion`, `podePesado`, `podeAnimar`, `disabled`), fonte única preservada.

## Achado novo — warning `THREE.Clock deprecated`

Console mostra `THREE.Clock: The .oldTime property has been deprecated...` (ou variante similar da
versão instalada), **2 vezes por carregamento** da rota `/`. Vem de dentro de
`@react-three/fiber`/`three` (biblioteca de terceiros, não código deste projeto) — não é um bug
introduzido pela Task 19, é comportamento da versão vendorizada dessas dependências.
**Registrado como deferred**: não bloqueia a Task 19 (não afeta funcionalidade nem performance
observável), mas fica pendente de acompanhar em upgrades futuros de `three`/`@react-three/fiber` —
se a próxima major remover a API deprecada em vez de só avisar, o `Silk.tsx` pode precisar de
ajuste.

## Conclusão

Os 4 componentes ficam. Custo aceito pelo parceiro é real e está documentado nos números acima; a
parte cara (Silk/three) é paga de forma assíncrona e só por quem já qualifica como aparelho capaz,
nunca no caminho crítico da rota.

Achados de documentação/cleanup da review (README desatualizado, este relatório ausente, cleanup
incondicional faltando no `StaggeredMenu`) foram corrigidos na rodada de correção seguinte — ver
commit correspondente e `components/reactbits/README.md`.
