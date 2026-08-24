Avaliação B — evidência mecânica (sem julgamento de design)

Servidor avaliado: `http://localhost:4173`, build de produção do commit `ce7c58d` (estado final, 19 tasks). Ferramental: Node/vitest, Lighthouse (via `CHROME_PATH` apontado para o Microsoft Edge — Chrome não está instalado nesta máquina), `javascript_tool` do painel do navegador para toda medição ao vivo. Esta sessão sofreu um reinício no meio da execução; o contexto foi preservado e o trabalho retomado sem refazer nada que já estava gravado em disco (detector, os dois Lighthouse, a suíte).

**Limitação de ambiente relevante, declarada uma vez aqui e referenciada abaixo:** em boa parte desta sessão o painel do navegador reportou `document.hidden = true` / `visibilityState = "hidden"` de forma persistente (`computer.screenshot` falhou com "the page is not compositing frames" em toda tentativa). Isso não impede leitura de DOM/CSS computado via `javascript_tool` (que sempre funciona, como o brief avisa), mas **suspende `requestAnimationFrame`** — o que trava qualquer coisa dirigida por rAF: as transições GSAP do drawer mobile, o scroll suave do Lenis (que anima `window.scrollTo` de verdade via rAF, não um transform virtual) e, por design do próprio projeto, o ticker/`ScrollVelocity` (que foi endurecido na Task 19 para pausar quando a aba está oculta — comportamento correto, não bug). Onde isso impediu uma medição, está marcado explicitamente abaixo com o motivo técnico exato, nunca alegando ter visto o que não foi visto.

---

## 1. Detector mecânico (impeccable)

Comando: `node C:/Users/Pichau/.claude/skills/impeccable/scripts/detect.mjs --json site/components site/app`
**Exit code: 0 (limpo). Saída: `[]`** — zero achados. Gravado em `.superpowers/sdd/2026-08-19-site-smile-ipiranga/task-18-detect.json`. Nada a classificar (defeito real vs. falso positivo): não há entradas.

## 2. Lighthouse — estado final

