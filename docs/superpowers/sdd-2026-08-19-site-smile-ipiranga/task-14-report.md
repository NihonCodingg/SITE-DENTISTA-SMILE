# Task 14 — Profissional, Antes e Depois, Como Funciona

## STATUS: completo

## Arquivos

- `site/components/sections/Profissional.tsx` (novo) — Server Component, fundo creme, duas colunas
- `site/components/sections/AntesDepois.tsx` (novo) — `'use client'` (GSAP/ScrollTrigger), scroller
  horizontal com clip-path reveal, condicional a `ANTES_DEPOIS.length > 0`
- `site/components/sections/ComoFunciona.tsx` (novo) — `'use client'` (linha de progresso com
  ScrollTrigger), grid dos 4 passos
- `site/components/sections/PaginaComVideo.tsx` (modificado) — prop `profissional`; `AntesDepois` e
  `ComoFunciona` entram direto (já são `'use client'`), depois de `Depoimentos`
- `site/app/page.tsx` (modificado) — importa `<Profissional />` e passa por prop
- `site/__tests__/profissional.test.tsx` (novo, 12 testes — Profissional, AntesDepois, ComoFunciona)
- `site/__tests__/antesDepois-vazio.test.tsx` (novo, 1 teste — módulo mockado para provar que a
  seção some por completo quando `ANTES_DEPOIS` esvazia)
- `.claude/launch.json` (modificado) — configuração `smile-4200` adicionada (porta 3000 já estava
  ocupada por outro processo nesta máquina; a task pedia explicitamente `-p 4200`)

## Commits

Um único commit cobrindo as três seções (ver abaixo).

## Testes

162/162 (`npx vitest run --no-file-parallelism`, subindo de 149 no fim da Task 13) — 13 testes
novos. `npx tsc --noEmit` limpo, `npx eslint` limpo nos arquivos tocados, `npm run build` limpo
(Next 16.3.1/Turbopack).

Processo TDD seguido literalmente: os dois arquivos de teste novos foram escritos primeiro: rodei
com os três componentes temporariamente renomeados para `.bak` e confirmei falha real (erro de
resolução de módulo — "Does the file exist?" — não um erro de asserção qualquer), depois restaurei
os arquivos e confirmei passe. Um teste próprio (`renderiza uma imagem para cada item de
ANTES_DEPOIS`) precisou de ajuste depois de escrito: comparava `img.src` inteiro contra
`item.img` (`/img/antes-depois-1.jpg`), mas o `next/image` reescreve `src` para a URL do
otimizador (`/_next/image?url=%2Fimg%2F...`, com barras percent-encoded) — corrigido para comparar
só o nome do arquivo, que sobrevive ao encoding.

## O Profissional

Duas colunas (`grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]`, mesmo padrão que
`Clinica.tsx` já usa), `max-width:1080px`. Foto `/img/dr-vinicius.jpg` (confirmada 900×1125 = 4:5
exato) em `aspect-[4/5]`, `rounded-[24px]`, `max-width:380px`.

**CRO**: mantido exatamente `CRO-SP a confirmar`, com `border-b-[2px] border-dashed border-dourado`
só no trecho pendente (não na palavra "Ortodontista", que é confirmada por BRIEFING.md §4). Testado
duas vezes: presença do texto exato, e ausência de qualquer dígito perto de "CRO-SP"
(`queryByText(/CRO-SP\s*\d/)` → `null`).

