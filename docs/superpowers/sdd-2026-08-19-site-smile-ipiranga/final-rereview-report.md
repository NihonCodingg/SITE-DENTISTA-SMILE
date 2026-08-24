# Re-review escopada da onda final de correção — relatório

Contrato: `final-rereview-brief.md`. Alvo: `e20b607^..5b59e01` (15 commits) + `78bb4be`
(sincronização do arquivo, posterior ao range). HEAD no início e no fim: `78bb4be`, `git status`
limpo nos dois momentos.

Somente leitura do git. A única mutação de working tree foi a prova por quebra do I3, que o brief
manda fazer — revertida com `git checkout --` e conferida (`git status` vazio) logo em seguida.
Nenhum commit, nenhuma mudança em `.claude/launch.json`. Servidor próprio na 4703, encerrado ao
final (PID 24572 finalizado, porta fechada).

**Veredito: 12 ADDRESSED · 1 PARTIAL (I5) · 0 NOT ADDRESSED.**

---

## Por item

### I1 — `npm test` termina · ADDRESSED

- `site/vitest.config.ts:16`: `fileParallelism: false`, com comentário de 5 linhas explicando o
  porquê. `site/package.json` mantém `"test": "vitest run"`.
- **Rodei eu mesmo**, em primeiro plano, de `site/`:

```
 Test Files  1 failed | 25 passed (26)
      Tests  1 failed | 243 passed (244)
   Duration  57.54s (transform 654ms, setup 7.34s, import 5.14s, tests 8.16s, environment 31.76s)
```

  Único vermelho: `orcamento.test.ts > atinge LCP abaixo de 2,5s no mobile simulado`
  (`expected 3847.0693 to be less than 2500`) — o esperado e documentado. O comando **termina**.
- O relatório dizia 62,9s; medi 57,54s. Variação de máquina, mesma ordem de grandeza.

### I5 — a justificativa do estado entregue no git · PARTIAL

**(a) Pasta arquivada · ✓**

- `git ls-files docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/` → **62 arquivos rastreados**;
  `git status --porcelain -uall docs/superpowers/` → vazio (nada solto).
- `diff -rq` do workspace contra o arquivo, ignorando as exclusões do contrato:
  **única diferença é `Only in docs/…: README.md`**. Ou seja: todo o resto é byte a byte idêntico,
  e nada de `review-*.diff`, `*.json` ou `*.stderr` entrou (confirmado no `ls` das duas pastas).
- Presentes: ledger `progress.md` (1069 linhas), todos os `task-*-brief.md`/`task-*-report.md`,
  os 5 guias, `deferred-minors.md`, `task-18-critique.md`, `final-review-report.md`,
  `final-fix-brief.md`, `final-fix-report.md`, `README.md` da pasta.
- O `README.md` da pasta arquivada explica o que é, aponta o ledger como a história completa e
  registra o que ficou de fora e por quê.

**(b) Ponteiros · ✓ (com nota)**

- `grep -rn "task-1[0-9]-report\|task-[0-9]-report" site/` → 26 ocorrências, todas por **nome puro**
  do arquivo.
- Levantei **todos** os `*.md` citados no código (`grep -rhoE "[A-Za-z0-9_./-]+\.md"` em `app`,
  `components`, `lib`, `__tests__`, `README.md`, `next.config.ts`, `vitest.config.ts`) e conferi
  um a um contra a pasta arquivada: `design-guidance.md`, `emenda-reactbits-e-skills.md`,
  `fix-titulos-report.md`, `progress.md`, `qa-guidance.md` (via guias),
  `reactbits-vendoring.md`, `ux-guidance.md`, `task-8/13/14/15/17-brief/17/18-fix/19-report.md`
  — **todos existem**. Os de fora do workspace (`BRIEFING.md`, `COPY.md`, `PERGUNTAS-CLIENTE.md`,
  `VIDEOS/README.md`) também existem na raiz. **Nenhum ponteiro morto.**
- `grep -rn "\.superpowers" site/` → vazio. Idem no `progress.md` da raiz.
- Nota (não é defeito): a nota de convenção vive em `site/README.md:10-13` e
  `site/components/reactbits/README.md:3-5`. Quem abre `site/lib/imgOtimizada.ts:8` e lê
  "task-17-report.md" resolve em **um salto** (README do app, um diretório acima), não direto. A
  troca do caminho completo pela nota de uma linha não deixou nada irresolvível — o nome puro é
  greppável e o arquivo existe no repo.