Ambos rodaram com sucesso (`site/lh-final-mobile.json`, `site/lh-final-desktop.json`), apontando `CHROME_PATH` para `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (headless) porque não há Chrome instalado. Um erro cosmético de limpeza de diretório temporário (`EPERM` ao apagar `%TEMP%\lighthouse.*`) apareceu no stderr das duas rodadas — não afeta os JSONs de saída, que estão completos e válidos.

### Notas de categoria

| Categoria | Mobile | Desktop |
|---|---|---|
| Performance | 0.64 | 0.99 |
| Acessibilidade | 0.94 | 0.94 |
| Best Practices | 1.00 | 1.00 |
| SEO | 1.00 | 1.00 |
| Agentic Browsing | 0.50 | 0.50 |

### Métricas centrais

| Métrica | Mobile (simulate throttling) | Desktop (preset desktop) |
|---|---|---|
| LCP | 3892.7 ms | 888.8 ms |
| TBT | 1116.2 ms | 4.5 ms |
| CLS | 0.0000272 (~0) | 0.0000273 (~0) |
| TTI | 6794.9 ms | 924.4 ms |
| FCP | 914.7 ms | 251.3 ms |
| Speed Index | 2981.3 ms | 799.3 ms |

O LCP mobile simulado (3892.7ms) reproduz o mesmo padrão de gap simulado-vs-real já diagnosticado no projeto: `orcamento.test.ts` compara LCP simulado contra 2500ms e falha — o brief registra que o LCP com throttling **real** (não simulado) mede 2211ms, dentro do orçamento. Este relatório apenas reproduz a medição simulada pedida pelo item 2 do brief; não há indicação de regressão nova, é a mesma característica conhecida de o `simulate` superestimar o LCP mobile. TBT mobile de 1116ms é alto e é o achado-chave da dimensão Performance — não corrigido aqui, conforme regra "não corrija nada".

### Audits de acessibilidade reprovados (idênticos em mobile e desktop)

**1. `aria-prohibited-attr` — score 0 — P1 CONHECIDO, RECONFIRMADO**
- Seletor: `div.relative > div.flex > h1.font-titulo > span.split-parent`
- Snippet: `<span class="split-parent inline-block whitespace-normal " aria-label="Seu novo sorriso começa aqui" style="text-align: center; overflow-wrap: break-word; will-change: transform, opa…;">`

**2. `heading-order` — score 0 — P1 CONHECIDO, RECONFIRMADO**
- Seletor: `section.mx-auto > div.grid > div.flex > h3.font-titulo`
- Snippet: `<h3 class="font-titulo text-[17px] text-preto">`

Nenhum achado novo de acessibilidade no Lighthouse/axe além destes dois — idênticos em mobile e desktop, exatamente como o `qa-guidance.md` registra.

## 3. Varredura responsiva — medida via `javascript_tool`

| Largura pedida | clientWidth real | overflow (scrollWidth≠clientWidth) | alvos interativos < 44×44 | menor `<h2>` |
|---|---|---|---|---|
| 320 | 320 | não | 0 | 26px |
| 375 | 375 | não | 0 | 26px |
| 414 | 414 | não | 0 | 26px |
| 768 | 753 (scrollbar) | **SIM — 8px** (scrollWidth 761) | **4** (nav links) | 30.72px |
| 1024 | 1009 | não | **4** (nav links) | 40px |
| 1280 | 1265 | não | **4** (nav links) | 40px |
| 1440 | 1425 | não | **4** (nav links) | 40px |
| 1920 | 1905 | não | **4** (nav links) | 40px |

Notas de medição: `document.documentElement.clientWidth` já exclui a barra de rolagem vertical (por isso 768 pedido mede 753 de `clientWidth`) — isso é normal do navegador, não é o achado. O achado real em 768px é `scrollWidth (761) > clientWidth (753)`: uma barra horizontal de 8px.

**Achado 1 — overflow horizontal em 768px, rastreado à origem exata.** `header.scrollWidth = 761`, `header.clientWidth = 753`. O elemento mais à direita é o CTA `<a class="pressable ... bg-amarelo ... font-rotulo" href="https://wa.me/...">Agendar avaliação</a>`, com `getBoundingClientRect().right = 760.9`. A fileira do header (logo + 4 links + telefone + CTA) não cabe em 768px de largura — a barra de nav "desktop" ainda está ativa nesse breakpoint (o menu-drawer só existe abaixo de `md:`), mas o conteúdo é largo demais para o próprio breakpoint que o aciona.
Arquivo: `components/layout/Header.tsx` (o botão CTA e o wrapper `div.flex.items-center.gap-3`).
Impacto: barra de rolagem horizontal de 8px em tablets 768px; o botão de agendamento fica visualmente espremido/cortado na borda.
Severidade: **P2**.
Correção concreta: reduzir o gap/padding horizontal do CTA ou dos links de nav nesse breakpoint, ou empurrar o breakpoint do drawer de `md` (768px) para `lg` (1024px), já que 1024px não tem overflow com o mesmo conteúdo.

**Achado 2 — alvos de toque abaixo do mínimo, sistemático em todo breakpoint ≥768px.** Os 4 links de navegação do header desktop (`Tratamentos` `#tratamentos`, `A Clínica` `#clinica`, `Depoimentos` `#depoimentos`, `Como Chegar` `#localizacao`) medem consistentemente **19.5px de altura** — abaixo não só dos 44×44 que o projeto pede, mas também do mínimo de **24×24 do WCAG 2.5.8 (Target Size Minimum, nível AA, WCAG 2.2)**. Reproduzido idêntico em 768, 1024, 1280, 1440 e 1920 — 5 dos 8 breakpoints medidos.
Arquivo: `components/layout/Header.tsx`, os `<a href="#tratamentos">` etc.
Impacto: em qualquer dispositivo com tela sensível ao toque nessa faixa de largura (a maioria dos tablets em paisagem, laptops híbridos), o alvo é pequeno demais para toque confiável.
Padrão violado: WCAG 2.5.8 (AA) — 19.5px < 24px mínimo.
Severidade: **P1** (violação WCAG AA confirmada — regra do `qa-guidance.md`: "violação WCAG AA → ≥P1").
Correção concreta: aumentar `padding-block` dos links de nav para atingir ao menos 24px de altura (ideal 44px, ver `min-h-11` já usado no botão CTA do mesmo header).

Nenhum texto abaixo de 16px em fonte de corpo foi encontrado nas larguras ≥375 (não reamostrado em detalhe em todas — ver nota abaixo). Em 320px, amostra detalhada de todo texto <16px:

- A grande maioria usa a classe `font-rotulo` (rótulo/etiqueta) — **permitido** pela regra do projeto (13px é ok em rótulo).
- **Achado 3 (P3):** `p.max-w-[32ch].font-corpo` a **15px** ("Consultório de cadeira única — Odontologia integrada...", subtítulo do Hero) usa a classe `font-corpo` (corpo) explicitamente, não rótulo — fica 1px abaixo do mínimo de 16px que a própria regra do projeto define para corpo.
- **Achado 4 (P3, ambíguo — não é claramente bug):** bloco de contato do rodapé (endereço, CEP, telefones, "Smile Odontologia Ltda · CNPJ...", disclaimer em itálico) em 13-14px, sem a classe `font-rotulo` explícita. É microcopy de rodapé — pode ser tratado como rótulo por convenção de design (rodapés em 13-14px são padrão de mercado), mas tecnicamente não carrega a classe que o projeto usa para marcar essa exceção. Fica para o parceiro decidir se é rótulo por natureza ou se precisa da classe.

⚠️ Zoom a 200%: tentei emular via `document.body.style.zoom='2'` e medi overflow (deu `true`, `scrollWidth 2530` vs `clientWidth 1265`) — mas descartei esse resultado do relatório de achados porque `zoom` em CSS não é proxy fiel do zoom real do navegador (o zoom real do navegador reduz a largura CSS efetiva do viewport e por isso dispara as mesmas media queries responsivas que uma tela estreita disparia; `zoom` no `body` apenas amplia o conteúdo dentro de um viewport que não muda de largura lógica, então gera overflow artificial que uma pessoa usando zoom de navegador de verdade não veria da mesma forma). **⚠️ Não verificável de forma confiável nesta sessão** — o harness não expõe controle de zoom real de navegador.

## 4. Sete verificações específicas do projeto

**1. Navegação por âncora (`/#tratamentos`, `/#depoimentos`, `/#localizacao`) — motion normal.**
Medido: `getComputedStyle(el).opacity` para os três alvos, amostrado em t=0, 320, 814, 1510, 2521, 3207ms após `navigate()` com hash na URL. **Resultado: opacity="1" em todas as amostras, para os três alvos, desde t=0** — não preso em `opacity:0`. Confirma que o bug histórico ("reveals presos em opacity:0 para quem chega por link com âncora") está corrigido no build atual.

**1b. O mesmo, com `prefers-reduced-motion` emulado.** **⚠️ Não verificável nesta sessão.** O harness não expõe nenhuma flag de emulação de media query (o `resize_window` só tem `colorScheme` light/dark, nada de reduced-motion) e não há tool de CDP `Emulation.setEmulatedMedia` disponível. Tentei contornar sobrescrevendo `window.matchMedia` via script, mas isso não tem efeito: `lib/useCapability.ts` chama `matchMedia('(prefers-reduced-motion: reduce)')` **uma vez**, dentro de um `useEffect` no mount, e guarda o objeto `MediaQueryList` resultante em closure — sobrescrever `window.matchMedia` depois do mount não afeta essa referência já criada, e o CSS nativo (`@media (prefers-reduced-motion)`) também não pode ser falsificado via JS. Como evidência substituta (inspeção de código, não medição ao vivo): `app/globals.css:53-60` tem a rede de segurança global (`animation-duration:.01ms!important` etc. sob `prefers-reduced-motion:reduce`), e o comentário em `app/globals.css:42-44` mais o próprio CSS confirmam que `.pressable:active{transform:scale(0.97)}` (linha ~50) **não** está dentro do bloco comprimido — a transição fica quase instantânea, mas o estado pressionado continua sendo aplicado, exatamente o "reduzir ≠ zerar" que o parceiro pede. `components/ui/Reveal.tsx` tem um ramo explícito para `!podeAnimar` que preserva o fade de opacidade (0.2s) e remove só o deslocamento `y`, com `immediateRender:false` documentado para nunca esconder conteúdo antes da hora.

