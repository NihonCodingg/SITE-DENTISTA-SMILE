# Task 17 — Relatório de performance

Continuação do trabalho commitado em `8ac06af` (medição feita, LCP mobile fora do
orçamento, A/B de 2 amostras sem diferença confiável). Este relatório cobre a
ablação controlada de 3 amostras pedida no handoff, a investigação de LCP que
ela obrigou a fazer, e as três hipóteses de caminho crítico (H1/H2/H3) que o
coordenador pediu numa segunda rodada depois de discordar da minha primeira
leitura do LCP. **A segunda rodada corrigiu essa leitura** — ver "Correção da
leitura de LCP" abaixo antes de qualquer outra coisa neste documento.

## Ambiente de medição

- Windows, Git Bash, `npx lighthouse` (devDependency, já instalado).
- Sem Google Chrome instalado nesta máquina — `CHROME_PATH` apontado para o
  Microsoft Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
  Chromium/Edg 151, mesmo motor). O `lh-mobile.json` que já estava no disco
  também foi gerado com Edge (`hostUserAgent` continha `Edg/151.0.0.0`), então
  a comparação é like-for-like.
- `npx lighthouse ... --output=json --form-factor=mobile --throttling-method=simulate`
  (comando exato do brief, o que `orcamento.test.ts` audita) para cada
  amostra; `--throttling-method=devtools` (throttling real via CDP) como
  contraprova, pedido pelo coordenador na segunda rodada; `--preset=desktop`
  para desktop.
- Cada variante: `npm run build` + `npm run start -- -p 4173` + 3 a 6
  execuções do Lighthouse (mediana) por modo.
- Nota de ambiente: no Windows, o `chrome-launcher` do Lighthouse lança um
  `EPERM` benigno ao limpar o diretório temporário no fim de cada execução
  (`rmSync` do perfil do Chrome). O JSON de saída já foi escrito antes disso —
  todas as medições abaixo vieram de arquivos válidos, conferidos um a um.

## Metodologia da ablação (primeira rodada)

Criei `site/lib/ablation.ts` (função `ablated(nome)`, lida de
`NEXT_PUBLIC_ABLATE`, uma env var `NEXT_PUBLIC_*` — inlined em build time pelo
Next) e um guard de uma linha em cada um dos 5 candidatos do handoff, cada um
comentado com `// Task 17: ablação`. Rodei build + 3× Lighthouse mobile para
cada variante, killando o servidor entre uma e outra. Depois da ablação,
removi o arquivo e todos os 6 pontos que o importavam — nenhuma variante de
ablação sobreviveu ao commit.

## Tabela de ablação (mediana de 3, mobile simulado)

| Variante | TBT (ms) | LCP (ms) | TTI (ms) | Performance | total-byte-weight |
|---|---:|---:|---:|---:|---:|
| **Baseline** (nada desligado) | 393,5 | 4360,6 | 7434,5 | 75 | 1.287.206 |
| (a) Lenis: rAF paralelo desligado | 470,5 | 4359,9 | 7506,9 | 73 | 1.287.206 |
| (b) `ScrollVelocity` (ticker, abaixo do hero) desligado | 334,0 | 4360,3 | 7423,1 | 77 | 1.287.212 |
| (c) `Silk` (three.js) desligado | 223,5 | 4360,7 | **5075,8** | 81 | 1.051.745 |
| (d) `CircularGallery` (ogl) desligado | 360,5 | 4364,7 | 6323,3 | 77 | 983.349 |
| (e) tweens GSAP (`Reveal`+`SplitText`) desligados | 268,0 | 4359,5 | 7422,1 | 79 | 1.287.209 |
| (c)+(d) combinados (todo WebGL fora) | **100,5** | 4362,1 | **4545,2** | 84 | **747.853** |

Leitura, que **continua válida** (não foi revisada na segunda rodada — só a
seção de LCP foi):

