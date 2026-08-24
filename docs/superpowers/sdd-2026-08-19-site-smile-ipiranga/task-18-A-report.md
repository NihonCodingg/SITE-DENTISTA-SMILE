Avaliação A — não-ancorada (sem detector, sem Lighthouse)

> Nota metodológica obrigatória: o painel do navegador desta sessão **não compositou frames**
> em nenhum momento — `screenshot` falhou de forma consistente em toda seção testada, e
> `document.visibilityState` ficou preso em `"hidden"` mesmo com a aba em primeiro plano. Isso
> significa que qualquer motion dirigido por `requestAnimationFrame` (GSAP — menu mobile,
> `SplitText`; Motion — lightbox, FAQ; Lenis — scroll suave; `ScrollVelocity`; `CircularGallery`)
> **não pôde ser observado tocando de verdade** neste ambiente, só medido pelo estado de repouso
> (antes/depois) e pelo código-fonte. Onde isso se aplica, o achado está marcado
> **⚠️ medido no código, não confirmado visualmente**. Estados controlados por React puro
> (`aria-expanded`, presença/ausência de `<dialog>`, foco, requisições de rede, texto renderizado,
> `getComputedStyle`/`getBoundingClientRect` em repouso) foram verificados de verdade, interagindo
> com a página ao vivo — não são inferência de código.

## 1. Veredito de especificidade

**É a Smile Ipiranga, não um template de dentista genérico — com uma lacuna de reconhecimento
específica.** A paleta ao vivo (`getComputedStyle` do `:root`) é `#FFFFFF`/`#FCF0E4`/`#FCCC24`/
`#F0B40C`/`#111111`/`#5A5A55` — bate exatamente com a extração do Instagram no `BRIEFING.md`, e é
uma escolha ousada (a maioria dos concorrentes de odontologia usa azul clínico). Os assets
carregados na página são reais e nomeados por conteúdo, não placeholder: `hero-foto.jpg`,
`fachada.jpg`, `dr-vinicius.jpg`, sete fotos `trat-facetas.webp`/`trat-implantes.jpg`/etc. (uma
por tratamento, não ícone genérico), cinco `antes-depois-*.jpg`, vídeo `recepcao.webp` da própria
recepção. O rodapé fecha com CNPJ 48.000.577/0001-20, endereço real e `@smileipiranga` — link
direto de volta ao perfil que a pessoa acabou de ver. O card de vídeo "Tour pela clínica" no hero e
os vídeos de depoimento no lightbox espelham o formato exato que o Instagram já usa ("Depoimento de
Paciente", conferido ao vivo no feed: várias posts de outubro/2025 a agosto/2026 são vídeos
rotulados assim). Isso não é o que um template serviria.

A lacuna: a assinatura mais repetida da marca no Instagram — **"Sorriso com propósito"**
(`#sorrisocompropósito`, aparece nos posts e no `BRIEFING.md` §7 como recorrente) — existe no
código (`app/page.tsx:29`, meta `description`) mas **não aparece em nenhum texto visível da
página**. Para a persona que chega do feed reconhecendo essa frase, ela nunca a vê. Não visualizei
pixel a pixel a parede verde de folhagem (screenshot não compositou — ver nota acima), mas os
nomes de arquivo confirmam que as fotos da clínica real estão em uso, então a ausência é
especificamente de uma frase, não de fotografia genérica.

## 2. Heurísticas de Nielsen — modo Persuade

Itens 7 (Flexibilidade/Eficiência) e 10 (Ajuda/Documentação) marcados `n/a`: é uma landing de
página única, sem tarefas repetidas que peçam atalho, e sem necessidade de documentação além do
FAQ (que já é avaliado dentro da própria navegação). Total renormalizado para **/32** (8 itens
aplicáveis × 4).

