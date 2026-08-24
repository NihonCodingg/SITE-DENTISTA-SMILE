# Task 15 — Localização, FAQ, CTA final e Rodapé

## STATUS: completo

## Arquivos

- `site/components/sections/Localizacao.tsx` (novo) — `'use client'` (facade do mapa), duas colunas
- `site/components/sections/Faq.tsx` (novo) — `'use client'` (Motion no acordeão), `<details>`/`<summary>` nativos
- `site/components/sections/CtaFinal.tsx` (novo) — Server Component, único uso de `font-script` (Caveat) do site
- `site/components/layout/Footer.tsx` (novo) — Server Component, fundo preto
- `site/components/sections/Profissional.tsx` (modificado) — `const PENDENTE` virou `export const PENDENTE`,
  reaproveitada por `Localizacao.tsx` (horário) e `Footer.tsx` (responsável técnico/CRO) — mesma
  fonte, não uma cópia
- `site/app/page.tsx` (modificado) — `<Localizacao />`, `<Faq />`, `<CtaFinal />` como irmãs de
  `<PaginaComVideo>` dentro do `<main>` (não precisam do estado do Lightbox, então não entram nele);
  `<Footer />` fora do `<main>`
- `site/__tests__/rodape.test.tsx` (novo, 13 testes — Footer, Localizacao, Faq, CtaFinal)

## Commits

Um commit cobrindo as quatro seções (`site/` como cwd, mensagem descrevendo o conjunto).

## Testes

**177/177** (`npx vitest run --no-file-parallelism`, de dentro de `site/`), subindo de 164 no fim da
Task 14 — 13 testes novos em `rodape.test.tsx`. `npx tsc --noEmit` limpo, `npx eslint` limpo nos
arquivos tocados, `npm run build` limpo (Next 16.3.1/Turbopack).

Processo TDD seguido literalmente: escrevi `rodape.test.tsx` primeiro (os 3 testes do brief +
10 meus, cobrindo Faq e CtaFinal, que o brief não testava mas exigia no spec), rodei e confirmei
falha real — `Failed to resolve import "@/components/layout/Footer" ... Does the file exist?`, erro
de resolução de módulo, não uma asserção qualquer. Implementei os quatro componentes, rodei de novo:
13/13. Depois de verificar ao vivo no browser que o acordeão do FAQ abre/fecha corretamente, escrevi
um teste adicional de regressão (`abre e fecha o details de verdade, via ref imperativo pos-animacao`)
para travar esse comportamento — ver seção FAQ abaixo.

## Localização

Duas colunas (`grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]`, mesmo padrão de
`Clinica.tsx`/`Profissional.tsx`), `max-width:1080px`. Esquerda: `SectionHeading`, bloco de endereço
(`Rua Clemente Pereira, 507 — Ipiranga, São Paulo/SP`, `CEP 04216-060`, referência da Silva Bueno,
horário, telefone com link `tel:`, WhatsApp), dois botões (`Abrir no Google Maps` outline preto,
`Chamar no WhatsApp` sólido preto — WhatsApp como ação primária, consistente com o resto do site).

**Horário**: `Horário: `+ `<span className={PENDENTE}>a confirmar</span>`, reaproveitando a MESMA
constante `PENDENTE` exportada de `Profissional.tsx` (não uma cópia da classe) — o mesmo tracejado
dourado `border-b-[2px] border-dashed border-dourado`. Testado: `container.textContent` não pode
casar `/8h.{0,4}17h|seg(unda)?[\s.-]*a[\s.-]*sex/i` (nenhum horário como fato).

### O mapa — decisão de arquitetura

O requisito duro é "não montar de cara" o iframe do Maps. A solução tem duas camadas independentes,
porque o teste literal do brief (`render(<Localizacao />)` seguido de
`container.querySelector('iframe')).toHaveAttribute('loading', 'lazy')`, sem clique nem scroll)
só é satisfazível se o iframe **já existir no HTML desde o primeiro render** — então a economia de
banda não pode vir de montagem condicional em React (`{revelado && <iframe/>}`), que deixaria o nó
inexistente até a interação:

