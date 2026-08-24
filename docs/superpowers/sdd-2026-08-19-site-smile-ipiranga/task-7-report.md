# Task 7 — Hero estático

## O que foi feito

- `site/components/sections/Hero.tsx` — seção `<section id="hero">` fiel à estrutura pedida no
  brief: container `bg-creme rounded-[32px]` (`max-width:1360px`, padding em `clamp`), sobretítulo
  centralizado (Jost 13px, `tracking-[.34em]`, uppercase, grafite), arco decorativo
  `/img/sorriso-arco.png` (`alt=""`, `h-[clamp(24px,3.2vw,44px)]`), `<h1>` Archivo Black
  (`clamp(42px,7.6vw,104px)`, `leading-[.96]`, uppercase, `text-balance`, `max-w-[14ch]`), grid
  `grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-end`:
  - Coluna 1: subtítulo real da COPY, CTA primário preto → WhatsApp, link "Conhecer a clínica" →
    `#clinica`, microcopy "Resposta pelo WhatsApp" (sem o horário — está `⚠️ PENDENTE` na COPY).
  - Coluna 2: `next/image` de `/img/hero-foto.jpg` com `fill` num wrapper `aspect-[944/1122]`
    (proporção real do arquivo), `preload` + `fetchPriority="high"` +
    `sizes="(max-width:768px) 100vw, 460px"`, com o card-botão do tour ("Tour pela clínica")
    sobreposto, `onClick={() => onAbrirVideo('tour-clinica')}`.
  - Coluna 3: "Facetas • Implantes • Próteses", a frase da cadeira única (derivada do dado real do
    CNES — "Consultório Isolado, 1 cadeira odontológica" — combinada com o tom de
    `COPY.md`/seção 5), endereço via `ENDERECO` de `lib/contact.ts`, `@smileipiranga` linkando pro
    Instagram real.
- `site/components/ui/SectionHeading.tsx` — o padrão "sobretítulo + título" que o plano descreve
  como repetido em quase toda seção, com `as="h1"|"h2"`, `align`, `children` (slot pro arco
  decorativo) e `tituloClassName` (a Hero é quem precisa de um tamanho de fonte próprio, bem maior
  que o `h2` default). A própria Hero já é a primeira consumidora.
- `site/app/page.tsx` — passou a `'use client'` e monta `<Hero onAbrirVideo={onAbrirVideo} />`
  dentro do `<main>`. Ver "Decisão 1" abaixo.
- `site/components/layout/WhatsAppFab.tsx` — sentinel de altura fixa substituído por observar o
  `<section id="hero">` de verdade. Ver "Decisão 2" abaixo (era um item obrigatório do brief, não
  opcional).
- `site/__tests__/hero.test.tsx` — exatamente como o brief especifica (5 testes).

## Decisão 1 — `page.tsx` virou Client Component

O brief só listava "Modify: `site/app/page.tsx`", sem detalhar como. Passar `onAbrirVideo` (uma
função) de `page.tsx` para `<Hero>` só é possível se `page.tsx` for Client Component — confirmado
batendo de frente no erro real do Next 16 ao rodar `npm run build` com `page.tsx` ainda Server
Component:

```
Error: Event handlers cannot be passed to Client Component props.
  {onAbrirVideo: function f}
```

Isso não é contornável definindo a função fora do componente (tentei antes de concluir isso) —
RSC não serializa função nenhuma através da fronteira, module-scope ou não. Adicionei `'use client'`
no topo de `page.tsx`. Isso já era o destino planejado: a Task 12 do plano descreve textualmente
"manter o estado `videoAberto: string | null`... em `app/page.tsx`" quando o Lightbox (Task 11)
chegar — só antecipei a fronteira client, não o estado (o handler de hoje é um no-op documentado em
comentário, porque não há Lightbox ainda para consumir o slug).

## Decisão 2 — sentinel do FAB trocado por observar o `#hero` real (item obrigatório do brief)

