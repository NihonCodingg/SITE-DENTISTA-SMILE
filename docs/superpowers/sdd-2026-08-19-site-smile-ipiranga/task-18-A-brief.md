# Task 18 — Avaliação A: revisão de design (isolada)

Você é o **diretor de design** que revisa o site da clínica odontológica Smile Ipiranga antes da
entrega. Esta é a **Avaliação A** de uma crítica em duas partes. A **Avaliação B** (detector
mecânico, Lighthouse, checagens técnicas) roda em paralelo, em outro agente, e **você não pode
ver a saída dela** — nem rodar o detector, nem abrir `impeccable-detect.json`, nem ler
`lh-*.json`. Seu julgamento tem que ser **não-ancorado**: o que você vê e lê, só.

**Diretório:** `D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA`
**Servidor de produção já no ar:** `http://localhost:4173` — **não rebuilde, não suba outro
nesta porta, não altere `.claude/launch.json`.** Abra em **aba nova sua** (`preview_start` com
`url`), nunca reaproveite aba existente.

## Leia antes de olhar a página

1. `.superpowers/sdd/2026-08-19-site-smile-ipiranga/qa-guidance.md` — método, modo Persuade,
   personas, **o que NÃO é defeito** (pendências do cliente marcadas de propósito, sem avaliações
   por integridade, sem dark mode por decisão). Leia a seção "O que NÃO é defeito" com atenção:
   reportar pendência conhecida como bug é falso positivo.
2. `.superpowers/sdd/2026-08-19-site-smile-ipiranga/design-guidance.md` — o guia de craft que
   toda task de UI seguiu. O que ele manda é a régua.
3. `BRIEFING.md` e `COPY.md` na raiz — quem é o cliente, o que está confirmado, qual é a copy
   aprovada. E `PROMPT-CLAUDE-DESIGN.md` — o brief que gerou o design aprovado.
4. `https://www.instagram.com/smileipiranga/` — abra e olhe. A pergunta central desta avaliação
   é se o site **parece a mesma empresa** do feed.

## Inspecione a página ao vivo — e MEÇA

Em **375×812** e **1280×900**. Para cada uma das 15 seções (Header, Hero, Ticker, Pilares,
Tratamentos, Clínica, Sorrisos, Profissional, Depoimentos, Antes/Depois, Como Funciona,
Localização, FAQ, CTA final, Rodapé):

- screenshot (se o painel não compositar, diga isso e use `javascript_tool`);
- `getComputedStyle` do título (tamanho, família) — os três piores bugs deste projeto eram
  visuais e passaram por seis reviews que só leram código;
- o que o olho vê: hierarquia, respiro, alinhamento, peso do CTA, consistência entre seções.

Interaja: abra o drawer mobile, abra um vídeo no lightbox, expanda uma pergunta do FAQ, role
até o fim. Sinta o motion: calmo e confiante (como o guia pede) ou nervoso?

## O que entregar — em `.superpowers/sdd/2026-08-19-site-smile-ipiranga/task-18-A-report.md`

**Primeira linha obrigatória:** `Avaliação A — não-ancorada (sem detector, sem Lighthouse)`.

1. **Veredito de especificidade.** O site é **desta** clínica, ou um template de dentista serviria
   igual? Cite o que o torna específico (ou não): a parede verde, o amarelo, os pacientes reais,
   a fachada, a voz da copy. Compare com o Instagram.
2. **Heurísticas de Nielsen, 0-4 cada**, em tabela com "achado-chave" por linha. Modo Persuade:
   7 (Flexibilidade) e 10 (Ajuda) podem ser `n/a` com uma linha de motivo; o total é
   renormalizado (ex.: **/32**), **nunca `/40` sobre conjunto parcial**. Seja honesto: 4 é
   excelente de verdade; a maioria das interfaces reais fica em 20-32 de 40.
3. **Carga cognitiva** — os 8 itens do guia, contando falhas. Em particular: a lista de 7
   tratamentos é parede de opções ou tem hierarquia? O hero tem uma ação clara ou compete?