| # | Heurística | Nota | Achado-chave |
|---|---|---|---|
| 1 | Visibilidade do status do sistema | 3/4 | Hambúrguer alterna ícone (☰↔✕) e `aria-expanded`; FAQ gira o `+` em 45° ao abrir (confirmado ao vivo, `rotate-45` aplicado); mas não há indicação de "carregando" enquanto o vídeo completo baixa no clique do lightbox (confirmei via rede: o `.mp4` só começa a baixar no clique — em 3G isso é um vácuo sem feedback visível) |
| 2 | Correspondência com o mundo real | 4/4 | Copy em português coloquial e caloroso ("Você chama no WhatsApp", "Fazemos o diagnóstico"), sem jargão; bate com o tom do Instagram (educativo, próximo) |
| 3 | Controle e liberdade do usuário | 4/4 | Lightbox: clique no botão fechar, clique no fundo (`onClick={fechar}` no backdrop, `Lightbox.tsx`) e `Escape` — testei `Escape` ao vivo: fecha e devolve foco exatamente ao card que abriu (`data-test-marker` confirmou a identidade do elemento). Drawer tem o mesmo padrão (botão, backdrop, `Escape`) |
| 4 | Consistência e padrões | 3/4 | Card de vídeo é o mesmo componente em Clínica e Depoimentos (mesmo padrão visual, reconhecível); container arredondado se repete em Hero e CTA final. Dois furos de consistência interna: (a) o token `--ease-gaveta` existe em `globals.css:27` especificamente para "drawer do menu mobile" e **nunca é referenciado** em nenhum componente — o menu real usa curvas GSAP (`power4.out`/`power3.in`) escolhidas à parte; (b) salto de `<h1>` direto para `<h3>` nos Pilares (sem `<h2>` de seção) — já é achado confirmado por axe/Lighthouse no `qa-guidance.md`, cito aqui só pelo ângulo de hierarquia visual: o olho também sente o salto, não só o leitor de tela, porque não existe nenhum rótulo de seção entre o hero e os quatro pilares |
| 5 | Prevenção de erros | 4/4 | Nenhum formulário de texto livre no site (toda ação principal é link `wa.me` pré-preenchido ou navegação); `<details>/<summary>` nativo no FAQ é robusto por natureza; foco preso corretamente no drawer e no lightbox evita ações fora de contexto |
| 6 | Reconhecimento em vez de memorização | 4/4 | Header sticky com âncoras sempre visível; WhatsApp aparece como CTA em pelo menos 6 pontos da página (hero, tratamentos, FAB, localização, CTA final, rodapé) — a pessoa nunca precisa lembrar de rolar de volta |
| 7 | Flexibilidade e eficiência | n/a | Página de conversão única, sem tarefa repetida que justifique atalho |
| 8 | Estética e design minimalista | 3/4 | Paleta contida, respiro generoso na maior parte da página; mas cinco seções seguidas (Profissional, Depoimentos, Antes/Depois, Como Funciona, Localização) compartilham o mesmo fundo creme sem nenhuma quebra visual por ~3470px de rolagem no mobile — ver item 4 da jornada emocional |
| 9 | Ajudar a reconhecer e recuperar de erros | 3/4 | Não há nada que "erre" no sentido clássico (sem formulário), mas também não há nenhum tratamento visível para o caso comum de alguém sem WhatsApp instalado clicar num link `wa.me` no desktop — não testei o resultado real (depende do navegador/OS do visitante), mas nenhum fallback textual existe no site para essa hipótese |
| 10 | Ajuda e documentação | n/a | Cabe dentro do FAQ, já avaliado na carga cognitiva; não há necessidade de documentação separada numa landing de conversão |

**Total: 28/32.** Está na faixa "bom, com furos reais e específicos" — não é uma nota inflada de
cortesia (o brief pede honestidade: a maioria das interfaces reais fica entre 20-32/40, o
equivalente proporcional aqui é 16-25,6/32; 28/32 reflete que a maior parte da execução está acima
da média, com dois furos concretos, não genéricos).

## 3. Carga cognitiva — 8 itens

1. **Foco único** — Falha parcial. O hero tem CTA primário claro ("Agendar minha avaliação"), mas
   compete visualmente com o secundário ("Conhecer a clínica") na mesma linha, mesmo peso de
   texto (ambos `text-[13px]`), diferindo só pela cor de fundo (preto vs. transparente com borda).
   Não é um erro grave — é hierarquia por cor, funciona — mas não é "uma coisa" clara.