O brief pedia explicitamente para validar a aproximação de 100dvh do WhatsAppFab (Task 6, quando o
Hero ainda não existia) agora que o Hero é real, e ajustar se divergisse muito. Medido no navegador
em 375×812: **altura real do hero = 1295.9px**, quase 60% a mais que os 812px que o sentinel
assumia. Em mobile isso faria o FAB aparecer bem antes do hero realmente sair da tela — competindo
com o próprio CTA que o sentinel existe para não atrapalhar, exatamente o cenário que o comentário
original do componente dizia querer evitar. Em desktop o problema seria o oposto (hero mais raso
que uma viewport).

Correção em `WhatsAppFab.tsx`: o `useEffect` agora tenta `document.getElementById('hero')` primeiro
e só cai no sentinel de 1px como fallback (mantém o teste existente do `WhatsAppFab`, que renderiza
o componente isolado sem `#hero` no DOM, passando sem alteração). `isIntersecting` vira `false`
exatamente quando 0% do hero está visível — "saiu da tela" passa a ser a altura real da seção, não
um palpite. Mesma lógica de mão única de antes (latch com `observer.disconnect()`).

## Verificação no navegador

Dev server via `npm run dev` (Chrome do MCP). Duas limitações de ambiente cortaram o caminho normal
de verificação visual — registradas aqui, não escondidas:

1. **Screenshot indisponível**: `computer{action:"screenshot"}` falhou o tempo todo com "the Browser
   pane is not displayed, so the page is not compositing frames" — a aba roda sem compositor ativo
   nesta sessão. Toda verificação abaixo foi feita por medição real de DOM
   (`getBoundingClientRect`/`getComputedStyle`) via `javascript_tool`, não por leitura de imagem —
   o mesmo cuidado que o relatório da Task 6 registrou ter aprendido depois de ler mal duas
   screenshots.
2. **`IntersectionObserver` não dispara**: como consequência direta de (1) — confirmado isolando a
   causa com um `IntersectionObserver` completamente novo, sem nenhum código meu, que também nunca
   chamou seu callback mesmo com o alvo genuinamente fora da viewport por 800ms+. IntersectionObserver
   depende do pipeline de compositing do browser para calcular interseção; sem a aba compositando,
   ele não roda. Isso impediu confirmar ao vivo, nesta sessão, que o FAB aparece no momento certo
   depois do fix da Decisão 2.

O que **foi** confirmado ao vivo, e é a evidência que sustenta a Decisão 2 apesar da limitação
acima:
- A geometria real: `#hero` tem 1295.9px de altura em 375px de largura, contra os 812px que o
  sentinel antigo assumia — a divergência que motivou a troca é real, medida, não hipotética.
- `document.getElementById('hero')` resolve corretamente e seu `getBoundingClientRect()` responde
  certo a mudanças de scroll (testado rolando via `lenis.scrollTo(..., {immediate:true})`, com um
  spacer temporário para dar espaço de rolagem, já que a página só tem Hero+Header até aqui —
  spacer e a instrumentação de debug (`window.__lenis`) foram removidos antes do commit, `git diff`
  em `lib/motion.tsx` confirmado vazio).
- A lógica de reação ao `IntersectionObserver` em si (isIntersecting + `boundingClientRect.top`)
  **não mudou** — é a mesma testada por `__tests__/header.test.tsx` (`WhatsAppFab > fica
  inalcancavel enquanto o sentinel esta em tela e alcancavel quando ele sai por cima`), que passa
  com um stub que dispara os callbacks manualmente. O que mudou foi só qual elemento é observado.

**375×812** (requisito principal da task):
- `<h1>` "Seu novo sorriso começa aqui": `top:194px`, `bottom:355px`, `font-size:42px` (mínimo do
  clamp, esperado nessa largura) — **visível sem rolar**.
- Botão "Agendar minha avaliação": `top:519px`, `bottom:563px`, `height:44px` — **visível sem
  rolar**. Como os dois já couberam com o clamp original de 42px, **não foi necessário** o ajuste
  de contingência do brief (reduzir pra 38px / reduzir padding).
