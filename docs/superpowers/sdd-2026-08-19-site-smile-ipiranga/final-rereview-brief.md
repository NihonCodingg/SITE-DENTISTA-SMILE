# Re-review escopada da onda final de correção (última antes do merge)

Você verifica, sem corrigir nada, a onda única de correção pós-review-final da branch
`feat/site` (site da clínica Smile Ipiranga). Commits: `<<BASE>>..<<HEAD>>`.

**Diretório:** `D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA` (raiz do git).
App em `site/`. **Leia:** `final-fix-brief.md` (contrato, 13 itens), `final-fix-report.md` (o
que o agente diz ter feito — desconfie por padrão), `final-review-report.md` (por que cada item
existe), todos em `.superpowers/sdd/2026-08-19-site-smile-ipiranga/`.

**Regras:** somente leitura do git (nenhum commit, nenhuma mutação de HEAD/índice); não altere
`.claude/launch.json`; não toque no servidor 4173; comandos em primeiro plano (nada em background
com a vez encerrada); `orcamento.test.ts` vermelho é esperado.

## Por item

- **I1** `vitest.config.ts` com `fileParallelism: false`; **rode `npm test` você mesmo** em
  primeiro plano (timeout 10 min) e registre totais + duração. Tem que terminar.
- **I5** (a) `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/` existe, rastreada, com
  ledger `progress.md`, briefs/relatórios de todas as tasks, guias, `deferred-minors.md`,
  `task-18-critique.md`, `final-review-report.md`, `final-fix-brief.md`, `final-fix-report.md`,
  `README.md` da pasta; **sem** `review-*.diff`, `*.json`, `*.stderr`. Compare com `ls` do
  workspace: o que falta? (b) `grep -rn "task-1[0-9]-report\|task-[0-9]-report" site/` — todo
  ponteiro aponta para um arquivo que **existe** em `docs/superpowers/...` (confira com `ls`).
  (c) `orcamento.test.ts` tem o comentário explicando o vermelho, e o teste **não** mudou de
  comportamento. (d) `progress.md` da raiz: estado final, números batendo com a suíte que você
  rodou, pacote R2 (4 linhas com números), bloqueios de publicação, onde está o histórico.
- **I2** `site/README.md`: zero "Geist"/"Learn More"/boilerplate; as 7 seções do brief presentes;
  checklist de pré-publicação inclui o ponto do `AntesDepois.tsx:17` (afirmação de autorização);
  nenhum dado da clínica inventado (compare qualquer número/nome com `BRIEFING.md`/`COPY.md`).
- **I3** `heroBackdrop.test.tsx`: `Silk` mockado como stub; **há caso positivo** (stub aparece com
  `podePesado`); negativos com `waitFor`. **Prova por quebra você mesmo:** remova temporariamente
  o gate `montado && podePesado` em `HeroBackdrop.tsx` (num worktree temporário ou revertendo em
  seguida com `git checkout -- site/components/sections/HeroBackdrop.tsx`), rode o arquivo de
  teste, veja o negativo falhar, restaure, confirme `git status` limpo.
- **M9** os 5 svgs não existem mais; grep por eles vazio.
- **M2** `Faq.tsx` resposta 16 px; `TratamentoLinha.tsx` descrição 16 px; `AntesDepois.tsx`
  aviso 14 px com comentário de exceção; `Hero.tsx` endereço intocado.
- **M7** `Header.tsx` sem hex cru (`border-borda-header` com token no `@theme`); sem `ease-out`
  nativo no hover do nav.
- **M8** `PENDENTE` vive em `components/ui/pendente.ts`; `Profissional`, `Footer`, `Localizacao`
  importam de lá; nenhum import de seção em layout.
- **M10** `sitemap.ts` sem `new Date()`.
- **M5** `grep -rn "ui/Silk" site/components` vazio; README do reactbits com contagem de linhas
  correta (`wc -l StaggeredMenu.tsx`).
- **M6** `header.test.tsx`: o teste de "opacidade" foi reescrito para algo que pode falhar (ou
  removido com motivo); título do teste de `position:fixed` corrigido; `sorrisos.test.tsx` sem spy
  morto e `onError` fora do render.
- **M1** comentário no `Faq.tsx` registrando o desvio; linha em `deferred-minors.md` (workspace
  **e** cópia arquivada).
- **M12** item do AVIF/cache no `deferred-minors.md` (workspace **e** cópia arquivada).

## Fechamento

`npm test` (você rodou), `npm run build`, `npx eslint .`, `npx tsc --noEmit` limpos; `git status`
limpo; `.claude/launch.json` sem diff; nenhum `lh-*.json` commitado; um commit por item; nenhuma
mudança de comportamento em runtime além dos 3 tamanhos de fonte e do token de borda (confira
`git diff <<BASE>>..<<HEAD>> -- site/components site/lib site/app` com olho em lógica).

## Relatório

`.superpowers/sdd/2026-08-19-site-smile-ipiranga/final-rereview-report.md`: por item
ADDRESSED / PARTIAL / NOT ADDRESSED com a evidência **sua** (comando + valor); fechamento ✓/✗.
Na resposta final, retorne APENAS: contagem por item, a linha de `npm test` com duração, e
**"Pronto para merge: SIM/NÃO"** com um motivo.
