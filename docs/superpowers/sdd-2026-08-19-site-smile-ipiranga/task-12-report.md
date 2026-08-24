# Task 12 — A Clínica, Depoimentos e ligação do Lightbox

## STATUS: completo

## Arquivos

- `site/components/sections/Clinica.tsx` (novo)
- `site/components/sections/Depoimentos.tsx` (novo)
- `site/components/sections/PaginaComVideo.tsx` (novo) — fronteira `'use client'` única que
  segura o estado `videoAberto: string | null`, compartilhado por Hero, Clínica e Depoimentos, e
  monta o único `<Lightbox>` da página
- `site/components/sections/HeroSection.tsx` (removido) — substituído por `PaginaComVideo.tsx`,
  que generaliza o mesmo padrão (fronteira client empurrada para baixo de `page.tsx`) para três
  seções em vez de uma só
- `site/components/reactbits/GradualBlur.tsx` (novo, vendorizado) — bordas do carrossel de
  Depoimentos
- `site/components/reactbits/README.md` (modificado) — documenta a vendorização do GradualBlur
- `site/lib/motion.tsx` (modificado) — interceptação de clique em link de âncora, delegando para
  `lenis.scrollTo()`
- `site/app/page.tsx` (modificado) — monta `PaginaComVideo`, que por sua vez monta Hero → Ticker →
  Pilares → Tratamentos → Clínica → Depoimentos, nessa ordem
- `site/__tests__/clinica.test.tsx` (novo — os 3 testes exatos do brief)
- `site/__tests__/depoimentos.test.tsx` (novo — 6 testes adicionais, não pedidos explicitamente
  pelo brief mas no mesmo padrão de rigor das tasks anteriores)

## Commits

- `e247ab1` — feat: secoes da clinica e depoimentos, lightbox ligado na pagina (site/)

## Testes

124/124 passam (`npx vitest run --no-file-parallelism`, subindo de 115 na Task 11), TypeScript
limpo (`npx tsc --noEmit`), ESLint limpo (`npx eslint .`), `npm run build` limpo (Next 16.3.1 /
Turbopack, sem erro de fronteira RSC).

## O que foi implementado

**Clínica** (`id="clinica"`): duas colunas
`grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]`, `items-center`,
`gap-[clamp(32px,6vw,80px)]`. Esquerda: sobretítulo "O ambiente", `<h2>` e parágrafo — copy exata
de `COPY.md` §5, sem reescrever (conferido caractere a caractere, inclusive o travessão).
Direita: `<VideoCard slug="recepcao">` em 9:16, `width:min(360px,100%)`, `rounded-[24px]`, com
gradiente inferior (`bg-gradient-to-t from-preto/60`) e rótulo "Vídeo / Conheça a recepção". O
design original mandava este vídeo abrir o Instagram numa aba nova — não foi feito: o vídeo da
recepção agora é local e abre no Lightbox compartilhado, como qualquer outro vídeo do site. O
parágrafo de instrução ao designer ("Arraste o frame de cada vídeo...") não existe em nenhum lugar
do código — não havia onde ele pudesse ter vazado, já que a seção foi escrita do zero a partir da
copy aprovada.

**Depoimentos** (`id="depoimentos"`): carrossel horizontal com `snap-x snap-mandatory` no próprio
`.depoimentos-scroller` (`overflow-x-auto` só nesse elemento, nunca na seção ou na página — testado
em runtime, ver abaixo). Os 3 `<VideoCard>` de `DEPOIMENTOS` (lib/content.ts), cada um
`flex-[0_0_min(260px,78vw)]` com `snap-start`; o aspecto 9/14 já vem de dentro do próprio
`VideoCard` (Task 11), não precisou ser reafirmado aqui. `GradualBlur` (React Bits, vendorizado)
nas duas bordas do scroller, `width="56px"`, sem a prop `animated` — é uma máscara estática, não
anima nada.

**Lightbox ligado à página**: `PaginaComVideo.tsx` é a única fronteira `'use client'` que guarda
`videoAberto`. `app/page.tsx` continua Server Component — recebe `<Ticker>`, `<Pilares>` e
`<Tratamentos>` (Server Components sem estado de vídeo) já renderizados e os repassa como prop
(`ticker`/`pilares`/`tratamentos`) para `PaginaComVideo`, que os intercala entre Hero e Clínica na
ordem certa. Esse é o padrão documentado do Next.js para interpor Server Components dentro da
árvore de um Client Component sem importar um módulo server dentro de um arquivo `'use client'`
(o que quebra o build) — verificado com `npm run build` limpo. Um mapa `slug → legenda`
(`tour-clinica`, `recepcao` e os 3 slugs de `DEPOIMENTOS`) vive só em `PaginaComVideo.tsx`, porque
só quem monta o `<Lightbox>` precisa traduzir slug em legenda; Hero/Clínica/Depoimentos continuam
só chamando `onAbrirVideo(slug)`, sem saber que existe um Lightbox do outro lado.

