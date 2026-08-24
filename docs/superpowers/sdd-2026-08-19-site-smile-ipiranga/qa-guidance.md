# Guia de QA — leitura obrigatória para a Task 18

Destilado da skill `impeccable` (playbooks `audit` e `critique`), somado à lição mais cara deste
projeto. Vale para quem executa a Task 18 e para quem a revisa.

---

## A lição que dita o método

Os três piores bugs do projeto inteiro saíram de **olhar a tela**, não de ler código:

- todos os `<h2>` do site renderizando a **16px** — passou por **seis** reviews;
- a seção de Tratamentos **sem título nenhum** — conteúdo aprovado, esquecido;
- reveals presos em `opacity: 0` para quem chega por link com âncora.

Seis reviews checaram estrutura, classes, ARIA e contraste com rigor e deixaram passar um site
visualmente quebrado, porque o painel do navegador raramente compositava frames e ninguém **mediu
o que aparecia**. Por isso:

**Regra 1 — verificação visual é obrigatória e tem que ser medida.** Para cada seção, em 375px e
1280px: `getComputedStyle` dos títulos (tamanho, peso, família), `getBoundingClientRect` do que
importa, e screenshot. Se o painel não compositar, diga isso em voz alta e use `javascript_tool`
para medir — mas **nunca** alegue ter visto o que não viu.

**Regra 2 — o detector não substitui o olho.** Rode o detector mecânico da `impeccable`
(`node C:/Users/Pichau/.claude/skills/impeccable/scripts/detect.mjs --json site/components site/app`)
sobre o **estado final**. Ele é determinístico e pega padrão repetido; não pega título a 16px.
Verifique cada achado no contexto antes de reportar, e separe falso positivo de defeito.

---

## Modo da superfície: **Persuade**

É uma landing page: o visitante decide e age. O sucesso é **agendar pelo WhatsApp**. Tudo que
compete com isso — ou que atrasa a pessoa de chegar no botão — é defeito, mesmo que bonito.

Consequência para a pontuação de heurísticas: os itens 7 (Flexibilidade/Eficiência) e 10
(Ajuda/Documentação) podem ser `n/a` — e o total é renormalizado para o máximo aplicável
(ex.: **/32** com dois `n/a`), nunca `/40` sobre um conjunto parcial.

---

## O audit técnico — 5 dimensões, nota 0-4 cada

| # | Dimensão | O que checar aqui, especificamente |
|---|---|---|
| 1 | **Acessibilidade** | Contraste ≥ 4,5:1 (grafite `#5A5A55` sobre amarelo **não passa** — nunca usar); `prefers-reduced-motion` com alternativa que **preserva** feedback (o reset global de `0.01ms` em `globals.css` é rede de segurança, mas flag se ele matar o `:active`); hierarquia de headings (um único `<h1>`, `<h2>` por seção); landmarks; `alt` em toda imagem informativa, `alt=""` em decorativa; foco visível em tudo; nenhuma armadilha de teclado no drawer e no lightbox |
| 2 | **Performance** | Entrada: os números finais da Task 17 (não re-meça Lighthouse — use o `task-17-report.md`); `will-change` não pode ficar ligado em repouso; nenhuma animação de `width`/`height`/`padding`/`top`/`left`; imagens por `next/image` com `sizes` real |
| 3 | **Tema** | Nenhum hex fora da paleta em componente (tokens em `globals.css`); o site **não tem dark mode de propósito** — não é defeito, registre como decisão |
| 4 | **Responsivo** | 320, 375, 414, 768, 1024, 1280, 1440, 1920: `document.documentElement.scrollWidth === clientWidth` em **todos**; alvos de toque ≥ 44px; nada cortado nem sobreposto; zoom a 200% sem quebrar |
| 5 | **Integridade de implementação** | O detector + leitura: o site é **desta** clínica, ou serviria para qualquer dentista? Nada decorativo que minta (estatística, estrela, badge) |

Bandas: 18-20 Excelente · 14-17 Bom · 10-13 Aceitável · 6-9 Ruim · 0-5 Crítico.

---

## O critique — o que a `impeccable` exige que eu não negocie

**Duas avaliações isoladas, em subagentes separados, que não veem uma a outra:**

- **A — revisão de design.** Um "diretor de design" lê o código e inspeciona a página ao vivo,
  em aba própria. Julga especificidade (é desta clínica?), hierarquia, carga cognitiva, jornada
  emocional, e pontua as 10 heurísticas de Nielsen **antes** de ver qualquer saída do detector.
