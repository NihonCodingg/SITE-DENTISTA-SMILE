# Review final da branch `feat/site` — `7e6b144..b51783d` (58 commits)

Revisor: Senior Code Reviewer (review do conjunto, pós 19 tasks). Data: 2026-08-21.
Somente leitura: nenhuma mutação de working tree, índice, HEAD, branch, `.claude/launch.json` ou do servidor 4173.

## O que foi lido e rodado

- Brief, plano (Global Constraints, Tasks 17/18, "Onde o WebGL entra", "Bloqueios antes de publicar"), ledger `progress.md` inteiro (1051 linhas), `deferred-minors.md`, `emenda-reactbits-e-skills.md`, relatórios das Tasks 17, 18 (critique, fix, re-review) e 19.
- **Todo** o código-fonte em HEAD, arquivo por arquivo (HEAD == working tree, `git status` limpo, então ler o arquivo equivale a ler o diff, que é 100% adição): `app/*`, `lib/*`, `components/layout/*`, `components/ui/*`, `components/sections/*` (17), `components/reactbits/*` (8 + README + LICENSE), os 26 arquivos de `__tests__/`, configs (`next.config.ts`, `vitest.*`, `eslint.config.mjs`, `tsconfig.json`, `.env.example`, `README.md`, `package.json`, `.gitignore`), raiz (`package.json`, `scripts/*`, `.claude/launch.json`, `progress.md`).
- Rodado em primeiro plano, de `site/`: `npx vitest run --no-file-parallelism` → **26 arquivos (25 ✓, 1 ✗) · 243 testes (242 ✓, 1 ✗)**, única falha `orcamento.test.ts` ("expected 3847.0693 to be less than 2500"). `npx eslint .` → exit 0, sem saída. `npx tsc --noEmit` → exit 0.
- Inspecionado o build existente em `site/.next` (BUILD_ID de 18:49, posterior ao commit de HEAD 18:31 — é o build da re-review da Task 18): lista de `<script>` do `.next/server/app/index.html` prerenderizado e `rootMainFiles` do `build-manifest.json`.
- Greps do brief (itens 1 e 2) e varredura de hex, z-index, easing, stagger, tamanhos de fonte, referências mortas.

---

## Forças (com precisão)