**2. Drawer mobile (375px) — abrir, fechar, reabrir em chamadas separadas.**
Três chamadas de `javascript_tool` **separadas** (não uma única com dois `.click()`, que cairia no mesmo lote do React): abrir → `aria-expanded` false→true, `aria-label` "Abrir menu"→"Fechar menu"; fechar → true→false, label volta; reabrir → false→true de novo. **Os três estados alternaram corretamente, sem travar** — confirma que a correção documentada no próprio código (`components/reactbits/StaggeredMenu.tsx:27-30`: "reabertura rápida não pode deixar `inert` preso") está funcionando ao nível de estado React.
⚠️ **A latência real sub-220ms entre chamadas não é mensurável neste harness** — cada chamada de `javascript_tool` tem overhead de rede/agente de vários segundos (~5s entre chamadas nesta sessão), muito maior que os 220ms em questão. O que fica confirmado é a estrutura (chamadas separadas, sem lote do React), não o tempo real de resposta.
`elementFromPoint(200,400)` com o drawer aberto → `<aside class="sm-panel-scope pointer-events-auto absolute inset-y-0 right-0 z-10 ...">` — **é o elemento do drawer, confirmado** (medição feita antes do reinício desta sessão, mesma tarefa, mesmo commit/servidor; nesta segunda metade da sessão o painel ficou com `document.hidden=true` persistente, o que trava o `requestAnimationFrame` do GSAP que anima o slide-in — repeti a tentativa várias vezes e o `transform` do painel ficou preso em `matrix(1,0,0,1,320,0)` (posição fechada) mesmo com `aria-expanded="true"`; isso é o mesmo artefato de não-compositing do brief, não um bug do site — o `StaggeredMenu.tsx` usa `requestAnimationFrame(() => focaveis()[0]?.focus())` para o foco inicial, que fica pendente enquanto rAF está suspenso).
`scrollWidth === outerWidth === innerWidth` (375) com o drawer aberto: **confirmado, sem vazamento horizontal**.
**Achado 5 (P2) — fundo não fica `inert`/`aria-hidden` enquanto o drawer está aberto.** Medido: `document.body.hasAttribute('inert') === false`, `document.querySelector('main').hasAttribute('inert') === false`, `mainAriaHidden === null`, com o drawer confirmadamente aberto (`aria-expanded="true"`, painel com `inert=false`). Conferido também no código (`components/layout/MobileMenu.tsx`): o único elemento que recebe `inert`/`aria-hidden` amarrado ao estado é o **próprio painel** (via `StaggeredMenu.tsx:294 inert={!open}`); não há nenhuma linha que aplique `inert` a `<main>` ou `<header>` quando o drawer abre. O componente **tem** um focus-trap funcional por teclado (listener de `keydown` em `document`, ver `MobileMenu.tsx` — Tab/Shift+Tab prendem entre o primeiro e o último item focável do painel, e o foco inicial vai para o primeiro item via `requestAnimationFrame`), então um usuário de Tab puro tende a ficar contido na prática assim que o foco inicial entra no painel. Mas um usuário de leitor de tela navegando por cursor virtual/modo de navegação (não Tab sequencial) ainda pode alcançar e ler o conteúdo de fundo, porque ele não está programaticamente escondido.
Impacto: pessoa com leitor de tela pode encontrar conteúdo duplicado/fora de contexto atrás do drawer aberto.
Correção concreta: aplicar `inert` (ou `aria-hidden="true"`) em `<main>` (e no restante do `<header>` fora do próprio drawer) enquanto `aberto === true`, revertendo ao fechar — mesmo padrão já usado no painel do Lightbox.

**3. Lightbox — Escape, Tab/Shift+Tab, foco, `lenis-stopped`.**
Abri via clique real (`computer.left_click` com `ref`, não `.click()` via script — importante: `.click()` via JS não aciona o "foco no clique" do Chrome do mesmo jeito que um clique real, o que teria confundido o teste de retorno de foco). Confirmado, tudo medido ao vivo:
- Ao abrir: `document.documentElement.classList.contains('lenis-stopped') === true`; foco inicial no botão "Fechar vídeo" (primeiro focável do painel).
- `Shift+Tab` a partir do primeiro focável → foco vai para o último (`<video>`) — **trap confirmado numa direção**.
- `Tab` a partir do último → volta para o primeiro ("Fechar vídeo") — **trap confirmado na outra direção**.
- `Escape` → fecha; foco volta **exatamente** ao card que abriu ("Assistir: Conheça a recepção"); `lenis-stopped` removido do `<html>`.
Tudo conforme o contrato documentado em `components/ui/Lightbox.tsx` — nenhuma armadilha de teclado, sem achado aqui. **Ponto positivo a destacar.**