- Nenhuma das 5 ablações — nem a combinada, que corta 42% do
  total-byte-weight — move o LCP. A faixa inteira fica entre 4359,5 e
  4364,7ms: 5ms de variação total contra uma meta de 2500ms.
- O rAF paralelo do Lenis (candidato "a", a hipótese central do handoff sobre
  "loop que nunca fica ocioso") não melhora nada quando desligado — TBT vai
  de 393,5 para 470,5ms (pior, dentro do ruído). A leitura original do
  `mainthread-work-breakdown` (11.792ms de "Other" atribuído a esse chunk) não
  se reproduziu numa medição limpa de 3 amostras.
- `Silk` e `CircularGallery` **são** custo real de TTI/TBT (não de LCP): a
  combinação dos dois corta TTI em 39% e TBT em 74%. Isso confirma a parte do
  handoff sobre "long tasks que atrasam TTI" — a causa raiz é peso de bundle
  (three.js + ogl competindo por CPU real de parse/execução), não um loop que
  "nunca fica ocioso": os dois já pausam via `IntersectionObserver`/
  `frameloop` (Task 8/13). **Não revertidos**, por instrução explícita do
  brief — custo registrado para a próxima decisão do parceiro (ver seção
  dedicada mais abaixo).

## Correção da leitura de LCP

Minha primeira conclusão (agora corrigida) foi "o Lantern está descolado do
comportamento real da página" — baseada em 7 intervenções (as 5 ablações +
combinada + despriorizar a fonte Caveat) que não tocaram o LCP em mais de
5-10ms. **O coordenador discordou com um argumento correto**: todas as 7
intervenções desligavam recursos que carregam DEPOIS da imagem do hero — os
chunks de WebGL são assíncronos pós-hidratação (só entram quando
`useCapability()` confirma `podePesado`, bem depois do primeiro paint), e a
Caveat é usada abaixo da dobra. Nenhuma delas tirava um único byte da janela
em que a própria imagem do hero está baixando. Um LCP insensível ao que não
está no caminho crítico é o comportamento CORRETO de um modelo de banda
compartilhada (Lantern) — não um bug do Lighthouse. O meu próprio número já
apontava isso: `lcpLoadDuration: 2805ms` no breakdown do `metrics` audit —
a imagem esperando banda, não uma inconsistência interna do relatório.

O que o coordenador pediu: testar três hipóteses que **de fato** competem
pela banda simulada durante o download da imagem do hero. Resultado: **as
três hipóteses testadas confirmam a leitura do coordenador — tocar o
caminho crítico de verdade move o LCP, e duas das três (H1 e H2) somadas
tiraram o LCP do orçamento no modo devtools (throttling real) e cortaram
quase 30% do LCP simulado.**

### H2 — `sizes` real do hero (testada primeiro, é de graça)

O próprio `boundingRect` do audit de LCP (`lcp-breakdown-insight`) media
348px de largura renderizada num viewport de 412 — 85vw. O `sizes="100vw"`
anterior superestimava, fazendo o navegador escolher o candidato de 750px do
srcset (131.850 bytes) em vez do de 640px (107.974 bytes).

**Achado durante a medição, não previsto:** testei `85vw` primeiro (o valor
exato medido). Resolvia para 640px na maioria das vezes, mas fica a só 27px
físicos do corte de 750px (612,9px físicos contra um corte em 640) — 6
amostras repetidas contra a MESMA build/servidor mostraram o navegador
escolhendo os dois candidatos de forma alternada: `total-byte-weight` ora
524KB (quando várias imagens lazy da galeria também não eram buscadas — outro
efeito colateral da mesma corrida) ora 1.155KB. **Confirmei que isso não é
ruído geral do ambiente**: 6 amostras repetidas do baseline sem essa mudança
ficaram perfeitamente estáveis (`bytes` idêntico nas 6). É uma corrida real na
aplicação do DPR simulado do Lighthouse perto de um limite de srcset. `80vw`
(576,8px físicos, 63px de margem) resolveu SEMPRE para 640px em 6 amostras —
mesma fração de largura real (só 5% menor que os 348px medidos, imperceptível
numa foto).