2. **Chunking ≤4** — Passa. Pilares (4), Como Funciona (4). Tratamentos tem 7, mas ver item 6.
3. **Agrupamento** — Passa. Cada seção tem um único assunto, sem mistura.
4. **Hierarquia clara** — Passa majoritariamente (numeração dourada nas linhas de tratamento,
   tamanhos de título consistentes por seção — medi `getComputedStyle` de 10 `<h2>`/`<h1>` e todos
   vieram em `Archivo Black`, tamanhos coerentes com a importância da seção, nenhum 16px-bug).
   Falha pontual já citada: heurística 4 acima (salto h1→h3).
5. **Uma coisa por vez** — Passa. FAQ usa `<details>` nativo — abrir uma pergunta não fecha as
   outras automaticamente (não é um accordion exclusivo), o que é aceitável para só 2 itens, mas
   seria um problema real se a lista crescesse sem essa exclusividade.
6. **≤4 opções por decisão** — Falha marginal. Os 7 tratamentos são mais que 4, mas **têm
   hierarquia real** (numeração `01`–`07` tabular em dourado, miniatura de foto por linha, nome em
   `Archivo Black` 21-34px, descrição em corpo menor, seta) — não é parede de opções idênticas.
   Ainda assim, é uma lista de rolagem longa (alturas de 157-202px cada, ~1200px total no mobile)
   antes de chegar ao CTA da seção.
7. **Sem memória entre telas** — Passa. Nenhum estado (drawer, lightbox, FAQ) precisa ser lembrado
   entre seções; cada um é local e se reseta.
8. **Revelação progressiva** — Passa por design (`Reveal`, stagger capado em 5 itens nas 7 linhas
   de tratamento — confirmei em `Tratamentos.tsx:13` — `STAGGER_MAX = 5`), mas não pude confirmar
   visualmente a cascata rodando (ver nota metodológica).

**Contagem: 2 falhas (1 parcial no foco único do hero, 1 marginal nas 7 opções de tratamento) →
banda "moderado", mas ambas são falhas leves, mitigadas por craft real (hierarquia visual nas
linhas de tratamento), não falhas cruas.**

## 4. Jornada emocional — pico e fim

**Pico:** a seção Sorrisos ("Sorrisos feitos aqui"), fundo preto, galeria WebGL de 9 retratos reais
com legenda `sr-only` própria — é o único momento da página com fundo escuro dramático depois de
tudo branco/creme, e o tratamento (`CircularGallery`, inércia por `lerp` com `scrollEase: 0.06`) é
desenhado para parecer caro. Depoimentos, logo depois, disputa esse pico de perto (vídeos reais de
pacientes, não texto) — os dois juntos formam o trecho mais forte da página.

**Vale real, não hipotético:** depois desse pico duplo, a página entra num trecho longo e plano.
Cinco seções seguidas — Profissional, Depoimentos, Antes/Depois, Como Funciona, Localização —
compartilham o mesmo fundo creme (`bg-creme`, confirmado por `getComputedStyle` em cada uma), sem
nenhuma seção preta ou branca quebrando o ritmo entre elas. Dentro desse trecho, duas seções
puxam o tom para o registro procedural/legal: Antes/Depois carrega o aviso obrigatório do CFO
("Cada caso é único e os resultados variam...") e Como Funciona é uma lista de passos operacional.
O FAQ que vem em seguida (branco, ao menos quebra o creme) tem só 2 perguntas confirmadas — um
acordeão magro bem no ponto em que a página deveria estar reconstruindo confiança para o fechamento.

**Fim:** o CTA final é um bloco `bg-amarelo` arredondado (`rounded-[32px]`, confirmado — não é a
seção inteira que vira amarela, é um cartão dentro de uma seção branca, mesma linguagem de
"container" do hero), com a única aparição de fonte manuscrita Caveat na palavra "sorriso" dentro
do título. É um fechamento caloroso e correto — mas ele **sobe direto de um vale** (creme monótono
+ FAQ magro), sem nenhuma transição intermediária que reconstrua o embalo emocional que Sorrisos/
Depoimentos tinham estabelecido. O arco correto seria pico → sustentação → pico-final; o que existe
é pico → vale longo → pico-final, o que é sentido pela pessoa como "a página esfriou antes de
pedir a ação".