**4. Vídeo — zero `.mp4` na carga, prévia só na viewport, completo só no clique.**
`performance.getEntriesByType('resource')` logo após carregar a página: 44 recursos totais, **zero `.mp4`, zero `completos/`** — confirmado limpo.
Prévia só ao entrar na viewport: **⚠️ não confirmável ao vivo nesta sessão** — o mecanismo (`components/ui/VideoCard.tsx`) usa `IntersectionObserver` para só então criar um `<source>` e chamar `.load()`; para testar isso eu precisava rolar a página, e o scroll suave do Lenis (que anima `window.scrollTo` de verdade via rAF) não progride com `document.hidden=true`. Tentei `window.scrollTo`, o próprio `window.lenis` (que só expõe `{version}`, não é a instância real — confirmado lendo `node_modules/lenis/dist/lenis.mjs:435-439`, é um objeto de debug da própria lib), scroll por teclado (`End`) e esperas de até 6s: a posição de scroll não avançou em nenhuma tentativa. Evidência substituta por leitura de código: `VideoCard.tsx` só anexa `<source src="/videos/previews/${slug}.mp4">` e chama `v.load()` dentro do callback do `IntersectionObserver` quando `entrada.isIntersecting`, nunca antes — o padrão está correto no código, só não pude reproduzir ao vivo o cruzamento de viewport.
Completo só no clique: não testado ao vivo pelo mesmo motivo (dependia de rolar até um vídeo e abrir o lightbox por ele); o Lightbox testado no item 3 usa `<video>` com o `slug` do preview, e a fonte completa (`completos/`) só é injetada sob demanda — inferido do padrão consistente com o preview, não confirmado por medição direta desta vez.

**5. Mapa — zero requisição antes, uma depois.**
`performance.getEntriesByType('resource')` antes de qualquer interação: `google.com/maps` count = **0**. Cliquei no botão "Ver no mapa" (`components/sections/Localizacao.tsx`) via `.click()` — como aqui o teste é sobre requisição de rede (não sobre foco), `.click()` via script é suficiente. Depois do clique: **exatamente 1** entrada — `https://www.google.com/maps?q=Rua%20Clemente%20Pereira%2C%20507%2C%20Ipiranga%2C%20S%C3%A3o%20Paulo&output=embed`, correspondendo ao `<iframe>` recém-montado. **Confirmado, limpo, sem confound.**

**6. Dados inventados.**
`grep -rEi "[0-9]+\+ (pacientes|clientes|anos)|[0-9],[0-9] estrelas|melhor clínica|garantid" .next/server/app/` → **vazio** (exit 1, zero matches). Confirmado limpo.

**7. Paleta.**
`grep -rnoE "#[0-9a-fA-F]{6}" components app --include=*.tsx` encontrou 12 ocorrências; comparando contra a paleta permitida (`#FFFFFF #FCF0E4 #FCCC24 #F0B40C #111111 #5A5A55 #F1E7DB #E8DCCA #EFDFC9 #EBDFCE #2A2A28 #8A8A85 #B7B7B2`), **3 aparentam estar fora** — verificadas uma a uma no contexto, **todas são falso positivo**:
- `#5227FF` e `#ff0000` em `components/reactbits/StaggeredMenu.tsx:64-65` — existem **só dentro de um comentário JSDoc** que documenta a remoção da paleta placeholder original do React Bits ("removida a paleta placeholder do React Bits (`#5227FF` roxo, `#ff0000` vermelho de fallback...)"). Não são código executável; o `accentColor` real usado é `'#F0B40C'` (permitido), confirmado na linha 115 do mesmo arquivo.
- `#7B7481` em `components/reactbits/Silk.tsx:199` — é o valor **default** do prop `color` do componente `Silk`, mas o único lugar do projeto que invoca `<Silk>` (`components/sections/HeroBackdrop.tsx:43`) passa `color="#F0B40C"` explicitamente, sobrescrevendo o default sempre. `#7B7481` nunca chega a renderizar em nenhuma página do site.
- `#ffffff` em `components/reactbits/GlareHover.tsx:85` — é o mesmo valor de `#FFFFFF` (já permitido), só com capitalização diferente; nem é uma cor nova, é uma duplicata de grafia do grep.
**Nenhum achado real de paleta.**

## 5. Console