- Alvos de toque, todos ≥44px de altura: CTA primário 264×44, "Conhecer a clínica" 153×44, card do
  tour 211×52, `@smileipiranga` 91×44.
- `document.body.scrollWidth === window.innerWidth` (375) — sem overflow horizontal.

**1280px** — grid de 3 colunas:
- `grid-template-columns` computado: `344.875px 344.875px 344.875px`, colunas lado a lado
  (`left: 75, 460, 845`), não empilhadas.
- `align-items:end` confirmado: as 3 colunas têm alturas diferentes (266px, 410px, 184px) mas
  `top + height` bate quase exato nas três (~977–978px) — alinhadas pela base, como o brief pede.
- `<h1>` em `97.28px` (`7.6vw` em 1280px, dentro do clamp, ainda não bateu no teto de 104px).

**LCP/performance da foto do hero** (confirmado lendo o `<head>` real, não só o JSX):
- `<link rel="preload" as="image" imagesrcset="...hero-foto.jpg..." imagesizes="(max-width:
  768px) 100vw, 460px" fetchpriority="high">` presente — o `preload` (ver "Nota Next 16" abaixo)
  gerou o preload responsivo completo, com `fetchpriority="high"` respeitado junto.
- `<img>` renderizado com `fetchpriority="high"`, sem `loading="lazy"` (eager, como esperado com
  preload ativo), `img.complete === true`.

## Nota Next 16 — `priority` está deprecado, usei `preload`