## Achados/decisões que valem registro

1. **`HeroSection.tsx` foi removido, não só modificado.** O brief da Task 12 não lista esse
   arquivo, mas a instrução de nível superior é explícita: "o estado do vídeo aberto vive num
   wrapper client (siga o padrão de HeroSection.tsx)... um único Lightbox compartilhado por Hero,
   Clínica e Depoimentos". Como o estado agora precisa ser visto por três seções em pontos
   diferentes da árvore (não mais só o Hero), a fronteira client subiu de um wrapper por-Hero para
   um wrapper que envolve as três — `PaginaComVideo.tsx` generaliza exatamente o padrão que
   `HeroSection.tsx` (Task 7) criou, só que numa escala maior. Nenhum outro arquivo importava
   `HeroSection` (conferido com grep antes de apagar), e não existe teste para o wrapper em si (só
   para `Hero.tsx`, que manteve seu contrato de props intacto).

2. **Bug real encontrado e corrigido: âncoras do header não chegavam na seção com o Lenis
   ativo.** Confirmado em runtime (ver "Verificação no navegador" abaixo): um clique nativo em
   `<a href="#clinica">` dispara o jump-to-anchor do próprio browser, que anima `scrollTop` por
   fora do loop de `requestAnimationFrame` do Lenis. O Lenis continua escrevendo sua própria
   posição-alvo a cada frame sem saber que o scroll nativo está em andamento — as duas animações
   competem pela mesma `scrollTop`. Corrigido em `lib/motion.tsx`: um listener de `click` no
   `document`, registrado só quando o Lenis existe (dentro do mesmo efeito que o cria, com
   cleanup simétrico), intercepta cliques em `a[href^="#"]`, previne o comportamento nativo e
   delega para `lenis.scrollTo(href, { offset: -(alturaHeader+16) })` — com a altura do header
   lida dinamicamente via `getBoundingClientRect()` (não hardcoded), para não quebrar se o header
   mudar de altura no futuro. Isso corrige **todo** link de âncora do site (inclusive o
   `href="#clinica"` do Hero, que já existia desde a Task 8, e os 4 do header/menu mobile), não só
   os dois novos ids desta task.

3. **`GradualBlur` vendorizado com modificações registradas em `components/reactbits/README.md`**:
   removidos todos os `any` (o projeto trata `@typescript-eslint/no-explicit-any` como erro — uma
   tabela fechada `RESPONSIVE_FIELDS` substitui a concatenação de string não tipada do original) e
   removida a função `injectStyles()` que o original roda em escopo de módulo, injetando uma folha
   de estilo global (`.gradual-blur{...;transition:opacity .3s ease-out}`) com curva nativa —
   proibida por `design-guidance.md` em qualquer lugar do site. Como esta task nunca liga a prop
   `animated`, essa transição nunca dispararia de verdade, mas a injeção de CSS global "invisível"
   (fora do Tailwind, fora de qualquer arquivo `.css` rastreado) foi removida por higiene — um
   mantenedor futuro não deveria precisar descobrir essa folha de estilo sozinho. Nenhuma
   dependência nova, nenhuma chamada de rede, nenhum `matchMedia` próprio — não precisou de gate
   via `useCapability()` porque, sem `animated`, o componente não anima nada (é uma máscara
   estática de `backdrop-filter`, mesma categoria de custo do `backdrop-blur-[8px]` que o Header e
   o botão do tour do Hero já usam sem gate).

4. **Conflito de z-order considerado e evitado no gradiente da Clínica.** Um gradiente cobrindo
   toda a largura inferior do card, como sibling renderizado *depois* do `<VideoCard>` no DOM,
   pintaria por cima do ícone de play (amarelo, `bottom-right`) que já existe dentro do próprio
   `VideoCard` — em CSS, dois elementos posicionados com `z-index:auto` empatam por ordem de
   documento, e não há como o filho de um elemento anterior "vencer" um sibling posterior sem
   mexer no markup interno do `VideoCard` (contrato fechado desta task). Resolvido posicionando o
   rótulo custom só no canto inferior esquerdo (`bottom-4 left-4`, `max-w-[60%]`), longe do ícone
   que fica no canto inferior direito — confirmado visualmente no Chrome real que o ícone continua
   nítido, sem nenhuma sobreposição do gradiente.