1. **Integridade de dados é real e verificada em três camadas.** `content.test.ts:46-99` é uma whitelist recursiva por nome de campo (`n`, `img`) com a única exceção (`WHATSAPP_DISPLAY`) importada de `lib/contact.ts`, não repetida. `jsonld.test.ts:77-97` varre o JSON-LD por campos proibidos em qualquer nível. O HTML prerenderizado (`.next/server/app/index.html`) passou no grep do plano (Task 18 Step 5): `limpo`. Nenhuma copy nova das Tasks 17-19 ("Sorriso com propósito", "Carregando vídeo…", "Fechar menu") traz dígito. As pendências continuam marcadas no HTML gerado: "CRO-SP a confirmar" (Profissional e Footer), "nome a confirmar" (Footer), "Horário: a confirmar" (Localização), "Ortodontista" tracejado (`Profissional.tsx:75`), e o `alt` do doutor não afirma especialidade (`Profissional.tsx:59`). Nenhum placeholder virou afirmação.
2. **Fonte única de capacidade preservada em 100% do projeto.** `grep matchMedia|navigator.connection` em `components/`, `lib/`, `app/` — fora de `lib/useCapability.ts:15,20,25`, todas as 20 ocorrências são comentários/README (inclusive nos 8 vendorizados). Os quatro componentes do React Bits recuperados recebem a decisão por prop (`reducedMotion`, `disabled`, gate por `podePesado`/`podeAnimar` no chamador).
3. **Zero chamada de rede em componente de terceiro.** `grep fetch(|XMLHttpRequest|new WebSocket|fonts.googleapis` em `components/reactbits/` só bate em 2 comentários (`CircularGallery.tsx:18`, `README.md:144`) descrevendo o que foi removido. `circularGallery.test.tsx:91-97` trava isso.
4. **`three` e `ogl` fora do first-load, provado no build de HEAD, não só no relatório.** Os 9 chunks referenciados por `<script>` no HTML prerenderizado e os 4 `rootMainFiles` têm 0 ocorrências de `WebGLRenderer` (three) e `updateMatrixWorld` (ogl). Os dois vivem só em `0xzmvzr9idbir.js` (888 KB raw, three) e `3gdjgg73w15nq.js` (61 KB raw, ogl), chunks assíncronos de `next/dynamic({ ssr:false })` em `HeroBackdrop.tsx:29` e `SorrisosGaleria.tsx:18`.
5. **Fronteira client correta.** `app/page.tsx` é Server Component e exporta `metadata`; `PaginaComVideo.tsx` é a fronteira `'use client'` que segura o estado do Lightbox, recebendo Ticker/Pilares/Tratamentos/Sorrisos/Profissional por prop (padrão correto do Next para intercalar RSC em árvore client). `Tratamentos.tsx` lê o disco no servidor e delega o hover a `TratamentoLinha.tsx` (client mínimo). `Pilares`, `Profissional`, `Sorrisos`, `Tratamentos`, `Footer`, `CtaFinal` são RSC puros.
6. **Vendorização exemplar.** `components/reactbits/README.md` documenta os 8 componentes com origem (caminho + commit `4e0e030`), dependências, rede, `matchMedia`, cleanup, propriedade animada e lista numerada de modificações (13 só no `StaggeredMenu`, com histórico recusa→recuperação). `LICENSE.md` (MIT + Commons Clause, aviso de copyright) está junto do código, como a licença exige.
7. **`lib/fundoInerte.ts` é exatamente o que a Task 18 pediu.** Um helper, os dois overlays (`MobileMenu.tsx:100`, `Lightbox.tsx:155`), restauração idempotente e **antes** do `focus()` nos dois `fechar()` (`MobileMenu.tsx:78-80`, `Lightbox.tsx:119-121`), provada por spy em `HTMLElement.prototype.focus` nos dois testes. `CustomEase 'gaveta'` registrado uma vez por flag de módulo (`easeGaveta.ts:18-33`), chamado no provider e, por segurança, no consumidor — e `staggeredMenu.test.ts:58-75` prova que a curva do GSAP avalia igual ao `cubic-bezier` do CSS em 5 pontos.
8. **Testes que provam comportamento, não estrutura, onde importa:** `reveal.test.tsx:51-92` força o disparo real do ScrollTrigger e avança a tween; `videoCard.test.tsx:103-165` dispara entradas de interseção e prova "um por vez" pela ordem das chamadas; `circularGallery.test.tsx:147-193` prova a pausa por viewport e por `document.hidden` com rAF controlado; `lightbox.test.tsx:190-219` e `header.test.tsx:232-280` provam a ordem restaurar→focar. O ledger mostra prova por quebra proposital em quase todo fix round.
9. **Acessibilidade dos overlays acima da média:** trap bidirecional, Escape, retorno de foco, `aria-modal`, `inert` no painel fechado e no fundo com overlay aberto, `aria-hidden` no canvas com equivalente `sr-only`, `aria-hidden` no ticker repetido, `alt=""` em decorativas, a11y Lighthouse 1.00/1.00 após a Task 18.
10. **Disciplina de motion:** `.pressable` único (`globals.css:45-51`), `Reveal` único para entrada (21 usos), tokens de easing em `@theme`, reduced-motion que reduz sem zerar (fade de 200 ms mantido via GSAP/Motion; WebGL, autoplay e ticker desligados). Stagger capado em 5 linhas (`Tratamentos.tsx:13`). Timings do drawer travados por teste contra os tetos do guia.
11. **Performance tratada com método:** ablação de 3 amostras refutou o diagnóstico inicial; H1 (AVIF) e H2 (`sizes` 80vw, com o achado da corrida perto do corte de srcset) foram medidas isoladas e combinadas; H3 revertida por não ter número. `lib/imgOtimizada.ts` tirou ~470 KB das texturas da galeria. O vermelho do `orcamento.test.ts` é honesto: lê o `lh-mobile.json` real (3847 ms, mediana de 6), e o devtools-throttling (2211 ms) está dentro da meta.

---

## Issues

### Critical

Nenhum.

### Important