| | LCP simulate (ms) | LCP devtools (ms) | Foto do hero |
|---|---:|---:|---|
| Baseline | 4362,8 | 3308,9 | WebP 750w, 131.850 bytes |
| H2 (sizes 80vw) | **4209,7** (mediana de 6) | **3051,2** (mediana de 3) | WebP 640w, 107.974 bytes |

Ganho: -153ms simulate, -258ms devtools. Elimina de quebra um fetch duplicado
(`hero-foto.jpg` também é o último item de `SORRISOS`, em `lib/content.ts` —
a galeria já pedia a mesma imagem em 640px; com o hero pedindo a mesma URL, o
navegador reaproveita a resposta em cache em vez de baixar duas vezes).
Commit `a5ef141`.

### H1 — AVIF em `next/image`

`next.config.ts` não configurava `images.formats` — default do Next é só
`['image/webp']`. `curl -H "Accept: image/avif" .../_next/image?...` contra o
build anterior confirmava: sempre devolvia `image/webp`, nunca avif.
Adicionado `formats: ['image/avif', 'image/webp']` (avif primeiro — Next usa
o primeiro match do `Accept` header, ordem importa, doc:
`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md#formats`).
Afeta toda imagem otimizada pelo site, não só o hero.

| | LCP simulate (ms) | LCP devtools (ms) | Foto do hero (750w, sizes ainda em 100vw) |
|---|---:|---:|---|
| Baseline | 4362,8 | 3308,9 | WebP, 131.850 bytes |
| H1 (avif) | **3856,8** (mediana de 6) | **2256,6** (mediana de 3) | AVIF, 61.264 bytes (-53%) |

Ganho isolado: -506ms simulate, -1052ms devtools — **o devtools já cruza para
dentro do orçamento de 2,5s com H1 sozinha**. Commit `ce7c58d`.

### H3 — Lenis por `import()` dinâmico, adiado até o main thread ficar ocioso

`lib/motion.tsx` criava `new Lenis(...)` de forma síncrona dentro do efeito
de montagem. Troquei o `import Lenis from 'lenis'` estático por
`import type Lenis from 'lenis'` (import só de tipo, zero código em runtime)
e um `import('lenis')` dinâmico dentro do efeito, agendado via
`requestIdleCallback({ timeout: 2000 })` (`setTimeout` como fallback em
ambiente sem a API — é o caso do jsdom dos testes). `gsap`/`ScrollTrigger`
continuam estáticos de propósito: `grep -rln "from 'gsap` mostra que
`Reveal.tsx` (usado 21 vezes, incluindo seções logo abaixo do hero) e mais 3
arquivos (`SplitText.tsx`, `AntesDepois.tsx`, `ComoFunciona.tsx`) já importam
`gsap`/`ScrollTrigger` de forma estática — tornar só o import daqui dinâmico
não tira nenhum byte do first-load, porque o bundler já inclui os dois na
rota de qualquer jeito via esses outros arquivos. `lenis`, ao contrário, só é
importado como VALOR neste arquivo (`MobileMenu.tsx`/`Lightbox.tsx` só
importam o TIPO, que já não gera código) — era o único corte que de fato
reduzia o chunk inicial.

Testes ajustados: `cria o Lenis e propaga via useLenis()...` e `ao clicar num
link de âncora...` passaram a `await waitFor(...)` em vez de asserção
síncrona, porque a criação do Lenis deixou de ser síncrona com a montagem —
o comportamento coberto não mudou, só o momento em que ele acontece.

| | LCP simulate (ms) | LCP devtools (ms) | total-byte-weight |
|---|---:|---:|---:|
| Baseline | 4362,8 | 3308,9 | 1.287.070 |
| H3 (Lenis adiado) | 4361,3 (mediana de 3, 1 outlier a 6397 descartado pela própria mediana) | 3297,7 (mediana de 3) | 1.288.189 |