- **B — detector + evidência de navegador.** Roda o detector, injeta o overlay no navegador se
  der, coleta o que é determinístico.

A deve terminar **antes** de B entrar no contexto de quem sintetiza — detector ancora julgamento.
Rodar os dois inline no mesmo contexto é um run **degradado** e precisa de banner na primeira
linha: `⚠️ DEGRADED: single-context (<motivo>)`. Silenciar isso é falha.

**Personas para landing page:** Jordan (primeira vez), Riley (testa limites), Casey (celular,
uma mão, distraída). Para cada uma, percorrer a ação principal — **encontrar e apertar o botão de
WhatsApp** — e listar o que quebrou, com nome do elemento. Nada genérico.

Para este projeto, acrescente uma persona derivada do briefing: **a pessoa que veio do Instagram**,
de celular, que conhece a Smile pelo feed e precisa reconhecer a mesma empresa em 3 segundos.
Se a página não parecer a mesma marca do @smileipiranga, é P1.

**Carga cognitiva — 8 itens, contar falhas:** foco único · chunking ≤4 · agrupamento · hierarquia
· uma coisa por vez · ≤4 opções por decisão · sem memória entre telas · revelação progressiva.
0-1 falhas = bom, 2-3 = moderado, 4+ = crítico. Atenção particular: a lista de **7 tratamentos** é
uma "parede de opções" no sentido do guia? Ela tem hierarquia (numeração, destaque)?

---

## Severidade — P0 a P3, e a pergunta que decide

| | | Regra prática |
|---|---|---|
| **P0** | Bloqueia a tarefa | A pessoa não consegue agendar |
| **P1** | Dificuldade séria ou violação WCAG AA | "A pessoa ligaria pro suporte?" Se sim, é ≥ P1 |
| **P2** | Incômodo com contorno | |
| **P3** | Polimento | Não inflar — P3 demais vira ruído |

Todo achado: **localização** (arquivo:linha), **impacto** (por que importa para quem usa),
**padrão** violado (WCAG, se houver), **correção** concreta. Sem "considere explorar".

---

## O que NÃO é defeito neste projeto — para não gerar falso positivo

- **`CRO-SP a confirmar`** e **`Ortodontista`** com tracejado dourado, **horário "a confirmar"**,
  **responsável técnico "nome a confirmar"**: são pendências **reais** do cliente, marcadas de
  propósito. Bloqueiam **publicação**, não o build. Registre como "bloqueio de release conhecido",
  não como bug.
- **Ausência de avaliações, estrelas, contagem de pacientes**: decisão de integridade — a clínica
  não tem esses dados. Não recomende adicionar.
- **Sem dark mode**: decisão.
- **Único uso de Caveat** (no CTA final): decisão do guia de craft.
- **Glifo `✦` em miniatura**: hoje todas as 7 têm foto; se aparecer glifo, **aí** é bug.
- **Canvas WebGL `aria-hidden` com resumo `sr-only`**: decisão documentada na Task 13, com a
  barreira de teclado reconhecida. Pode ser reavaliada aqui — a proposta de botões anterior/próximo
  está registrada no ledger — mas não é "faltou ARIA".

---

## Verificações específicas que este projeto exige além do playbook

1. **Navegação por âncora chegando com hash na URL** (`/#tratamentos`, `/#depoimentos`,
   `/#localizacao`): conteúdo visível, **inclusive com `prefers-reduced-motion` ligado**. Foi bug
   duas vezes.
2. **Drawer mobile**: abrir, fechar, reabrir em < 220ms (chamadas de script separadas — dois
   `.click()` na mesma chamada caem no mesmo lote do React). `scrollWidth === outerWidth` em
   375px. `elementFromPoint(200,400)` com o drawer aberto retorna elemento do drawer.
3. **Lightbox**: `Escape`, foco preso nas duas direções, foco devolvido ao card, `lenis.stop()`.
4. **Vídeo**: zero `.mp4` na carga inicial; prévia só ao entrar na viewport; completo só no clique;
   nada toca com `saveData` ou reduced-motion.