**I1 — `site/package.json:10` · `npm test` trava nesta máquina e o comando que funciona vive só no ledger (gitignored).**
- O quê: `"test": "vitest run"`. O ledger (L392, L761) registra que o paralelismo padrão trava por contenção e que a suíte só roda com `--no-file-parallelism`. Esse conhecimento não está em `package.json`, `vitest.config.ts` nem `README.md`. O plano (Task 17 Step 6, Task 18) diz `npm test` → "tudo PASS".
- Por quê: quem clonar `main` depois do merge (ou um CI) roda `npm test` e fica pendurado — e, se rodar, vê um vermelho sem explicação no repositório.
- Como: `vitest.config.ts` → `test: { ..., fileParallelism: false }` (ou o script com a flag), e uma linha no README. Ver também I5 para o vermelho.

**I2 — `site/README.md` · o entregável da Task 18 Step 6 não existe; o arquivo ainda é o boilerplate do `create-next-app`.**
- O quê: o plano pedia README com "como rodar, como buildar, onde ficam os assets, como trocar um vídeo, e a lista de pendências que bloqueiam a publicação". O que existe: seção de domínio (boa) e de ícones. Linhas 33-66 são o template — inclusive "optimize and load Geist" (`README.md:51`), que é falso (o site usa Archivo Black/Jost/Source Sans 3/Caveat). Não há: como rodar a suíte (ver I1) e o que é o vermelho esperado; o pipeline `scripts/preparar-assets.mjs` (raiz) e `VIDEOS/README.md`; como trocar um vídeo (slug → previews/posters/completos + `DEPOIMENTOS` em `lib/content.ts`); a lista de bloqueios de publicação (hoje só em `PERGUNTAS-CLIENTE.md`, `VIDEOS/README.md` e no workspace gitignored); o aviso de que `Tratamentos.tsx:32` lê `public/` do disco no servidor (deploy `standalone` precisa copiar `public/`, deferred L367).
- Por quê: é o documento de handoff para o parceiro/cliente e para qualquer mantenedor; a Task 18 foi re-escopada para o QA do impeccable e este step caiu sem ninguém registrar.
- Como: reescrever o README com as cinco seções do plano, apontando para `.env.example`, `VIDEOS/README.md`, `PERGUNTAS-CLIENTE.md` e para o arquivo do workspace arquivado (I5).

**I3 — `site/__tests__/heroBackdrop.test.tsx:16-26` · os dois testes "não monta canvas" passam por construção.**
- O quê: `Silk` entra por `next/dynamic({ ssr:false })`, que em jsdom resolve de forma assíncrona; os testes consultam `container.querySelector('canvas')` **síncrono** logo após o `render`, então o resultado é `null` mesmo com `podePesado === true`. Não há caso positivo ("monta quando capaz") — se o gate `montado && podePesado` de `HeroBackdrop.tsx:38` for removido, os três testes continuam verdes. Compare com `sorrisos.test.tsx:12-20,100-108`, que faz o certo: mocka o módulo dinâmico com um stub e tem controle positivo.
- Por quê: o que esses testes dizem provar é uma Global Constraint ("reduced-motion desliga todo WebGL"). A regressão passaria em silêncio. A proteção real hoje é `useCapability.test.tsx` + leitura de código.
- Como: `vi.mock('@/components/reactbits/Silk', () => ({ default: () => <div data-testid="silk-stub" /> }))`, `await waitFor` nos negativos (`expect(queryByTestId('silk-stub')).toBeNull()`), e um positivo com `cap(false, 8)` esperando o stub aparecer.