## 5. Forças

1. **Ticker de tratamentos calibrado, não copiado do padrão.** `Ticker.tsx` usa velocidade base de
   40px/s e capa o boost de velocidade do scroll em 2,5× (`VELOCITY_MAPPING` output `[0, 2.5]`) —
   o default do React Bits vai a 5-6×. O comentário no código cita `design-guidance.md`
   explicitamente ("a marca não é nervosa"). Funciona porque é o primeiro motion que a pessoa sente
   logo abaixo do hero, e ele nunca "dispara", mesmo com um flick de scroll rápido — estabelece o
   tom certo no primeiro segundo de interação.
2. **O fallback do CircularGallery tem dignidade de verdade, não é modo econômico.** Sob
   reduced-motion, save-data ou aparelho fraco, `SorrisosGaleria.tsx` não esconde nem simplifica —
   troca para um scroller horizontal com `snap`, 9 fotos reais, cada uma com uma leve rotação/
   deslocamento (`TRANSFORMS_FALLBACK`, ciclo de 3 valores, só `transform`) para o olho não ver um
   grid raso repetindo. Funciona porque cumpre a régua do guia ("reduzir não é zerar") com cuidado
   que a maioria dos projetos não dá ao caminho alternativo — é visualmente comparável ao caminho
   "de luxo", não um substituto óbvio.
3. **O FAB do WhatsApp entra e sai, não aparece/some.** No topo da página ele existe no DOM com
   `opacity-0 scale-95 pointer-events-none` — não compete com o CTA grande do hero — e assume
   `opacity-1`/`pointer-events-auto` só depois que a pessoa rola (confirmei: `scrollY:0` → opacidade
   0; após rolar → opacidade 1). Funciona porque evita dois CTAs de WhatsApp brigando pela atenção
   na primeira dobra, sem duplicar lógica de visibilidade em vários lugares.

## 6. Problemas prioritários

**P2-1 — Menu mobile: orçamento de motion medido no código excede o teto do próprio guia, e a
curva de saída é a proibida.** `components/reactbits/StaggeredMenu.tsx:182-229`. A timeline de
abertura soma: painel entra às `panelInsertTime + panelDuration` (0,15s + 0,55s = 0,70s), itens
começam em `itemsStart` (~0,23s) e animam por 0,8s com stagger de 0,06s por item — para um menu de
5 itens, o último item só termina de assentar por volta de **1,3s** após o toque. O guia do projeto
é explícito: "Teto de 300ms para qualquer coisa que a pessoa aciona" e, especificamente para este
componente, "300ms na abertura, 220ms no fechamento". Além disso, o fechamento usa
`ease: 'power3.in'` (linha 229) — uma curva de aceleração-a-partir-do-zero, da família que o guia
proíbe explicitamente ("Nunca use `ease-in` em UI"). O token `--ease-gaveta` que o `globals.css`
define especificamente para este drawer (linha 27) não é referenciado em lugar nenhum do código —
ninguém decidiu conscientemente usar as curvas GSAP no lugar dele, é órfão. **⚠️ Não pude confirmar
o tempo percebido tocando a animação de verdade neste ambiente** (rAF/GSAP pausado, ver nota
metodológica) — o achado é sobre os valores no código, que são o que qualquer visitante real vai
sentir. **Correção concreta:** ou encurtar a timeline (reduzir `duration` dos itens para ~0,4-0,5s,
cortar o stagger a 40ms, iniciar os itens mais cedo) para caber nos 300ms de abertura que o próprio
guia pede para este componente, ou trocar `power3.in` por uma curva de desaceleração
(`power2.out`/equivalente a `--ease-saida`) no fechamento — e então ligar `--ease-gaveta` de
verdade ou apagar o token morto. Por que importa: é a navegação primária no dispositivo que o
`PROMPT-CLAUDE-DESIGN.md` manda desenhar primeiro ("mobile-first... o público chega do Instagram").