Recarreguei em 375px e em 1280px, `read_console_messages` nas duas. **Idêntico nas duas larguras: 4× `[warn] THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.`** — é o aviso já conhecido e deferred citado no brief; não inflacionado aqui, apenas registrado. **Nenhum erro em nenhuma das duas larguras.**

## 6. Suíte de testes

`npx vitest run --no-file-parallelism` (dentro de `site/`): **23 de 24 arquivos passaram; 220 de 221 testes passaram.**
Única falha: `__tests__/orcamento.test.ts > orçamento de performance > atinge LCP abaixo de 2,5s no mobile simulado` — `AssertionError: expected 3847.0693 to be less than 2500` (o teste lê `lh-mobile.json`, não o `lh-final-mobile.json` gerado nesta rodada). É o estado "vermelho de propósito" descrito no brief. Não corrigido, apenas reportado.

## 7. Motion — o que dá para medir

**`document.getAnimations({subtree:true})` após rolar a página inteira.** **⚠️ Não plenamente verificável nesta sessão.** Consegui rolar a página com sucesso uma única vez, antes de um dos pontos de confusão do harness (`window.scrollTo` seguido de espera real chegou a `scrollY=10389` de `scrollHeight=11201`), mas não consegui reproduzir isso de forma confiável depois — o Lenis (que anima o scroll de verdade via `window.scrollTo`, não um transform virtual — ver comentário em `components/sections/Ticker.tsx`) depende de `requestAnimationFrame`, suspenso enquanto `document.hidden=true`. Na maioria das tentativas desta sessão, `scrollY` permaneceu em 0 mesmo depois de `window.scrollTo`, cliques no `window.lenis` (que na verdade é só um objeto de debug `{version}` exposto pela própria lib — não a instância real, confirmado lendo o pacote), tecla `End` real via `computer.key`, e esperas de até 6s.
Com a página **em repouso** (topo, sem scroll), `document.getAnimations()` retornou **0** — sem animação presa, sem `will-change` ativo em repouso detectável por essa via. Isto é parcialmente esperado por design: `components/sections/Ticker.tsx`/`ScrollVelocity.tsx` foram endurecidos na Task 19 especificamente para **pausar fora da viewport ou com a aba oculta** — meu `document.hidden=true` persistente faz o ticker corretamente ficar parado, não é um bug, é o comportamento correto sendo observado sob a condição que ele foi desenhado para tratar.
Evidência de código como substituto: `ScrollVelocity.tsx` anima a motion value `x` (mapeia para `transform: translateX`, não `left`) — conforme a regra "só transform e opacity". `GlareHover.tsx` anima `background-position` via `style.transition = '${ms}ms ease'` — é a exceção explicitamente aceita pelo parceiro, confirmada linha a linha (`el.style.backgroundPosition`, `ease` puro, não um easing proibido).

**`grep -rn "transition: all\|transition-all\|ease-in\b" site/components site/app`** → 4 ocorrências, **todas falso positivo**: `GradualBlur.tsx:17,100,102` são um sistema de nomes de curva **JavaScript** (`'ease-in': (p) => p*p`) para calcular blur/opacidade por segmento — não é `transition-timing-function` CSS, é uma função matemática interna sem relação com o CSS real de transição; `reactbits/README.md:66` é prosa de documentação. **Nenhum achado real.**

**`prefers-reduced-motion` — canvas desmontado, vídeo pausado, ticker parado, `:active` ainda funciona.** **⚠️ Não verificável ao vivo** — mesma limitação do item 1b (sem flag de emulação no harness). Por leitura de código: `components/sections/HeroBackdrop.tsx:38` só monta o `<Silk>` (canvas WebGL) quando `montado && podePesado`, e `podePesado` exige `podeAnimar` (`lib/useCapability.ts`) — sob reduced-motion, `podeAnimar=false` ⇒ canvas nunca monta. `VideoCard.tsx:78` tem a mesma guarda (`if (!v || !montado || !podePesado) return`) — vídeo nunca reproduz. O CSS de `:active` (`app/globals.css` ~linha 49-50) fica fora do bloco `@media (prefers-reduced-motion:reduce)` que comprime durações — o feedback de toque sobrevive por desenho. Tudo isso é leitura de código, não medição de navegador.