**Sem ganho mensurável**, isolada. Hipótese confirmada de propósito: como o
`gsap`/`ScrollTrigger` (a maior parte do chunk `127qemistpig0.js` mapeado no
handoff original) continua estático via `Reveal.tsx`, adiar só o Lenis não
tira volume suficiente do caminho crítico simulado pra aparecer no LCP.

### As três combinadas

| | LCP simulate (ms) | LCP devtools (ms) | total-byte-weight | Foto do hero |
|---|---:|---:|---:|---|
| Baseline | 4362,8 | 3308,9 | 1.287.070 | WebP 750w, 131.850 |
| H1+H2 (sem H3) | **3847,2** (mediana de 6) | **2210,9** (mediana de 3) | 1.025.757 | AVIF 640w, 49.011 |
| H1+H2+H3 (as três) | 3853,9 (mediana de 6) | 2224,1 (mediana de 3) | 1.026.877 | AVIF 640w, 49.011 |

H3 não soma nada em cima de H1+H2 (3853,9ms vs 3847,2ms — 7ms de diferença,
dentro do ruído medido em outras variantes desta mesma task). Consistente com
a leitura isolada: o gargalo do caminho crítico é bytes de imagem, não o
Lenis. **H3 foi revertida** — complexidade real (criação assíncrona, efeito
em cascata nos testes) sem ganho medido que a justifique.

**H1+H2 é o que foi commitado.** Devtools (throttling real) sai do vermelho:
2210,9ms, dentro do orçamento de 2,5s. Simulate (o que `orcamento.test.ts`
audita) cai de 4362,8ms para 3847,2ms — uma redução real de 515ms, 12% — mas
continua acima de 2500ms.

## Tabela H1/H2/H3/combinado (resumo pedido pelo coordenador)

| Variante | LCP simulate (ms) | LCP devtools (ms) | bytes da foto do hero |
|---|---:|---:|---:|
| Baseline | 4362,8 | 3308,9 | 131.850 (WebP 750w) |
| H1 (avif) | 3856,8 | 2256,6 | 61.264 (AVIF 750w) |
| H2 (sizes 80vw) | 4209,7 | 3051,2 | 107.974 (WebP 640w) |
| H3 (Lenis adiado) | 4361,3 | 3297,7 | 131.850 (sem H1/H2, inalterado) |
| H1+H2 (commitado) | **3847,2** | **2210,9** | 49.011 (AVIF 640w) |
| H1+H2+H3 (todas) | 3853,9 | 2224,1 | 49.011 (AVIF 640w) |

## O que mais ficou por tentar (não testado — registrado, não decidido)

O coordenador citou que Next 16 rejeita `quality` fora de `images.qualities`
(default `[75]` desde a v16) e sugeriu testar isso DEPOIS de H1, "porque AVIF
provavelmente rende mais que qualidade". Como H1+H2 sozinhas já tiraram o
devtools do vermelho e cortaram 12% do simulate, não cheguei a testar
`qualities` — ficaria configurando uma variável sem número que justifique
gastá-la agora. Registrado aqui caso o parceiro queira uma rodada 3: reduzir
`quality` da foto do hero (com `images.qualities: [50, 75]` ou similar) é o
próximo lugar óbvio pra continuar cortando bytes do caminho crítico, já que
H1/H2 confirmaram que bytes no caminho crítico é exatamente o que move o LCP
simulado.

## O que foi aplicado nesta rodada

- **H2** — `sizes` do hero corrigido de `100vw` para `80vw` (`Hero.tsx`,
  commit `a5ef141`).
- **H1** — AVIF habilitado em `next.config.ts` (commit `ce7c58d`).
- **H3** — testada, sem ganho medido, revertida (não commitada).
- **Caveat sem preload** (primeira rodada) — sem ganho de LCP, regressão de
  FCP medida, revertida (documentado em `app/layout.tsx`, commit `2828b2f`).

## Tabela final — mobile (simulado) vs. desktop