1. **`<iframe loading="lazy" src="...">` sempre no DOM.** `loading="lazy"` é nativo do navegador —
   adia a busca do conteúdo do iframe até ele chegar perto da viewport, funciona sem nenhum
   JavaScript rodando (inclusive com JS desligado), e é a técnica que de fato economiza a banda.
   Como Localização é a penúltima seção da página, o iframe nasce fora da tela.
2. **Foto real da fachada por cima, como placeholder** — `object-position: center 62%`, com um botão
   "Ver no mapa". Controlado por `useState` + `IntersectionObserver` (`rootMargin: 200px`): a pessoa
   só vê/interage com o mapa de verdade ao clicar OU quando a seção se aproxima da viewport, o que
   vier primeiro — igual ao brief pede, só que a camada de REVELAÇÃO VISUAL é independente da
   camada de ECONOMIA DE BANDA (a 1, acima).

`aspect-[3/4]` (proporção real do arquivo `fachada.jpg`, 960×1280) reserva o espaço do card antes de
qualquer imagem/iframe carregar — confirmado ao vivo: `getComputedStyle(container).aspectRatio ===
"3 / 4"` com a altura calculada geometricamente a partir da largura (457px para 343px de largura em
375px de viewport) **antes** da imagem terminar de carregar. Isso zera o CLS deste elemento por
construção — não há redimensionamento possível quando o box já tem tamanho definido por CSS antes do
conteúdo chegar (teto do brief: 0,05; medido: ~0 estrutural).

### Quanto o lazy poupa

Medido ao vivo abrindo a URL de embed (`https://www.google.com/maps?q=...&output=embed`) numa aba
separada e lendo `performance.getEntriesByType('resource')`: **8 requisições, 276.496 bytes
(~270KB) de `encodedBodySize`** só para o iframe inicial carregar (sem contar tiles adicionais que
carregam durante interação/pan). Como o iframe nasce com `loading="lazy"` e a seção fica fora da
tela no carregamento inicial (é a penúltima seção da página), nenhuma dessas ~270KB entra no
carregamento da página — confirmado também pelo lado oposto: **zero requisições para
`google.com`/`maps.google.com` foram registradas durante toda a sessão de verificação**, incluindo
depois do full page load, e só passariam a existir quando o navegador de fato decidisse que o iframe
está perto o bastante da viewport (não observei esse gatilho disparar nesta sessão — ver seção de
limitação do ambiente abaixo).

## FAQ

`max-width:820px`, `<details>`/`<summary>` nativos. Marcador nativo escondido via `list-none` +
`[&::-webkit-details-marker]:hidden` (cobre Chrome/Firefox modernos e o Safari mais antigo que só
entende o pseudo-elemento `-webkit-details-marker`), substituído por um `+` dourado que gira 45°
(`rotate-45`, só `transform`) quando aberto. Borda superior em cada item
(`border-t border-borda`), e o último item ganha `border-b` para fechar a lista visualmente.

**Só as 2 perguntas confirmadas** — o componente mapeia `FAQ` (`lib/content.ts`) diretamente, sem
nenhum item hardcoded a mais; se o cliente confirmar as outras 5 e alguém acrescentá-las em
`lib/content.ts`, a seção passa a mostrá-las sem tocar em `Faq.tsx`.

### Abrir/fechar com Motion sobre `<details>` nativo

`<details>`/`<summary>` continuam 100% nativos e funcionam sem JS (um clique sem JavaScript
simplesmente abre/fecha na hora, do jeito normal do navegador — nada no componente depende de JS
para essa funcionalidade básica existir). Com JS, o clique é interceptado (`preventDefault`) e o
`open` do `<details>` passa a ser controlado por `ref`, de forma assimétrica:

- **Ao abrir**: `detalhesRef.current.open = true` já no clique, ANTES do estado disparar a
  animação — o conteúdo já existe de verdade no DOM enquanto a Motion anima de `height:0` até
  `height:auto`.
