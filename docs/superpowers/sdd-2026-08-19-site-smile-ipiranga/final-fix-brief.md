# Onda única de correção pós-review final (antes do merge)

Fonte: `final-review-report.md` (0 Critical, 5 Important, 12 Minor, "With fixes"). Esta é a
**única** onda; depois dela, uma re-review escopada e o fechamento da branch.

**Diretório:** `D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA` (raiz do git,
branch `feat/site`, HEAD `b51783d`). App em `site/` (Next 16.3.1 — leia `site/AGENTS.md`; doc
local em `site/node_modules/next/dist/docs/`).
**Testes:** `npx vitest run --no-file-parallelism` de `site/` até o item I1 estar feito; depois,
`npm test` tem que funcionar. `orcamento.test.ts` continua vermelho (é decisão do parceiro).
**Commits:** um por item, da raiz, `git -c user.name="Claude" -c user.email="noreply@anthropic.com"
commit -m "<tipo>(final <item>): <o quê>"` com linha em branco e
`Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`. `git status` antes de cada commit; nunca
`git add -A` cego; nunca commitar `lh-*.json`.
**Não altere `.claude/launch.json`. Não toque no servidor 4173.** Não deixe comandos em
background e encerre a vez esperando por eles — rode tudo em primeiro plano (timeout até 10 min).

Ordem: I1 → I5 → I2 → I3 → M9 → M2 → M7 → M8 → M10 → M5 → M6 → M1 → M12.

---

## I1 — `npm test` trava (`site/package.json:10`, `vitest.config.ts`)

`vitest.config.ts`: `test: { ..., fileParallelism: false }`. Mantenha o script `"test": "vitest run"`.
Prova: `npm test` em primeiro plano termina (timeout 10 min) com 25 arquivos verdes + o
`orcamento.test.ts` vermelho. Registre a duração.

## I5 — a justificativa do estado entregue não está no git

`.superpowers/` é gitignored. Faça, nesta ordem:
1. **Arquivar o workspace:** copie `.superpowers/sdd/2026-08-19-site-smile-ipiranga/` para
   `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/` **excluindo** `review-*.diff`, `*.json`,
   `*.stderr`. Inclua `progress.md` (o ledger), todos os `task-*-brief.md`/`task-*-report.md`,
   os guias (`design-guidance.md`, `ux-guidance.md`, `qa-guidance.md`, `reactbits-vendoring.md`,
   `emenda-reactbits-e-skills.md`), `deferred-minors.md`, `task-18-critique.md`,
   `final-review-brief.md`, `final-review-report.md`, `final-fix-brief.md` (este). Acrescente um
   `README.md` curto na pasta arquivada dizendo o que é (workspace do subagent-driven development,
   arquivado no fechamento; o ledger `progress.md` é a história completa).
   **Não apague** o workspace original — eu faço isso no fechamento.
2. **Ponteiros mortos:** `Silk.tsx:15`, `GlareHover.tsx:15`, `HeroBackdrop.tsx:11,15`,
   `globals.css:70` citam `task-19-report.md`. Troque por
   `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/task-19-report.md`. Grep
   `task-1[0-9]-report\|task-[0-9]-report` em `site/` para achar outros.
3. **`orcamento.test.ts:21-26`:** comentário de 3-4 linhas acima do `it` do LCP: "LCP simulado
   3847 ms > 2500 por design após H1 (AVIF) + H2 (`sizes`); devtools-throttling 2211 ms, dentro da
   meta; decisão do parceiro pendente (aceitar vermelho documentado / `it.fails` / nova rodada) —
   ver docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/task-17-report.md". **Não** mude o
   comportamento do teste.
4. **`progress.md` da raiz:** substitua o conteúdo pelo rascunho em
   `C:/Users/Pichau/AppData/Local/Temp/claude/D--PROGRAMA--O-CLAUDE-PROJETOS-PROJETO-SMILE-IPIRANGA-DENTISTA/82a13fdc-f2e8-4bb0-9830-9332511cefa8/scratchpad/progress-raiz-final.md`
   e **atualize os números** (testes, etc.) para o estado ao fim desta onda; acrescente na
   tabela de status a linha "Review final da branch: 0 Critical · 5 Important · 12 Minor → onda de
   correção `<primeiro>..<último commit desta onda>`" (preencha no último commit) e, em
   "Decisões pendentes do parceiro", o pacote R2 do relatório (LCP simulado, first-load ~249 KB
   gzip vs 180 do plano, custo do React Bits, I4 gate por viewport da galeria) em 4 linhas com
   os números do `final-review-report.md`.

