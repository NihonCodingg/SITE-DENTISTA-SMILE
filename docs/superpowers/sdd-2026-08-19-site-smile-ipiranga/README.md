# Workspace do build do site — arquivado

Este diretório é a cópia do workspace de *subagent-driven development* usado para construir o
site (`.superpowers/sdd/2026-08-19-site-smile-ipiranga/`, que é gitignored), arquivada no
fechamento da branch `feat/site` para que a justificativa do estado entregue fique no git.

- **`progress.md` é o ledger** — a história completa, em ordem, de cada task: despachos, reviews,
  rodadas de correção, decisões, minors adiados e medições. Quem quiser entender "por que está
  assim" começa por ele.
- `task-N-brief.md` / `task-N-report.md`: o contrato de cada task e o relatório de quem executou
  (Task 18 tem avaliações A/B, critique, fix, re-review; Task 19 é a emenda React Bits).
- Guias: `design-guidance.md`, `ux-guidance.md`, `qa-guidance.md`, `reactbits-vendoring.md`,
  `emenda-reactbits-e-skills.md`.
- Fechamento: `deferred-minors.md` (minors adiados + bloqueios de publicação),
  `final-review-brief.md` / `final-review-report.md` (review final da branch),
  `final-fix-brief.md` / `final-fix-report.md` (onda única de correção pós-review).

Ficaram de fora só os `review-*.diff` (deriváveis do git), `*.json` e `*.stderr` de ferramentas.
O plano que originou tudo está em `docs/superpowers/plans/2026-08-19-site-smile-ipiranga.md`.