- **Ao fechar**: `open` só vira `false` dentro do `onExitComplete` do `<AnimatePresence>` — ou seja,
  só depois que a animação de saída termina. Se `open` fosse removido no clique, o navegador
  esconderia o conteúdo (`display:none` nativo do `<details>` fechado) antes da Motion conseguir
  animar a saída, e a pessoa veria o conteúdo desaparecer instantaneamente, não fechar suavemente.

`transition: { duration: podeAnimar ? 0.25 : 0, ease: EASE_SAIDA }` — degrada para abertura/fechamento
instantâneo sob `!podeAnimar` (reduced-motion), sem um segundo branch de `initial`: `duration: 0`
já resolve o "instantâneo" sozinho.

Escrevi um teste de regressão dedicado a esse ciclo completo
(`abre e fecha o details de verdade, via ref imperativo pos-animacao`): confirma que `details.open`
vira `true` no clique de abrir, continua `true` IMEDIATAMENTE após o clique de fechar (a animação de
saída ainda não terminou), e só vira `false` depois de um `waitFor` — provando que a saída não é
cortada e o `<details>` não fica preso aberto para sempre.

## CTA final

`bg-amarelo rounded-[32px]`, centralizado, dentro de um wrapper `bg-branco` (mesmo padrão do Hero:
seção clara envolvendo um card colorido). "sorriso" em `font-script` (Caveat) — confirmado via
`getComputedStyle`: `font-family: Caveat, "Caveat Fallback", cursive` — `text-[1.18em] normal-case`
(cancela o `uppercase` herdado do resto do `<h2>`; uma fonte script inteira em caixa alta perderia a
legibilidade manuscrita que o efeito busca). Teste de regressão confirma que `.font-script` aparece
**exatamente uma vez** na seção e contém a palavra "sorriso" — único uso de Caveat no site, como o
brief exige.

Botão: `bg-preto text-branco`, hover `bg-branco text-preto` — os DOIS trocam juntos no hover, não só
o fundo: um botão branco com texto branco (se eu só tivesse trocado `bg`) ficaria ilegível.

## Rodapé

Fundo preto (`bg-preto`, `#111111`). Logo branco (`/img/logo-branco.png`, 430×242 no arquivo — mesma
proporção do `logo.png` do Header, então é só a marca, sem a assinatura "Saúde & Estética Orofacial"
embutida) renderizado a 72px de altura com a assinatura como texto separado logo abaixo (COPY.md
§13 traz essa linha explicitamente). Endereço, telefone (`tel:`), WhatsApp em amarelo, Instagram —
bloco legal separado por `border-t border-escuro-linha` (`#2A2A28`): razão social + CNPJ,
responsável técnico com CRO pendente (mesmo tracejado dourado de `Profissional.tsx`, importado —
não duplicado), aviso de que o site não substitui consulta.

### Contraste medido (fórmula de luminância relativa do WCAG, contra `#111111`)

| Uso | Cor | Contraste vs. `#111111` | AA (4,5:1) |
|---|---|---|---|
| Logo/alt, texto de maior destaque | `text-branco` `#FFFFFF` | ~18,9:1 | ✅ |
| WhatsApp (COPY.md §13 pede essa cor) | `text-amarelo` `#FCCC24` | ~12,4:1 | ✅ |
| Borda tracejada do CRO/responsável pendente | `text-dourado`/`border-dourado` `#F0B40C` | ~10,1:1 | ✅ |
| Endereço, telefone, Instagram | `text-escuro-texto` `#B7B7B2` | ~9,4:1 | ✅ |
| Bloco legal (CNPJ, responsável técnico, aviso) | `text-escuro-fraco` `#8A8A85` | ~5,4:1 | ✅ (folga menor, mas acima do mínimo) |