**Long tasks (>50ms) durante scroll programático do topo ao fim.** Registrei um `PerformanceObserver({entryTypes:['longtask']})` com sucesso (a API respondeu sem erro) e disparei `window.scrollTo(0, scrollHeight)`. **⚠️ Não verificável nesta sessão**: como o scroll não progrediu de forma confiável (mesma limitação do Lenis/rAF descrita acima), o observer capturou **zero** entradas — mas isso é porque o scroll efetivamente não aconteceu na maior parte das tentativas, não porque a rolagem foi limpa. Não posso reportar "0 long tasks" como um resultado de qualidade; é um "não medido", registrado como tal.

---

## Nota das 5 dimensões do audit técnico

| # | Dimensão | Nota | Achado-chave |
|---|---|---|---|
| 1 | Acessibilidade | 2/4 | 2 violações WCAG AA conhecidas e reconfirmadas (aria-prohibited-attr, heading-order) + 1 nova (alvos de toque do nav <24px, WCAG 2.5.8 AA) + fundo não-inert no drawer. Lightbox exemplar (trap, retorno de foco, Escape) e rede de segurança de reduced-motion corretas no código. |
| 2 | Performance | 3/4 | Desktop excelente (0.99, LCP 0.9s); mobile abaixo do orçamento no throttling simulado (LCP 3.9s, TBT 1116ms vs meta 2.5s) — mesmo gap simulado-vs-real já diagnosticado e aceito (real: 2211ms, dentro). Sem animação de propriedade de layout; sem `will-change` preso em repouso. |
| 3 | Tema | 4/4 | Grep de paleta não achou violação real — as 3 ocorrências aparentes são falso-positivo (comentário, default nunca usado, duplicata de grafia). Sem dark mode por decisão. |
| 4 | Responsivo | 2/4 | Overflow horizontal real de 8px em 768px, rastreado ao CTA do header; alvos de toque <24px sistemáticos em 5 dos 8 breakpoints (≥768px). Em compensação, 320-414px impecáveis e nenhum `<h2>` cai a 16px em nenhuma largura (bug antigo confirmado corrigido). |
| 5 | Integridade de implementação | 4/4 | Detector limpo; grep de dados inventados vazio; conteúdo específico da clínica (endereço real, profissional nomeado, pendências reais marcadas como tal, não fabricação). |

**Total: 15/20 — banda Bom** (14-17).

## Achados P0-P3

**P0: 0.** Nada impede a tarefa de agendar — os CTAs de WhatsApp funcionam em toda largura testada, sem bloqueio de teclado ou script encontrado.

**P1: 3**

1. **[CONHECIDO, RECONFIRMADO]** `aria-prohibited-attr` — `aria-label` num `<span>` sem role. Seletor `h1.font-titulo > span.split-parent`. WCAG 4.1.2 (Name, Role, Value). Fonte: Lighthouse/axe, mobile e desktop idênticos. Correção já documentada no `qa-guidance.md` (mover o nome acessível para o `<h1>`, atualizar `hero.test.tsx`).
2. **[CONHECIDO, RECONFIRMADO]** `heading-order` — salto de `h1` para `h3` na seção Pilares. Seletor `section.mx-auto > div.grid > div.flex > h3.font-titulo`. WCAG 1.3.1 (Info and Relationships). Fonte: Lighthouse/axe, mobile e desktop idênticos.
3. **[NOVO]** Alvos de toque do nav desktop (`Tratamentos`, `A Clínica`, `Depoimentos`, `Como Chegar`) a 19.5px de altura, abaixo do mínimo WCAG 2.5.8 (24px) — reproduzido em 768/1024/1280/1440/1920px. Arquivo: `components/layout/Header.tsx`. Impacto: alvo pequeno demais para toque confiável em tablets/laptops híbridos nessa faixa. Correção: aumentar `padding-block` para ≥24px (idealmente 44px).

**P2: 2**

4. Overflow horizontal de 8px em 768px, rastreado ao CTA "Agendar avaliação" do header (`right: 760.9px` contra `clientWidth: 753px`). Arquivo: `components/layout/Header.tsx`. Correção: reduzir gap/padding do CTA nesse breakpoint ou mover o corte do drawer de `md` para `lg`.
5. Fundo (`<main>`, `<header>`) não fica `inert`/`aria-hidden` enquanto o drawer mobile está aberto — confirmado por medição (`bodyInert=false`, `mainInert=false`, `mainAriaHidden=null`) e por leitura de `MobileMenu.tsx`/`StaggeredMenu.tsx` (o `inert` só está amarrado ao painel, nunca ao fundo). O trap de teclado (Tab/Shift+Tab) funciona e cobre usuários de Tab sequencial; usuários de leitor de tela em modo de navegação livre continuam expostos ao conteúdo de fundo. Correção: aplicar `inert`/`aria-hidden="true"` em `<main>` enquanto o drawer está aberto, mesmo padrão já usado no Lightbox.