## Verificação no navegador

`npm run dev -- -p 3700`, verificado via Browser Pane (Chrome real) em 375px e 1280px.

- **375px**: seções aparecem, texto legível, sem overflow lateral (`document.documentElement.
  scrollWidth === window.innerWidth === 375`, confirmado via `getComputedStyle`/JS, não só
  visual). Menu mobile abre; clicar em "Depoimentos" no drawer fecha o menu e rola até a seção com
  `#depoimentos` ficando a 133px do topo (abaixo do header de ~67px, sem sobreposição). O
  carrossel tem overflow real (`scrollWidth: 812 > clientWidth: 343`), `scroll-snap-type: x
  mandatory` e `scroll-snap-align: start` confirmados via `getComputedStyle`; setar `scrollLeft`
  programaticamente snapa exatamente no início do próximo card (0 → 260px), e o
  `GradualBlur` esquerdo aparece visualmente desfocando a borda do card ao rolar (capturado em
  screenshot). Clicar num card de Depoimentos abre o Lightbox com o vídeo, controles e
  `aria-label` corretos (`"Resultado de facetas em resina, gravado na clínica."`, batendo com
  `DEPOIMENTOS` de `lib/content.ts`).
- **1280px**: sem overflow lateral (`scrollWidth: 1265 <= innerWidth: 1280`). Os 3 cards de
  Depoimentos cabem lado a lado sem precisar rolar (`scrollWidth === clientWidth` do scroller
  nessa largura) — o `GradualBlur` continua montado (decorativo, não atrapalha).
- **Âncoras do header**: clicar em "A Clínica" e "Depoimentos" no nav desktop, e no drawer mobile,
  chega exatamente na seção certa, com o Lenis fazendo o scroll suave (confirmado cronometrando
  `scrollY` antes/depois de um clique disparado via `element.click()`: ~1,5s de animação,
  consistente com `duration: 1.05` do Lenis) — nenhum "tremor" ou volta perceptível, ao contrário
  do que acontecia com `scrollIntoView()` nativo (testado à parte: a chamada nativa é revertida
  pelo próprio loop do Lenis, confirmando por que a interceptação de clique era necessária).
- **Vídeo do Hero (`tour-clinica`)**: o botão "Tour pela clínica" (que antes da Task 12 chamava um
  `onAbrirVideo` vazio, placeholder da Task 7) agora abre o Lightbox de verdade, com
  `src="/videos/completos/tour-clinica.mp4"` e `aria-label="Tour em vídeo pela Smile Ipiranga."` —
  confirma que a fronteira única em `PaginaComVideo.tsx` cobre as três seções, não só as duas
  novas.
- Console do navegador sem erros nem warnings em nenhuma das verificações acima.

## Concerns

- O React Bits sugeria também as props `hoverIntensity`/`animated="scroll"` do `GradualBlur`, não
  usadas aqui — ficaram vendorizadas (código morto até alguém precisar) porque remover só essas
  ramificações do arquivo oficial extrapolaria "modificação pontual" e passaria a ser reescrita —
  contra a decisão do parceiro de manter o componente o mais fiel possível ao original.
- O offset de `lenis.scrollTo()` usa a altura do header lida em tempo de clique
  (`getBoundingClientRect()`), então acompanha automaticamente qualquer mudança futura de altura
  do header — mas não tem teste automatizado cobrindo isso (Lenis real não roda de forma
  confiável em jsdom; a verificação ficou só no navegador, registrada acima). Vale um teste E2E
  dedicado no dia em que o projeto ganhar Playwright/Cypress.
- `GradualBlur` não tem teste unitário próprio (é puramente decorativo, sem lógica de negócio) —
  coberto indiretamente pelos testes de `Depoimentos` que verificam que o scroller (não a seção)
  é quem tem `overflow-x-auto`.

---

## Fix round 1 (review): GradualBlur vazando por cima do Lightbox

### O problema

`Depoimentos.tsx` montava as duas instâncias de `<GradualBlur position="left"/"right">` sem prop
`zIndex`, herdando o default `1000` do componente vendorizado
(`components/reactbits/GradualBlur.tsx`). A escala de z-index real do projeto é muito menor
(WhatsAppFab 60, drawer mobile 65/70, backdrop do Lightbox 85, painel do Lightbox 90) — então as
duas faixas de 56px vazavam visualmente por cima do fundo escurecido do Lightbox quando um vídeo
de Depoimentos era aberto com a seção visível. O revisor confirmou empiricamente (fundo pintado de
vermelho + screenshot), não só por leitura de CSS.