**P2-2 — Cinco seções seguidas com o mesmo fundo creme, direto depois do pico emocional da
página.** Profissional (667px) → Depoimentos (820px) → Antes/Depois (685px) → Como Funciona
(493px) → Localização (805px), todas `bg-creme` (confirmado por `getComputedStyle`), ~3470px de
rolagem contínua no mobile sem nenhuma seção preta ou branca entre elas. Isso vem logo depois de
Sorrisos (preto, o pico visual da página). Por que importa: achata o ritmo exatamente no trecho
que devia sustentar o embalo até o CTA final — ver jornada emocional, item 4. **Correção
concreta:** alternar ao menos uma dessas cinco seções para `bg-branco` (quebra já usada em outras
partes do site, sem precisar de cor nova) — Como Funciona ou Localização são as candidatas mais
naturais por serem as mais "utilitárias" do bloco.

**P2-3 — FAQ com 2 perguntas confirmadas, seção "Perguntas frequentes" no plural, posicionada
logo antes do CTA final.** `components/sections/Faq.tsx` já documenta corretamente que 3 das 5
perguntas do `COPY.md` (convênio, pagamento, duração, emergência) dependem do cliente e foram
corretamente omitidas — **isto não é o defeito**; inventar resposta seria o defeito. O defeito é de
composição: a seção "Perguntas frequentes" com só 2 itens, posicionada no ponto da página onde a
pessoa deveria estar ganhando confiança final antes do fechamento, é fina demais para o peso que o
título e a posição sugerem. **Correção concreta:** não é conteúdo (não inventar) — é decidir, com
o parceiro, se a seção deveria ficar menor visualmente (título mais discreto, menos padding) até o
cliente responder as pendências, ou ser reposicionada para não ocupar o último respiro antes do
CTA.

**P3-1 — "Sorriso com propósito" existe só na meta description invisível.** `app/page.tsx:29`. É a
assinatura mais repetida da marca no Instagram (`#sorrisocompropósito`) e não aparece em nenhum
texto visível do site. Para quem chega do feed reconhecendo essa frase, ela nunca aparece na
página. **Correção concreta:** considerar um uso visível pontual (ex.: como legenda pequena perto
do logo no rodapé, ou como a segunda linha manuscrita do CTA final) — sem inventar frase nova, é
copy que a própria marca já usa.

## 7. Personas — achar e apertar o WhatsApp

**Jordan (primeira vez, lê tudo, hesita).** Lê o hero, vê "Resposta pelo WhatsApp" sem horário
(corretamente omitido — pendência real). Segue lendo, chega em Profissional e vê "CRO-SP a
confirmar" com sublinhado tracejado dourado — para alguém cauteloso avaliando se pode confiar numa
clínica odontológica, um número de registro profissional ainda não preenchido é uma hesitação real
no momento errado (não é bug de UI — é pendência legítima do cliente, mas o efeito em Jordan é
concreto e vale registrar). O que **não** quebrou: a hierarquia da lista de tratamentos deu a
Jordan pontos de entrada claros (a numeração e o nome grande ajudam a escanear os 7 itens sem se
perder), e ele chega ao FAQ encontrando resposta real para "preciso levar algo" — que é exatamente
o tipo de dúvida de quem ainda não decidiu.

**Riley (testa limites: abre/fecha rápido, volta, recarrega no meio).** Testei o essencial que dá
para testar sem renderização ao vivo: cliques reais no hambúrguer e no botão de fechar do lightbox
alternam `aria-expanded`/removem o `[role="dialog"]` de forma consistente via estado React — não
encontrei estado travado ou duplicado nos meus testes. `Escape` no lightbox fecha e devolve foco
exatamente ao card de origem (confirmei com marcador no DOM). **⚠️ Não pude verificar** o caso
específico que o `qa-guidance.md` marca como já ter sido bug duas vezes — dois cliques no mesmo
lote de script caindo no mesmo batch do React — porque cliques disparados por `javascript_tool` em
chamadas separadas não reproduzem o timing real de dois toques físicos rápidos, e a composição de
frames para observar o resultado visual não funcionou neste ambiente.