4. **Jornada emocional** — pico-fim: onde está o pico (provavelmente a galeria de sorrisos) e
   como a página termina (o CTA amarelo)? Há vale emocional — uma seção que esfria a pessoa?
5. **2-3 forças**, específicas, dizendo *por que* funcionam.
6. **3-5 problemas prioritários**, cada um com **P0-P3**, o quê, por que importa para quem usa,
   correção concreta. Regra: "a pessoa ligaria para o suporte?" → ≥ P1.
7. **Personas** — percorra a ação principal (**achar e apertar o WhatsApp**) como:
   - **Jordan** (primeira vez, lê tudo, hesita),
   - **Riley** (testa limites: abre e fecha rápido, volta, recarrega no meio),
   - **Casey** (celular, uma mão, distraída, 3G),
   - **a pessoa que veio do Instagram** (conhece a Smile pelo feed; precisa reconhecer a
     mesma empresa em 3 segundos).
   Para cada uma: o que quebrou, com o nome do elemento. Nada genérico.
8. **Observações menores** e **2-3 perguntas provocativas** ("e se o hero fosse mais confiante?").

## Regras

- **Não corrija nada.** Você avalia. Outra pessoa corrige.
- **Não invente dado** nem sugira adicionar estatística, estrela, badge ou depoimento escrito. A
  clínica não tem esses dados e a decisão de não fingir é de integridade.
- Seja direto. "O botão de WhatsApp do hero", não "alguns elementos". Diga o que está errado
  **e** por que importa. Corte "considere explorar".
- Feche o servidor? **Não** — ele é compartilhado. Feche só a sua aba.

Na resposta final, retorne APENAS: o caminho do relatório, a nota total das heurísticas (com o
máximo aplicável), a contagem P0/P1/P2/P3, e o veredito de especificidade em uma frase.

---

## Motion — dimensão própria, pontuada (acréscimo do parceiro)

O parceiro foi explícito: **o site precisa ter motion ótimo e animações de alto nível.** Isso
não é "nice to have" aqui — é requisito de entrega. Avalie o motion como uma dimensão própria,
nota 0-4, com a régua do `design-guidance.md` (curvas, durações, stagger, reduced-motion que
reduz e não zera, feedback de toque em tudo que é pressionável).

Percorra, de cima para baixo, e **descreva o que sentiu** em cada um:
1. **Hero**: o fundo WebGL (`Silk`) dá vida sem competir com a headline? O reveal do `<h1>`
   (`SplitText`) tem ritmo ou parece atraso? Os CTAs magnéticos (`Magnet`) respondem ao ponteiro
   sem parecer instáveis?
2. **Ticker** (`ScrollVelocity`): acelera com o scroll de forma perceptível e calma, ou nervosa?
3. **Tratamentos** (`GlareHover` nas linhas): o brilho no hover é elegante ou genérico?
4. **Entradas por scroll** (`Reveal`): cascata com stagger, ou tudo aparecendo de uma vez? Algum
   bloco que entra tarde demais, quando você já passou por ele?
5. **Sorrisos** (`CircularGallery` WebGL): é o pico emocional da página? Arrastar tem inércia
   boa? Em reduced-motion, o fallback de scroller ainda tem dignidade?
6. **Menu mobile** (`StaggeredMenu`): entrada dos itens em cascata, saída mais rápida que a
   entrada, feedback ao tocar?
7. **Lightbox**: entra de `scale(0.95)`, sai mais rápido do que entra?
8. **Carrosséis** (`GradualBlur` nas bordas): o desfoque das bordas sugere continuidade?

Para cada um: **o que está excelente, o que está só "ok", o que atrapalha**. Motion que a pessoa
nota como motion (e não como a página "parecendo viva") é sinal de calibragem errada. Se algo
está abaixo de "alto nível", diga **qual valor mudar** (duração, curva, stagger, amplitude) —
não "melhorar a animação".

Adicione a nota de motion à tabela final, separada das heurísticas de Nielsen.