**I4 — `site/components/sections/SorrisosGaleria.tsx:79-85` · a galeria WebGL monta na hidratação, não quando a seção entra na viewport — desvio do plano, originado no brief da Task 13, nunca registrado como desvio.**
- O quê: o plano ("Onde o WebGL entra", l.62) diz "montados só quando a seção entra na viewport"; `task-13-brief.md:29` reduziu para "montada só quando `useCapability().podePesado`". Medido no `lh-mobile.json` de HEAD (Lighthouse não rola a página): os 8 retratos já são baixados (`/_next/image?...retrato-N&w=640`, 134 KB AVIF somados) mais o chunk do `ogl` (18 KB gzip) — para um visitante que nunca chega em "Sorrisos". O loop de render pausa (`CircularGallery.tsx:403`), mas o download não. A ablação da Task 17 mostrou o custo: CircularGallery desligado = TTI 7,4 s → 6,3 s.
- Por quê: é custo em bytes + CPU de montagem (18 texturas, 2 `Program` por retrato) pago por todo aparelho "capaz" independentemente de uso; e é a única Global/plan constraint de WebGL sem registro de desvio (HeroBackdrop é aceitável — o hero está na viewport desde o primeiro frame).
- Como (follow-up, não bloqueia merge): em `SorrisosGaleria`, um `IntersectionObserver` no wrapper com `rootMargin: '100%'` (uma viewport de antecedência, para o canvas já estar pronto quando a seção aparecer) antes de `mostrarWebgl`; o scroller de fallback já é o conteúdo que o servidor manda, então nada some. Registrar junto do custo do React Bits para a decisão do parceiro — os números já estão em `task-17-report.md` e `task-19-report.md`.

**I5 — A justificativa do estado entregue não está no git: `.superpowers/` é ignorado (`.gitignore:5`), o `progress.md` da raiz está desatualizado (`progress.md:9-13`: "16 de 18 tasks… Task 19 pendente de review"), e `orcamento.test.ts` não explica o vermelho.**
- O quê: relatórios de custo (Task 19), de performance (Task 17, a leitura corrigida do LCP, a recomendação ao parceiro), critique/fix/re-review da Task 18, `deferred-minors.md` e o ledger inteiro vivem só no workspace gitignored. Depois do merge, o que resta rastreado sobre "por que há um teste vermelho" são mensagens de commit e o comentário em `app/layout.tsx:18-24`. Os quatro componentes vendorizados citam `task-19-report.md` como fonte do custo (`Silk.tsx:15`, `GlareHover.tsx:15`, `HeroBackdrop.tsx:11,15`, `globals.css:70`) — referência a um arquivo que não existe no repositório. `orcamento.test.ts:21-26` não tem comentário dizendo que o vermelho é conhecido e aguarda decisão.
- Por quê: o ledger (L1022-1029) já marca o arquivamento como "PASSO OBRIGATÓRIO NO FECHAMENTO"; esta review confirma que ele precisa acontecer **no mesmo merge**, senão a branch chega em `main` com um teste vermelho e quatro comentários apontando para o vazio.
- Como: copiar o workspace (menos `review-*.diff`, `*.json`, `*.stderr`) para `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/`, ajustar os 5 ponteiros para o caminho arquivado, atualizar o `progress.md` da raiz com estado final/decisões/bloqueios, e adicionar em `orcamento.test.ts` um comentário de 3 linhas: "LCP simulado 3847 ms > 2500 por design após H1+H2; devtools 2211 ms; decisão do parceiro pendente — ver docs/…/task-17-report.md". A forma final do teste (`it.fails`, `it.skip` com motivo, ou orçamento revisto) é decisão do parceiro, não desta review.

### Minor

**M1 — `site/components/sections/Faq.tsx:74-76` · anima `height` (0 → auto) com Motion, única violação não documentada de "só `transform`/`opacity`/`clip-path`".** 250 ms, duas perguntas, abaixo da dobra — impacto real desprezível, mas todo outro desvio do projeto (GlareHover, padding do header revogado) está registrado e este não. Como: registrar como desvio aceito no comentário do componente e no README/ledger, ou trocar por `clip-path: inset()` + altura medida.

**M2 — Corpo de texto abaixo de 16 px fora da exceção aceita (microcopy de rodapé).** `Faq.tsx:80` resposta do FAQ a **15 px** (texto corrido, o mesmo caso do F4 do hero, corrigido na Task 18); `TratamentoLinha.tsx:71` descrição a 15 px; `AntesDepois.tsx:137` aviso legal a 13,5 px (duas frases exigidas pela CFO-196); `Hero.tsx:157` endereço a 14 px (rótulo, ok). Como: FAQ → 16 px; descrição → 16 px ou registrar como rótulo; aviso legal → 14 px ou registrar na mesma exceção do rodapé.