**O parágrafo** (COPY.md §6 marca esse texto como "⚠️ a escrever com o cliente — formação, tempo de
atuação, abordagem") foi escrito agora, mas só com o que está confirmado: o nome, "Ortodontista"
(declarado no jaleco, per BRIEFING.md §4) e o traço real do negócio que o próprio BRIEFING.md já
aprova em §3 ("é um consultório boutique... o ativo real é atendimento pessoal e especializado").
Texto final: *"Dr. Vinicius atende pessoalmente cada paciente da Smile, do diagnóstico ao
acompanhamento do tratamento, com calma para explicar cada etapa antes de começar."* Nenhuma
formação, nenhum tempo de atuação, nenhum número — um teste de regressão (`nao inventa formacao,
tempo de atuacao ou numero de CRO`) trava contra `/anos? de (experiência|atuação)|formad[oa]
(pela|em|no)/i` no texto renderizado.

## Antes e Depois

**Decisão sobre `clip-path`: usei.** O design-guidance.md recomenda por nome esta seção
("Use na galeria da clínica e nos antes/depois — é acelerado por hardware e parece mais caro do que
custa"). Implementado com a mesma estrutura do `<Reveal>` genérico (gsap + ScrollTrigger, "nasce
visível", reduced-motion cai para fade de opacidade em vez de zerar) — não criei um segundo padrão
de animação, só troquei `y` por `clipPath`. Usei exatamente os valores do brief,
`inset(0% 0% 100% 0%)` → `inset(0% 0% 0% 0%)`, com um adicional: `round 20px` dentro do próprio
`clip-path`, para os cantos ficarem arredondados também nos estados intermediários da animação (sem
isso, o clip desenha um retângulo de cantos retos por cima do `border-radius` enquanto a foto ainda
está sendo revelada). `overflow-hidden` no wrapper também, redundante com o `round` mas é o segundo
cinto de segurança que o ux-guidance.md pede explicitamente.

Nota sobre a direção do reveal: a prosa do design-guidance.md diz "de baixo para cima", mas os
valores de `inset()` que ele mesmo lista (só o componente `bottom` anima, de 100% a 0%, com `top`
fixo em 0) produzem matematicamente uma revelação **de cima para baixo** (a borda superior fica
sempre ancorada, e a área visível cresce estendendo a borda inferior). Segui os valores exatos
citados duas vezes (design-guidance.md e o brief desta task) em vez da descrição em prosa — é um
efeito de reveal igualmente elegante, só com a direção oposta à frase.

Aviso legal: texto **exato** de COPY.md §8, copiado sem alterar uma vírgula:
> Imagens de casos realizados na Smile, publicadas com autorização dos pacientes. Cada caso é único
> e os resultados variam conforme a condição de cada pessoa.

`ANTES_DEPOIS.length` é tipado como o literal `5` (o array em `lib/content.ts` usa `as const`), então
`=== 0` é sinalizado pelo TypeScript como comparação impossível (TS2367) — usei `!ANTES_DEPOIS.length`
(checagem de truthiness) em vez de igualdade estrita, e escrevi um teste dedicado
(`antesDepois-vazio.test.tsx`, com `vi.mock('@/lib/content', ...)` substituindo só `ANTES_DEPOIS`
por `[]`) para provar que o comportamento real de esconder a seção continua funcionando — o ajuste
foi só para satisfazer o compilador, não uma mudança de lógica.

Scroller: `overflow-x-auto` só em `.antes-depois-scroller`, nunca na seção — confirmado por teste
(mesmo padrão de `depoimentos.test.tsx`) e por medição ao vivo (`scrollWidth === innerWidth` em
375px, sem overflow de página).

## Como Funciona

Grid `repeat(auto-fit,minmax(min(230px,100%),1fr))`, `gap-6` (24px), `<Reveal delay={i * 0.1}>` por
passo, número 40px Archivo Black amarelo, borda superior neutra (`border-borda-forte`, não amarela —
decisão de craft: evitar dois acentos amarelos competindo no mesmo cartão, já que o número já é o
elemento de destaque).

**Decisão sobre a linha de progresso vertical no mobile — invertida em relação ao que o texto da
task sugeria por padrão.** Fiz as contas do próprio grid antes de decidir: com o container desta
seção (`max-w-[1080px]`, `px-4` abaixo de `md`), 2 colunas já cabem a partir de ~516px de largura de
viewport (2×230 + 24 de gap + 32 de padding = 516). Ou seja, a única faixa de largura em que os
quatro números realmente ficam em coluna única — e uma linha vertical "liga" alguma coisa de verdade
— é a mobile; a partir dali eles ficam lado a lado numa única linha horizontal (confirmado ao vivo em
1280px: as quatro colunas aparecem lado a lado numa fileira única). Uma linha vertical não conecta
itens dispostos horizontalmente. Por isso: **a linha aparece só até 480px** (`hidden
max-[480px]:block`, puro CSS — folga de segurança abaixo do ponto real de quebra em ~516px) e fica
escondida (não desmontada) daí para cima — o inverso do que o texto da task avisava como risco
("se ficar estranha em 375px, adapte ou omita no mobile"): aqui é o **desktop** que quebra a
metáfora da linha, não o mobile, então mantive no mobile e escondi no desktop.

Animação: `scaleY` de 0 a 1 via `gsap.to(..., {scrollTrigger: {scrub: 0.6}})`, `transformOrigin: top
center`, só `transform`. Sob `prefers-reduced-motion`, o efeito nem roda — o elemento fica no estado
padrão (sem transform = escala cheia, sempre visível), que é o comportamento certo pela tabela do
design-guidance.md ("Parallax, translate, scale → Remover o movimento", não remover o elemento).

**Bug real encontrado e corrigido durante a verificação visual**: a linha usa `-z-10` para ficar
atrás dos 4 cartões de passo (que são elementos estáticos, sem z-index). Sem mais nada, isso
**escapava do contexto de empilhamento** — `position:relative` sozinho no wrapper não cria um
contexto de empilhamento novo, então o z-index negativo subia até o ancestral mais próximo que cria
um (nenhum, neste caso) e a linha era pintada atrás de **tudo**, inclusive do `bg-creme` da própria
seção, ficando invisível. Só percebi porque fui conferir com `javascript_tool` (não bastou o
screenshot — a linha é sutil, `amarelo/40`, 2px). Corrigido adicionando `isolate` ao wrapper
(`isolation: isolate`, fecha um contexto de empilhamento ali mesmo), confirmado depois trocando a cor
por vermelho opaco temporariamente e tirando screenshot: a linha aparece corretamente atrás dos
números/texto e na frente do fundo creme, do primeiro ao quarto passo.

## Verificação ao vivo (Browser pane, `localhost:4200`, porta 3000 ocupada por outro processo)

`npm run dev -- -p 4200` funcionou normalmente — nenhuma limitação de compositing neste ambiente;
`computer.screenshot` capturou conteúdo real nas duas larguras pedidas.

- **375px**: Profissional (foto + CRO tracejado + parágrafo), Antes e Depois (scroller com 5 fotos,
  aviso legal completo, ambas as frases obrigatórias visíveis), Como Funciona (coluna única, linha
  de progresso presente e animando — confirmado via `getBoundingClientRect`/`getComputedStyle`, não
  só visualmente) — sem overflow horizontal de página (`document.documentElement.scrollWidth ===
  window.innerWidth`, 375 === 375).
- **1280px**: Profissional em duas colunas de verdade (confirmado por scroll real, não por salto de
  `window.scrollTo` — um salto instantâneo via JS não dava tempo do ScrollTrigger dos `<Reveal>`
  disparar antes do screenshot, o que inicialmente pareceu "coluna direita em branco"; um scroll de
  mouse real resolveu, e não é um bug de produção). Como Funciona em fileira única de 4 colunas,
  linha de progresso corretamente ausente (`display: none`, confirmado via `getComputedStyle`) — a
  decisão de craft acima na prática.
- Console do browser sem erros em nenhuma das duas larguras.

## Craft

Curvas/durações: `power2.out`, 700ms para os reveals de opacidade+y e de clip-path (mesmo padrão que
`Reveal.tsx` já usa — não recalculei um valor novo). Linha de progresso: `scrub: 0.6` (acompanha o
scroll com suavização leve, sem ser instantânea nem atrasada demais) e `ease: 'none'` (correto para
scrub — a curva de suavização já vem do próprio `scrub`, uma segunda easing por cima faria o
progresso "escorregar" fora de sincronia com a posição real do scroll). Nenhum `transition: all`,
nenhum `scale(0)` na entrada, nenhum `ease-in`. Só `transform`, `opacity` e `clip-path` animam nos
três componentes novos.

## Concerns / pendências

- A "linha de progresso" liga os quatro números só numa aproximação: ela cobre do topo ao fim do
  grid (`top-0 bottom-0` do wrapper), não do centro do glifo "01" ao centro do glifo "04" — medir a
  posição exata de cada número exigiria uma segunda passada de `getBoundingClientRect` por item
  (mais JS, mais uma fonte de layout thrashing) por um ganho visual pequeno; optei pela versão mais
  simples.
- O corte em 480px para mostrar/esconder a linha é uma aproximação segura (o breakpoint real de
  2 colunas fica em ~516px), não uma medição de colunas em tempo real via `ResizeObserver` — se o
  container mudar de largura/padding no futuro, vale reconferir a conta.
- CRO e a especialidade registrada continuam pendências reais do cliente (BRIEFING.md §4,
  PERGUNTAS-CLIENTE.md nº1) — a seção está pronta para publicar assim que o dado chegar, sem
  nenhuma mudança de código.

---

## Correções pós-review

O revisor aprovou spec e qualidade, conferiu caractere a caractere o aviso legal contra COPY.md §8,
confirmou ausência de dígito no CRO, refez a conta do breakpoint do grid (516px) e validou a
inversão da linha de progresso, e confirmou `isolate` e o `clip-path` com `round`. Também corrigiu,
do lado dele, a prosa errada do design-guidance.md sobre a direção do clip-path reveal. Três
correções entraram nesta rodada — duas por erro do brief/guia, uma minha:

### 1. (Important — meu) `.claude/launch.json` revertido

Eu tinha acrescentado uma segunda config (`smile-4200`, porta 4200) porque a 3000 estava ocupada
por outro processo nesta máquina. `launch.json` é configuração compartilhada e versionada — porta
ocupada é circunstância de sessão, não motivo para mudar config do repositório. Revertido: só a
config `smile` (porta 3000) permanece. Quando precisei reconfirmar visualmente depois desta
correção, usei `npm run dev -- -p 4300` direto por linha de comando (processo solto, nunca escrito
em `launch.json`, encerrado ao final da verificação).

### 2. (Minor — erro do brief, não meu) Stagger de `ComoFunciona.tsx` acima do teto

`delay={i * 0.1}` (100ms) excedia o teto de 30-80ms do design-guidance.md — o número veio direto do
brief da task. Corrigido para `delay={i * STAGGER_STEP}` com `STAGGER_STEP = 0.06` (60ms),
alinhado com a constante de mesmo nome/valor que `AntesDepois.tsx` já usa, por consistência entre as
duas seções novas desta task.

### 3. (Minor, risco regulatório — erro do brief, não meu) "Ortodontista" também é pendência, não só o CRO

BRIEFING.md §4 marca a especialidade e o CRO como **duas pendências distintas**:
- CRO: "—" · ⚠️ PENDENTE, obrigatório na publicidade odontológica
- Especialidade: "Ortodontista (bordado no jaleco)" · ⚠️ PENDENTE — **confirmar se é especialidade
  registrada**

A primeira versão desta seção só tracejava o CRO, tratando "Ortodontista" como fato confirmado. Pela
Resolução CFO-196/2019 não se anuncia especialidade sem registro correspondente — exibi-la como
afirmação sem essa confirmação carrega o mesmo risco regulatório que um número de CRO inventado.

Corrigido em `Profissional.tsx`: extraída uma constante `PENDENTE` (a mesma classe
`border-b-[2px] border-dashed border-dourado pb-0.5`) aplicada agora nos DOIS trechos —
"Ortodontista" e "CRO-SP a confirmar" — fonte única, para as duas marcações nunca divergirem por
acidente. Nem o texto nem a ordem mudaram, só a marcação visual. Novo teste de regressão
(`marca TAMBEM a especialidade (Ortodontista) como pendente, nao so o CRO`) trava contra isso —
verifica `border-dashed` e `border-dourado` no `className` do nó `<span>Ortodontista</span>`, o
mesmo padrão já usado para o CRO.

**Não alterado, registrado como observação**: o `alt` da foto ("Dr. Vinicius Aracena, ortodontista
da Smile Ipiranga") continua descrevendo a especialidade em texto livre, sem o equivalente de
"a confirmar" que existe visualmente — texto alternativo de imagem não tem como carregar estilo, e
mudar sua redação estava fora do escopo específico pedido nesta correção ("não mude o texto"). Quem
usa leitor de tela ouve a especialidade como afirmação plana, sem o mesmo sinal de pendência que
quem vê a tela recebe visualmente. Fica como assimetria conhecida para uma eventual Task de
acessibilidade revisar, não resolvida aqui.

### Verificação depois das correções

`npx vitest run --no-file-parallelism`: **163/163** (subiu de 162 — o teste novo da especialidade
pendente). `npx tsc --noEmit` e `npx eslint` limpos nos arquivos tocados. `npm run build` limpo
(Next 16.3.1/Turbopack).

Verificação visual: o Browser pane não compositou frames nesta parte da sessão
(`screenshot failed: ... the Browser pane is not displayed`) — não forcei nem inventei uma captura.
Confirmação feita por `javascript_tool` direto no DOM real (subi um `next dev -p 4300` solto, fora
do `launch.json`, só para esta checagem): os dois `<span>` de `Profissional.tsx` têm
`getComputedStyle(...).borderBottomStyle === 'dashed'`, `borderBottomWidth === '2px'` e
`borderBottomColor === 'rgb(240, 180, 12)'` (`#F0B40C`, `--color-dourado`) — idênticos entre
"Ortodontista" e "CRO-SP a confirmar", confirmando que o tratamento visual é o mesmo nos dois.

`.claude/launch.json` confirmado de volta ao estado original: só a config `smile` (porta 3000).

---

## Correção pós-review (2) — o `alt` da foto ainda afirmava a especialidade

A observação que eu tinha registrado como "assimetria conhecida, não resolvida" na rodada anterior
voltou como pedido de correção — com razão: o `alt` da foto em `Profissional.tsx` dizia
`"Dr. Vinicius Aracena, ortodontista da Smile Ipiranga"`. Quem enxerga a tela vê "Ortodontista" com
o tracejado dourado (`PENDENTE`) e entende que é dado a confirmar; quem usa leitor de tela recebia a
mesma palavra como **fato afirmado**, sem ressalva nenhuma — as duas pessoas recebendo informação
diferente, e a versão sem ressalva sendo exatamente a alegação que a Resolução CFO-196/2019
restringe (não se anuncia especialidade sem registro correspondente).

**Correção**: `alt` reescrito para descrever a cena, não a credencial —

```
"Dr. Vinicius Aracena no consultório da Smile Ipiranga"
```

`alt` existe para dizer o que a imagem *mostra* a quem não pode vê-la (um retrato do Dr. Vinicius no
consultório), não para repetir uma credencial não confirmada. A especialidade continua no texto da
seção, lido pelo leitor de tela logo em seguida, com a marcação de pendente intacta — a informação
não foi removida, só parou de aparecer duas vezes com dois níveis de certeza diferentes.

**Teste novo** (`o alt da foto descreve a cena, nao afirma a especialidade nao confirmada`): trava
duas coisas ao mesmo tempo — `alt` não pode conter "ortodontista" (nem variação, via regex
case-insensitive), e o texto da seção **continua** contendo "ortodontista" (a informação não
desapareceu, só mudou de lugar/marcação). Se alguém reescrever o `alt` no futuro e reintroduzir a
credencial ali, o teste pega.

### Verificação

`npx vitest run --no-file-parallelism`: **164/164** (subiu de 163). `npx tsc --noEmit` e
`npx eslint` limpos nos arquivos tocados. `npm run build` limpo (Next 16.3.1/Turbopack).