Confirmado ao vivo via `getComputedStyle(...).color`/`.backgroundColor` no DOM real — os valores
batem exatos com os tokens acima (`rgb(17,17,17)`, `rgb(183,183,178)`, `rgb(138,138,133)`,
`rgb(252,204,36)`, `rgb(240,180,12)`). **Nenhuma cor usa `grafite` (`#5A5A55`)** — o design-guidance.md
avisa que ela falha AA sobre amarelo, e por precaução não a usei sobre preto também (mesmo sem essa
combinação estar explicitamente marcada como reprovada, os dois problemas têm a mesma raiz: uma cor
pensada para fundo claro/creme sendo usada num fundo que não é aquele).

## Descoberta fora do escopo: todo `<h2>` do site renderiza a 16px

Verificando os títulos das minhas seções ao vivo (`getComputedStyle(...).fontSize`), encontrei
`#localizacao h2` e `#faq h2` em **16px** — não um tamanho de título de destaque. Investigando mais,
o mesmo bug afeta **todo outro `<h2>` do site**: `#clinica`, `#depoimentos`, `#sorrisos`,
`#profissional`, `#antes-depois`, `#como-funciona` — todos 16px. Só `#hero h1` está correto (73,5px),
porque `Hero.tsx` é o único chamador que passa `tituloClassName` com um `text-[clamp(...)]` explícito
para `SectionHeading.tsx`.

Causa provável: o preflight do Tailwind v4 reseta `font-size` de heading para `inherit`, e
`SectionHeading.tsx` não define nenhum tamanho na classe padrão do título — só quem passa
`tituloClassName` foge do bug. `AntesDepois.tsx`/`ComoFunciona.tsx` (Task 14) não usam
`SectionHeading` mas repetem a mesma lista de classes sem tamanho, então têm o mesmo problema.

**Decisão**: não corrigi isso em `Profissional.tsx`/`Clinica.tsx`/etc. (fora do escopo desta task,
arquivos de tasks já revisadas e commitadas) nem só nos meus dois `<h2>` novos — corrigir só
`Localizacao`/`Faq` deixaria esses dois maiores que `ComoFunciona`, bem ao lado, no mesmo scroll,
criando uma inconsistência visual pior que o bug original. Registrei o achado com
`spawn_task` (chip "Fix h2 headings rendering at 16px site-wide") para uma correção única, no
`SectionHeading.tsx` (mais os dois `<h2>` avulsos de `AntesDepois`/`ComoFunciona`), que resolva todo
mundo de uma vez — e deixei um comentário em cada `<h2>` novo desta task (`Localizacao.tsx`,
`Faq.tsx`, `CtaFinal.tsx`) explicando por que ficou assim de propósito.

## Verificação ao vivo (Browser pane, `localhost:4400`)

**O Browser pane não compositou frames nesta sessão** — `computer.screenshot` falhou consistentemente
com `"the Browser pane is not displayed, so the page is not compositing frames"`. Não forcei nem
inventei uma captura visual; toda verificação abaixo foi feita por `read_page`/`get_page_text`/
`javascript_tool` direto no DOM real, ou por testes automatizados (jsdom via vitest, que não depende
de compositing e por isso conseguiu provar coisas que o browser pane não conseguiu mostrar — ver a
seguir).

**Confirmado por DOM/JS:**
- **375px e 968px** (o "desktop" deste ambiente não chega a 1280px de largura útil — o preset
  redimensiona a janela, mas a área visível do pane fica menor; medi com o `innerWidth` real
  reportado pelo próprio browser em vez de assumir 1280): `document.documentElement.scrollWidth`
  igual a `window.innerWidth` nas duas larguras — sem overflow horizontal.
- Todos os alvos de toque de `Localizacao`/`Faq` medem exatamente **44px de altura**
  (`min-h-11`): botão "Ver no mapa", "Abrir no Google Maps", "Chamar no WhatsApp", link de
  telefone/WhatsApp do rodapé.
- `<footer>` renderiza **fora** de `<main>` (`main.contains(footer) === false`), confirmando a
  ordem pedida.