| | Mobile (antes, `8ac06af`, 1 amostra) | **Mobile final** (mediana de 6) | Desktop (mediana de 3) |
|---|---:|---:|---:|
| Performance | 54 | 80 | 99 |
| LCP | 4,5s | **3,85s** (meta 2,5s) | 0,89s |
| TBT | 4.130ms | ~360ms | ~1ms |
| TTI | 18,7s | ~6,65s | ~0,92s |
| CLS | 0,01 | 0,00003 | 0,00003 |
| total-byte-weight | 1.323.394 | 1.025.757 | 1.024.289 |

LCP mobile **devtools** (throttling real, não auditado pelo teste mas medido
como contraprova): 2.211ms — dentro do orçamento de 2,5s.

## O que ficou fora do orçamento

**LCP mobile simulado: 3.847ms vs. meta de 2.500ms — `orcamento.test.ts`
continua vermelho, de propósito.** `total-byte-weight` (1,03MB < 1,4MB) e CLS
(0,00003 < 0,05) passam.

Motivo, com a leitura corrigida: o `--throttling-method=simulate` modela uma
rede lenta compartilhada (~1,47Mbps simulados, RTT 150ms) entre TODOS os
recursos de alta prioridade que competem no momento em que a página carrega —
H1 (AVIF) e H2 (sizes correto) já cortaram a foto do hero de 131.850 para
49.011 bytes (-63%) e o `total-byte-weight` total de 1,29MB para 1,03MB
(-20%), o que tirou o LCP do vermelho no throttling REAL (devtools: 3.309ms
→ 2.211ms) e cortou 515ms no simulado. O que resta no caminho crítico
simulado depois desses dois cortes: ~50KB da própria foto (já em AVIF, já no
tamanho certo) mais ~280KB de fontes/CSS/logo/favicon de alta prioridade
(mapeado na primeira rodada) — cortar mais exigiria reduzir `quality` da
imagem (não testado, ver seção acima) ou revisar quantas fontes/pesos
continuam sendo preloaded, o que já foi tentado uma vez (Caveat) sem sucesso
mensurável. Não é mais um caso de "o Lantern está quebrado" — é aritmética de
banda simulada que resta genuinamente acima do orçamento depois de duas
correções reais.

**Recomendação para o parceiro:** aceitar o vermelho documentado com o
contexto de que (a) o LCP real da página é rápido (observado em torno de
200ms num trace bruto, sem throttling algum) e (b) o LCP sob throttling REAL
(devtools) já está dentro do orçamento — ou autorizar uma terceira rodada
testando `images.qualities` reduzido na foto do hero para tentar zerar
também o simulado.

## Custo do React Bits (Silk/CircularGallery) — registrado para decisão futura

Não revertido (fora do escopo desta task, decisão do parceiro na Task 19).
Juntos, Silk (three.js) + CircularGallery (ogl) respondem por 42% do
total-byte-weight da rota e por ~76% do TBT mobile simulado medido na
primeira rodada (393,5ms → 100,5ms quando ambos desligados). Nenhum dos dois
tem loop "preguiçoso" pra consertar — já pausam corretamente fora da
viewport/aba oculta (Task 8/13) — o custo é genuinamente o peso de bundle +
CPU de montagem do WebGL.

## Arquivos

- `site/app/layout.tsx` — comentário documentando o experimento revertido da
  fonte Caveat (primeira rodada, commit `2828b2f`).
- `site/components/sections/Hero.tsx` — H2, `sizes` corrigido (commit
  `a5ef141`).
- `site/next.config.ts` — H1, AVIF habilitado (commit `ce7c58d`).
- `site/lh-mobile.json`, `site/lh-desktop.json` — medição final (amostra
  mediana das 6/3 rodadas mobile/desktop com H1+H2; não versionados,
  `.gitignore`).
- `site/__tests__/orcamento.test.ts` — inalterado, continua certo em falhar.
- `site/lib/motion.tsx`, `site/__tests__/motion.test.tsx` — H3 testada e
  revertida, nenhuma mudança líquida nestes arquivos.