**(c) `orcamento.test.ts` · ✓**

- Comentário de 9 linhas em `:21-29`, com os dois números (3847 simulado / 2211 real), as três
  saídas possíveis e o ponteiro para `task-17-report.md`.
- `git diff b51783d..HEAD -- site/__tests__/orcamento.test.ts` → **9 linhas adicionadas, 0
  removidas**, todas comentário. Comportamento intacto: mesmo `it`, mesma asserção, e no meu
  `npm test` ele falha exatamente como antes.

**(d) `progress.md` da raiz · ✗ — é o que rebaixa o I5 para PARTIAL**

Presentes e corretos: estado final, as 19 tasks com faixas de commit, decisões tomadas, **pacote R2
em 4 linhas numeradas com os números** (`:84-91` — LCP 3847/2500/2211, first-load 249 vs 180 KB,
Silk+CircularGallery 42% dos bytes / −74% TBT / −39% TTI, I4), bloqueios de publicação (`:97-113`),
onde está o histórico (`:115-122`).

Dois defeitos:

1. **Os números não batem com a suíte que rodei.** `progress.md:13`:

   ```
   | Testes | 26 arquivos · 243 testes · 242 verdes · 1 vermelho de propósito (…) |
   ```

   Medido por mim: **244 testes · 243 verdes**. 243/242 é a linha de base **antes** da onda — o
   próprio I3 acrescentou o controle positivo que soma o teste que falta. O brief pedia
   explicitamente "números batendo com a suíte que você rodou". Curiosamente o **ledger** arquivado
   (`docs/…/progress.md`, entrada "ONDA FINAL DE CORREÇÃO — COMPLETA") traz `244 testes, 243
   verdes` — certo lá, errado aqui.

2. **A faixa de commits da onda se autodestrói no merge.** `progress.md:57` registra
   `` | — | Onda final pós-review da branch | `e20b607..HEAD` | ``. `HEAD` é literal: depois do
   merge ele passa a apontar para o topo da `main` e a linha deixa de identificar coisa alguma. O
   brief pedia `<primeiro>..<último commit desta onda>`, preenchido no último commit — seria
   `e20b607..5b59e01` (ou `..78bb4be`). A linha da tabela de status (`:18`) tem o veredito da review
   mas nenhuma faixa, que era onde o brief mandava colocá-la.

Nenhum dos dois é código; os dois são duas linhas num `.md`.

### I2 — `site/README.md` de entrega · ADDRESSED

- `grep -inE "geist|learn more|bootstrapped|create-next-app|deploy on vercel|nextjs\.org/docs|vercel\.com/new" site/README.md`
  → **zero**.
- As 7 seções do brief: (1) o que é + stack `:1-8`; (2) como rodar `:15-39`, com o vermelho
  conhecido em 5 linhas e o `CHROME_PATH` do Edge; (3) build/publicação `:41-69`
  (`NEXT_PUBLIC_SITE_URL` build-time, `public/` no deploy por causa do `fs.existsSync` do
  `Tratamentos.tsx`, cache de `/_next/image`); (4) onde ficam os assets `:71-88`, com tabela,
  `scripts/preparar-assets.mjs` e `VIDEOS/README.md`; (5) como trocar um vídeo `:90-97`; (6)
  checklist de pré-publicação `:120-140`; (7) onde está o histórico — no blockquote `:10-13`.
- Checklist: o ponto do `AntesDepois` está lá e em destaque (`:127-129`): *"⚠️ A seção Antes e
  Depois **já afirma** 'publicadas com autorização dos pacientes': publicar antes de a autorização
  existir torna a frase falsa"*. Os 10 bloqueios do R3 estão todos.
- Dado inventado: conferi cada afirmação sobre a clínica contra o `BRIEFING.md` — "consultório de
  cadeira única" ← `BRIEFING.md:33` ("1 cadeira odontológica", CNES); "Ipiranga, São Paulo" ←
  `:25`; "Saúde & Estética Orofacial" ← `:13`. Nenhum número, nome, horário ou avaliação novo.