5. **Mapa**: zero requisição a `google.com/maps` antes de ativar.
6. **Dados inventados**: `grep -rEi "[0-9]+\+ (pacientes|clientes|anos)|[0-9],[0-9] estrelas|melhor clínica|garantid" .next/server/app/` → tem que dar vazio.
7. **Reconhecimento de marca**: lado a lado com o perfil @smileipiranga, a página é a mesma empresa?

---

## O que a Task 18 entrega

1. Relatório de **audit** (5 dimensões, nota, achados P0-P3, padrões sistêmicos, pontos positivos).
2. Relatório de **critique** (heurísticas, especificidade, carga cognitiva, personas, perguntas
   provocativas), com proveniência declarada na primeira linha.
3. **Correções** de tudo que for P0 e P1 — em commits pequenos, cada um com verificação medida.
   P2 e P3 ficam listados para o parceiro decidir.
4. Uma rodada de confirmação, **e só uma**: a `impeccable` é explícita — auto-QA em loop aberto
   queima dinheiro fazendo pior o que a entrega faz melhor. Construa, inspecione uma vez em lote
   (desktop e mobile juntos), corrija tudo de uma vez, confirme com no máximo mais uma rodada, pare.

---

## Ferramental de acessibilidade — decisão tomada, não rediscutir

`npx @axe-core/cli` **não funciona nesta máquina**: o chromedriver que ele embute crasha
(`GetHandleVerifier` no stack) e não há Chrome no caminho padrão. Não gaste tempo depurando.

Use no lugar, nesta ordem:

1. **Lighthouse** — ele embute o axe-core. Os audits de acessibilidade reprovados já estão em
   `site/lh-mobile.json` e `site/lh-desktop.json` (categoria `accessibility`, 94/100 nos dois).
   Extraia com script (chave `categories.accessibility.auditRefs` → `audits[id].details.items`),
   cada item traz `node.selector` e `node.snippet`. Re-rode o Lighthouse sobre o estado final.
2. **axe injetado pelo navegador** — se precisar do axe completo com regras que o Lighthouse não
   roda, injete o `axe.min.js` na página pelo `javascript_tool` (do cache do npx ou de
   `node_modules`) e chame `axe.run()`. Funciona sem chromedriver.
3. **Teclado e leitor de tela à mão** — o que nenhuma ferramenta pega: ordem de tabulação real,
   foco visível em cada pressionável, nomes acessíveis que fazem sentido quando lidos em sequência.

---

## Achados já confirmados pelo axe (via Lighthouse) — entrada garantida da Task 18

Os dois aparecem idênticos em mobile e desktop. Não são hipóteses: são violações WCAG AA
apontadas pelo axe-core embutido no Lighthouse, com seletor e snippet. Ambos **P1**.

**1. `aria-prohibited-attr` — `aria-label` num `<span>` sem role.**
Seletor: `h1.font-titulo > span.split-parent`. O GSAP SplitText escreve
`aria-label="Seu novo sorriso começa aqui"` no `span.split-parent` (comportamento `aria: "auto"`).
`aria-label` só é válido em elementos com role que aceite nome acessível; num `<span>` cru é
proibido e leitores de tela podem ignorar — ou pior, ler as palavras fatiadas.
**Cuidado na correção:** o teste `site/__tests__/hero.test.tsx` afirma igualdade exata desse
`aria-label` no `.split-parent` (decisão da Task 8, para driblar um artefato do jsdom). A correção
certa move o nome acessível para o próprio `<h1>` (heading aceita `aria-label`) e esconde as
peças fatiadas (`aria-hidden` nos filhos, ou a opção `aria` do SplitText) — e **atualiza o teste
para afirmar no `<h1>`**, mantendo a igualdade exata. Não afrouxe o teste.

**2. `heading-order` — salto de `h1` para `h3`.**
Seletor: `section.mx-auto > div.grid > div.flex > h3.font-titulo` — é a seção **Pilares**, logo
abaixo do hero. Os 4 pilares são `<h3>` e não existe `<h2>` entre o `<h1>` do hero e eles.
Correções possíveis, decidir pelo que lê melhor em leitor de tela: (a) um `<h2>` `sr-only` para
a seção ("Como atendemos" ou equivalente — **texto a confirmar contra o COPY.md, não inventar
frase de marketing**); (b) rebaixar os pilares de `<h3>` para `<p>` com `<strong>`, já que são
rótulos curtos, não subseções. A opção (b) é mais honesta semanticamente: quatro frases de 3
palavras não são subtítulos de nada.