**M3 — Encanamento dos overlays duplicado verbatim.** `travarScroll`/`destravarScroll` em `MobileMenu.tsx:17-44` e `Lightbox.tsx:44-67` (28 linhas idênticas); a lógica de trap Tab/Shift+Tab em `MobileMenu.tsx:109-127` e `Lightbox.tsx:166-184`; `FOCAVEIS_SELETOR` divergente (`MobileMenu.tsx:15` sem `video[controls]`, `Lightbox.tsx:24` com). A Task 18 F3b criou `lib/fundoInerte.ts` justamente para os dois overlays não divergirem — e deixou os gêmeos ao lado. Como: `lib/overlay.ts` com `travarScroll`, `destravarScroll`, `prenderFoco(painel, e)` e um só seletor.

**M4 — Constantes de motion/z-index espalhadas.** `EASE_SAIDA = [0.23,1,0.32,1]` duplicado em `Lightbox.tsx:22` e `Faq.tsx:11`; o comentário de `Lightbox.tsx:17-21` justifica a cópia citando cópias em `MobileMenu.tsx`/`WhatsAppFab.tsx`/`Magnet.tsx` que **não existem mais** (MobileMenu usa GSAP, FAB usa a classe `ease-saida`, Magnet usa `var(--ease-saida)`). `STAGGER_STEP = 0.06` em `AntesDepois.tsx:19`, `ComoFunciona.tsx:15`, `Tratamentos.tsx:14`, inline `0.06` em `Depoimentos.tsx:61` e `0.08` em `Pilares.tsx:22`. Z-index: `Header.tsx:29` z-50, `WhatsAppFab.tsx:65` z-[60], `MobileMenu.tsx:184,189` z-[65]/z-[70], `Lightbox.tsx:37` constante 85 **e** `Lightbox.tsx:245` literal `z-[90]` — no mesmo arquivo que argumenta que só a constante garante sincronia. A ordem está coerente (50 < 60 < 65 < 70 < 85 < 90) mas por acaso, não por design. Como: `lib/motionTokens.ts` (mesmo padrão de `easeGaveta.ts`: pontos + teste contra o `globals.css`) e `lib/zIndex.ts` com a escala nomeada.

**M5 — Comentários apontando para arquivo removido na Task 19.** `CircularGallery.tsx:21,23,275,401,455` e `ScrollVelocity.tsx:20,143` dizem "mesmo padrão de `components/ui/Silk.tsx`" — o arquivo não existe e o `reactbits/Silk.tsx` atual usa outro mecanismo (`frameloop` do R3F, não rAF próprio). `README.md:155,176,182` idem. `README.md:282` "325 linhas" — o `StaggeredMenu.tsx` tem 410 depois da Task 18.

**M6 — Testes vazios ou com título enganoso.** `header.test.tsx:88-113` "abre o drawer com opacidade visível": desde a Task 19 o painel animado nunca recebe `style.opacity` (`StaggeredMenu.tsx:370` só seta no ramo reduced) — `''` ≠ `'0'` passa sempre, e o comentário descreve a implementação antiga; a regressão real agora seria `xPercent` preso em 100, que o teste não vê. `header.test.tsx:310` título diz "lenis.stop" mas testa o fallback `position:fixed` (o corpo admite). `sorrisos.test.tsx:12-20` declara `circularGalleryOnErrorSpy` e nunca o usa; o stub chama `props.onError(true)` **durante o render** (setState do pai dentro do render do filho — React avisa). `motion.test.tsx:99-110,172-181` provam "não chamou" com `setTimeout(80)`. Nenhum deles esconde bug hoje; o primeiro deveria ser reescrito ou removido.

**M7 — `Header.tsx:29` `border-[#F1E7DB]`** — único hex cru em componente fora dos tokens (está na lista da paleta, mas `@theme` só tem `--color-borda: #EBDFCE` e `--color-borda-forte`). `Header.tsx:49` `ease-out` nativo (deferred L184). Como: token `--color-borda-header` ou `border-borda`; `ease-[var(--ease-saida)]`.

**M8 — `Footer.tsx:3` e `Localizacao.tsx:8` importam `PENDENTE` de `components/sections/Profissional`.** Fonte única correta, lugar errado (layout dependendo de seção). Como: `components/ui/pendente.ts` ou `lib/ui.ts`.

**M9 — `site/public/{file,globe,next,vercel,window}.svg`** — sobras do scaffold, sem nenhuma referência em `app/`, `components/`, `lib/`. Apagar.