- Nit: a seção 7 aponta para `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/` e o ledger, mas
  **não** para `docs/superpowers/plans/2026-08-19-site-smile-ipiranga.md`, que o brief listava
  junto. O plano é alcançável pelo `README.md` da pasta arquivada, que o cita — nada se perde.

### I3 — `heroBackdrop.test.tsx` não passa mais por construção · ADDRESSED

- `vi.mock('@/components/reactbits/Silk', …)` com stub `data-testid="silk-stub"` (`:13-15`) — o
  caminho bate com o `next/dynamic` de `HeroBackdrop.tsx:29`.
- **Controle positivo** em `:30-34` (`cap(false, 8)` → `waitFor(… not.toBeNull())`), negativos em
  `:36-46` com `waitFor(… toBeNull())`.
- **Prova por quebra, feita por mim:** troquei `{montado && podePesado && (` por `{true && (` em
  `HeroBackdrop.tsx:38` e rodei o arquivo:

  ```
   Test Files  1 failed (1)
        Tests  2 failed | 2 passed (4)
  ```

  Os dois que falharam são exatamente os negativos, com `- Expected: null / + Received: <div
  data-testid="silk-stub" />` (`heroBackdrop.test.tsx:45` e o de reduced-motion). Antes do I3
  esses dois passavam com o gate removido.
- Restaurado com `git checkout -- site/components/sections/HeroBackdrop.tsx`; `git status --porcelain`
  → vazio; re-rodei: `Test Files 1 passed (1) · Tests 4 passed (4)`.

### M9 — sobras do scaffold · ADDRESSED

- `ls site/public/*.svg` → *No such file or directory*.
- `grep -rn "file\.svg\|globe\.svg\|next\.svg\|vercel\.svg\|window\.svg" site/app site/components site/lib site/__tests__`
  → vazio.

### M2 — corpo ≥ 16 px · ADDRESSED

| Alvo | Fonte | Ao vivo (320 px, build de produção) |
|---|---|---|
| Resposta do FAQ (`Faq.tsx:89`) | `font-corpo text-[16px]` | **16px** |
| Descrição do tratamento (`TratamentoLinha.tsx:71`) | `font-corpo text-[16px]` | **16px** |
| Aviso legal (`AntesDepois.tsx:141`) | `font-corpo text-[14px]` | **14px** |
| Endereço do hero (`Hero.tsx:157`) | intocado | — |