O brief pedia `priority` + `fetchPriority="high"`. Lido `node_modules/next/dist/docs/.../image.md`
antes de escrever qualquer código, como o `AGENTS.md` manda: nesta versão (Next 16.3.1), **`priority`
foi deprecado em favor de `preload`** ("Starting with Next.js 16, the priority property has been
deprecated in favor of the preload property"). Confirmado no fonte
(`node_modules/next/dist/shared/lib/get-img-props.js`) que os dois produzem exatamente o mesmo
efeito interno (`preload: preload || priority`, e usar os dois juntos lança erro) — troquei para
`preload={true}` no lugar de `priority`, mantendo `fetchPriority="high"` como o brief pede. `Header.tsx`
(Task 6) continua usando `priority` no logo — não mexi nele, está fora do escopo desta task e
continua funcional (só deprecado, não removido).

## Copy — dado sem invenção

- Frase da cadeira única: derivada do dado confirmado no `BRIEFING.md` ("CNES: Consultório
  Isolado, ambulatorial, 1 cadeira odontológica") combinada com o tom já usado em `COPY.md` seção 5
  ("aqui você não é encaixado entre um paciente e outro") — não é um número ou fato novo, é a
  mesma verdade já registrada, com voz de hero.
- Microcopy do CTA: só "Resposta pelo WhatsApp", sem o horário — `COPY.md` marca "Seg a Sex, 8h às
  17h" com `⚠️` (pendente de confirmação do cliente), e o próprio brief da Task 7 já pedia só a
  frase sem o horário.
- Terceira coluna: só "Facetas • Implantes • Próteses" (subconjunto real dos 7 tratamentos, não os
  7 inteiros) — como o brief especifica.

## Testes

```
npm test          -> 8 arquivos, 65/65 passando (5 novos de hero.test.tsx)
npm run lint       -> limpo
npx tsc --noEmit   -> limpo
npm run build      -> build de produção completo sem erros
```

TDD seguido: `hero.test.tsx` criado igual ao brief, rodado e confirmado falhando (`Failed to
resolve import "@/components/sections/Hero"`), implementado, rodado e confirmado passando (5/5).

## Arquivos

- Criados: `site/components/sections/Hero.tsx`, `site/components/ui/SectionHeading.tsx`,
  `site/__tests__/hero.test.tsx`
- Modificados: `site/app/page.tsx`, `site/components/layout/WhatsAppFab.tsx`

## Concerns para a review

1. **`IntersectionObserver` do FAB não pôde ser confirmado disparando ao vivo nesta sessão** —
   limitação de ambiente (aba sem compositing ativo, não específica desta task; ver seção de
   verificação acima para a evidência indireta reunida). Vale re-confirmar visualmente numa sessão
   com o Browser pane exibido antes de dar a Task 7 por definitivamente fechada nesse ponto.
2. `page.tsx` virou Client Component nesta task (Decisão 1) — antecipação de algo que o plano já
   previa para a Task 12, não um desvio de arquitetura.
3. A frase da "cadeira única" (coluna 3) e o texto do card do tour ("Tour pela clínica") não têm
   redação literal em `COPY.md` — foram compostos a partir de dados confirmados (`BRIEFING.md`) e
   do texto exigido pelo teste/brief. Vale o dono do copy revisar o tom.
4. `Header.tsx` (Task 6) continua usando o `priority` deprecado do `next/image` — fora do escopo
   desta task, registrado para quem pegar uma limpeza geral depois.

---

## Fix round 1 — resposta à review

A review aprovou spec e qualidade (destacou a confirmação da depreciação do `priority` no
fonte/doc local em vez de por memória, o reaproveitamento de `.pressable`, e o `aspect-[944/1122]`
batendo com as dimensões reais do JPEG) e reprovou por 1 Important + 1 Minor. Os dois endereçados.

### 1. (Important) `page.tsx` não precisava virar Client Component

A review estava certa: a premissa (RSC não serializa função como prop) é real, mas a conclusão do
round anterior — subir a página inteira para `'use client'` — era mais forte que o necessário. O
padrão idiomático é empurrar a fronteira `'use client'` o mais fundo possível na árvore.

Criado `site/components/sections/HeroSection.tsx`: um wrapper client pequeno que declara
`'use client'`, define `onAbrirVideo` internamente (mesmo placeholder documentado de antes — ainda
não há Lightbox para consumir o slug) e renderiza `<Hero onAbrirVideo={...} />`. `app/page.tsx`
voltou a ser Server Component puro (sem `'use client'`, sem função nenhuma no corpo) e agora
renderiza `<HeroSection />` em vez de `<Hero>` diretamente — nenhuma prop de função cruza a
fronteira RSC nele.

Confirmado depois da troca:
```
grep -n "use client" app/page.tsx   -> nenhuma ocorrência (exit 1)
npm run build                        -> compila, gera "/" como estático (○), sem erro de RSC
```

Isso deixa `page.tsx` livre para exportar `metadata`/`generateMetadata` quando a Task 16 (SEO
local) chegar, sem precisar reabrir esta refatoração — exatamente o motivo que a review deu.

### 2. (Minor) Frase da "cadeira única" extrapolava

Trocado em `site/components/sections/Hero.tsx`, coluna 3. Antes:

> Consultório de cadeira única: atenção inteira, sem correria entre um paciente e outro.

"Atenção inteira" era inferência de qualidade de atendimento a partir de um fato de infraestrutura
(1 cadeira, CNES) — exatamente o tipo de coisa que a regra de "nenhum dado inventado" do projeto
existe para barrar, mesmo sem ser um número. Reescrito para ficar ancorado na redação já aprovada
em `COPY.md` §5 ("aqui você não é encaixado entre um paciente e outro"), sem a alegação extra:

> Consultório de cadeira única — aqui você não é encaixado entre um paciente e outro.

### Saída final

```
npm test          -> 8 arquivos, 65/65 passando (inalterado — nenhum teste novo neste round)
npm run lint       -> limpo
npx tsc --noEmit   -> limpo
npm run build      -> build de produção completo sem erros, "/" gerado como estático
```

### Arquivos desta rodada

- Criado: `site/components/sections/HeroSection.tsx`
- Modificados: `site/app/page.tsx` (voltou a Server Component), `site/components/sections/Hero.tsx`
  (frase da cadeira única)
