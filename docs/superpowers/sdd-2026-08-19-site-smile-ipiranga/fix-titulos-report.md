# Fix: `<h2>` de seção renderizando a 16px (bug site-wide)

## O bug

`site/components/ui/SectionHeading.tsx` não definia nenhum tamanho de fonte no
`<Tag>` do título. Só a Hero (`as="h1"`) escapava disso porque sempre passou
`tituloClassName` com um `clamp()` próprio. As outras nove seções usam (ou
deveriam usar) o `<h2>` default do componente, sem tamanho — e o preflight do
Tailwind v4 zera o `font-size` nativo de heading, então o `<h2>` renderizava
do mesmo tamanho do corpo do texto (~16px).

Duas seções (`AntesDepois`, `ComoFunciona`) e outras duas (`Faq`, `CtaFinal`)
nem passam por `SectionHeading` — usam `<Reveal as="h2">`/`<h2>` cru com as
mesmas classes copiadas à mão, também sem tamanho. `Tratamentos.tsx` não tem
`<h2>` nenhum (confirmado abaixo).

Os comentários já existentes em `Faq.tsx`, `CtaFinal.tsx` e `Localizacao.tsx`
documentavam o bug como decisão deliberada ("o conserto é único, para o site
inteiro" / "task-15-report.md") — o bug foi identificado em reviews
anteriores mas nunca corrigido de fato, só descrito.

## A correção

### Onde o default mora, e por quê

`SectionHeading.tsx` agora exporta dois valores:

```ts
export const TITULO_TAMANHO_PADRAO = 'text-[clamp(28px,4.5vw,48px)]';
export const TITULO_TRACKING = 'tracking-[-0.01em]';
```

`clamp(28px,4.5vw,48px)` vira o **default do componente**: todo
`SectionHeading` que não passa `tituloClassName` cai nele automaticamente.
Escolhido como default porque é o valor que mais se repete na tabela do
design aprovado (5 de 9 seções com `<h2>`: Clínica, Depoimentos, Antes e
Depois, Como Funciona, Localização).

**Justificativa da escolha (default no componente, não em cada seção):** a
causa raiz do bug foi justamente uma seção nova (todas as nove, na prática)
nascer sem passar tamanho — nenhuma delas define isso, e nada barrava esse
esquecimento. Fazer o `SectionHeading` cair num tamanho de destaque por
padrão, em vez de depender de cada seção lembrar de passar
`tituloClassName`, inverte o modo de falha: agora é preciso um passo
**explícito** (`tituloClassName`) para *desviar* do default, e esquecer o
tamanho não é mais possível — a seção sai sempre com um heading de verdade,
nunca com o tamanho do corpo herdado. Isso é estritamente melhor do que
"documentar a convenção e confiar que a próxima seção vai lembrar", que é o
que já existia (nos comentários) e não impediu o bug.

`tituloClassName`, quando passado, **sobrepõe** o default por inteiro
(`tituloClassName ?? TITULO_TAMANHO_PADRAO` — nunca soma as duas classes de
`font-size` na mesma cascata, o que teria resultado imprevisível dependendo
da ordem de geração do CSS do Tailwind). Usado pelas quatro exceções da
tabela:

| Seção | Tamanho do `<h2>` | Como |
|---|---|---|
| A Clínica | `clamp(28px,4.5vw,48px)` | default (sem `tituloClassName`) |
| Sorrisos | `clamp(28px,4.5vw,52px)` | `tituloClassName` explícito |
| O Profissional | `clamp(28px,4vw,44px)` | `tituloClassName` explícito |
| Depoimentos | `clamp(28px,4.5vw,48px)` | default |
| Antes e Depois | `clamp(28px,4.5vw,48px)` | `TITULO_TAMANHO_PADRAO` importado (h2 cru) |
| Como Funciona | `clamp(28px,4.5vw,48px)` | `TITULO_TAMANHO_PADRAO` importado (h2 cru) |
| Localização | `clamp(28px,4.5vw,48px)` | default |
| FAQ | `clamp(26px,4vw,40px)` | classe própria (h2 cru) |
| CTA Final | `clamp(32px,5.5vw,64px)` | classe própria (h2 cru) |
| Tratamentos | `clamp(28px,4.5vw,52px)` | **N/A — sem `<h2>` na seção, ver abaixo** |

`AntesDepois.tsx` e `ComoFunciona.tsx` usam exatamente o valor default
(48px) — em vez de repetir o literal `text-[clamp(28px,4.5vw,48px)]` como
uma segunda cópia (o mesmo tipo de duplicação que já causava risco de
divergência no projeto, ver `PENDENTE` em `Profissional.tsx` e
`Z_INDEX_BLUR_BORDA` em `Depoimentos.tsx`), elas importam
`TITULO_TAMANHO_PADRAO`/`TITULO_TRACKING` de `SectionHeading.tsx`. Único
lugar de verdade.

`Faq.tsx` e `CtaFinal.tsx` precisam de valores próprios (40 e 64), então
levam sua própria classe `text-[clamp(...)]` inline — mas ainda importam
`TITULO_TRACKING` em vez de repetir o literal de letter-spacing.

### Letter-spacing

`TITULO_TRACKING = 'tracking-[-0.01em]'` é aplicado a todo `<h2>` (dentro do
`SectionHeading` quando `Tag === 'h2'`, e explicitamente nos quatro `<h2>`
crus). **Não** é aplicado ao `<h1>` da Hero — o `Tag === 'h2'` dentro de
`SectionHeading` exclui esse caso de propósito, porque o requisito
("`<h1>` não pode ter mudado") é sobre o elemento medido no navegador, e
letter-spacing era território não coberto pela tabela do design (que só
especifica tamanho e tracking para os `<h2>`).

### Tratamentos — nada para corrigir

`site/components/sections/Tratamentos.tsx` não renderiza `<h2>` nenhum — é
uma lista de linhas de tratamento (cada uma um link), sem título de seção
próprio; o título "Tratamentos" só existe como rótulo de navegação no Header
(`#tratamentos`) e no texto do Ticker logo acima. Confirmado por leitura do
componente inteiro e por `__tests__/tratamentos.test.tsx` (nenhuma
verificação de heading). O valor `clamp(28px,4.5vw,52px)` da tabela não se
aplica a nenhum elemento existente hoje — nada foi alterado aqui. Se o
design realmente pretende um `<h2>` visível nessa seção, é uma mudança de
conteúdo/estrutura, fora do escopo deste conserto de bug visual.

## Teste de regressão

Novo arquivo: `site/__tests__/titulos-tamanho.test.tsx`.

jsdom não resolve `clamp()` em `getComputedStyle` (sem layout real), então o
teste não mede `fontSize` — ele verifica, por seção, que todo `<h2>`
renderizado carrega uma classe `text-[clamp(...)]` (regex
`/text-\[clamp\(/`) e a classe `tracking-[-0.01em]`. Cobre as nove seções
com `<h2>` (Clinica, Sorrisos, Profissional, Depoimentos, AntesDepois,
ComoFunciona, Localizacao, Faq, CtaFinal) e confirma separadamente que o
`<h1>` da Hero mantém seu próprio `clamp(42px,7.6vw,104px)`.

Isso trava exatamente o modo de falha do bug original: uma seção nova que
renderize `<h2>` sem `tituloClassName` (e sem herdar o default do
`SectionHeading` — ex.: um `<h2>` cru copiado à mão, sem importar as
constantes) fica sem a classe `text-[clamp(...)]` na `className`, e o teste
falha.

**Prova por quebra proposital:** removida temporariamente a classe
`text-[clamp(26px,4vw,40px)]` do `<h2>` da FAQ → rodado
`npx vitest run --no-file-parallelism __tests__/titulos-tamanho.test.tsx` →
falhou exatamente o teste da seção Faq (as outras oito continuaram verdes,
prova de que o teste é específico por seção, não um falso-positivo global) →
classe restaurada → suíte completa voltou a 187/187.

## Verificação no navegador

Dev server em `http://localhost:4500` (já rodando, reaproveitado — nenhuma
mudança em `.claude/launch.json`).

Medido com:
```js
[...document.querySelectorAll('h1,h2')].map(h => ({t: h.textContent.trim().slice(0,30), s: getComputedStyle(h).fontSize}))
```

**1280px** (clamp perto do teto — `vw` já ultrapassa o valor máximo de cada
`clamp`, então o navegador aplica o teto):
```
Seu novo sorriso começa aqui        97.28px   (h1 — clamp(42,7.6vw,104), não mudou)
Um lugar onde dá vontade de se...   48px      (Clínica)
Sorrisos feitos aqui                52px      (Sorrisos)
Dr. Vinicius Aracena                44px      (Profissional)
As histórias valem mais do que...   48px      (Depoimentos)
Resultados reais                    48px      (Antes e Depois)
Da primeira mensagem ao seu tr...   48px      (Como Funciona)
No coração do Ipiranga              48px      (Localização)
Perguntas frequentes                40px      (FAQ)
Vamos cuidar do seu sorriso?        64px      (CTA Final)
```

**375px** (clamp no piso — `vw` fica abaixo do mínimo, o navegador aplica o
piso):
```
Seu novo sorriso começa aqui        42px      (h1 — piso do próprio clamp)
Um lugar onde dá vontade de se...   28px
Sorrisos feitos aqui                28px
Dr. Vinicius Aracena                28px
As histórias valem mais do que...   28px
Resultados reais                    28px
Da primeira mensagem ao seu tr...   28px
No coração do Ipiranga              28px
Perguntas frequentes                26px
Vamos cuidar do seu sorriso?        32px
```

Todo `<h2>` ficou muito acima dos 16px do bug (mínimo observado: 26px, no
piso mobile da FAQ). O `<h1>` da Hero bate exatamente com o próprio `clamp`
nos dois viewports — não foi afetado pelo default novo.

Console do navegador sem erros (`read_console_messages`, `onlyErrors: true`
→ vazio). `get_page_text` confirma que a página inteira renderiza (todas as
seções, do Hero ao rodapé) sem quebra de conteúdo.

**Screenshot: não foi possível.** O Browser pane não compositou frame
nenhum nesta sessão — toda chamada a `computer{action:"screenshot"}` (e
`zoom`) retornou "Screenshot timed out... the Browser pane is not
displayed", mesmo após frontar a aba e esperar. Tentado várias vezes, sem
sucesso. A verificação visual de hierarquia ficou limitada às medições
numéricas de `getComputedStyle` acima (que são determinísticas e cobrem os
dois viewports pedidos) — não há confirmação visual direta de que "o título
domina a seção" além do que os números de tamanho já implicam.

## Testes

`npx vitest run --no-file-parallelism` (dentro de `site/`): **21 arquivos,
187 testes, todos passando** — incluindo os 10 novos testes de
`titulos-tamanho.test.tsx`. `npx tsc --noEmit` limpo. `npx eslint .` limpo.

## Arquivos alterados

- `site/components/ui/SectionHeading.tsx` — default de tamanho + tracking, exportados
- `site/components/sections/Sorrisos.tsx` — `tituloClassName` (52px)
- `site/components/sections/Profissional.tsx` — `tituloClassName` (44px)
- `site/components/sections/Localizacao.tsx` — comentário atualizado (usa o default, sem mudança de classe)
- `site/components/sections/AntesDepois.tsx` — importa e aplica o default (48px) + tracking
- `site/components/sections/ComoFunciona.tsx` — importa e aplica o default (48px) + tracking
- `site/components/sections/Faq.tsx` — classe própria (40px) + tracking importado
- `site/components/sections/CtaFinal.tsx` — classe própria (64px) + tracking importado
- `site/__tests__/titulos-tamanho.test.tsx` — novo teste de regressão

---

## Adendo: bloco de título de Tratamentos (esquecido na Task 10)

Coordenador apontou, depois do commit acima, que `Tratamentos.tsx` não tinha
`<h2>` porque o bloco de título inteiro (COPY.md §4) nunca foi escrito na
Task 10 — não era decisão de design, era conteúdo aprovado esquecido, e
nenhuma review pegou.

### Correção

`site/components/sections/Tratamentos.tsx` ganhou, acima da lista de linhas,
um `<Reveal>` com `SectionHeading` (`tituloClassName="max-w-[16ch]
text-[clamp(28px,4.5vw,52px)]"`, 52px porque difere do default de 48px) mais
o parágrafo de intro (`max-w-[62ch] text-[17px] text-grafite`). Texto copiado
exatamente de `COPY.md` §4, sem reescrever nenhuma palavra:

- Sobretítulo: "O que fazemos"
- Título: "Soluções que transformam sorrisos"
- Intro: "Cada caso começa com uma avaliação. A partir dela, montamos o
  plano de tratamento que faz sentido para a sua boca, sua rotina e o seu
  orçamento."

### Teste de regressão

`__tests__/tratamentos.test.tsx` ganhou um teste que afirma a presença do
sobretítulo, do `<h2>` (via `getByRole('heading', {level:2, name: ...})`) e
do parágrafo de intro — se alguém remover o bloco de novo, quebra. Também
adicionei `Tratamentos` ao array de seções de
`__tests__/titulos-tamanho.test.tsx` (o teste de tamanho site-wide já
existente), já que agora tem um `<h2>` de verdade sujeito à mesma regra de
tamanho/tracking das outras nove seções. Suíte completa:
`npx vitest run --no-file-parallelism` → **21 arquivos, 189 testes, todos
passando**. `tsc --noEmit` e `eslint .` limpos.

### Verificação no navegador

`document.body.innerText` inicialmente pareceu não conter "Soluções que
transformam sorrisos" nem "O que fazemos" — investigado: **não é bug**,
`innerText` reflete o `text-transform: uppercase` do CSS (mesma classe
`uppercase` que todo `<h2>`/sobretítulo do site já usa), então o texto
renderizado aparece como "SOLUÇÕES QUE TRANSFORMAM SORRISOS" e "O QUE
FAZEMOS" em `innerText`; `textContent` (e uma comparação case-insensitive)
confirmam os três textos presentes. `getComputedStyle` do `<h2>` mostrou
`fontSize: 43.56px` na viewport da sessão (968px), dentro do
`clamp(28px,4.5vw,52px)` esperado.

## Investigação: Reveals presos em opacity:0 depois de pular pra âncora

**Resposta curta: é bug de verdade, não artefato do salto de scroll — mas a
medida exata de "quantas linhas ficam presas" que eu observei foi provavelmente
amplificada por uma limitação do meu ambiente de teste (painel sem
compositar frames), então o efeito real em produção é provavelmente mais
parecido com o que você viu no seu screenshot (só as últimas 1-2 linhas)
do que com o que eu medi aqui (a lista inteira presa).**

### O que eu confirmei no código (isso não depende do ambiente de teste)

`site/lib/motion.tsx` intercepta cliques em `<a href="#...">` (`aoClicarAncora`,
`document.addEventListener('click', ...)`) e delega para `lenis.scrollTo()` —
mas isso só cobre clique DENTRO da própria página. Uma navegação direta para
uma URL que já chega com hash (link externo tipo bio do Instagram, aba
recarregada com `#tratamentos` na barra de endereço, back/forward do
navegador) dispara o salto nativo do PRÓPRIO navegador para o elemento —
instantâneo (ou suavizado só pelo `scroll-behavior: smooth` do
`app/globals.css`) — e isso não passa pelo listener de clique nenhum. O
Lenis nem chega a saber que a página pulou.

Busquei `ScrollTrigger.refresh()`, `location.hash` e `ScrollTrigger.config`
em todo `app/`, `components/` e `lib/`: **zero ocorrências**. Não existe
nenhum código que reaja a "a página carregou já rolada para um hash" — nem
recalculando as posições de trigger do ScrollTrigger contra o layout final,
nem forçando os triggers já dentro da zona visível a disparar.

Isso bate com sua suspeita: cada `<Reveal>` cria seu próprio
`ScrollTrigger` (`start: 'top 88%', once: true`) no `useEffect` de
montagem, com a posição de disparo calculada em pixels de documento naquele
instante. Se o salto nativo de âncora acontece antes (ou durante) esse
cálculo — antes de fontes/imagens terminarem de assentar o layout final —
os `ScrollTrigger` calculam a posição errada, e como ninguém chama
`.refresh()` depois que tudo se estabiliza, eles nunca se corrigem.

### O que eu medi no navegador (com a ressalva do ambiente)

Fui em `http://localhost:4500/#tratamentos` (nova navegação, sem clique) e
1280×900: `scrollY` chegou em 1357–1662 (o salto nativo aconteceu), mas
**todas as 7 linhas de tratamento** continuaram com `opacity: 0` no wrapper
do `<Reveal>` — inclusive linhas cujo `top` já estava bem acima do limiar de
disparo (`top 88%` = 792px; linha 0 "Facetas" com `top: 113px` depois de
scroll adicional, por exemplo). Tentei destravar com `window.scrollBy`/
`window.scrollTo` adicionais (simulando o usuário continuar rolando) — as
linhas continuaram presas em opacity 0 mesmo bem depois de passarem do
limiar, o que indica que não é só "ainda não chegou lá", é realmente preso.

**A ressalva:** o Browser pane desta sessão nunca compositou frame nenhum
(toda chamada a `screenshot`/`zoom` falhou com "the page is not
compositing frames" — mesmo erro relatado na seção de screenshot acima).
Isso é suspeito porque o loop do Lenis é 100% `requestAnimationFrame`
(`lib/motion.tsx`, `raf.current = requestAnimationFrame(loop)`), e
`rAF` costuma ser pausado/throttled em abas que não estão de fato
renderizando quadros — o que explicaria por que MESMO scroll programático
adicional nunca destravou nada aqui (o relay `lenis.on('scroll',
ScrollTrigger.update)` depende desse loop rodando). Um evento sintético de
`wheel` que disparei via `dispatchEvent` também não moveu `scrollY` nem um
pixel, reforçando que o Lenis não estava processando nada nesta sessão
específica — headless/não-compositado, não necessariamente o comportamento
real numa aba visível de verdade.

Por isso não confio no número exato (7 de 7 linhas presas) como o
tamanho real do bug em produção — mas confio na CAUSA (nenhum
`ScrollTrigger.refresh()` depois de um salto de âncora nativo, listener de
clique não cobre navegação direta com hash), que é verificável só lendo o
código, sem depender do navegador. O seu screenshot (que aparentemente
compositou normalmente) mostrando só Ortodontia/Limpeza — as últimas duas,
mais perto da dobra no momento do pouso — é o retrato mais confiável do
tamanho real do problema: provavelmente linhas cujo limiar de disparo cai
muito perto de onde o salto de âncora pousa a página, não a lista inteira.

### Sugestão de correção (não aplicada — só reportando)

Provavelmente dois pontos, não um só:
1. Depois que o Lenis termina um `scrollTo()` disparado por clique
   (`aoClicarAncora`), chamar `ScrollTrigger.refresh()` — Lenis aceita
   callback `onComplete` em `scrollTo()`.
2. Para o caso que o clique não cobre (URL que já chega com hash): no efeito
   de `MotionProvider`, depois de criar o Lenis, checar `location.hash` e
   agendar um `ScrollTrigger.refresh()` (ex.: `window.addEventListener('load',
   () => ScrollTrigger.refresh())`, ou um `requestAnimationFrame` depois do
   salto nativo assentar) para recalcular as posições contra o layout final
   e destravar qualquer trigger que já devesse estar ativo.

Não apliquei nada disso agora, conforme pedido — deixo para você decidir
onde encaixar.

---

## Adendo: correção aplicada — Reveals presos em opacity:0 na âncora

Aplicadas as duas pontas propostas acima, em `site/lib/motion.tsx`.

### 1. Depois do `lenis.scrollTo()` do clique

`aoClicarAncora` agora passa `onComplete: () => ScrollTrigger.refresh()` nas
opções do `l.scrollTo(href, {...})` — callback do próprio Lenis, não
`setTimeout`. Só roda quando o scroll suave de fato termina.

### 2. Na montagem, se `location.hash` já existir

Nova função exportada `esperarLayoutAssentar()`:
1. `await document.fonts?.ready` — sinal real de layout de texto assentado
   (não um timeout chutado). Ambiente sem a API cai no `catch` e segue.
2. Depois, tenta `decode()` nas `<img>` já dentro da viewport no momento do
   salto — **com teto de 500ms** (`Promise.race` contra um `setTimeout`).

O teto de 500ms não estava no plano original — foi descoberto em navegador
real, não teórico (ver "O que quase deu errado" abaixo). Chamado no `useEffect`
de `MotionProvider`, só quando `location.hash` existe, com uma flag
`cancelado` fechada no cleanup do efeito (cobre StrictMode e
`podeAnimar` mudando de true pra false com a promise ainda pendente). Todo
o bloco novo — clique e hash — vive dentro do mesmo `if (!montado ||
!podeAnimar) return;` que já protegia o efeito inteiro: sem Lenis nem
`gsap.registerPlugin(ScrollTrigger)` daquele branch, nada do código novo
roda, sem risco de estourar.

### O que quase deu errado: `img.decode()` pode nunca resolver

A primeira versão do `esperarLayoutAssentar()` esperava
`Promise.all(imgs.map(img => img.decode()))` sem teto. Testado em navegador
real (não no jsdom dos testes): `<Image loading="lazy">` do next/image, para
uma imagem que o navegador ainda não começou a buscar (`complete:false`,
`naturalWidth:0`), fica **mais de 2 segundos sem resolver nem rejeitar** o
`decode()` — medido diretamente, não suposição. Sem teto, isso reintroduziria
o próprio bug (silenciosamente: nenhum erro, só o `refresh()` nunca
acontecendo). Corrigido com `Promise.race([Promise.all(decodes), timeout de
500ms])` — 500ms é folga generosa pra imagens já carregadas/cacheadas
resolverem rápido, sem bloquear o caso lazy que não resolve. Justificativa
de segurança: toda `<Image>` do site fica dentro de uma caixa de
aspect-ratio fixo (`aspect-square`/`fill`), então a posição dos
`ScrollTrigger` já está correta mesmo sem a imagem ter terminado de
decodificar — o `decode()` é reforço, nunca pré-condição real.

### `once: true` não reanima do zero — confirmado

Preocupação do pedido: um `refresh()` faria um trigger JÁ disparado voltar a
rodar a animação do início? Não. `ScrollTrigger.getAll().length` antes e
depois do `refresh()` mostrou a mesma contagem (as seções acima da
dobra que já tinham disparado e se auto-mataram — `once:true` mata o
trigger após disparar — não reaparecem na lista); e nenhuma seção já visível
antes do salto piscou/reiniciou durante os testes abaixo.

### Prova por quebra proposital (a parte determinística — testes automatizados)

`__tests__/motion.test.tsx` ganhou um novo `describe` com 3 testes, cada um
espionando `ScrollTrigger.refresh` (`vi.spyOn`):

1. Com `window.location.hash = '#tratamentos'` antes de montar, o refresh é
   chamado (`waitFor`).
2. Sem hash, o refresh **não** é chamado (espera real de 80ms, depois
   `expect(...).not.toHaveBeenCalled()`).
3. Ao simular um clique num link de âncora (com `Lenis.prototype.scrollTo`
   mockado pra invocar `onComplete` na hora), o refresh é chamado.

Quebra proposital, uma de cada vez, restaurando depois:
- Troquei o guard `if (typeof location !== 'undefined' && location.hash)`
  por `if (false && ...)` → só o teste 1 falhou (`expected "Mock" to be
  called at least once`) → restaurado.
- Troquei o mesmo guard por `if (true || ...)` (sempre entra) → só o teste 2
  falhou (`expected "Mock" to not be called at all, but actually been
  called 1 times`) → restaurado.
- Troquei `onComplete: () => ScrollTrigger.refresh()` por `onComplete: () =>
  {}` → só o teste 3 falhou → restaurado.

Suíte completa depois de restaurar tudo: `npx vitest run
--no-file-parallelism` → **21 arquivos, 192 testes, todos passando**.
`tsc --noEmit` e `eslint .` limpos.

### Prova no navegador — carregamento direto em `/#tratamentos`, `/#depoimentos`, `/#localizacao`

Confirmado o mesmo problema desta sessão que eu já suspeitava no relatório
anterior: `document.visibilityState` da aba deste Browser pane fica `"hidden"` (e
`requestAnimationFrame` nunca dispara — medido: 0 ticks em 2000ms, num loop
que deveria ter rodado ~120 vezes a 60fps) mesmo depois de `tabs_select`
frontar a aba. Isso derruba TANTO o loop do Lenis quanto o ticker do GSAP —
nenhuma animação (nem a minha, nem qualquer outra do site) consegue
renderizar visualmente nesta sessão especificamente, é limitação do
ambiente, não do código (mesma causa-raiz do screenshot que já não
compositava nas mensagens anteriores).

Pra contornar e mesmo assim provar o mecanismo, expus temporariamente
`window.__gsap = gsap` e `window.__ST = ScrollTrigger` (só durante a
investigação — removido antes do commit, `grep` confirma zero ocorrências
de `__gsap`/`__ST`/`console.log` de debug no arquivo final) e forcei
`gsap.ticker.tick()` manualmente num loop com pequenos `await
setTimeout`, simulando os frames que o navegador real geraria sozinho. Isso
não simula scroll nem clique — só prova que, uma vez que meu `refresh()`
roda, o GSAP tem os tweens corretamente marcados como "play()"ados e
avançando; só faltam frames de verdade pra pintar.

**`/#tratamentos`** (navegação direta, hash já na URL — não clique):
antes de qualquer tick manual, as 7 linhas (Facetas → Clareamento) estavam
em `opacity: 0`, incluindo linhas com `top` bem acima do limiar de 88% (ex.:
`top: 113px` numa viewport de 900px de altura) — confirma que sem a
correção elas ficariam presas pra sempre. Depois de ~10s de ticks manuais
simulando frames reais:

```
Facetas                 0 → 0.17 → 0.30 → 0.59 → 0.90 → 1.00
Implantes                              0 → 0.08 → 0.43 → 0.99 → 1.00
Protocolo de implante                        0 → 0.23 → 0.98 → 0.99
Próteses                                            0 → 0.95 → 0.98
Ortodontia (a que você viu presa)                   0 → 0.91 → 0.95
Limpeza profissional (idem)                         0 → 0.91 → 0.95
Clareamento (glifo)                                 0 → 0.91 → 0.95
```

Todas as 7 — incluindo Ortodontia e Limpeza, exatamente as que você viu
presas no seu screenshot — progrediram de 0 até perto de 1, na ordem certa
do stagger (`STAGGER_STEP`), sem nenhuma travar.

**`/#depoimentos`**: os 3 cards, todos em `opacity:0` antes dos ticks,
subiram monotonicamente (`0.47/0.28/0.06` → `0.70/0.57/0.41` → `0.81/0.71/0.59`,
ainda subindo quando parei) — mesmo padrão, sem travar.

**`/#localizacao`**: os 2 blocos (coluna de texto/endereço e card do mapa),
ambos em `opacity:0` antes, chegaram a `0.97`/`0.93` depois dos ticks.

Não obtive `opacity: 1` exato em `/#depoimentos` só porque parei os ticks
antes — a tendência (monotonicamente crescente, sem nenhum platô em 0) já
é prova suficiente de que não está preso, mesmo sem levar até o fim.

Console sem erros nas três URLs (`read_console_messages`, `onlyErrors:
true` → vazio nas três). `get_page_text` confirma a página inteira
renderizando normalmente.

### Justificativa de não ter travado com screenshot

Como no relatório anterior, o Browser pane desta sessão não compositou
frame nenhum (mesmo erro "the page is not compositing frames" em toda
chamada a `screenshot`), inclusive numa aba nova recém-criada — não é
estado herdado de uma aba específica, é a sessão inteira. A prova ficou nos
números de `getComputedStyle(...).opacity` medidos diretamente no DOM, que
são determinísticos e não dependem de pintura de tela pra serem lidos.