**M10 — `app/sitemap.ts:10` `lastModified: new Date()`** muda a cada build e mente para o crawler. Como: data fixa/env de build ou omitir.

**M11 — `globals.css:53-59` comprime para `.01ms` a transição de opacidade que o `StaggeredMenu.tsx:368` usa sob reduced-motion (`duration-200`)** — o drawer aparece de uma vez, enquanto o Lightbox (Motion, JS) mantém o fade de 200 ms que o guia pede. Documentado no README do reactbits como esperado; fica registrado como inconsistência entre os dois overlays. Como: exceção para `.sm-panel-scope` no reset, ou aceitar.

**M12 — `deferred-minors.md` está incompleto:** o minor da Task 17 registrado no ledger (L958, custo do primeiro request AVIF ~50% maior e persistência do cache de imagens no host — "confirmar antes de publicar") não entrou na lista consolidada. Adicionar (e é item de publicação).

---

## Verificações específicas pedidas no despacho

| # | Pedido | Resultado |
|---|---|---|
| 1 | `matchMedia`/`navigator.connection` fora de `useCapability.ts` | Só comentários (20 ocorrências, todas em `/* */`, `//` ou README), inclusive em `components/reactbits/`. ✓ |
| 2 | Rede em `components/reactbits/` | Vazio; 2 hits são comentários sobre o que foi removido. ✓ |
| 3 | Whitelist de dígitos em `content.test.ts` | Intacta e forte (`:46-99`). Nenhum número novo na copy das Tasks 17-19. Gap pré-existente, por design da Task 4: copy que vive em componentes (Hero, Clínica, Tratamentos intro, CtaFinal, Footer) não passa pela whitelist — coberta pelo grep do HTML (rodado aqui: `limpo`). Recomendação em R4. |
| 4 | README + LICENSE dos vendorizados | 8/8 documentados com origem e modificações; `LICENSE.md` presente com o aviso. ✓ (M5 para as referências mortas) |
| 5 | `fundoInerte.ts` nos dois overlays, restaura antes do `focus()`, `'gaveta'` registrada uma vez | ✓ `MobileMenu.tsx:78-80,100,135`, `Lightbox.tsx:119-121,155,192`; `easeGaveta.ts:18-33` flag de módulo; `motion.tsx:116` + `StaggeredMenu.tsx:231,295` (idempotente, provado em `staggeredMenu.test.ts:66-67`). |
| 6 | `page.tsx` RSC; `'use client'` só onde precisa; `three`/`ogl` fora do first-load | ✓ (Forças 4 e 5). 28 arquivos com `'use client'`, todos com hook/efeito/evento. |
| 7 | Testes por construção / mocks vazios | I3 (real), M6 (vazios/stale). |

**Global Constraints, verbatim:**
- Mobile-first / headline e CTA acima da dobra em 375 px: medido pela Avaliação A da Task 18 (`task-18-A-report.md:213`: h1 termina em y=355, CTA em y=563, viewport 812). ✓
- Alvos ≥ 44 px: `min-h-11`/`h-11 w-11` em todo pressionável lido (header, drawer, FAB 58 px, FAQ summary, cards, CTAs, links de contato). Nada exclusivo de `:hover` (`pointer-fine:` só muda cor/fundo). ✓
- Corpo ≥ 16 px: **M2** (quatro exceções, uma clara).
- Paleta fixa: nenhum hex fora da lista em componente; 1 hex da lista fora de token (**M7**). Defaults não usados dos vendorizados (`Silk.tsx:199`, `GlareHover.tsx:85`) sempre sobrescritos.
- Só `transform`/`opacity`/`clip-path`: **M1** (Faq `height`); GlareHover `background-position` = decisão do parceiro, documentada; transições de cor = permitidas pela emenda do guia.
- reduced-motion desliga WebGL/autoplay e reduz o resto: ✓ (`HeroBackdrop.tsx:38`, `SorrisosGaleria.tsx:79`, `VideoCard.tsx:82,134`, `Ticker.tsx:66`, ramos reduzidos de `Reveal`, `AntesDepois`, `StaggeredMenu`, `Lightbox`, `Faq`).
- `saveData` desliga vídeo e WebGL: ✓ via `podePesado` (`useCapability.ts:30`), testado em `useCapability.test.tsx:43-49`, `videoCard.test.tsx:47-52`, `sorrisos.test.tsx:69-75`.
- WhatsApp `wa.me/551122740228?text=` variando por contexto: ✓ (`contact.ts:22-24`, 5 mensagens distintas).
- Orçamento: `three`/`ogl` fora do inicial ✓; previews < 260 KB cada (maior: 213 KB) e < 1 MB no total (833 KB) ✓; LCP simulado ✗ (3847 ms, honesto, ver I5); CLS ✓; JS inicial ≤ 180 KB gzip — **não medido nesta review**; o relatório da Task 19 mediu ~249 KB gzip de first-load, acima do orçamento do plano. Ninguém marcou isso como estouro. Entra em R2.

