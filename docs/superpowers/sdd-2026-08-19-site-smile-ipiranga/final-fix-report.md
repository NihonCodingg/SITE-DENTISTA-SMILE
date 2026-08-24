# Onda final de correção — relatório

Commits `e20b607..5b59e01` (15 commits, 13 itens). Contrato: `final-fix-brief.md`, que vem da
`final-review-report.md` (0 Critical, 5 Important, 12 Minor, "ready to merge with fixes").

**Nota de execução.** A onda começou num agente que caiu no limite de sessão depois do I1 e no
meio do I5, deixando 30 arquivos modificados sem commit. Esse trabalho intermediário era a
expansão de **todo** ponteiro de documentação para o caminho completo
(`docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/design-guidance.md`), 59 ocorrências, com
reflow de parágrafo em comentários — verificado como **somente comentário** (zero linha de código)
e depois revertido a favor de uma solução de uma linha, descrita no I5.2. O restante foi executado
diretamente, sem subagente.

## Por item

| Item | Commit | O que mudou | Como está provado |
|---|---|---|---|
| I1 | `e20b607` | `fileParallelism: false` no `vitest.config.ts` | `npm test` termina em **62,9s** (antes travava) |
| I5.1 | `9e79be8` | Workspace arquivado em `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/` (61 arquivos) | `comm` contra o workspace: só `review-*.diff`, `*.json` e `*.stderr` ficaram de fora, como o brief pede |
| I5.2 | `a2e78e3` | Nota de convenção no README dos vendorizados; as 2 referências ao caminho gitignored trocadas pelo nome do arquivo | `grep -rn "\.superpowers" site/` → vazio; os 13 nomes de doc citados no código existem em `docs/superpowers/...` (verificado um a um) |
| I5.3 | `a61751f` | Comentário no `orcamento.test.ts` explicando o vermelho | Teste inalterado no comportamento (segue vermelho, mesma asserção) |
| I5.4 | `4fc5da3` | `progress.md` da raiz reescrito | Estava na fase 3; agora traz as 19 tasks com commits, medidas, decisões pendentes e bloqueios |
| I2 | `6d0492b` | `site/README.md` reescrito | `grep -i "geist\|learn more\|bootstrapped\|create-next-app"` → nenhum |
| I3 | `102e02c` | `heroBackdrop.test.tsx`: Silk vira stub, ganha controle positivo, negativos com `waitFor` | **Prova por quebra:** com o gate `montado && podePesado` removido, os 2 negativos falham (antes passavam). Restaurado, 4/4 verdes |
| M9 | `e1d4c99` | 5 svgs do scaffold removidos | `grep` por cada nome em `app/`, `components/`, `lib/` → nenhuma referência |
| M10 | `986e6f7` | `sitemap.ts` sem `lastModified` | `curl /sitemap.xml` no build: sem `<lastmod>` |
| M2 | `3aadaeb` | FAQ e descrição de tratamento 15→16px; aviso legal 13,5→14px com a exceção registrada | Medido ao vivo: FAQ 16px, descrição 16px, aviso 14px, subtítulo do hero 16px |
| M7 | `2736664` | `--color-borda-header` no `@theme`; `ease-out`→`ease-saida` no nav e no fade do drawer | Ao vivo: `borderBottomColor rgb(241,231,219)` = token; `transitionTimingFunction cubic-bezier(0.23,1,0.32,1)` = `--ease-saida`. Nenhuma curva nativa resta em código |
| M8 | `74c4249` | `PENDENTE` migrou para `components/ui/pendente.ts` | `tsc` limpo; 30 testes de Profissional/Localização/rodapé verdes; nenhum import de seção em layout |
| M5 | `c3e8d2c` | Comentários param de citar `ui/Silk.tsx` como exemplo vivo; contagem de linhas 325→410 | As menções restantes são históricas ("até a Task 19 este projeto usava"), conferidas uma a uma |
| M6 | `d311741` | Teste de opacidade reescrito para `xPercent`; título do teste de scroll corrigido; spy morto removido; `onError` fora do render | **Prova por quebra:** com `playOpen` sem `tl.play(0)`, o novo teste falha (o antigo passaria). Restaurado, 17/17 verdes |
| M1 + M12 | `5b59e01` | Desvio do `height` no FAQ registrado no componente; `deferred-minors.md` ganha a seção da review final | — |

## Fechamento

| Verificação | Resultado |
|---|---|
| `npm test` | **26 arquivos · 244 testes · 243 verdes · 1 vermelho** (`orcamento.test.ts`, LCP simulado) · 62,9s |
| `npx eslint .` | limpo (exit 0) |
| `npx tsc --noEmit` | limpo (exit 0) |
| `npm run build` | compila; 6 rotas estáticas |
| `git status` | limpo |
| `.claude/launch.json` | sem diff |
| `lh-*.json` | nenhum commitado (gitignored) |

Baseline de testes antes da onda: 243 testes, 242 verdes. Depois: 244/243 (+1 teste — o controle
positivo do I3; o I3 também converteu 2 negativos vazios em negativos reais, que não somam
contagem mas passam a poder falhar).

**Ao vivo** (build de produção na 4702, encerrada ao final; a 4173 da Task 18 já não estava de pé):
sem overflow horizontal em 320, 375 e 1265; os 4 links do nav mantêm 44px de altura (F1 da Task 18
preservado); `aria-label` no `<h1>` e ausente no `.split-parent` (A1 preservado); o hero renderiza
o reveal completo — a primeira captura pegou a animação em voo, a segunda mostra o estado final
correto.

**Lighthouse não foi rodado.** O brief dispensa: nada de runtime mudou além de três tamanhos de
fonte, um token de cor e uma curva de easing. A acessibilidade 1.00/1.00 medida na re-review da
Task 18 não tem como ter regredido por essas mudanças — mas isso é raciocínio, não medição, e fica
declarado como tal.

## O que ficou de fora, de propósito

- **I4** (galeria WebGL montando na hidratação): follow-up, e entra no pacote de decisão de
  performance do dono do projeto. Registrado em `deferred-minors.md`.
- **M3** (encanamento duplicado entre os dois overlays), **M4** (constantes de motion e z-index
  espalhadas), **M11** (fade do drawer comprimido sob reduced-motion), **R4** (teste de padrões
  proibidos contra o HTML prerenderizado): follow-up pós-merge, nenhum muda comportamento.
- O `motion.test.tsx` com `setTimeout(80)`: o brief manda explicitamente não mexer.