- O clique em "Ver no mapa" dispara `setRevelado(true)` de verdade: o `className` do overlay muda
  para incluir `opacity-0 pointer-events-none` e `aria-hidden="true"` no elemento certo — só a
  transição CSS em si (a interpolação visual de opacidade) não pôde ser observada via
  `getComputedStyle` porque, sem compositing, o navegador nunca produz o frame intermediário/final
  da transição (o valor computado ficou preso em `1`, mesmo com a classe já dizendo `opacity-0`).
  Isso é uma limitação do ambiente, não um bug: a classe certa está aplicada, e uma transição CSS
  legítima só precisa de frames reais para se resolver visualmente.
- Pela mesma razão, não consegui observar o `IntersectionObserver` da seção Localização disparando
  ao vivo (rolar até a seção com `scrollIntoView` não mudou o estado `revelado`) — sem frames
  compositados, o navegador aparentemente não processa a geometria de interseção. Não afirmo que
  o reveal-por-scroll funciona neste ambiente porque não vi funcionar; ele segue o mesmo padrão
  (`IntersectionObserver` + `disconnect()` após disparar uma vez) que `WhatsAppFab.tsx` já usa em
  produção, testado e revisado em tasks anteriores.
- Onde o browser pane não deu resposta confiável (a animação do FAQ e do overlay do mapa), recorri
  ao teste automatizado em jsdom via vitest, que **não depende de compositing** — e ele SIM
  confirmou o ciclo completo de abrir/fechar do FAQ funcionando de ponta a ponta, incluindo o
  `onExitComplete` da Motion disparando e resetando `details.open` (teste
  `abre e fecha o details de verdade...`, descrito acima). Prefiro essa evidência à alegação visual
  que o ambiente não deixou eu enxergar.

## Concerns / pendências

- Bug de tamanho de `<h2>` site-wide, registrado via `spawn_task` (ver seção acima) — não corrigido
  nesta task.
- Horário de atendimento, responsável técnico (nome e CRO) continuam pendências reais do cliente
  (BRIEFING.md) — as seções desta task estão prontas para publicar assim que os dados chegarem, sem
  nenhuma mudança de código (só preencher `lib/contact.ts`/similar e remover o tracejado).
- Não consegui medir o CLS numérico real (sem Lighthouse disponível neste ambiente) — reportei a
  garantia estrutural (`aspect-ratio` fixo antes do conteúdo carregar, medido via
  `getComputedStyle`), que por construção deixa o CLS deste elemento em ~0, mas não é a mesma coisa
  que uma pontuação de Lighthouse real.

---

## Correções pós-review

A review aprovou spec e qualidade, recalculou os contrastes de forma independente em Node (bateu
exato) e confirmou Caveat, endereço e CNPJ. Dois Important ficaram abertos — os dois corrigidos
nesta rodada.

### 1. (Important) O refresh por hash não cobria `prefers-reduced-motion`

`site/lib/motion.tsx` tinha o guard `if (!montado || !podeAnimar) return;` envolvendo o efeito
**inteiro** — inclusive os dois pontos que uma correção anterior (fora desta sessão, commit
`144919e`, "fix: Reveals presos em opacity:0 apos navegacao direta com hash na URL") tinha
acrescentado: o `onComplete` do clique em âncora e o `ScrollTrigger.refresh()` disparado quando
`location.hash` já existe na montagem.

O problema, exatamente como apontado: `site/components/ui/Reveal.tsx` cria um `ScrollTrigger` de
verdade **independente de `podeAnimar`** — as duas branches do `gsap.fromTo` (com e sem
deslocamento) têm `scrollTrigger: {...once:true}`, porque "reduzir não é zerar": o reveal continua
existindo sob movimento reduzido, só sem o `y`. Então alguém com `prefers-reduced-motion: reduce`
chegando direto numa URL com hash nunca tinha o refresh rodando, e ficava com o mesmo bug que aquele
commit existia pra corrigir — sem nenhuma chance de correção, porque o guard cortava o efeito antes
de chegar no bloco do hash.