**Casey (celular, uma mão, distraída, 3G).** O CTA "Agendar minha avaliação" e o `<h1>` estão
inteiramente acima da dobra em 375×812 (medido: `h1` termina em y=355, CTA em y=563, viewport
812) — Casey não precisa rolar para ver a ação principal. O FAB de WhatsApp é 58×58px, canto
inferior direito, alcançável com o polegar numa pegada destra padrão. Os vídeos de prévia usam
`preload="none"` (confirmado no card da recepção) — não puxam dado antes de precisar. O que **quase**
quebra: ao clicar para abrir um vídeo completo no lightbox, não há nenhum indicador de carregamento
visível enquanto o `.mp4` completo baixa (confirmei via rede que o download só começa no clique) —
em 3G, Casey vê um player parado sem saber se algo está acontecendo.

**A pessoa que veio do Instagram.** Reconhece a paleta em menos de 3 segundos — é a mesma
combinação branco/creme/amarelo/dourado do feed, sem ambiguidade. Reconhece o formato dos vídeos de
depoimento (mesmo gênero "Depoimento de Paciente" que vi em vários posts do feed ao vivo). Encontra
`@smileipiranga` linkado no rodapé, fechando o círculo. O que quebra: **não encontra a frase
"Sorriso com propósito"** em lugar nenhum visível — a assinatura mais repetida da marca no feed
simplesmente não está na página que deveria confirmar "é a mesma empresa".

## 8. Observações menores

- Header: o link do logo usa `href="#"` em vez de `/` — funciona (rola ao topo), mas não é
  semântico; sem impacto de uso real.
- A seção Clínica promete ambientação rica na copy ("luz, plantas, silêncio") mas entrega um único
  card de vídeo ("Conheça a recepção"), não uma galeria — decisão documentada no código
  (`Clinica.tsx`, o vídeo saiu do Instagram para o lightbox do próprio site), então não é bug, mas
  a proporção copy-rica/prova-única vale observar.
- Ticker: a faixa é `aria-hidden="true"` corretamente (evita duplicar a lista de tratamentos para
  leitor de tela) — bom detalhe, sem correção necessária.
- FAQ usa `<details>/<summary>` nativo — decisão de craft sólida, ganha navegação por teclado de
  graça; mas como não é um accordion exclusivo, abrir uma pergunta não fecha outra já aberta (hoje
  irrelevante com só 2 itens).

## Perguntas provocativas

1. **E se o hero tivesse só um CTA?** "Agendar minha avaliação" e "Conhecer a clínica" dividem a
   mesma linha visual com o mesmo peso de fonte — o que aconteceria com a taxa de clique se o
   secundário virasse um link de texto discreto abaixo, deixando literalmente uma única forma de
   agir no primeiro impacto?
2. **E se o trecho creme (Profissional→Localização) fosse cortado ao meio por uma seção com
   fundo diferente?** A página tem duas cores fortes disponíveis (preto de Sorrisos, amarelo do
   CTA final) que nunca aparecem nesse meio — o que ganharia em ritmo se uma delas emprestasse um
   pouco de presença ali?
3. **E se "Sorriso com propósito" fosse a frase que fecha a página, em vez de ficar só no
   `<meta>`?** É a linha que mais aparece no Instagram da própria clínica — por que ela nunca
   chega a quem já rolou a página inteira?

---

## Motion — dimensão própria

**Nota: 3/4.**

O motion do site, no que pude confirmar por código e por estado de repouso, segue a régua do
`design-guidance.md` com disciplina real na maior parte dos casos — mas há uma violação concreta
e mensurável do próprio teto numérico que o guia define, no componente de maior frequência de uso
no dispositivo que o projeto prioriza (mobile). Isso tira o motion de "excelente" (4, que o brief
exige ser honesto de verdade) e coloca em "muito bom com um furo específico" (3).

1. **Hero.** O canvas WebGL (`Silk`) está presente e ocupa a largura do container (confirmei
   `<canvas>` renderizado, 351×1240 em 375px). O `<h1>` usa `SplitText` — confirmei ao vivo que o
   `aria-label` do texto completo está no `<span class="split-parent">`, não no `<h1>` (o achado
   P1 já confirmado por axe no `qa-guidance.md` — cito porque toquei nele diretamente, não é
   descoberta nova). **⚠️ Não pude sentir o ritmo do reveal nem a resposta do `Magnet` ao ponteiro**
   — ambos dependem de rAF/pointer tracking que não pôde ser observado tocando (ver nota
   metodológica). Pelo código, o hero está estruturado corretamente (fundo decorativo separado do
   texto, sem competir por camada).