**P3: 2**

6. `p.max-w-[32ch].font-corpo` a 15px no subtítulo do Hero ("Consultório de cadeira única...") — 1px abaixo do mínimo de 16px que o próprio projeto define para texto de corpo (a classe usada é `font-corpo`, não `font-rotulo`).
7. Bloco de contato do rodapé (endereço, CEP, telefones, CNPJ, disclaimer) em 13-14px sem a classe `font-rotulo` explícita — ambíguo se deve ser tratado como rótulo por convenção ou se precisa da classe; fica para decisão do parceiro, não é claramente um bug.

## Tabelas de referência

### Lighthouse final — ver seção 2 acima (categorias + métricas centrais + os dois audits de a11y reprovados).

### Responsiva — ver tabela da seção 3.

### 7 verificações — ver seção 4 (cada uma com comando/medição e resultado).

## Padrões sistêmicos

- **O par overflow-em-768 + alvos-de-toque-pequenos no nav** (achados 3 e 4) têm a mesma raiz: o header desktop (logo + 4 links + telefone + CTA, todos dimensionados para telas ≥1024px de sobra) é ativado já em 768px (o corte do drawer é em `md:`), mas o conteúdo não foi ajustado para caber nem para ter alvo de toque adequado nessa largura especificamente tablet. Um único ajuste de breakpoint ou de padding resolveria os dois achados juntos.
- **Padrão de foco/inert é dessimétrico entre os dois overlays do projeto**: o Lightbox (`Lightbox.tsx`) aplica `inert`/`aria-hidden` no próprio painel via toggle direto e usa foco síncrono (sem depender de `requestAnimationFrame`) — testável e correto de ponta a ponta nesta sessão. O Drawer (`MobileMenu.tsx`/`StaggeredMenu.tsx`) usa `requestAnimationFrame` para o foco inicial (mais frágil sob condições de rAF suspenso, como esta sessão demonstrou) e não estende `inert` ao fundo. Vale trazer o Drawer para o mesmo padrão do Lightbox.
- **Boa disciplina de motion tokens**: em todo o código de animação revisado (Ticker/ScrollVelocity, GlareHover, Reveal, MobileMenu, Lightbox), as propriedades animadas são sempre `transform`/`opacity`/`background-position` (esta última uma exceção documentada e aceita) — nenhuma ocorrência de animação de `width/height/top/left/padding/margin` encontrada nem por grep nem por leitura dos componentes de motion revisados.
- **Capacidade do dispositivo como fonte única de verdade**: `lib/useCapability.ts` centraliza `prefers-reduced-motion`, `pointer:fine`, `saveData` e `deviceMemory`/`hardwareConcurrency` num único hook consumido por Hero (canvas), VideoCard, Reveal, MobileMenu e Lightbox — evita que cada componente reimplemente sua própria lógica de capacidade (e reduz o risco do tipo de bug que motivou este guia: um componente decidir sozinho e destoar dos outros).

## Pontos positivos (o que manter)

- Lightbox com focus-trap bidirecional, retorno de foco exato ao gatilho, `Escape`, e `lenis-stopped` — confirmado de ponta a ponta ao vivo, sem nenhuma ressalva.
- Mapa e vídeo carregados sob demanda: zero requisição de mapa/vídeo completo antes da ativação, confirmado por medição de rede real.
- Zero dado inventado (estatística, estrela, "melhor clínica") — grep limpo, conteúdo específico desta clínica.
- Paleta de cores disciplinada — os únicos hex fora da lista permitida no código-fonte estão em comentários ou em defaults nunca usados; nada realmente renderiza fora da paleta.
- `<h2>` nunca cai a 16px em nenhuma das 8 larguras testadas — o bug histórico do projeto (citado no `qa-guidance.md`, "passou por seis reviews") está confirmadamente corrigido.
- Motion via tokens de easing consistentes (`--ease-saida` etc.) e sempre em `transform`/`opacity`; rede de segurança de `prefers-reduced-motion` no CSS global preserva feedback de `:active` em vez de zerar tudo.