## I2 — `site/README.md` é boilerplate do create-next-app

Reescreva inteiro (mantendo as duas seções boas: domínio e ícones), em português, com:
1. **O que é** (uma frase) + stack (Next 16 App Router, React 19, Tailwind v4, GSAP/Lenis/Motion,
   three/ogl atrás de `useCapability`).
2. **Como rodar**: `npm install`, `npm run dev` (3000), `npm test` (e que o `orcamento.test.ts`
   vermelho é conhecido — 2 linhas + ponteiro para o relatório arquivado), `npm run build`,
   `npm run start`. Lighthouse local: Chrome ausente → `CHROME_PATH` no Edge.
3. **Como buildar/publicar**: `NEXT_PUBLIC_SITE_URL` build-time (já existe — mantenha), `public/`
   precisa estar no deploy porque `Tratamentos.tsx:32` lê do disco no servidor (se `output:
   'standalone'`, copiar `public/`), cache de `/_next/image` persistente no host (AVIF custa ~50%
   mais no 1º request).
4. **Onde ficam os assets**: `public/img/`, `public/videos/{previews,posters,completos}/`,
   pipeline `scripts/preparar-assets.mjs` (raiz) e `VIDEOS/README.md`; `lib/imgOtimizada.ts`.
5. **Como trocar um vídeo**: slug → `previews/<slug>.mp4` (< 260 KB), `posters/<slug>.webp`,
   `completos/<slug>.mp4`; entrada em `DEPOIMENTOS` de `lib/content.ts`; rodar a suíte (teste de
   orçamento de previews).
6. **Checklist de pré-publicação** (R3 do relatório, verbatim na essência): CRO + nome do RT;
   "Ortodontista" registrada; autorização de imagem — **`AntesDepois.tsx:17` já afirma
   "publicadas com autorização"; publicar antes dela é afirmação falsa**; horário; corte dos
   trechos de procedimento (`caso-protese` ~16 s, `facetas-transformacao` ~3 s); marca d'água
   CapCut; logo vetorial; `NEXT_PUBLIC_SITE_URL` + rebuild; cache de imagens no host; `public/`
   no deploy; teste manual de reduced-motion e saveData em aparelho real.
7. **Onde está o histórico**: `docs/superpowers/plans/...` e
   `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/`.
Nada de "Geist", "Learn More", "Deploy on Vercel" genérico. Nenhum dado da clínica inventado.

## I3 — `heroBackdrop.test.tsx:16-26` passa por construção

`vi.mock('@/components/reactbits/Silk', () => ({ default: () => <div data-testid="silk-stub" /> }))`
(confira o caminho real importado por `HeroBackdrop.tsx` via `next/dynamic`). Negativos com
`await waitFor(() => expect(queryByTestId('silk-stub')).toBeNull())` **depois** de um positivo
que prove que o stub aparece quando capaz (`podePesado === true`) — sem o positivo, o negativo
não prova nada. Modelo: `sorrisos.test.tsx:12-20,100-108`. Prova por quebra: remova o gate
`montado && podePesado` em `HeroBackdrop.tsx:38`, veja o negativo falhar, restaure.

## M9 — sobras do scaffold

Apague `site/public/{file,globe,next,vercel,window}.svg` após `grep -rn "file.svg\|globe.svg\|next.svg\|vercel.svg\|window.svg" site/app site/components site/lib` vazio.

## M2 — corpo abaixo de 16 px

- `Faq.tsx:80` resposta → 16 px. `TratamentoLinha.tsx:71` descrição → 16 px.
- `AntesDepois.tsx:137` aviso legal 13,5 px → **14 px** e registre no comentário do componente
  como a mesma exceção do rodapé (texto legal = rótulo). `Hero.tsx:157` (14 px, rótulo) fica.