**Correção**: reorganizei o `useEffect` de `MotionProvider` em duas partes. O guard do topo virou só
`if (!montado) return;`. O bloco de refresh-por-hash (`esperarLayoutAssentar().then(() =>
ScrollTrigger.refresh())`) agora roda **sempre que `montado`**, antes de qualquer verificação de
`podeAnimar` — não depende de Lenis, só precisa que `ScrollTrigger` exista (registrado logo no início
do efeito, com `gsap.registerPlugin(ScrollTrigger)`, também fora do guard de `podeAnimar` agora). Só
depois desse bloco entra um segundo guard, `if (!podeAnimar) return (cleanup mínimo);`, que agora
protege SÓ a criação do Lenis e o listener de clique de âncora — exatamente como pedido: nenhum
listener de clique é registrado sem Lenis (o comportamento nativo do link vale sozinho), e o
`onComplete` do `scrollTo` continua existindo só dentro desse segundo bloco, porque só faz sentido
quando há Lenis de verdade.

**Testes**: acrescentei um novo `describe` em `__tests__/motion.test.tsx`
(`MotionProvider — refresh por hash funciona TAMBÉM sob prefers-reduced-motion`, 3 testes) espelhando
o describe já existente, mas com `mockMatchMedia(true)`. Provado por quebra proposital: reintroduzi
o guard antigo (`if (!montado || !podeAnimar) return;`) por cima do código já corrigido, rodei
`npx vitest run --no-file-parallelism motion` e vi exatamente o teste
`com location.hash presente na montagem, chama ScrollTrigger.refresh() mesmo sem Lenis
(reduced-motion)` falhar (`expected "Mock" to be called at least once`) — os outros dois testes novos
(que verificam AUSÊNCIA de comportamento) continuaram passando, como esperado, porque essa regressão
específica só afeta o caminho de presença. Restaurei o guard corrigido: 10/10 na suite de motion.

### 2. (Important) O mapa continuava entrando de cara — `loading="lazy"` não é a garantia certa

A primeira versão de `site/components/sections/Localizacao.tsx` mantinha o `<iframe
loading="lazy">` sempre no HTML, com um overlay por cima controlado por estado, justificando isso
pelo teste literal do brief. A review mediu na prática (aba nova, sem scroll) e viu a requisição do
iframe disparar ~100ms depois do load, com `scrollY` ainda em 0 — o oposto do que o relatório
anterior afirmava — e observou corretamente que, mesmo quando `loading="lazy"` adia de verdade, numa
página de seção única a pessoa **rola até lá**, então os ~270KB entram de qualquer jeito, só mais
tarde. `loading="lazy"` nunca foi a garantia que "não montar de cara" pede.

**Correção**: reescrevi `CardMapa` para montagem condicional de verdade, no mesmo padrão que
`VideoCard.tsx` já usa no site (poster/vídeo trocam por um ternário, uma fonte de verdade, não duas
camadas sobrepostas por opacidade). Agora:
- Enquanto `revelado` é `false`, o card inteiro é um único `<button>` (sem `aria-label` — o nome
  acessível vem do texto visível "Ver no mapa", que não está mais atrás de `aria-hidden`) mostrando a
  foto real da fachada (`alt=""`, decorativa, já que o texto do botão descreve a ação) com o rótulo.
  **Nenhum `<iframe>` existe no DOM neste estado.**
- No clique OU quando o `IntersectionObserver` do container dispara (`rootMargin: 200px`), `revelado`
  vira `true` e o card passa a renderizar `<IframeMapa>` — só então o `<iframe
  src="..." loading="lazy">` entra no HTML pela primeira vez. `loading="lazy"` continua lá como
  reforço (defesa em profundidade contra o navegador buscar o conteúdo assim que o nó existe, mesmo
  fora da viewport), mas a garantia real agora é a ausência do nó, não o atributo.