2. **Ticker (`ScrollVelocity`).** Excelente, com evidência concreta: velocidade base 40px/s,
   `damping: 60, stiffness: 300` (mais suave que o default 50/400 do React Bits),
   `velocityMapping` capado em 2,5× em vez do default 5-6×. Decisão documentada no próprio código
   citando o guia. Isto é o oposto de nervoso — é o exemplo mais bem calibrado do site.

3. **Tratamentos (`GlareHover`).** Só ativa com `pointer: fine` (confirmei via prop `disabled=
   {!pontoFino}` em `TratamentoLinha.tsx`) — não dispara em toque, evitando o problema clássico de
   hover preso em mobile. `glareOpacity={0.35}`, `transitionDuration={550}` — valores moderados,
   consistentes com "elegante" e não "genérico" pela configuração, mas **⚠️ não vi o brilho
   correndo de verdade** para confirmar a sensação.

4. **Entradas por scroll (`Reveal`).** O stagger nas 7 linhas de tratamento é explicitamente
   capado nos primeiros 5 itens (`STAGGER_MAX = 5` em `Tratamentos.tsx:13`, comentário cita o guia
   direto) — as linhas 6 e 7 entram junto com a 5ª, exatamente a recomendação de "não esticar a
   cascata". Bom sinal de disciplina, mas **⚠️ não confirmei visualmente** se algum bloco entra
   tarde demais depois que a pessoa já passou por ele — precisaria de scroll real renderizando, que
   este ambiente não sustentou.

5. **Sorrisos (`CircularGallery`).** Comentado em detalhe nas Forças (força #2) — o fallback sob
   reduced-motion tem dignidade real, verificado no código com cuidado incomum (rotação/
   deslocamento cíclico, não grid raso). `scrollEase: 0.06` no modo WebGL é um valor de inércia
   padrão de mercado para esse tipo de galeria — razoável, mas não pude sentir o arraste de
   verdade.

6. **Menu mobile (`StaggeredMenu`).** O problema já registrado como P2-1: cascata de abertura
   medida em ~1,3s no código contra um teto de 300ms que o próprio guia define para este
   componente especificamente, e curva de fechamento `power3.in` (família proibida pelo guia).
   Valor a mudar: cortar a duração dos itens (~0,8s → ~0,4-0,5s) e o alcance do stagger, ou trocar
   `power3.in` por uma curva de desaceleração no fechamento. Feedback de toque em cada item não
   pôde ser sentido ao vivo, mas a estrutura de `whileTap`/stagger no código está presente.

7. **Lightbox.** Estrutura correta por código (`scale`/`opacity`, fundo com transição própria) e
   comportamento **funcional confirmado ao vivo**: abre com vídeo pausado e controles visíveis
   (não autoplay), fecha com `Escape` e devolve foco exatamente ao elemento que abriu. **⚠️ Não
   confirmei visualmente** a curva `scale(0.95)→scale(1)` nem a assimetria de duração
   entrada/saída tocando de verdade.

8. **Carrosséis (`GradualBlur`).** Presente nas bordas do scroller de Depoimentos, 56px de
   largura, `divCount={4}` (gradiente em 4 passos, não um blur único e abrupto) — valor razoável
   para sugerir continuidade sem pesar. Não encontrei o mesmo tratamento no scroller de fallback de
   Sorrisos nem em Antes/Depois — se esses também rolam horizontalmente, vale conferir se têm o
   mesmo cuidado nas bordas.

**Resumo da calibragem:** o site tem pelo menos um motion que soa "de verdade" nota 4 (o ticker) e
craft real em pontos que a maioria dos projetos não daria atenção (fallback do CircularGallery,
FAB entrando/saindo). O que impede o 4 geral é concreto, não impressão: a timeline do menu mobile,
medida no próprio código, é ~4× mais longa que o teto que o guia do projeto define para
exatamente esse componente, e usa a curva que o guia proíbe por nome.