- Teste: se existir teste de tamanho de corpo, estenda; senão, sem teste (classe pura). Confira
  no build que nada estoura em 320 px (`scrollWidth === clientWidth`).

## M7 — hex cru e `ease-out` no Header

`Header.tsx:29` `border-[#F1E7DB]` → token: acrescente `--color-borda-header: #F1E7DB` no `@theme`
de `globals.css` (é cor da paleta) e use `border-borda-header`. `Header.tsx:49` `ease-out` →
`ease-[var(--ease-saida)]` (ou a classe utilitária que o projeto já tem para `--ease-saida` —
veja como `WhatsAppFab.tsx` faz). Fecha o deferred L184.

## M8 — `PENDENTE` importado de uma seção

Mova `PENDENTE` (e o que vier junto) de `components/sections/Profissional.tsx` para
`components/ui/pendente.ts`; `Profissional`, `Footer` e `Localizacao` importam de lá. Sem mudança
visual; testes que importam `PENDENTE` ajustados.

## M10 — `app/sitemap.ts:10` `lastModified: new Date()`

Omita `lastModified` (ou use uma constante de data da última alteração de conteúdo). Ajuste o
teste do sitemap se houver.

## M5 — comentários para arquivo removido

`CircularGallery.tsx:21,23,275,401,455`, `ScrollVelocity.tsx:20,143` citam `components/ui/Silk.tsx`
(não existe; o `reactbits/Silk.tsx` usa `frameloop` do R3F). Reescreva para descrever o mecanismo
atual ("pausa por IntersectionObserver + document.hidden, como `reactbits/Silk.tsx` via
`frameloop`"). `reactbits/README.md:155,176,182` idem; `README.md:282` "325 linhas" → número
atual (`wc -l`). Só comentários/README — zero mudança de código.

## M6 — testes vazios/obsoletos (só os dois claros)

- `header.test.tsx:88-113` ("abre o drawer com opacidade visível"): o painel não recebe
  `style.opacity` desde a Task 19 — `''` ≠ `'0'` passa sempre. Reescreva para provar o que
  importa hoje (painel aberto: `aria-hidden="false"`/sem `inert`, e `xPercent`/transform fora da
  posição fechada após a timeline — se o GSAP do teste for mockado, afirme a chamada com
  `xPercent: 0`), ou remova com uma linha de motivo no commit. Corrija o título de
  `header.test.tsx:310` para o que ele testa (fallback `position:fixed`).
- `sorrisos.test.tsx:12-20`: remova o `circularGalleryOnErrorSpy` não usado; mova o
  `props.onError(true)` do stub para um `useEffect` (setState do pai durante o render do filho).
- `motion.test.tsx` `setTimeout(80)`: **não mexa** (follow-up).

## M1 — `Faq.tsx:74-76` anima `height`

Não troque a implementação. Registre como desvio aceito: comentário de 3 linhas no componente
("única animação de `height` do projeto: 250 ms, 2 itens, abaixo da dobra; `clip-path` exigiria
medir a altura — aceito em `final-review-report.md` M1") e uma linha em `deferred-minors.md`
(no workspace **e** na cópia arquivada) como "desvio aceito".

## M12 — `deferred-minors.md` incompleto

Acrescente o item do ledger L958 (custo do 1º request AVIF ~50% maior + persistência do cache de
imagens no host — checklist de publicação). No workspace **e** na cópia arquivada.

---

## Ao terminar

`npm test` (agora funciona), `npm run build`, `npx eslint .`, `npx tsc --noEmit` limpos. Lighthouse
**não** é necessário (nada de runtime mudou além de 3 tamanhos de fonte) — mas rode um build e
confira em 320/375 que `scrollWidth === clientWidth` (suba em 4702, feche ao final). Atualize os
números do `progress.md` da raiz e re-copie os arquivos alterados do workspace para a pasta
arquivada (ledger incluído — acrescente você a entrada "onda final de correção: commits X..Y"
no ledger do workspace antes de copiar). Relatório em
`.superpowers/sdd/2026-08-19-site-smile-ipiranga/final-fix-report.md` (e cópia no arquivo).

Na resposta final, retorne APENAS: STATUS, a lista de commits (hash + item), a linha de totais
de `npm test` com a duração, e qualquer item que não pôde ser feito como descrito.