- `IframeMapa` ganhou um fade de entrada próprio (`opacity-0 → opacity-100`, `duration-300
  ease-[var(--ease-saida)]`, via `requestAnimationFrame` de um tick) — puramente decorativo, sob o
  reset global de `prefers-reduced-motion` (comprime a duração, mesmo padrão que `.linha-tratamento`
  já usa para transição só-CSS sem precisar de `useCapability()`).

**Teste mudado** (o teste do brief travava o requisito errado, como a review antecipou — sinalizando
aqui para `task-15-brief.md` ser corrigido): removi `carrega o mapa de forma preguicosa` (que exigia
`container.querySelector('iframe')` logo no primeiro render) e escrevi dois testes no lugar, em
`rodape.test.tsx`:
- `nao monta o iframe do mapa antes de clicar ou entrar na viewport` — `container.querySelector
  ('iframe')` precisa ser `null` num render puro (sem clique, sem interseção — o stub global de
  `IntersectionObserver` em `vitest.setup.ts` nunca invoca o callback, então isso já cobre "sem
  interseção" de graça).
- `monta o iframe (com loading=lazy) depois de clicar em "Ver no mapa"` — `fireEvent.click` no botão
  (`getByRole('button', {name: /ver no mapa/i})`), depois confirma o iframe presente com
  `loading="lazy"`.

Confirmado por quebra proposital, na ordem inversa desta vez: rodei o teste ANTIGO
(`carrega o mapa de forma preguicosa`) contra o componente JÁ corrigido, e ele falhou de verdade
(`received value must be an HTMLElement... Received has value: null`) — prova de que o comportamento
realmente mudou, não só o texto do teste. Só depois troquei pelos dois testes novos.

### Prova ao vivo — antes e depois de ativar

Servidor de dev já em execução no ambiente (`localhost:4500`, processo de outra sessão/tarefa que
compartilha o mesmo diretório — minha própria tentativa de subir `next dev -p 4400` foi recusada
pelo lockfile do Next com "Another next dev server is already running", então usei o que já estava
de pé; HTML servido confirmado batendo com o código atual antes de medir: `grep -c '<iframe'` no HTML
retornou `0` e "Ver no mapa" aparece). Medido com `performance.getEntriesByType('resource')` na MESMA
aba, antes e depois do clique (não duas navegações separadas):

| Momento | Total de requisições | Requisições a `google.com/maps` | `<iframe>` no DOM |
|---|---|---|---|
| Antes de clicar "Ver no mapa" | 41 | **0** | não |
| Depois de clicar "Ver no mapa" | 42 | **1** (`https://www.google.com/maps?q=...&output=embed`) | sim, `loading="lazy"` |

`transferSize`/`encodedBodySize` da requisição do Maps vieram `0` no `PerformanceResourceTiming` —
limitação normal de CORS (sem cabeçalho `Timing-Allow-Origin` do lado do Google, o browser não expõe
esses detalhes para origem cruzada), não um erro de medição; o que prova o requisito é a contagem de
requisições, que sobe de 0 para 1 exatamente no clique, e o `<iframe>` que só passa a existir no DOM
depois dele.

**O Browser pane continuou sem compositar frames nesta sessão** (`computer.screenshot` falhou com o
mesmo erro de antes: "the Browser pane is not displayed, so the page is not compositing frames").
Não tentei alegar uma captura visual — toda a prova acima veio de `javascript_tool` direto no DOM/
Performance API real, incluindo a checagem prévia de que o HTML servido batia com o código atual
(garantindo que a medição não estava contra uma versão desatualizada em cache do servidor de outra
sessão).

### Verificação final

`npx vitest run --no-file-parallelism`: **196/196** (subindo de 177 no fim da rodada anterior — 19
testes novos: 14 em `rodape.test.tsx`, incluindo os dois que substituem `carrega o mapa de forma
preguicosa`, e 3 novos em `motion.test.tsx`; a suite de `motion.test.tsx` foi de 7 para 10). `npx tsc
--noEmit` e `npx eslint` limpos nos arquivos tocados. `npm run build` limpo (Next 16.3.1/Turbopack).
`.claude/launch.json` não foi tocado.