### Correção

1. **`components/ui/Lightbox.tsx`**: exportada `Z_INDEX_BACKDROP = 85` — e, para que essa
   constante seja garantidamente a MESMA fonte que o CSS renderizado usa (não uma cópia que possa
   divergir), o backdrop trocou a classe Tailwind `z-[85]` por `style={{ zIndex: Z_INDEX_BACKDROP
   }}`. O painel (`z-[90]`) não foi tocado — não é ele quem o GradualBlur precisa ficar abaixo, é o
   backdrop (o "fundo escurecido" que o revisor descreveu).
2. **`components/sections/Depoimentos.tsx`**: exportada `Z_INDEX_BLUR_BORDA = 1`, passada como
   `zIndex={Z_INDEX_BLUR_BORDA}` nas duas instâncias de `<GradualBlur>`.
3. **`__tests__/depoimentos.test.tsx`**: novo teste `'as faixas de GradualBlur ficam abaixo do
   fundo escurecido do lightbox'` — renderiza `<Depoimentos>`, lê o `style.zIndex` REAL de cada
   `.gradual-blur` (não a prop que o componente recebe) e compara contra `Z_INDEX_BACKDROP`
   IMPORTADO de `Lightbox.tsx` (não um `85` repetido no teste). Os dois lados da asserção vêm da
   fonte real — se qualquer um dos dois números mudar no arquivo de origem, o teste continua
   correto sem precisar de edição manual.

### Prova por quebra proposital

Removido temporariamente `zIndex={Z_INDEX_BLUR_BORDA}` das duas instâncias em `Depoimentos.tsx`
(`sed` + backup), rodado `npx vitest run depoimentos --no-file-parallelism`:

```
FAIL  __tests__/depoimentos.test.tsx > Depoimentos > as faixas de GradualBlur ficam abaixo do fundo escurecido do lightbox
AssertionError: expected 1000 to be less than 85
```

Falhou exatamente como esperado (1000, o default do componente, contra o limite real de 85).
Restaurado o arquivo original (`mv Depoimentos.tsx.bak Depoimentos.tsx`) e re-rodado a suíte
inteira: 125/125 voltam a passar.

### Verificação depois da correção

`npx tsc --noEmit`, `npx eslint .` e `npm run build` (Next 16.3.1/Turbopack) limpos com a
correção aplicada.

**Verificação visual no navegador — limitação de ambiente registrada**: nesta sessão de follow-up,
o Browser Pane não compositou frames (`screenshot failed: ... the Browser pane is not displayed`,
mesmo depois de `tabs_select`, nova aba em foreground e `resize_window`) — `document.visibilityState`
ficou `"hidden"` o tempo todo, a mesma limitação de ambiente já documentada no relatório da Task 11
("a aba desta sessão fica hidden, o que atrasa/agrupa rAF"). Como o Lenis depende de rAF para
comitar qualquer mudança de scroll, isso bloqueou tanto scroll programático quanto scroll nativo
nesta sessão específica — sem conseguir rolar até Depoimentos, não há como tirar um screenshot
pixel-a-pixel do lightbox aberto sobre a seção.

Na ausência de screenshot, a verificação foi feita por inspeção direta do Chrome real via
`getComputedStyle` (não jsdom) depois de abrir o lightbox de um card de Depoimentos:

```json
{
  "backdropComputedZIndex": "85", "backdropPosition": "fixed",
  "blurZIndexes": [
    { "inline": "1", "computed": "1", "position": "absolute" },
    { "inline": "1", "computed": "1", "position": "absolute" }
  ]
}
```

Confirma no motor de renderização real: o backdrop (`position:fixed`, direto filho de
`document.body` via portal) tem z-index 85; as duas faixas `.gradual-blur` (`position:absolute`,
dentro do wrapper `<div className="relative mt-10...">`, que NÃO tem z-index próprio e portanto
não cria stacking context isolado) têm z-index 1. Sem nenhum stacking context intermediário entre
as faixas e a raiz do documento, as duas comparam diretamente contra o backdrop na mesma escala —
85 > 1, então o backdrop passa a pintar por cima das faixas, corrigindo o vazamento. Isso é
determinístico pela especificação de stacking do CSS (não depende de scroll), e é a mesma conclusão
que um screenshot mostraria — só sem a foto. Registrado como lacuna de verificação desta rodada
específica, não do código.

## Commits (fix round 1)

- `337f1a6` — fix: GradualBlur do carrossel de depoimentos nao vaza mais sobre o lightbox (site/)