- A exceção do aviso legal está registrada no comentário `AntesDepois.tsx:137-140` ("mesma exceção
  do bloco de contato do rodapé… abaixo de 14px não desce").
- `git diff --stat b51783d..HEAD -- site/components/sections/Hero.tsx` → **vazio**: o hero não foi
  tocado nesta onda, como o brief exigia.
- Varri o projeto inteiro por corpo abaixo de 16 px: fora do aviso legal (14px, documentado) e do
  bloco de contato do rodapé (`Footer.tsx:74`, 13px, exceção aceita na Task 18 e registrada em
  `deferred-minors.md`), **todo** o restante sub-16px é `font-rotulo` — botões, rótulos, numeração,
  nav em caixa alta. Nenhum caso novo.
- **Sem overflow horizontal**, medido por mim no build de produção: 320 px →
  `documentElement.scrollWidth 305 === clientWidth 305`; 375 px → `375 === 375`.

### M7 — token de cor e curva da marca no Header · ADDRESSED

- `grep -nE "#[0-9A-Fa-f]{3,8}" site/components/layout/Header.tsx` → **vazio** (nenhum hex cru).
- `globals.css:14`: `--color-borda-header: #F1E7DB;`, dentro do `@theme`, com comentário
  justificando por que não é o `--color-borda`.
- No CSS **compilado** (`.next/static/chunks/02t91oh181i7y.css`):
  `.border-borda-header{border-color:var(--color-borda-header)}` e
  `--color-borda-header:#f1e7db` — o utilitário existe de verdade, não é classe fantasma. As duas
  classes aparecem no HTML pré-renderizado.
- Ao vivo: `getComputedStyle(header).borderBottomColor` = **`rgb(241, 231, 219)`** (= #F1E7DB,
  idêntico ao hex que substituiu) e `getComputedStyle(header nav a).transitionTimingFunction` =
  **`cubic-bezier(0.23, 1, 0.32, 1)`** (= `--ease-saida`). Nenhum `ease-out` nativo no nav.
- Os `ease-out` que sobram no projeto estão em `GradualBlur.tsx` (nome de curva de *blur* na API do
  componente vendorizado, não transição CSS) e num comentário do `StaggeredMenu.tsx`. Fora do
  escopo do M7.

### M8 — `PENDENTE` fora da seção · ADDRESSED

- `site/components/ui/pendente.ts` existe, com docstring explicando o porquê da mudança.
- Importam de lá: `layout/Footer.tsx:3`, `sections/Localizacao.tsx:8`, `sections/Profissional.tsx:4`.
- `grep -rn "from '@/components/sections" site/components/layout site/components/ui` → **vazio**:
  nenhum import de seção em layout.
- Valor da constante idêntico ao anterior (`border-b-[2px] border-dashed border-dourado pb-0.5`) —
  zero mudança visual. `tsc` limpo, suíte verde.

### M10 — `sitemap.ts` sem `new Date()` · ADDRESSED

- Nenhum `lastModified` no retorno; comentário de 5 linhas explica a omissão.
- `grep -rn "new Date()" site/app site/components site/lib` → único hit é a palavra dentro desse
  comentário.
- `npm run build` emite `○ /sitemap.xml` como rota estática.

### M5 — comentários para arquivo removido · ADDRESSED

- `grep -rn "ui/Silk" site/components` → as ocorrências que restam são **todas históricas**:
  `Silk.tsx:9` ("Até a Task 19 este projeto usava…"), `README.md:361` ("foi **removido**"),
  `README.md:257` ("a antiga…"), `HeroBackdrop.tsx:6` (descreve a troca). **Zero** em
  `CircularGallery.tsx` e `ScrollVelocity.tsx`, que eram os apontados pela review — lá o comentário
  agora descreve o mecanismo atual ("alternando o `frameloop` do R3F, não com um `rAF` próprio").
- `wc -l site/components/reactbits/StaggeredMenu.tsx` → **410**; `README.md:287` diz "410 linhas
  contra as 588 do original". Bate.
- `git show c3e8d2c` — os 11+/9− são comentário e README. **Zero linha de código.**

### M6 — testes que não podiam falhar · ADDRESSED

- `header.test.tsx:89`: título e corpo reescritos. A asserção agora é
  `expect(Number(gsap.getProperty(painel, 'xPercent'))).toBe(0)`. É falsificável de verdade: o
  estado fechado é `gsap.set([panel, …], { xPercent: offscreen })` (`StaggeredMenu.tsx:206`, e de
  novo em `:297` ao fechar), então um painel que monta sem a timeline rodar reprova. O comentário
  registra por que a versão antiga (`style.opacity !== '0'`) passava sempre.
- `header.test.tsx:305`: título agora é *"sem Lenis na arvore, trava o scroll com position:fixed e
  desfaz ao fechar"* — descreve o que o corpo faz.
- `sorrisos.test.tsx`: `circularGalleryOnErrorSpy` removido; o stub virou
  `function CircularGalleryStub` e o `props.onError?.(true)` saiu do corpo do render para um
  `useEffect`.
- `motion.test.tsx` intocado, como o brief mandava
  (`git diff --stat b51783d..HEAD -- site/__tests__/motion.test.tsx` vazio).
- Não repeti a prova por quebra do M6: o brief autoriza só a mutação do I3. A falsificabilidade da
  nova asserção está verificada por leitura do par asserção/estado-fechado acima.

### M1 — desvio do `height` no FAQ · ADDRESSED

- Comentário de 9 linhas em `Faq.tsx:65-73`: nomeia o desvio, os 250 ms / 2 perguntas / abaixo da
  dobra, por que `clip-path` custaria mais, e quando reavaliar.
- `deferred-minors.md:53-56`, seção "Desvio aceito".
- `diff` do `deferred-minors.md` workspace × arquivo → **sem diferença**. As duas cópias batem.

### M12 — item do AVIF/cache no `deferred-minors.md` · ADDRESSED

- `deferred-minors.md:85-87`, em "Checklist de publicação (acrescentados nesta review)": custo do
  1º request AVIF ~50% maior + persistência do cache de `/_next/image`, com a referência ao ledger
  L958. Nas duas cópias (mesmo `diff` sem diferença acima).
- Nota de atribuição: o conteúdo chegou no `78bb4be` (commit de sincronização), não no `5b59e01`,
  que leva "M1, M12" no assunto mas toca só `Faq.tsx`. Imprecisão de rótulo, não mudança faltando.

---

## Fechamento

| Verificação | Resultado |
|---|---|
| `npm test` (rodado por mim) | ✓ **26 arquivos (25 ✓ / 1 ✗) · 244 testes (243 ✓ / 1 ✗) · 57,54s** — único vermelho é o `orcamento.test.ts` esperado |
| `npm run build` | ✓ exit 0, compila em 3,8s, 6 rotas estáticas |
| `npx eslint .` | ✓ exit 0, sem saída |
| `npx tsc --noEmit` | ✓ exit 0 |
| `git status` | ✓ limpo antes, durante (pós-restauração do I3) e depois do build |
| HEAD | ✓ `78bb4be` no início e no fim — nenhuma mutação |
| `.claude/launch.json` | ✓ `git diff --stat b51783d..HEAD` vazio |
| `lh-*.json` commitado | ✓ nenhum; `git diff --name-only b51783d..HEAD` não traz nenhum `.json`, `.stderr` ou `.diff` |
| Um commit por item | ✓ 16 commits (13 itens; I5 em 4 sub-commits, M1+M12 juntos, +1 de sincronização). Conferi o `--stat` de cada um: **nenhuma contaminação cruzada**. O `--amend` que caiu no commit errado foi de fato desfeito — o `d311741` (M6) carrega os dois arquivos de teste, incluindo a renomeação do stub que o eslint exigiu, e o `5b59e01` (M1) só o `Faq.tsx` |
| Mudança de comportamento em runtime | ✓ nenhuma lógica alterada — ver ressalva abaixo |

**Ressalva sobre a última linha.** O fechamento do brief fala em "os 3 tamanhos de fonte e o token
de borda". O diff real de `site/components site/lib site/app` traz um pouco mais que isso —
tudo dentro dos itens contratados, mas vale nomear:

- 3 tamanhos de fonte (15→16 ×2, 13,5→14) — **M2**
- 1 token de cor, mesmo valor final `#F1E7DB` — **M7**
- **2** trocas de curva, não 1: `ease-out`→`ease-saida` no hover do nav (`Header.tsx:49`, era o que
  o brief pedia) **e** no fade do painel sob reduced-motion (`StaggeredMenu.tsx`, que o brief não
  citava). Efeito visível ~nulo: o reset de `globals.css:53-59` já comprime essa transição para
  `.01ms` sob reduced-motion (é o M11, registrado como follow-up). Ampliação de escopo pequena e
  no espírito do M7.
- `lastModified` fora do `sitemap.ts` — **M10**
- `PENDENTE` mudou de módulo, valor idêntico — **M8**

Rodei `git diff b51783d..HEAD -- site/components site/lib site/app` filtrando comentários:
**nenhuma condição, nenhum hook, nenhum handler, nenhum parâmetro de animação mudou.**

---

## O que falta para o merge

Só o I5(d), e são duas linhas no `progress.md` da raiz:

1. `:13` → `26 arquivos · 244 testes · 243 verdes · 1 vermelho de propósito` (é o que a suíte
   devolve hoje).
2. `:57` → trocar `` `e20b607..HEAD` `` por `` `e20b607..78bb4be` ``, e/ou completar a linha `:18`
   da tabela de status com a faixa, como o `final-fix-brief.md` pedia.

Nada disso é código, nada disso muda comportamento, e o build/suíte/lint/tipos seguem limpos. Mas o
`progress.md` da raiz é justamente o documento cuja razão de existir é sobreviver ao merge contando
a verdade sobre o estado entregue — publicá-lo com a contagem de testes da véspera e uma faixa de
commits que aponta para lugar nenhum depois do merge esvazia o próprio I5.

**Pronto para merge: NÃO** — a duas linhas de distância do SIM.