---

## Recomendações

**R1 — Onda única de correção antes do merge (barata, ~1 h):** I1, I2, I5, I3. Opcionalmente M2 (Faq 16 px) e M9 (svgs) na mesma onda por serem triviais. Uma re-review escopada, parar.

**R2 — Apresentar ao parceiro, com os números já medidos, a decisão sobre performance em um só pacote:** (a) LCP simulado 3847 ms vs. 2500 (devtools 2211 ms) — aceitar vermelho documentado ou rodada com `images.qualities`; (b) first-load JS ~249 KB gzip vs. 180 KB do plano (`gsap`/`ScrollTrigger`/`motion`/`lenis` são estáticos, +6,5 KB do React Bits); (c) custo do React Bits: Silk+CircularGallery = 42% dos bytes, -74% TBT e -39% TTI quando desligados; (d) I4 (gate por viewport da galeria). São quatro faces da mesma escolha "motion ousado vs. orçamento"; decidir junto evita quatro rodadas.

**R3 — Checklist de pré-publicação (não de merge), para o README:** CRO + nome do RT; confirmação de "Ortodontista" registrada; termos de autorização de imagem — **atenção:** `AntesDepois.tsx:17` já afirma "publicadas com autorização dos pacientes" (texto exato de COPY.md §8, correto para quando a autorização existir; publicar antes dela é afirmação falsa); horário; corte dos trechos de procedimento em `caso-protese` (~16 s) e `facetas-transformacao` (~3 s) nos completos; marca d'água CapCut; logo vetorial; `NEXT_PUBLIC_SITE_URL` + rebuild; persistência do cache de `/_next/image` no host (AVIF, deferred da Task 17); `public/` presente no deploy (`Tratamentos.tsx:32`); teste manual de reduced-motion e saveData em aparelho real (deferreds L151/L343 — o harness nunca compositou).

**R4 — Follow-up de integridade:** um teste que rode o grep de padrões proibidos contra o HTML prerenderizado (`.next/server/app/index.html`) quando ele existir — mesmo padrão condicional do `orcamento.test.ts` — fecha o gap da copy que não passa por `lib/content.ts`.

**R5 — Follow-up de coesão (M3, M4, M5, M8):** uma task curta "consolidar tokens de motion e overlay" depois do merge; nenhuma delas muda comportamento.

---

## Triagem do `deferred-minors.md` (um por um)

| Ref | Item | Triagem | Nota |
|---|---|---|---|
| L6 | `tokens.test.tsx` ausente | **Descartar** | Tokens confirmados no navegador na Task 6; `titulos-tamanho.test.tsx` cobre o único caso que já quebrou. |
| L7 | `"type":"module"` / warning do Vitest | **Follow-up** | Trivial; o warning apareceu nesta rodada. Validar que `next.config.ts`/`postcss.config.mjs` não mudam. |
| L30 | Marca d'água CapCut no vídeo da recepção | **Publicação** | Decisão do parceiro/cliente; já na lista de bloqueios. |
| L31 | `posters/recepcao` sem `.jpg` | **Descartar** | Componentes padronizados em `.webp` (`VideoCard.tsx:141,153`, `Lightbox.tsx:278`). |
| L32 | `logo-branco.png` com arco acinzentado | **Publicação** | Depende do logo vetorial (bloqueio existente). |
| L51 | `package-lock.json` na raiz | **Descartar** | Resolvido na prática por `turbopack.root` (`next.config.ts:8`); a raiz tem `sharp` de propósito. |
| L56 | Ramo `.png` morto em `preparar-assets.mjs:75` | **Follow-up** | 1 linha; sem impacto. |
| L57 | `dr-vinicius.jpg` com marca d'água | **Descartar (obsoleto)** | Substituído pela foto real na task extra de assets (113 KB, 20/08). |
| L76 | Regex do FAQ sem "duração"/"emergência" | **Follow-up** | `content.test.ts:27`, acrescentar 2 termos. |
| L151 | reduced-motion não testado ao vivo | **Publicação (checklist)** | Coberto por suíte + código; o harness nunca compositou. Teste manual em aparelho antes de publicar (R3). |
| L183 | Hover do FAB sem transição de `filter` | **Descartar** | Transição de `filter` é exatamente o que o guia evita. |
| L184 | `ease-out` no hover do nav | **Follow-up** | Junto com M7. |
| L304 | Brief da Task 7 citava `useCapability` | **Descartar (obsoleto)** | Hero usa desde a Task 8 (`Hero.tsx:20`). |
| L341 | rAF se reagenda quando pausado | **Descartar** | Só resta em `CircularGallery.tsx:398-403`; Silk usa `frameloop="never"`, ScrollVelocity usa o ticker da Motion. Custo de um early-return por frame. |
| L343 | Calibragem visual do boost do ticker | **Publicação (checklist)** | Olhar em aparelho real; parâmetros já conservadores (`Ticker.tsx:42`). |
| L365 | Comentário do `globals.css` sobre o GlareHover | **Descartar (obsoleto)** | `globals.css:62-73` e README reescritos na Task 19. |
| L367 | `fs.existsSync` frágil com `output:'standalone'` | **Follow-up (doc)** | Entra no README (I2/R3). |
| L443 | Desempate do coordenador de vídeo | **Descartar** | Estado final correto por construção (`VideoCard.tsx:41-54`); ordem só afeta chamadas intermediárias. |
| L445 | `recepcao.jpg` ausente | **Descartar** | Idem L31. |
| L489 | `href="#"` no logo | **Descartar (resolvido)** | Task 18 E2 (`Header.tsx:25`). |
| L683 | `titulos-tamanho.test.tsx` com lista fixa | **Descartar** | A defesa é o default de `SectionHeading.tsx:49`; o teste é cinto extra. |
| L781 | `THREE.Clock deprecated` no console | **Follow-up** | Acompanhar em upgrade de `three`/R3F. |
| (ledger L958, fora da lista) | Custo do 1º request AVIF / cache no host | **Publicação (checklist)** | Adicionar ao `deferred-minors.md` (M12). |

**Resumo (22 da lista + 1 do ledger = 23):** 0 bloqueiam merge · 6 follow-up (L7, L56, L76, L184, L367, L781) · 5 publicação/checklist (L30, L32, L151, L343, L958) · 12 descartar (L6, L31, L51, L57, L183, L304, L341, L365, L443, L445, L489, L683 — L57/L304/L365/L489 por obsolescência, os demais por decisão).

**Bloqueios de publicação:** os 7 da lista continuam válidos e continuam marcados no site (conferido no HTML prerenderizado). Acrescentar: o aviso legal de `AntesDepois` (afirma autorização) e a confirmação do cache de imagens no host. Nenhum bloqueia merge.

**Decisões da Task 18 para o parceiro:** FAQ fino (P2-3) — concordo em não inventar; a alternativa (b) do critique (reduzir peso visual) é a mais barata se ele não responder. Microcopy do rodapé — exceção aceita, concordo. Perguntas provocativas — a terceira ("o hero precisa do Silk?") é a mesma decisão de R2(c).

---

## Assessment

**Ready to merge? With fixes.**

Nada crítico e nenhuma constraint dura quebrada: o código é coerente, íntegro e bem testado; o vermelho é honesto. O que falta é o que só o conjunto mostra — a suíte trava com o comando padrão, o README de entrega não foi escrito, a justificativa do estado final não está no git e um teste de constraint passa por construção (I1, I2, I5, I3: uma onda curta, uma re-review escopada, merge). I4 e a performance (LCP simulado, first-load acima do orçamento, custo do React Bits) são uma única decisão do parceiro, a apresentar junto; não bloqueiam o merge e nunca bloquearam o build.
