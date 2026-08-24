# SDD ledger — plan: docs/superpowers/plans/2026-08-19-site-smile-ipiranga.md

BASE inicial: 7e6b144 (branch feat/site)

Task 1: complete (commits 7e6b144..f8b8f3f, review clean)
Task 1: minor (deferred): tokens.test.tsx citado em Files mas ausente nos Steps do brief — sem teste dedicado de tokens
Task 1: minor (deferred): package.json sem "type":"module" gera warning do Vitest a cada rodada
Task 1: nota: create-next-app instalou Next 16.3.1 (plano dizia 15). Sem breaking change para o stack usado.
Task 1: nota: app/layout.tsx sem export const metadata — coberto pela Task 16 (SEO)
Task 1: nota: app/page.tsx ainda é placeholder do scaffold com classes fora da paleta — substituído na Task 6/7
Task 1: RESOLVIDO ⚠️ do reviewer: "classes Tailwind v4 realmente geradas" — verificação movida para a Task 6,
        primeira que usa bg-creme/font-titulo em JSX. Se não gerarem, a Task 6 falha visivelmente.

--- Emenda ao plano (pedido do parceiro): aplicar skills de design/UI/UX ---
Criado $WS/design-guidance.md, destilado da skill emil-design-eng e calibrado para a marca.
Leitura obrigatória para toda task que escreve componente, CSS ou motion (5,6,7,8,9,10,11,12,13,14,15).
Emendas que ele introduz:
 - Tokens de easing (--ease-saida / --ease-movimento / --ease-gaveta) entram na Task 5, dona da fundação de motion
 - reduced-motion refinado: desliga WebGL/autoplay/ticker e todo movimento, mas MANTÉM fade de opacidade
   (~200ms), transição de cor e o scale(0.97) do :active, que é feedback e não decoração
 - Todo pressionável ganha :active scale(0.97) / 160ms
 - Todo :hover atrás de @media (hover:hover) and (pointer:fine)
 - Reveal de imagem pode usar clip-path inset em vez de translate

Task 2: implementado (commit c98bb6d) — 20 imagens, 5 previews (833KB no total), teste 26/26
Task 2: review — spec ✅ / qualidade REPROVADO
  Critical:  dr-vinicius.jpg com legenda "SUA PRÓTESE" queimada no frame
  Important: clinica-interior.png com 960KB e cor degradada (sharp .png() quantizou para paleta de 256 cores)
Task 2: fix round 1/5 despachado (resume do implementador original a2e20eb805d4774e9)
Task 2: minor (deferred): marca d'água CapCut queimada no vídeo da recepção — decisão do parceiro
Task 2: minor (deferred): posters/recepcao sem par .jpg (os outros 4 slugs têm) — assimetria herdada do brief
Task 2: minor (deferred): logo-branco.png com o arco acinzentado em vez de branco chapado
Task 2: nota: logo.png / logo-branco.png / sorriso-arco.png são FALLBACK gerado com Pillow.
        Substituir pelo export limpo do Claude Design quando o parceiro conseguir exportar.

--- Emenda ao plano ---
clinica-interior.png -> clinica-interior.jpg. Avisar as Tasks 7 e 12, que referenciam o arquivo.

--- Constraint nova, descoberta na Task 2 ---
site/AGENTS.md (gerado pelo `next dev`) avisa: esta é Next 16.3.1 e tem breaking changes em relação
ao conhecimento de treinamento dos modelos. Todo implementador das tasks seguintes precisa ser
instruído a ler `node_modules/next/dist/docs/` antes de escrever código de Next.

--- BLOQUEIO menor a resolver antes da Task 4 ---
As 7 imagens trat-*.jpg (facetas, implantes, protocolo, próteses, ortodontia, limpeza, clareamento)
não existem no acervo local. Existem no projeto do Claude Design em uploads/ (FACETAS.webp,
IMPLANTES.jpg, LIMPEZA PROFISSIONAL.jpg, ORTODENTIA.jpg, PROTESES.jpg, PROTOCOLO DE IMPLANTE.jpg).
O design já tem fallback: quando não há imagem, mostra o glyph ✦ sobre fundo creme.
Decisão: Task 4 referencia os caminhos; Task 10 renderiza com o fallback do glyph quando o arquivo
falta. Não bloqueia a execução. Pedir os arquivos ao parceiro.
Task 2: minor (deferred): `npm i -D sharp` criou package-lock.json na raiz; Turbopack agora avisa
        "inferred workspace root may not be correct" e escolhe a raiz em vez de site/. Corrigir com
        `turbopack.root` no next.config.ts. Dobrar na Task 3.
Task 2: fix round 1/5 (2 addressed, 0 open; commits c98bb6d..167ed72)
Task 2: complete (commits f8b8f3f..167ed72, review clean)
Task 2: minor (deferred): ramo if(.png) em preparar-assets.mjs virou código morto após a troca
Task 2: minor (deferred): dr-vinicius.jpg tem marca d'água "Smile" do vídeo no canto superior direito

Task 3: implementado (commits dc3f080, 895ad36) — useCapability + turbopack.root fixado em site/
Task 3: review — spec ✅ / qualidade REPROVADO
  Important x3: sem teste para hardwareConcurrency<4 isolado; sem teste do fallback ?? 8 quando o
  navegador não expõe deviceMemory (Safari/Firefox); sem teste de reatividade do listener nem de
  cleanup no unmount. Hook gateia WebGL/autoplay em 11 tasks — regressão passaria silenciosa.
Task 3: fix round 1/5 despachado (resume af2a44968d9eda1ee), com exigência de provar cada teste
        novo por quebra proposital da implementação
Task 3: fix round 1/5 (3 addressed, 0 open; commits 895ad36..5722b20) — 8 testes, cada um provado
        por quebra proposital da implementação; useCapability.ts intocado
Task 3: complete (commits 167ed72..5722b20, review clean)

Task 4: implementado (commit 76b2713) — lib/content.ts, 44/44 testes
Task 4: review — spec ✅ / qualidade Aprovado, mas 2 Important entram no loop
  Important: regex de "nenhum número inventado" com buracos ("mais de 500 pacientes", "+500", "nota 5.0")
  Important: divergências content.ts x COPY.md em PASSOS[3].desc e FAQ[0].r não registradas no relatório
             (origem é o brief, não escolha do implementador — mas precisa estar documentado)
Task 4: fix round 1/5 despachado — trocar blacklist de regex por whitelist de dígitos permitidos
Task 4: minor (deferred): regex do FAQ não guarda "duração da avaliação" nem "emergência/dor"
Task 4: fix round 1/5 (2 addressed, 0 open; commits 76b2713..505dd97) — whitelist recursiva de
        dígitos, telefone importado de contact.ts, mensagem de falha aponta a chave; content.ts intocado
Task 4: complete (commits 5722b20..505dd97, review clean)

Task 5: implementado (commit 4bae2f5) — MotionProvider (Lenis+ScrollTrigger), Reveal, 3 tokens de easing. 53/53
Task 5: desvio APROVADO pela review: motion.tsx reescrito com useSyncExternalStore porque o código do
        brief falha nas regras novas de lint do Next 16.3.1 (set-state-in-effect, refs). Interface
        pública idêntica, cleanup correto (rAF + Lenis.destroy + kill de todos os ScrollTriggers),
        getServerSnapshot presente para SSR.
Task 5: emenda do guia aplicada — reduced-motion faz fade de 200ms SEM deslocamento, em vez de pular
        a animação inteira
Task 5: review — spec ✅ / qualidade Aprovado, 1 Important entra no loop
  Important: o teste de "sem deslocamento sob reduced-motion" nunca dispara o ScrollTrigger (o mock de
  getBoundingClientRect põe o elemento fora da zona), então mede o estado pré-animação. Reintroduzir
  `y` no ramo reduzido passaria verde.
Task 5: fix round 1/5 despachado — forçar o disparo real do trigger e afirmar que a opacidade mudou
        E o transform continua sem translate
Task 5: fix round 1/5 (1 addressed, 0 open; commits 4bae2f5..6d633e7) — teste força o disparo real do
        trigger e afirma opacity==1 E transform=='' ; provado por quebra proposital ("translate(0, 0)")
Task 5: complete (commits 505dd97..6d633e7, review clean)

Task 6: implementado — Header, MobileMenu (drawer à mão), WhatsAppFab, 4/4 testes novos (58/58 total)
Task 6: RESOLVIDO ⚠️ do reviewer da Task 1 — bg-creme, text-amarelo, text-grafite, font-titulo,
        font-rotulo, font-corpo confirmados no navegador (CSS gerado + getComputedStyle), não só
        pelo build passar. Os 3 primeiros já apareciam organicamente nos componentes; text-amarelo/
        font-titulo/font-corpo foram confirmados com um componente temporário (criado, testado,
        apagado antes do commit — não sobrou no diff).
Task 6: desvio do brief — @react-bits/staggered-menu não instalado. `npx shadcn@latest add
        @react-bits/staggered-menu` (e a versão fixada em 4.17.0) falham com "Unexpected token '<'
        ... is not valid JSON": https://reactbits.dev/r/staggered-menu.json devolve o HTML da SPA
        (Content-Type: text/html, CF-Cache-Status: HIT — falha real do registry, não do sandbox).
        components.json com a chave "registries" foi criado mesmo assim (brief pede) — Tasks 10 e 12
        também dependem desse registry (glare-hover, gradual-blur) e provavelmente vão bater na
        mesma falha; avisar os implementadores para não perderem tempo tentando de novo sem checar
        primeiro. Drawer implementado à mão com Motion (`motion/react`, dependência já existia em
        package.json) seguindo as regras de craft do guia (--ease-gaveta em array, 300ms/220ms
        assimétrico, stagger 40ms, translateX(100%), foco preso, Escape, devolução de foco).
Task 6: nota — ids das seções que o header referencia (âncoras da nav) fixados aqui para as Tasks 7,
        10, 12 e 15 honrarem: #tratamentos (Task 10), #clinica (Task 12), #depoimentos (Task 12),
        #localizacao (Task 15). Nenhuma seção existe ainda; se essas tasks usarem outro id, os links
        do header/drawer quebram silenciosamente (âncora que não bate com nada).
Task 6: bug pego só no navegador (não no vitest) — MobileMenu tinha opacity:0 preso para sempre no
        painel do drawer. Causa: useCapability() começa com podeAnimar:false até o efeito resolver;
        o primeiro commit usa o ramo reduced-motion do variants (que declara opacity:0), e a Motion
        só atualiza propriedades presentes no variant *atual* — o ramo podeAnimar:true não declarava
        opacity, então o 0 herdado ficava preso. Corrigido fixando opacity:1 nos dois estados do
        ramo animado. Achado com `npm test` verde o tempo todo — só apareceu inspecionando o
        `style` real no navegador.
Task 6: bug pego só no navegador (2) — WhatsAppFab: o IntersectionObserver só tratava a transição
        para "além do sentinel", nunca a volta; depois de rolar uma vez, rolar de volta ao topo não
        escondia o FAB. Decisão (registrada no componente): manter assim de propósito — mão única,
        para não ficar aparecendo/sumindo toda vez que o scroll cruza a borda do hero — mas o código
        original fazia isso sem querer (reducer que só tratava um dos dois ramos), corrigido para um
        latch explícito com observer.disconnect() após a primeira revelação.
Task 6: desvio do guia de craft — o encolhimento do header (padding 10px→6px aos 80px de scroll)
        anima `padding`, não só `transform`. Registrado no código: encolher de verdade sem deixar um
        vão fantasma no layout não é possível só com transform (transform não muda o box do
        elemento); optei por uma transição CSS de padding isolada num único elemento sticky (não é
        lista/bulk, custo de reflow desprezível) em vez de uma solução transform-only que deixaria
        um gap visual. GSAP/ScrollTrigger só decide o estado binário (igual ao resto do projeto,
        integrado ao Lenis); quem anima é `transition: padding-* 260ms var(--ease-movimento)` em
        CSS puro. Desligado sob reduced-motion (mesma categoria de "remover o movimento" do guia).
Task 6: nota — FAB usa um sentinel de 1x1px a `100vh` do topo do documento (IntersectionObserver) em
        vez de observar o Hero, porque o Hero só existe a partir da Task 7 e esta task roda antes.
        Continua correto depois que o Hero existir, já que o Hero é desenhado para caber
        aproximadamente na primeira viewport em mobile (mobile-first "acima da dobra").
Task 6: verificado no navegador em 375px e 1280px via Chrome DevTools MCP — nav horizontal/CTA some
        e hambúrguer aparece em 375px (e vice-versa em 1280px); drawer abre/fecha por clique, por
        Escape e por clique no backdrop; foco inicial vai para "Fechar menu", Tab/Shift+Tab
        confirmados prendendo o foco nos dois sentidos (do último para o primeiro e vice-versa),
        Escape devolve o foco ao hambúrguer; header encolhe e volta (10px↔6px) rolando a página
        (precisou de um spacer temporário via JS — a página ainda não tem conteúdo até a Task 7);
        FAB some no topo, aparece depois de ~1 viewport rolada, continua visível ao rolar de volta;
        nenhum erro/warning no console em toda a sessão de teste.
Task 6: minor (deferred) — reduced-motion (matchMedia prefers-reduced-motion:reduce) não foi testado
        ao vivo no navegador, só por leitura de código (o padrão já usado em Reveal.tsx/motion.tsx é
        seguido à risca nos 3 componentes novos). Não há ferramenta disponível nesta sessão para
        emular a media feature num browser real; os testes unitários do projeto cobrem esse ramo via
        vi.stubGlobal('matchMedia', ...) mas header.test.tsx (conteúdo fixo do brief) não inclui um
        caso dedicado a isso.

Task 6: implementado (commit b8d6cd3) — Header sticky, MobileMenu (drawer à mão), WhatsAppFab. 58/58
Task 6: RESOLVIDO ⚠️ da Task 1: os 6 tokens Tailwind v4 foram confirmados no navegador via
        getComputedStyle. bg-creme/text-amarelo/text-grafite/font-titulo/font-rotulo/font-corpo funcionam.
Task 6: desvio documentado: header anima `padding` no encolhimento (não só transform) — encolher sem
        vão fantasma é impossível só com transform; isolado a um elemento sticky, off sob reduced-motion
Task 6: ids de âncora definidos aqui: #tratamentos #clinica #depoimentos #localizacao
        Tasks 7/10/12/15 precisam honrar exatamente esses ids.

--- BLOQUEIO RESOLVIDO: registry do React Bits está quebrado ---
Verifiquei eu mesmo: https://reactbits.dev/r/<nome>.json devolve HTTP 200 com o shell HTML do SPA,
para todos os 8 componentes testados e em 4 variações de caminho. `npx shadcn add @react-bits/*`
não funciona e não vai funcionar.
Solução: vendorizar de https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/...
(variante TypeScript+Tailwind, casa com o stack). Caminhos dos 7 componentes confirmados.
Licença MIT + Commons Clause: permite uso comercial em site de cliente; proíbe revender os
componentes em si. Exige manter o aviso de copyright junto do código.
Escrito em .superpowers/sdd/2026-08-19-site-smile-ipiranga/reactbits-vendoring.md
LEITURA OBRIGATÓRIA nas Tasks 8, 9, 10, 12 e 13.
Task 6: review — spec ✅ / qualidade REPROVADO (revisor subiu o navegador e testou ao vivo)
  Desvios ACEITOS: drawer à mão (registry do React Bits quebrado) e padding no encolhimento do header
  Important: :active scale(0.97) não aplica nos itens do drawer — a Motion escreve transform inline
             e estilo inline vence regra de classe. Confirmado no DOM real. Zero feedback de toque.
  Important: nenhum teste cobre os 2 bugs achados só no navegador (opacidade do drawer presa em 0,
             FAB sem comportamento ao voltar ao topo)
Task 6: fix round 1/5 despachado — whileTap na Motion + testes com stub de IntersectionObserver
Task 6: minor (deferred): hover do FAB troca brightness sem transição de filter
Task 6: minor (deferred): hover do nav usa ease-out onde o guia prescreve ease
Task 6: nota: sentinel do FAB é um alvo de 1px em 100vh — técnica frágil, a Task 7 deve revalidar
        quando o Hero real existir
Task 6: hook de design (impeccable) sinalizou Header.tsx:50 — layout-transition.
        NÃO é falso positivo: expôs contradição no PLANO, não no trabalho do implementador.
        A Global Constraint diz "só transform e opacity"; o brief da Task 6 (também meu) pediu header
        que encolhe, o que exige mudar o box. Pior: header é sticky e está no fluxo, então mudar a
        altura empurra todo o conteúdo abaixo — reflow do documento a cada frame, não só do header.
        Conferido no design aprovado do Claude Design: o header de lá é sticky simples, altura fixa,
        SEM encolhimento. O shrink era enfeite meu.
        Decisão: remover o encolhimento. Adicionado como item 4 do fix round 1.

--- Emenda ao plano ---
Task 6 do plano dizia "O Header encolhe ao rolar: usar ScrollTrigger para reduzir o padding vertical
de 10px para 6px depois de 80px de scroll". REVOGADO. Header tem padding fixo, como no design aprovado.
Task 6: fix round 1/5 (4 addressed, 0 open) — whileTap real nos itens do drawer (a causa raiz não
        era só "estilo inline vence classe": misturar `transform:'translateX()'` literal com
        `whileTap={{scale}}` quebra a composição da Motion — trocado para o atalho `x` só nesse
        item, único lugar do projeto que foge da regra "transform literal", com justificativa e
        prova ao vivo no comentário do código); 2 testes novos provando os bugs documentados no
        round anterior (opacidade presa do drawer, reducer do FAB), cada um provado por quebra
        proposital + restauração; sentinel do FAB trocado de 100vh para 100dvh; encolhimento do
        header removido por inteiro (ScrollTrigger, useCapability, useState/useEffect órfãos
        limpos de Header.tsx — decisão do parceiro, não erro do implementador, ver nota acima).
        60/60 testes, lint e build limpos. Commits pendentes.

=========================================================================
PAUSA — 19/08/2026, fim de sessão. Retomar em 20/08.
=========================================================================

ESTADO: Tasks 1-5 completas com review limpa. Task 6 em fix round 1/5, COM TRABALHO NÃO COMMITADO.

Último commit: b8d6cd3 (feat: header sticky, menu mobile e botao flutuante de WhatsApp)
Branch: feat/site

Working tree sujo em 4 arquivos, do fix round 1 da Task 6 que estava em andamento:
  M site/__tests__/header.test.tsx
  M site/components/layout/Header.tsx
  M site/components/layout/MobileMenu.tsx
  M site/components/layout/WhatsAppFab.tsx

O implementador (agente a71176ffc90f659d6) recebeu 4 itens de correção e pode ter terminado
depois desta anotação. AO RETOMAR, PRIMEIRO PASSO: rodar `git status` e `cd site && npm test`
para descobrir em que ponto parou. Não re-despachar a Task 6 do zero.

Os 4 itens do fix round 1 da Task 6:
  1. (Important) whileTap na Motion para o :active scale(0.97) funcionar nos itens do drawer
     — hoje a Motion escreve transform inline e vence a regra de classe na cascata
  2. (Important) 2 testes que faltam: drawer abre visível (bug da opacidade presa em 0) e
     FAB reage ao sentinel (precisa de stub de IntersectionObserver — jsdom não implementa)
  3. (Minor) sentinel do FAB de 100vh para 100dvh
  4. (Important) REMOVER o encolhimento do header — decisão minha, o design aprovado não tem
     isso e contradizia a Global Constraint "só transform e opacity"

Depois que a Task 6 fechar: gerar review-package do range b8d6cd3..HEAD, re-review escopada dos
4 itens, e só então marcar complete e seguir para a Task 7 (Hero estático).

CONTEXTO QUE NÃO PODE SE PERDER AO RETOMAR:
- `.superpowers/sdd/2026-08-19-site-smile-ipiranga/design-guidance.md` — guia de craft, leitura
  obrigatória de toda task de UI (5,6,7,8,9,10,11,12,13,14,15)
- `.superpowers/sdd/2026-08-19-site-smile-ipiranga/reactbits-vendoring.md` — o registry do
  React Bits está quebrado; vendorizar do GitHub. Leitura obrigatória das Tasks 8,9,10,12,13
- Next é 16.3.1, não 15. Tem breaking changes; ler site/node_modules/next/dist/docs/ antes de
  usar API do Next. O site/AGENTS.md avisa.
- ids de âncora fixados na Task 6: #tratamentos #clinica #depoimentos #localizacao
- clinica-interior é .jpg, não .png (Tasks 7 e 12 referenciam)
- Dev server: `cd site && npm run dev` (porta 3000). Foi encerrado na pausa.

PENDÊNCIAS COM O CLIENTE (não bloqueiam build, bloqueiam publicação):
  CRO do responsável técnico · autorização de imagem dos pacientes · marca d'água CapCut no vídeo
  da recepção · as 7 imagens trat-*.jpg · logo em vetor · horário de atendimento
  Ver PERGUNTAS-CLIENTE.md

--- ATUALIZAÇÃO: o fix da Task 6 entrou DEPOIS da nota de pausa acima ---

Task 6: fix round 1/5 ENTREGUE (commit b120400). 60/60 testes, lint e tsc limpos, build de produção ok.
        Working tree LIMPO. A nota de pausa acima que fala em "trabalho não commitado" está VENCIDA.

Os 4 itens, todos feitos:
  1. :active nos itens do drawer — causa raiz mais profunda do que a review diagnosticou: não era só
     "inline vence classe". O item usava `transform: 'translateX(...)'` como string literal, e a Motion
     não sabe compor um transform cru com o scale do whileTap (duas fontes disputando a mesma
     propriedade). Trocado para o atalho `x` da Motion — única exceção do projeto à regra de transform
     literal, documentada em comentário no código.
     Confirmado no navegador real via PointerEvent: none -> scale(0.9968) -> scale(0.97) -> none.
  2. 2 testes de regressão adicionados (drawer visível ao abrir; FAB reage ao sentinel com stub de
     IntersectionObserver), ambos provados por quebra proposital.
  3. sentinel do FAB: 100vh -> 100dvh
  4. encolhimento do header removido por completo (ScrollTrigger, estado e imports órfãos limpos)

NOTA DE JULGAMENTO do implementador que vale registrar: ele recusou a mutação que eu sugeri para
provar o teste do FAB (reintroduzir o reducer antigo), porque o reducer antigo é comportamentalmente
idêntico ao novo para qualquer sequência alcançável — a diferença era só clareza. Escolheu uma
mutação que representa regressão de verdade. Estava certo.

>>> PONTO DE RETOMADA EXATO <<<
Falta a RE-REVIEW ESCOPADA do fix round 1 da Task 6, dos 4 itens acima.
Comando: scripts/review-package docs/superpowers/plans/2026-08-19-site-smile-ipiranga.md b8d6cd3 HEAD
Depois: marcar Task 6 complete e seguir para a Task 7 (Hero estático).
Nada mais está pendente. Working tree limpo.
Task 6: fix round 1/5 (4 addressed, 0 open; commits b8d6cd3..b120400)
Task 6: complete (commits 6d633e7..b120400, review clean)
Task 6: CORREÇÃO NO design-guidance.md — a afirmação de que os atalhos x/y da Motion não são
        acelerados por hardware estava ERRADA nesta versão. O revisor checou o fonte do motion-dom:
        compõem num único write de element.style.transform, mesmo caminho de GPU. E usar string
        literal tem custo real: impede compor com whileTap. Guia atualizado com a regra correta.

Task 7: implementado (commit 76a6823) — Hero + SectionHeading. 65/65
Task 7: ACHADO IMPORTANTE do implementador: hero real mede 1295.9px em 375px, ~60% acima do palpite
        de 100dvh da Task 6. Sentinel do FAB trocado para observar #hero de verdade. Se não tivesse
        verificado, o FAB apareceria cedo demais no mobile.
Task 7: Next 16 deprecou `priority` do next/image em favor de `preload` — confirmado na doc e no
        fonte local pelo implementador E pelo revisor. Header.tsx (Task 6) ainda usa o deprecado.
        Corrigir na Task 17 (passada de performance).
Task 7: review — spec ✅ / qualidade Aprovado, 1 Important entra no loop
  Important: page.tsx virou Client Component sem necessidade — existe wrapper client menor. Custo
             real: Client Component não exporta metadata, e a Task 16 precisa disso.
Task 7: fix round 1/5 despachado — empurrar a fronteira 'use client' para baixo + ancorar a frase
        da "cadeira única" na redação aprovada do COPY.md (extrapolava de infraestrutura para
        qualidade de atendimento)
Task 7: minor (deferred): brief citava useCapability() como consumido, Hero não usa (correto — motion é Task 8)
Task 7: fix round 1/5 (2 addressed, 0 open; commits 76a6823..f3c384f) — 'use client' desceu para
        HeroSection.tsx, page.tsx voltou a Server Component e pode exportar metadata na Task 16
Task 7: complete (commits b120400..f3c384f, review clean)

Task 8: implementado (commit 8a70981) — HeroBackdrop (WebGL), SplitText na headline, Magnet nos CTAs,
        pontoFino adicionado ao useCapability. 72/72
Task 8: DESVIO APROVADO: o Silk do React Bits depende de @react-three/fiber + three em TODAS as
        variantes do repo (revisor conferiu no GitHub, inclusive no commit inicial). A política de
        vendorização veta three. Silk construído à mão com ogl direto, com cleanup completo:
        WEBGL_lose_context, cancelAnimationFrame, ResizeObserver, e pausa por IntersectionObserver
        + document.hidden.
Task 8: BUG REAL achado no componente vendorizado: SplitText chamava gsap.registerPlugin() em escopo
        de módulo, o que quebra sob SSR. Movido para dentro do efeito.
Task 8: ogl confirmado FORA do first load — chunk assíncrono de 47.669 bytes, zero ocorrências nos
        4 rootMainFiles. three com 0 ocorrências no package-lock.
Task 8: contraste do backdrop MEDIDO pelo revisor: 10,5:1 a 15:1 no pior caso do gradiente. Acima
        de AAA. A pendência que o implementador deixou está resolvida.
Task 8: review — spec ✅ / qualidade Aprovado com ressalvas, 1 Important entra no loop
  Important: regex de teste afrouxada com \s* (zero ou mais) virou quase tautologia — aceitaria
             "Seunovosorrisocomeçaaqui". Solução melhor: o GSAP escreve aria-label com o texto
             original ANTES de fatiar, imune ao artefato do jsdom.
  Minor incluído no fix: timing do Magnet invertido (entrada 200ms, saída 400ms) — o guia manda
             saída mais rápida que entrada, teto de 300ms
Task 8: fix round 1/5 despachado
Task 8: fix round 1/5 (2 addressed, 0 open; commits 8a70981..06eb0cb) — aria-label com igualdade exata
        (provado por quebra proposital), Magnet 200ms entrada / 150ms saída
Task 8: complete (commits f3c384f..06eb0cb, review clean)

Task 9: implementado (commit 93f5bf1) — Ticker. 81/81
Task 9: DESVIO APROVADO: ScrollVelocity do React Bits não vendorizado. O revisor baixou o arquivo e
        confirmou: puxa 6 hooks de motion/react e o useAnimationFrame roda para sempre, sem
        IntersectionObserver, sem document.hidden. Implementado à mão com rAF escrevendo
        style.transform direto e lendo lenis.velocity da instância existente.
Task 9: BUG REAL pego pelo TDD: sentinela `0` era falsy e congelava o dt permanentemente. Corrigido
        com sentinela `null` e checagem estrita.
Task 9: complete (commits 06eb0cb..93f5bf1, review clean)
Task 9: minor (deferred): o rAF continua se reagendando quando pausado (early-return), não cancela
        o agendamento. Mesmo padrão já aceito no Silk.tsx.
Task 9: minor (deferred): calibragem visual do boost/decay não feita (rAF não dispara no ambiente)

--- DEFEITO DO PLANO, achado pela review da Task 9 ---
Das 18 tasks, só 6, 7 e 12 têm `Modify: site/app/page.tsx`. Ticker, Pilares, Tratamentos, Sorrisos,
Profissional, AntesDepois, ComoFunciona, Localizacao, Faq e CtaFinal seriam construídos e NUNCA
montados — 10 seções de código morto, descobertas só na Task 18 (QA).
EMENDA: cada task de seção daqui em diante monta as suas próprias seções em page.tsx, na ordem do
design. A Task 10 monta também o Ticker da Task 9, que ficou órfão.
Ordem final das seções em page.tsx:
  Header · Hero · Ticker · Pilares · Tratamentos · Clinica · Sorrisos · Profissional · Depoimentos ·
  AntesDepois · ComoFunciona · Localizacao · Faq · CtaFinal · Footer · WhatsAppFab · Lightbox

Task 10: implementado (commit 4ea4e8a) — Pilares + Tratamentos, montados em page.tsx. 90/90
Task 10: DESVIO APROVADO: GlareHover não vendorizado. O revisor baixou e leu o arquivo: anima
         background-position (viola só-transform/opacity) e força container grid place-items-center
         incompatível com o grid da linha. Implementado à mão em globals.css, só transform.
Task 10: Pilares e Tratamentos saíram como Server Components puros — o fallback de imagem ausente
         usa fs.existsSync no servidor (zero flash) e o gate do glare não precisou de JS nenhum.
Task 10: BUG DE ACESSIBILIDADE pego pelo TDD: spans sem separador de texto colavam os nomes
         acessíveis ("implanteSolução"). Corrigido com {' '} — é correção real de leitor de tela,
         não workaround de teste. O revisor reverteu o fix e confirmou que 2 testes falham.
Task 10: complete (commits 93f5bf1..4ea4e8a, review clean)
Task 10: minor (deferred): comentário em globals.css afirma que a decisão do GlareHover está no
         README de reactbits, mas não está
Task 10: minor (deferred): fs.existsSync é sólido hoje, mas frágil se o deploy migrar para
         output:'standalone' sem copiar public/

--- BUG DE RELEASE confirmado por duas fontes independentes ---
Overflow horizontal em TODA a página em larguras mobile. Culpado: MobileMenu.tsx (Task 6). O painel
fechado usa position:fixed + transform:translateX(100%), e elemento fixo transformado ainda conta
para document.scrollWidth. Medido: scrollWidth 375 -> 695 (exatamente 375 + os 320px do painel).
Nenhum overflow-x:hidden mascara. Anterior à Task 10 (o diff não toca o arquivo).
Viola a Global Constraint nº 1 (mobile-first). Correção despachada agora, fora do fluxo de task.
RESOLVIDO — não havia conflito. A sessão paralela (task_ebc28e7a) rodava numa worktree isolada
(.claude/worktrees/goofy-lewin-95beb5, branch claude/goofy-lewin-95beb5), sem tocar o working tree
principal e sem nenhum commit exclusivo. Arquivada a pedido do parceiro; a worktree ficou no disco
com trabalho não commitado (a tentativa dela do mesmo fix) e NÃO foi apagada — descartar quando
quiser. A correção oficial é a do agente dono do MobileMenu.tsx, na branch feat/site.
Task 6: fix round 2/5 (2 addressed, 0 open) — overflow horizontal em mobile: opcao 1
        (AnimatePresence, nao renderiza fechado) sozinha nao bastava, o painel passava um
        instante montado com transform:translateX(100%) no primeiro/ultimo frame de toda
        abertura/fechamento, ainda gerando 695px de scrollWidth em 375px. Somada a opcao 2
        (wrapper fixed inset-0 overflow-hidden + painel position:absolute em vez de fixed) para
        cobrir a transicao inteira, nao so o repouso. Teste de regressao adicionado (consulta DOM
        crua, nao queryByRole, que filtraria aria-hidden e nao pegaria o padrao antigo — descoberto
        rodando contra o bug reintroduzido de proposito e vendo passar quando devia falhar).
        Fechar() agora marca aria-hidden/inert direto no no via ref, ja que o AnimatePresence
        nao deixa mais reaplicar essas props via JSX depois que o elemento sai da arvore. Minor da
        Task 10 endereçado: secao GlareHover adicionada a components/reactbits/README.md. 91/91
        testes (--no-file-parallelism; paralelo padrao quebrou por contencao de recursos da
        maquina, nao do codigo), lint e build limpos. Commits pendentes.
Task 6: fix round 3/5 (2 addressed, 0 open) — CRITICAL: wrapper overflow-hidden do round 2
        colapsava a ~66px porque MobileMenu roda dentro do <header>, que tem
        backdrop-blur-[8px] — backdrop-filter num ancestral estabelece containing block para
        descendentes fixed/absolute (CSS padrao), entao o inset-0 do wrapper passou a derivar do
        header, nao da viewport. So a faixa de 66px do topo do drawer ficava clicavel; nav/CTA
        inacessiveis a mouse/toque (teclado nao pegava, focus() ignora clipping visual). Corrigido
        com createPortal (react-dom) para document.body, gated por montado (useCapability) contra
        mismatch de hidratacao. Important: abrir() nao limpava aria-hidden/inert que fechar() seta
        por ref — reabertura rapida (antes dos ~220ms de saida) reaproveita o mesmo no via
        AnimatePresence e prendia o menu inacessivel. Corrigido com abrir() simetrico. Teste novo
        (ciclo abrir/fechar/reabrir rapido) provado por quebra proposital. Hit-test ao vivo
        confirmado: elementFromPoint no centro do link "Tratamentos" retorna o proprio link;
        backdrop cobre a pagina inteira (812px, nao so o header); scrollWidth continua 375 em todo
        cenario testado. Minor: afirmacao sobre window.innerWidth inflar com overflow nao procedia
        (testado isolado pelo revisor) - corrigida no relatorio. 92/92 testes
        (--no-file-parallelism), lint e build limpos. Commit pendente.

--- BUG DE RELEASE (overflow do drawer): RESOLVIDO em 2 rodadas ---
Round 1 (6515c28): AnimatePresence + wrapper overflow-hidden. Resolveu o scrollWidth (375->695 virou
  375 no range inteiro da transição), mas INTRODUZIU regressão crítica: backdrop-filter no <header>
  estabelece containing block para descendentes fixed/absolute, então inset-0 colapsava para os ~66px
  do header e o overflow-hidden recortava o drawer. Nav e CTA invisíveis e sem clique (hit-test).
  Segunda falha: abrir() não limpava o aria-hidden/inert setados por fechar() — reabrir em menos de
  220ms deixava o painel inert, inacessível a teclado e leitor de tela.
Round 2 (76d32ab): portal para document.body (escapa do containing block) + simetria abrir/fechar.
  Re-review verificou AO VIVO: elementFromPoint no centro do link retorna o próprio link; backdrop
  cobre 812px; scrollWidth 375 em repouso e aberto; ciclo de reabertura rápida com inert=false e foco
  dentro do painel; e as 6 frentes de risco do portal (hidratação, z-index, scroll lock, foco nas
  duas direções, Escape, whileTap) todas intactas. 92/92.
  Correção de metodologia registrada: dois .click() síncronos NÃO reproduzem reabertura rápida —
  caem no mesmo lote de batching do React e o segundo lê closure desatualizada. Precisa de macrotasks
  separadas. O revisor confirmou reproduzindo a forma errada.
  Correção de fato: minha alegação de que window.innerWidth infla com overflow era FALSA. innerWidth
  é a viewport de layout e não reage a overflow de conteúdo.

Task 11: implementado (commit 95a3513) — VideoCard + Lightbox. 115 testes.
Task 11: ACHADOS REAIS do implementador, todos confirmados pelo revisor:
  1. O código de referência do MEU brief tinha bug: v.play().catch() estoura no jsdom porque play()
     retorna undefined. Corrigido com optional chaining.
  2. React trata `muted` como caso especial em <video>: só seta a propriedade JS, NUNCA o atributo
     HTML. Sem setAttribute explícito, autoplay quebra no iOS. Revisor confirmou no Chrome real.
  3. recepcao.jpg não existe no pipeline (só .webp). Fallback padronizado em .webp nos 5 slugs.
  4. Bug de dependência de efeito no Lightbox: focus-trap sem `montado` nas deps nunca re-rodaria.
Task 11: coordenador de "um por vez" implementado em escopo de módulo, mais rigoroso que o
  heurístico de 60% que o brief autorizava. Revisor escreveu teste próprio de vazamento entre
  instâncias e confirmou que o cleanup desregistra corretamente no unmount.
Task 11: VERIFICADO AO VIVO pelo revisor: zero .mp4 na carga inicial; completo só no clique
  (206 Partial Content), independente da prévia ter tocado ou não.
Task 11: complete (commits 76d32ab..95a3513, review clean)
Task 11: minor (deferred): desempate do coordenador depende da ordem de entrega entre observers
  distintos, que a spec não garante formalmente (consistente no Chromium)
Task 11: minor (deferred): falta recepcao.jpg no pipeline de assets (contornado no componente)

--- Skill ui-ux-pro-max carregada (decisão do parceiro) ---
Destilado em ux-guidance.md. Leitura obrigatória das Tasks 12-15, junto do design-guidance.md.
Onde os dois falarem da mesma coisa, o guia de craft (Emil) manda — é calibrado para a marca.
ACHADO IMPORTANTE resolvido: a base da skill afirma que SplitText é plugin PAGO do GSAP Club.
Está DESATUALIZADA. Verifiquei: GSAP 3.15.0 com "Standard 'no charge' license"; desde a aquisição
pela Webflow todos os plugins antes members-only (SplitText, ScrollTrigger) são livres para uso
comercial. Site de cliente coberto. Sem risco de licença, não procurar alternativa.

--- Assets puxados do Claude Design via DesignSync (MCP) ---
DESCOBERTA: o subagente NÃO tem acesso ao DesignSync — a ferramenta só existe na sessão principal.
E o harness persiste resultados grandes em disco em vez de jogar no contexto, o que torna viável
puxar binário: get_file -> arquivo persistido -> script decodifica base64 e grava.
LIMITE REAL: get_file trunca em 256 KiB. PNG/WebP menores passam; os JPG grandes vêm truncados e inúteis.

Baixados com sucesso (3):
  sorriso-arco.png     569x205  RGBA  — melhor que o meu fallback (240x101). SUBSTITUÍDO.
  trat-facetas.webp    860x496  RGB   — 1 das 7 miniaturas de tratamento
  logo-branco.png      1031x600 RGBA  — REJEITADO, ver abaixo

Truncados e inúteis (6): trat-implantes/protocolo/proteses/ortodontia/limpeza .jpg, logo.png

DECISÃO sobre logo-branco: a versão do Claude Design tem o arco dourado correto MAS a palavra
"Smile" saiu corroída, com falhas pretas visíveis sobre o preto do rodapé. A minha (430x242) tem
letra limpa mas o arco perdeu o dourado. Restaurei a minha; a do design ficou guardada como
logo-branco.claude-design-artefatos.png. O ideal é arco dourado + letra limpa — resolver quando o
cliente entregar o logo em vetor, que já é pendência aberta.

PENDÊNCIA NOVA: trat-facetas.webp é uma imagem de ANTES/DEPOIS com os rótulos "Antes" e "Depois"
em AZUL cravados. Azul viola a paleta do projeto, e num thumb de 60-92px o texto fica ilegível.
Avaliar recorte ou pedir outra imagem ao cliente.
PENDÊNCIA NOVA: lib/content.ts referencia /img/trat-facetas.JPG mas o arquivo é .WEBP — o
fs.existsSync do Tratamentos não vai achar. Corrigir na próxima task que tocar content.ts.
Task 12: fix round 1/5 (1 addressed, 0 open; commits e247ab1..337f1a6). Solução boa: exportou
         Z_INDEX_BACKDROP do Lightbox e trocou a classe Tailwind z-[85] por style inline usando a
         constante, para que CSS renderizado e teste tenham a MESMA fonte. O teste importa a
         constante em vez de repetir 85. Provado por quebra proposital ("expected 1000 to be less than 85").
Task 12: complete (commits 95a3513..337f1a6, review clean)
Task 12: BUG REAL corrigido em lib/motion.tsx (arquivo que 10 tasks consomem): links de âncora não
         passavam pelo Lenis — o jump nativo competia com o rAF pela mesma scrollTop, causando
         tremor. Interceptação com escopo correto (exclui href="#", âncora inexistente, clique do
         meio e modificadores de teclado), cleanup simétrico, offset dinâmico da altura do header.
         O revisor validou item por item e mediu #clinica parando em 82,97px, exatamente a fórmula.
Task 12: minor (deferred): href="#" da logo no Header continua usando jump nativo (excluído de
         propósito, querySelector('#') lançaria SyntaxError)

--- TASK EXTRA (emenda): assets reais entregues pelo cliente ---
O parceiro colocou em IMAGENS DO INSTAGRAM/: FACETAS.webp, IMPLANTES.jpg, PROTESES.jpg,
ORTODENTIA.jpg, LIMPEZA PROFISSIONAL.jpg, PROTOCOLO DE IMPLANTE.jpg, FOTO DO DOUTOR.jpg,
FOTO HERO.jpg, LOGO.jpg. Isso fecha 6 das 7 miniaturas de tratamento (falta só clareamento) e
resolve a foto do profissional, que era frame de vídeo de 40KB.
Task extra (assets do cliente): complete (commits 337f1a6..b509681, review clean após 1 fix round)
  6 das 7 miniaturas de tratamento integradas; clareamento segue com glifo (cliente não tem a imagem)
  dr-vinicius.jpg substituído pela foto real (era frame de vídeo de 40KB com marca d'água)
  DECISÃO: hero mantido — a "FOTO HERO.jpg" é o próprio Dr. Vinicius, não paciente. Prova social
    real é gancho de hero mais forte. Salva como hero-alternativa.jpg.
  DECISÃO: logo mantido — LOGO.jpg é mockup de apresentação com textura de papel e relevo; a
    extração de alfa saiu com halo e serrilhado, pior que o recorte atual.
  Fix: backups de asset removidos do índice do git e cobertos por .gitignore; porta do launch.json
    revertida de 3900 para 3000 (config compartilhada não deve carregar circunstância local)

--- Skill `animate` carregada antes da Task 13 (decisão do parceiro) ---
~90% de sobreposição com o guia do Emil. Em vez de criar um terceiro documento redundante, anexei
só o que acrescenta ao design-guidance.md: o portão frequência+propósito, "dado que a pessoa lê não
se move por estilo", clip-path como quarta propriedade sancionada, e saída espelhando a entrada.
CONFLITO ENTRE SKILLS resolvido e registrado no guia: `animate` repete que os atalhos x/y do Motion
não são acelerados. Continua errado para a versão instalada — já verificado no fonte do motion-dom.
Regra do projeto: usar atalhos quando o elemento tem whileTap/variantes (string literal não compõe
com eles, foi o bug da Task 6); fora disso, tanto faz.
NOTA do portão: landing é vista uma vez por visitante, cai no tier "raro" — é o único lugar onde
encanto se justifica sozinho. Usar como permissão para UM momento forte, não para animar tudo.

--- Task 13: Sorrisos feitos aqui (galeria WebGL) ---
`task-13-brief.md` não existia no workspace (reconstruído a partir da mensagem de orientação, que
já trazia o brief completo — mesmo padrão dos demais `task-N-brief.md`).

CircularGallery vendorizado (`src/ts-tailwind/Components/CircularGallery/CircularGallery.tsx`,
mesmo commit fixado no README dos outros vendorizados — conferido: idêntico ao HEAD de `main`).
O que ele arrastava: (1) chamada de rede real — `loadFontFromStylesheet()` buscava
fonts.googleapis.com toda montagem, pra desenhar legenda de item em canvas; removida por completo
junto com a classe `Title` inteira (não existe nome de paciente pra desenhar — nunca inventamos);
(2) loop de render sem pausa nenhuma fora da viewport/aba oculta — mesmo problema já registrado pro
ScrollVelocity (Task 9); corrigido com IntersectionObserver + document.hidden, padrão do Silk.tsx;
(3) destroy() nunca liberava o contexto WebGL — corrigido com WEBGL_lose_context; (4) gestos de
arraste/roda no `window` inteiro (rolar a página em qualquer lugar empurrava a galeria mesmo fora
de tela) — rescopados pro container, mousemove/mouseup continuam em window de propósito (arraste
não pode travar se o cursor sair da caixa); (5) sem proteção contra falha de WebGL mesmo em
aparelho "pesado" (GPU bloqueada etc.) — `new App()` agora em try/catch com `onError` pro chamador
cair no fallback; (6) `role="region"`/`tabIndex`/navegação por seta removidos — host WebGL virou
puramente `aria-hidden`, decisão de acessibilidade abaixo.
Custo registrado pra Task 17: a lista de itens é duplicada pelo próprio design do componente
(loop parecer contínuo) — 9 retratos viram 18 planos com textura na GPU. Rede não dobra (mesma URL,
cache do navegador), memória de GPU sim. Não removido: quebraria o efeito circular pedido.

Acessibilidade: canvas WebGL não é lido por leitor de tela — nenhuma forma de expor um
role/aria-label nele levaria a algo perceptível. Decisão: host do canvas marcado aria-hidden puro
(sem tabIndex — elemento focável+aria-hidden é o anti-padrão "buraco negro de foco"), e
`SorrisosGaleria.tsx` mantém um parágrafo sr-only com o mesmo conteúdo (9 fotos de pacientes reais)
sempre que o WebGL está ativo. Nenhuma perda de conteúdo: os 9 retratos já estão todos visíveis no
anel da galeria (arrastar só gira pra explorar, não revela item escondido), então quem usa teclado
sem mouse não perde informação por não conseguir focar o canvas — só a animação decorativa, que já
está marcada como tal. No modo fallback (scroller), cada `<Image>` carrega
`alt="Paciente da Smile sorrindo"` — mesmo texto, nunca nome.

Arquitetura: `Sorrisos.tsx` é Server Component (sobretítulo/h2 nascem no HTML do servidor, nos dois
modos) — só `SorrisosGaleria.tsx` (decide WebGL vs. fallback via useCapability) é client. Renderizada
em `page.tsx` e passada por prop pra `PaginaComVideo.tsx` (mesmo padrão de Ticker/Pilares/
Tratamentos), entre `<Clinica>` e `<Depoimentos>` — ambas já vivem dentro de PaginaComVideo desde a
Task 12, então "montar em page.tsx depois de Clinica e antes de Depoimentos" (texto do brief) virou
"entre as duas dentro de PaginaComVideo", que é a mesma posição visual pedida.
`SectionHeading` ganhou prop `tema` ('claro' default, inalterado; 'escuro' novo — sobretítulo
amarelo, título branco) em vez de um componente novo, pra primeira seção de fundo escuro do site.

Build: confirmado que `ogl` está FORA do first-load JS da rota. Os 4 arquivos de
`rootMainFiles`/polyfill do `build-manifest.json` da rota `/` não contêm nenhum símbolo de ogl
(Renderer/generateMipmaps/WEBGL_lose_context); o pacote inteiro (classe Transform com
`updateMatrixWorld`, achado exclusivo do ogl) vive só num chunk carregado via
`react-loadable-manifest.json`, o mecanismo do Next para `next/dynamic`. Confirmado ao vivo também:
rede do dev server mostra `ogl` e `CircularGallery` chegando bem depois do lote inicial de chunks,
só depois que `useCapability()` resolve `podePesado`.

Verificado ao vivo no browser (localhost:4000, 1280 e 375): screenshot funcionou nesta sessão
(compositou frames de verdade, ao contrário do aviso de limitação conhecida) — seção preta,
"PACIENTES REAIS" amarelo, "SORRISOS FEITOS AQUI" branco, canvas com retratos reais visíveis,
arraste com inércia funcionando (imagem mudou de posição após drag). Achado interessante: o
`document.hidden` deste harness de automação lê `true` mesmo com a aba "em foco" — usei isso a favor:
comparei o canvas por `toDataURL()` antes/depois de 600ms parado e confirmei que ele NÃO mudou
enquanto document.hidden==true, ou seja, a pausa por aba oculta está funcionando de verdade num
browser real, não só no teste com rAF mockado. Não consegui forçar reduced-motion/deviceMemory
baixo neste harness (sem acesso a emulação do DevTools) pra ver o scroller de fallback ao vivo — a
lógica de gate é a mesma `useCapability()` já provada em produção desde a Task 8 (Silk), e o
fallback em si tem cobertura direta em `__tests__/sorrisos.test.tsx` (reduced-motion, pouca memória,
economia de dados — os três caem no mesmo scroller, com alt correto nas 9 fotos).

Testes: 10 novos em `sorrisos.test.tsx` (conteúdo idêntico nos dois modos, id, os 3 gatilhos de
fallback, overflow-x próprio da seção, montagem do WebGL, equivalente sr-only, onError caindo pro
fallback) + 8 novos em `circularGallery.test.tsx` (sem fetch, canvas aria-hidden sem role/tabIndex,
duplicação 9→18, cleanup com WEBGL_lose_context, onError sem derrubar a árvore, pausa por
IntersectionObserver+document.hidden com renderer.render mockado). 149/149 no total
(--no-file-parallelism), lint limpo (1 warning de eslint-disable morto, removido), build limpo.
Task 13: complete (commit 835a04d).
Task 13: fix round 1/1 (commit fd0080b) — 1 important + 2 minor. O important: a justificativa de
  acessibilidade alegava que os 9 retratos ficam todos visiveis ao mesmo tempo no anel WebGL, o que
  o revisor provou falso com a matematica do proprio onResize() (~4 de 18 planos cabem na viewport
  por vez). Corrigido em CircularGallery.tsx e README.md: a barreira de teclado e real, e a decisao
  de manter aria-hidden se sustenta porque nenhuma das 9 fotos tem alt individual distinto (mesmo
  texto em todas), entao o resumo sr-only e um equivalente fiel, nao uma perda. Registrado o que eu
  faria se a barreira for julgada grande demais (botoes prev/next com aria-live), sem implementar -
  fora do escopo dos 3 itens pedidos. Minors: borderRadius (0.05->0.04) documentado junto de
  bend/scrollEase; `items` do CircularGallery movido para constante de modulo (era recriado a cada
  render de SorrisosGaleria, nas deps do efeito que cria/destroi o contexto WebGL). 149/149, lint e
  build limpos, ogl reconfirmado fora do first-load.

Task 13: implementado (commit 835a04d) — Sorrisos com CircularGallery WebGL + fallback scroller. 149 testes
Task 13: ACHADO DE SEGURANÇA no componente de terceiro: o CircularGallery original fazia
  `await fetch('https://fonts.googleapis.com/...')` A CADA MONTAGEM para desenhar legendas no canvas.
  O revisor baixou o original e confirmou (linha 30 = URL, 38-40 = fetch). Sistema de legenda removido
  inteiro — não havia texto legítimo a desenhar, nenhum paciente tem nome confirmado.
  A política de vendorização existe exatamente para isso.
Task 13: outras 4 correções no componente antes de usar: não pausava fora da viewport nem com aba
  oculta; não liberava contexto WebGL no destroy; capturava arraste no window inteiro (arrastar em
  qualquer ponto da página movia a galeria); derrubaria a árvore React se WebGL falhasse.
Task 13: ogl confirmado fora do first-load por DOIS agentes independentes, com build do zero.
Task 13: review — spec ✅ / qualidade Aprovado, 1 Important + 2 Minor no loop
  Important: o revisor FEZ A CONTA da geometria (bend=2, FOV 45°, câmera z=20, container 1265x504)
  e provou que só ~4 dos 18 planos cabem na viewport, não os 9. A justificativa de acessibilidade
  escrita no código ("todos visíveis, teclado não perde nada") era FALSA.
Task 13: fix round 1/5 (3 addressed, 0 open; commits 835a04d..fd0080b) — justificativa reescrita
  reconhecendo a barreira e defendendo pelo motivo certo (nenhuma foto tem alt distinto, o sr-only
  transmite a mesma informação); borderRadius documentado; itens estabilizados em constante de módulo
Task 13: complete (commits 9cf2dd1..fd0080b, review clean)
Task 13: PROPOSTA registrada, não implementada: se a barreira de teclado for julgada grande demais,
  a saída é dois botões nativos anterior/próximo fora do canvas, sempre focáveis, empurrando
  scroll.target e atualizando um aria-live com "retrato N de 9". Avaliar na Task 18 (QA/impeccable).

Task 14: implementado (commit 12ffa86) — Profissional, AntesDepois, ComoFunciona. 162 testes
Task 14: ERRO NO MEU GUIA achado pelo implementador: a prosa do clip-path dizia "revela de baixo
  para cima" mas os valores que eu listei revelam de CIMA para baixo (a ordem do inset é
  top/right/bottom/left). Ele seguiu os números. Guia corrigido.
Task 14: ele INVERTEU minha instrução sobre a linha de progresso, com razão: mediu o grid e viu que
  2 colunas já cabem a partir de ~516px, então a linha vertical só faz sentido abaixo de 480px.
  O revisor refez a conta e confirmou.
Task 14: BUG achado por ele na verificação visual: o -z-10 da linha escapava do contexto de
  empilhamento (position:relative sozinho não cria contexto). Corrigido com `isolate`.
Task 14: review — spec ✅ / qualidade Aprovado. 1 Important + 2 Minor, e os DOIS Minors eram erro
  do MEU brief, não do implementador:
  Important: launch.json ganhou config extra na porta 4200 — reincidência do mesmo padrão
  Minor (meu): stagger de 100ms acima do teto de 80ms do guia
  Minor (meu, RISCO REGULATÓRIO): "Ortodontista" sem marcação de pendente. O BRIEFING §4 marca a
    especialidade como pendente de confirmação de REGISTRO, e a Res. CFO-196/2019 restringe
    anunciar especialidade sem registro. Eu tratei duas pendências como uma.
Task 14: fix rounds 1 e 2 (4 addressed, 0 open; commits 12ffa86..4db4bcf)
  Round 2 saiu de uma observação do próprio implementador: o alt da foto afirmava "ortodontista"
  como fato, então quem usa leitor de tela recebia a credencial sem a ressalva que quem enxerga vê.
  Reescrito para descrever a cena. Teste trava as duas pontas.
Task 14: complete (commits fd0080b..4db4bcf, review clean)

Task 15: implementado (commit 0d778a7) — Localizacao, Faq, CtaFinal, Footer. 177 testes
  Mapa: iframe com loading=lazy + overlay com foto da fachada controlado por IntersectionObserver/clique.
  Medido: ~270KB e 8 requisições que NÃO entram no carregamento inicial.
  Contraste do rodapé medido: branco 18,9:1 · amarelo 12,4:1 · dourado 10,1:1 · escuro-texto 9,4:1 ·
  escuro-fraco 5,4:1 — todos acima de AA.

--- BUG SITE-WIDE achado pelo implementador da Task 15, confirmado por mim ---
TODOS os <h2> do site renderizavam a 16px — tamanho do corpo. Medi com getComputedStyle em 968px:
h1 do hero correto em 73,5px, os NOVE h2 em 16px. Causa: SectionHeading nunca definiu tamanho de
fonte e o preflight do Tailwind v4 zera o tamanho nativo dos headings; só a Hero passava o seu.
Passou por SEIS reviews porque os revisores checaram estrutura, classes, a11y e contraste, mas o
painel do navegador quase nunca compositava frames — ninguém MEDIU o tamanho renderizado.
Corrigido (e129a86): tamanho de destaque virou DEFAULT do SectionHeading, invertendo o modo de
falha — agora é preciso passo explícito para fugir dele, não para obtê-lo. Medido depois: 38-53px.
Teste trava seção nova sem tamanho.

--- SEGUNDO achado: Tratamentos sem bloco de título ---
A seção começava direto em "01 Facetas". Faltava sobretítulo "O que fazemos", título "Soluções que
transformam sorrisos" e o parágrafo de intro — tudo aprovado no COPY.md §4, esquecido na Task 10 e
não pego por nenhuma review. Corrigido (6cd7268). 189 testes.

--- TERCEIRO achado: reveals presos em opacity 0 na navegação por âncora ---
CONFIRMADO por leitura de código, não só medição: lib/motion.tsx só intercepta CLIQUE em a[href^="#"].
Quem chega numa URL que já vem com hash (link do Instagram, reload, voltar) dispara o salto nativo,
que o Lenis nunca vê. E não existe ScrollTrigger.refresh() em lugar nenhum do projeto — cada trigger
calcula a posição na montagem e fica preso. Como o briefing diz que o tráfego vem do Instagram, e
link de bio costuma carregar âncora, isso é falha real. Correção despachada.
Task 15: review — spec ✅ / qualidade Aprovado, 2 Important no loop
  Important: refresh por hash não rodava sob prefers-reduced-motion (o guard cortava o efeito inteiro,
    mas o Reveal cria ScrollTrigger independente de podeAnimar). Pior segmento possível para deixar
    quebrado — quem liga movimento reduzido costuma fazer por necessidade.
  Important: iframe do mapa sempre no HTML com loading=lazy não é a garantia pedida. A review viu a
    requisição saindo 100ms após o load, sem scroll.
Task 15: fix round 1/5 (2 addressed, 0 open; commits 144919e..273281a). Mapa agora monta condicional:
  medição real 0 requisições ao Google Maps antes do clique, 1 depois. Teste antigo SUBSTITUÍDO —
  ele travava o requisito errado (exigia iframe no DOM sem interação).
Task 15: complete (commits 4db4bcf..273281a, review clean)
Task 15: ERRO NO MEU BRIEF: o Step 1 mandava um teste que exigia o iframe presente sem interação,
  o que induziu a arquitetura errada. Teste corrigido pelo implementador; o brief fica registrado
  como fonte do erro.
Task 15: minor (deferred): titulos-tamanho.test.tsx cobre lista fixa de seções — a defesa real
  contra seção nova sem tamanho é o default do SectionHeading, não o teste.

>>> TODAS AS SEÇÕES CONSTRUÍDAS E MONTADAS. 196 testes. <<<
Task 16: complete (commits 273281a..5920512, review clean, ZERO achados — primeira task assim)
  Domínio NÃO hardcodado: NEXT_PUBLIC_SITE_URL com default localhost. O revisor confirmou na doc
  local E na prática que NEXT_PUBLIC_* é build-time: rebuild muda, env var sem rebuild não muda.
  Consequência documentada no README: trocar domínio exige rebuild.
  Favicon: ainda era o padrão do create-next-app. Regenerado do arco dourado da marca sobre preto.
  JSON-LD sem aggregateRating, review, openingHours, priceRange, medicalSpecialty — varredura
  recursiva feita pelo revisor de forma independente.
  ERRO NO MEU BRIEF corrigido pelo implementador: eu hardcodei smileipiranga.com.br, que é chute.

--- ORDEM AJUSTADA: Task 19 (React Bits máximo) ANTES da 17 (performance) ---
Motivo: a passada de performance precisa medir o que de fato vai ao ar, não um estado intermediário.

=========================================================================
PAUSA — fim de sessão 20/08/2026. Retomar em 21/08.
=========================================================================

ESTADO: 40 commits, branch feat/site, **working tree LIMPO**. 217 testes passando.
Último commit: c36436d "feat: maximiza uso do React Bits (Task 19) — WIP, pendente de review"

TODAS AS 15 SEÇÕES CONSTRUÍDAS E MONTADAS:
Header · Hero · Ticker · Pilares · Tratamentos · Clinica · Sorrisos · Profissional · Depoimentos ·
AntesDepois · ComoFunciona · Localizacao · Faq · CtaFinal · Footer · WhatsAppFab · Lightbox

TASKS COMPLETAS COM REVIEW LIMPA: 1 a 16, mais 2 tasks extras (assets do cliente; correção dos
títulos de 16px). A Task 16 passou com ZERO achados.

>>> PONTO DE RETOMADA EXATO <<<

1. **Task 19 está IMPLEMENTADA mas NÃO REVISADA.** O commit c36436d entrou como WIP porque o
   parceiro pediu para não perder progresso no fim da sessão. O trabalho NÃO foi feito por mim
   nesta sessão — eu tinha despachado a task e o parceiro cancelou o despacho; o código apareceu
   no working tree depois. **Primeiro passo amanhã: rodar a review da Task 19**, range
   5920512..c36436d, contra os critérios de aceitação em `emenda-reactbits-e-skills.md`.

   O que entrou: StaggeredMenu, Silk, ScrollVelocity e GlareHover vendorizados de
   DavidHDev/react-bits; `three` + `@react-three/fiber` + `@types/three` como dependência nova;
   `site/components/ui/Silk.tsx` (feito à mão) removido; novo `TratamentoLinha.tsx`;
   novo teste `glareHover.test.tsx`. 206 -> 217 testes.

   **A review precisa cobrar com rigor os critérios que custaram caro**, listados na emenda:
   - Drawer: foco preso nas duas direções, foco devolvido, Escape, aria-expanded/controls,
     inert correto inclusive na reabertura rápida (<220ms), scroll travado via useLenis().stop(),
     feedback de toque, scrollWidth === outerWidth em 375px, e elementFromPoint no meio do painel
     retornando elemento do drawer (o recorte a 66px por containing block do backdrop-filter).
   - `three` NUNCA no bundle inicial da rota; Silk gateado por podePesado, pausando fora da
     viewport e com document.hidden, destruindo o contexto no unmount.
   - ScrollVelocity precisa pausar fora da viewport e com aba oculta.
   - Nenhum componente pode consultar matchMedia por conta própria (fonte única: useCapability).
   - Nenhuma chamada de rede (o CircularGallery fazia fetch ao Google Fonts — só foi pego lendo).
   - **MEDIR O CUSTO EM NÚMEROS**: first-load JS da rota / antes e depois, KB do three, chunks
     novos. O parceiro decidiu assumir o custo e precisa do número para resolver depois.

2. Depois da Task 19: **Task 17 (performance, Lighthouse)** — nesta ordem de propósito, para medir
   o que de fato vai ao ar.
3. Depois: **Task 18 (QA, breakpoints, acessibilidade)**. Carregar a skill `impeccable` antes,
   conforme a emenda de skills.
4. Depois: review final da branch inteira (modelo mais capaz) e superpowers:finishing-a-development-branch.

NOVIDADE DO PARCEIRO: `IMAGENS DO INSTAGRAM/CLAREAMENTO.jpg` foi entregue — é a 7ª imagem de
tratamento, a única que faltava. **Ainda não foi processada** para site/public/img/trat-clareamento.jpg.
A linha de clareamento ainda mostra o glifo ✦. Encaixar numa das próximas tasks.

LIÇÃO DE PROCESSO PARA A TASK 18: os três piores bugs do projeto (todos os h2 a 16px, Tratamentos
sem título, reveals presos na âncora) saíram de OLHAR A TELA, não de ler código. Seis reviews
passaram por cima do bug dos títulos porque o painel do navegador raramente compositava frames e
ninguém MEDIU o que aparecia. A Task 18 precisa exigir medição visual explícita, com getComputedStyle
e screenshot, não só inspeção de estrutura.

CONTEXTO QUE NÃO PODE SE PERDER (documentos no mesmo diretório):
- design-guidance.md — guia de craft (Emil + adendo da skill `animate`), leitura obrigatória de UI
- ux-guidance.md — destilado da skill ui-ux-pro-max
- reactbits-vendoring.md — registry quebrado, vendorizar do GitHub; licença MIT + Commons Clause
- emenda-reactbits-e-skills.md — as duas decisões do parceiro e os critérios de aceitação da T19
- Next é 16.3.1, não 15. Ler site/node_modules/next/dist/docs/ antes de usar API do Next.
- Testes: `npx vitest run --no-file-parallelism` de dentro de site/ (o npm test padrão trava)
- **NÃO alterar .claude/launch.json** — três tasks reprovadas por isso. Porta por linha de comando.
- Domínio via NEXT_PUBLIC_SITE_URL, build-time. Trocar antes de publicar exige rebuild.

PENDÊNCIAS COM O CLIENTE (bloqueiam publicação, não o build) — ver PERGUNTAS-CLIENTE.md:
CRO do responsável técnico · confirmação de que "Ortodontista" é especialidade registrada ·
autorização de uso de imagem dos pacientes · horário de atendimento · marca d'água CapCut no vídeo
da recepção · logo em vetor · domínio

Task 19: review (primeira — o código chegou como WIP sem relatório) — funcional ✅, TODOS os
  critérios do drawer passaram AO VIVO, pausas de Silk/ScrollVelocity verificadas por snapshot.
  Reprovada por DOCUMENTAÇÃO: README contradizia o código (dizia "não vendorizado" para os 3 que
  foram vendorizados) e o relatório de custo citado 4x no código não existia. O revisor mediu o
  custo ele mesmo com build limpo nos dois commits.
Task 19: CUSTO MEDIDO: first-load +6,5KB gzip (+2,7%). Chunk do Silk com three.js: 229KB gzip,
  assíncrono, só pago por podePesado, nunca no caminho crítico. Número registrado para o parceiro.
Task 19: fix round 1/5 (4 addressed, 0 open; commits c36436d..e35afd3) — README reescrito com
  histórico recusa+recuperação, task-19-report.md criado com os números, cleanup incondicional no
  StaggeredMenu, e CLAREAMENTO.jpg processada: as 7 linhas de tratamento agora têm foto, 0 glifo.
Task 19: complete (commits 5920512..e35afd3, review clean). 218 testes.
Task 19: minor (deferred): warning THREE.Clock deprecated no console, 2x por carga, vindo da lib.

--- Task 17 (performance): WIP commitado em 8ac06af, medição feita, DIAGNÓSTICO meu ---
O trabalho apareceu no working tree sem relatório (mesmo padrão da Task 19). Commitei para não perder.
Lighthouse (npm run start, localhost:4173, simulate, CPU 4x):
  DESKTOP: Performance 99 | LCP 0,8s | TBT 40ms | CLS 0,01          -> ótimo
  MOBILE:  Performance 54 | LCP 4,5s | TBT 4.130ms | TTI 18,7s | CLS 0 -> RUIM. Teste de orçamento
           FALHA de propósito (LCP 4522ms vs 2500). Está certo em falhar.
Mapeei os hashes dos chunks por grep no .next:
  127qemistpig0.js  131KB  = LENIS + GSAP ScrollTrigger  -> 11.792ms de main thread, só 201ms de script.
                             O resto é "Other" = loop de rAF rodando sem parar. É O VILÃO.
  40pqcsdvtsv6p.js  211KB  = gsap/ScrollTrigger + ogl     ->  4.707ms
  227kwhsrjlnp4.js  223KB  = React DOM (hidratação)      ->  1.064ms
  0xzmvzr9idbir.js  867KB  = Silk/three.js               ->    467ms  <- o React Bits NÃO é o vilão do CPU
CONCLUSÃO: o custo do three.js é em BYTES (230KB gzip, assíncrono), não em CPU. O TBT vem da fundação
de motion (Task 5, meu código no plano) ou do ticker — loop contínuo de rAF que nunca fica ocioso.
Isso NÃO é ainda o "momento dos custos técnicos do React Bits" que o parceiro aceitou — é bug de
performance a corrigir de qualquer jeito.
Nota: podePesado deu true na emulação porque o Lighthouse simula CPU 4x mas NÃO reduz deviceMemory
(host: 12 cpus, 17GB). O gate não pega CPU lenta. Celular mid-range real tem o mesmo problema.
O implementador anterior A/B-testou adiar o WebGL com requestIdleCallback (hipótese errada) e reverteu.
Nunca profilou o loop. task-17-report.md NÃO EXISTE apesar de citado no código.
PRÓXIMO: ablação controlada — desligar um loop por vez (Lenis, Ticker, Silk, CircularGallery), medir
TBT em cada variante, e consertar o(s) culpado(s) preservando o design.

--- Task 17 (performance): ablação feita, DIAGNÓSTICO ANTERIOR NÃO SE CONFIRMOU — ver task-17-report.md ---
Rodei os 5 candidatos do handoff (Lenis rAF, ScrollVelocity, Silk, CircularGallery, tweens GSAP),
cada um isolado + uma combinada (Silk+CircularGallery), 3 amostras/mediana cada. Também refiz a
baseline com 3 amostras. Resultado: TBT/TTI da medição original ERAM RUÍDO DE UMA AMOSTRA SÓ — numa
mediana limpa, sem mudar nada, TBT já era 393,5ms (não 4.130ms) e TTI já era 7,46s (não 18,7s). O
"loop que nunca fica ocioso" (rAF paralelo do Lenis) não mudou TBT quando desligado — dentro do
ruído. Silk+CircularGallery SÃO custo real (juntos: -74% TBT, -39% TTI quando desligados), mas por
peso de bundle/CPU de montagem, não por loop preguiçoso — os dois já pausam certo (Task 8/13). Não
revertidos, conforme instrução do brief.
LCP: nenhuma das 7 intervenções (5 ablações + combinada + despriorizar a fonte Caveat, só usada
abaixo da dobra) moveu o LCP simulado em mais de 5ms (fica preso em ~4,36s). Trace bruto mostra o
LCP REAL da página em 192ms; devtools-throttling (real, não simulado) dá 3,14s — os dois muito
diferentes do número que --throttling-method=simulate reporta e que orcamento.test.ts audita. Os
audits de oportunidade do próprio Lighthouse confirmam zero economia de LCP disponível pelas vias
padrão. Caveat sem preload: sem ganho de LCP e piora o FCP (~910→1220ms, 3/3 amostras) — revertido.
CONCLUSÃO: orcamento.test.ts continua vermelho (LCP), de propósito, com investigação exaustiva
documentada. Nenhuma mudança de código de produção nesta rodada além do comentário em
app/layout.tsx documentando a tentativa revertida. total-byte-weight e CLS passam.
PRÓXIMO (decisão do parceiro): aceitar o vermelho documentado (a página real é rápida — 192ms de
LCP observado, 99 de Performance desktop) ou investir em depurar a divergência do Lantern/Lighthouse
13.4.1 com Node 24 neste ambiente — não é mudança de código do site nos dois casos.

--- Task 17, rodada 2: ablação feita (commit 2828b2f), MEU DIAGNÓSTICO CORRIGIDO ---
Ablação com mediana de 3 (a medição de 4.130ms de TBT era RUÍDO de amostra única):
  Baseline           TBT 393ms  LCP 4,36s  TTI 7,4s  Perf 75
  Lenis rAF off      TBT 470ms  (PIOROU — meu "loop perpétuo" não se confirmou)
  ScrollVelocity off TBT 334ms
  Silk off           TBT 223ms  TTI 5,1s
  CircularGallery off TBT 360ms TTI 6,3s
  Silk+CG off        TBT 100ms  TTI 4,5s  Perf 84  bytes -42%
  -> O custo REAL de TBT/TTI é Silk+CircularGallery. ESSE é o custo do React Bits que o parceiro
     aceitou decidir depois. Número para ele: Perf mobile 75 vs 84, TTI 7,4s vs 4,5s.
  -> LCP ficou em 4,36s em TODAS as 7 variantes (±5ms). Elemento LCP = <img> do hero (confirmado
     pelos insights). Minha hipótese do SplitText foi REFUTADA.
LEITURA CORRETA do LCP (discordo do relatório, que culpou o Lantern): as 7 intervenções desligaram
recursos que carregam DEPOIS da imagem. Nenhuma tocou o caminho crítico. lcpLoadDuration simulado
= 2.805ms = a imagem esperando banda. No HTML inicial competem com ela: ~890KB raw de JS em 9
chunks (Lenis+GSAP 131KB é chunk INICIAL), 4 fontes preloaded (~200KB), logo. Devtools throttling
real deu 3,14s — acima da meta de qualquer jeito, não é artefato.
Descobertas medidas por mim: next/image serve WebP, NÃO AVIF (107KB em 640px); Next 16 REJEITA
q<75 por padrão (precisa images.qualities); sizes do hero declara 100vw para 348px reais.
Rodada 3 despachada: H1 AVIF, H2 sizes, H3 tirar Lenis/GSAP da janela inicial. Mediana de 3 em
simulate E devtools. Se ainda ficar vermelho depois das três, aceitar vermelho DOCUMENTADO.
ERRO MEU registrado: grep de "ogl" casa com "toggle"/"google" — o mapeamento do chunk
1o6whawhpwyz5 como ogl não é confiável.

--- Task 17, rodada 3: H1/H2/H3 medidas (commits a5ef141, ce7c58d), LCP saiu do vermelho no devtools ---
Confirmação do coordenador: as 7 intervenções da rodada 2 desligavam recurso que carrega DEPOIS
da imagem do hero (WebGL é pós-hidratação, Caveat é abaixo da dobra) — nenhuma tocava o caminho
crítico. Testadas as 3 hipóteses que tocam, mediana de 6 (simulate) + 3 (devtools) cada:
  H2 sizes 80vw (Hero.tsx, commit a5ef141): simulate 4362,8ms->4209,7ms | devtools 3308,9->3051,2ms
    | foto do hero WebP 750w 131.850B -> WebP 640w 107.974B.
    ACHADO NÃO PREVISTO: testei 85vw primeiro (valor exato medido no boundingRect) — fica a só 27px
    físicos do corte de 750w e 6 amostras mostraram o navegador alternando entre os dois candidatos
    na MESMA build (bytes ora 524KB ora 1.155KB). Confirmado que não é ruído geral (6 amostras do
    baseline sem a mudança ficaram idênticas) — é corrida real na aplicação do DPR simulado perto
    de um limite de srcset. 80vw (63px de margem) resolveu SEMPRE pra 640w em 6 amostras.
  H1 avif (next.config.ts, commit ce7c58d): simulate 4362,8->3856,8ms | devtools 3308,9->2256,6ms
    (JÁ dentro do orçamento de 2,5s) | foto do hero 750w WebP 131.850B -> AVIF 61.264B (-53%).
  H3 Lenis por import() dinâmico via requestIdleCallback (lib/motion.tsx): SEM GANHO medido,
    isolada (4361,3ms simulate, quase idêntico à baseline) OU empilhada com H1+H2 (3853,9ms vs
    3847,2ms sem H3 — 7ms de diferença, ruído). Confirma a hipótese do coordenador: gsap/ScrollTrigger
    continuam estáticos via Reveal.tsx (usado 21x, +3 arquivos) — só adiar o Lenis não tira volume
    suficiente do chunk inicial. REVERTIDA, não commitada (motion.tsx/motion.test.tsx sem mudança líquida).
  H1+H2 juntas (o que ficou): simulate 4362,8->3847,2ms (-515ms/12%) | devtools 3308,9->2210,9ms
    (SAIU do vermelho) | bytes 1,29MB->1,03MB (-20%) | foto do hero AVIF 640w 49.011B (-63%).
CONCLUSÃO CORRIGIDA sobre o LCP: não é o Lantern "quebrado" — é aritmética de banda simulada.
Tocar o caminho crítico de verdade (bytes da própria imagem do hero) move o LCP; recursos fora do
caminho crítico não movem, e isso é o comportamento CORRETO de um modelo de banda compartilhada.
orcamento.test.ts CONTINUA vermelho no simulate (3.847ms vs 2.500ms meta) mas o devtools (throttling
real) já passa (2.211ms). total-byte-weight e CLS passam nos dois.
NÃO TESTADO (registrado, não decidido): images.qualities reduzido na foto do hero — H1+H2 já
resolveram o suficiente (devtools passou) pra não gastar mais uma rodada sem número que justifique.
Próximo lugar óbvio se o parceiro quiser fechar o vermelho do simulate também.
task-17-report.md reescrito com a leitura corrigida (a seção de LCP mudou de "Lantern descolado"
pra "H1-H3 testadas, resultado Y" — ablação da rodada 1 ficou intacta, só a interpretação do LCP
mudou). Suite completa (220/221, só orcamento LCP simulate falha por design), build e eslint limpos.

--- Preparação da Task 18 (feita em paralelo à rodada 3 da Task 17) ---
Skill `impeccable` carregada (decisão do parceiro). Setup (context.mjs) rodado: projeto sem
PRODUCT.md/DESIGN.md — "refinamento estreito pode prosseguir com a implementação como autoridade".
Aviso único surfado ao parceiro: há impeccable v4.1.1 (instalada 4.0.4); atualizar vale só para
a próxima sessão.
Playbooks lidos: audit.md (5 dimensões 0-4, P0-P3) e critique.md (EXIGE duas avaliações em
subagentes ISOLADOS — A: revisão de design; B: detector+navegador — A termina antes de B entrar
na síntese; rodar inline é run DEGRADADO e precisa de banner).
Detector mecânico rodado sobre site/components + site/app: exit 0, ZERO achados
(.superpowers/.../impeccable-detect.json = []). Re-rodar sobre o estado final na Task 18.
Escrito qa-guidance.md — leitura obrigatória da Task 18. Inclui: a lição dos 3 bugs que só
apareceram olhando a tela (verificação visual MEDIDA é obrigatória), modo Persuade (heurísticas
7 e 10 podem ser n/a, total renormalizado), personas Jordan/Riley/Casey + "a pessoa que veio do
Instagram", a lista do que NÃO é defeito (pendências do cliente marcadas de propósito, sem
avaliações por integridade, sem dark mode por decisão), as 7 verificações específicas do projeto,
e o limite da impeccable: inspecionar em lote UMA vez, corrigir tudo de uma vez, confirmar com no
máximo mais uma rodada, parar.
PLANO DA TASK 18: (A) e (B) em paralelo como subagentes isolados → eu sintetizo → um despacho
de correção para P0/P1 → uma re-review escopada → parar. Só começa depois da Task 17 fechar,
porque o audit é sobre o estado final.
Task 18 prep: @axe-core/cli DESCARTADO — chromedriver crasha nesta máquina, Chrome fora do
caminho padrão. Decisão: Lighthouse (já embute axe, 94/100 a11y nos dois modos) + axe injetado
pelo navegador como fallback + verificação manual de teclado. Registrado no qa-guidance.md.
Task 18 prep: 2 violações WCAG AA extraídas do axe embutido no Lighthouse (94/100 nos dois modos):
  P1 aria-prohibited-attr — aria-label no span.split-parent do h1 (escrito pelo GSAP SplitText).
     NÓS criamos isso na Task 8 e o teste do hero depende dele. Corrigir movendo o nome para o h1.
  P1 heading-order — h1 → h3 nos Pilares sem h2. Rebaixar para <p><strong> ou h2 sr-only.
  Registradas em qa-guidance.md como entrada garantida da Task 18.
Prep da reta final (feita durante a rodada 3 da Task 17): task-18-A-brief.md (revisão de design
isolada, não-ancorada) e task-18-B-brief.md (evidência mecânica: detector, Lighthouse final,
varredura responsiva medida em 8 larguras, as 7 verificações do projeto, paleta, console).
deferred-minors.md consolidou 22 minors adiados + 7 bloqueios de PUBLICAÇÃO para a review final
triar. final-review-brief.md pronto com placeholders <<HEAD>> e <<PACOTE>>. Merge-base = 7e6b144,
43 commits na branch, ~94 arquivos de código / ~9,7k linhas (sem lockfile/binários).
SEQUÊNCIA QUANDO A 17 FECHAR: (1) npm run build + start -p 4173 UMA vez, servidor compartilhado;
(2) despachar A e B em paralelo, isolados; (3) eu sintetizo com banner "Method: dual-agent";
(4) UM despacho de correção para P0/P1 (inclui os 2 P1 do axe já conhecidos); (5) UMA re-review
escopada; (6) review final da branch no modelo mais capaz; (7) superpowers:finishing-a-development-branch.
Prep: finishing-a-development-branch lido. Repo normal (GIT_DIR == GIT_COMMON), branch feat/site
forkada de main em 7e6b144 → menu padrão de 3 opções (merge local / PR / manter). O protocolo
EXIGE suíte verde antes do menu. CONFLITO PREVISTO: se o LCP mobile ficar > 2,5s após a rodada 3,
orcamento.test.ts fica vermelho de propósito. Decisão do PARCEIRO, a apresentar com os números:
(a) aceitar o vermelho documentado — o teste vira relatório (it.skip com motivo, ou orçamento
ajustado com justificativa) e o merge segue; (b) segurar o merge até o LCP entrar (o que implica
mexer no custo do React Bits que ele mesmo aceitou decidir depois). Não decidir por ele.
A worktree órfã .claude/worktrees/goofy-lewin-95beb5 é host-managed: o cleanup do protocolo não
a toca. Deixar como está.
Parceiro reforçou: o site PRECISA ter motion ótimo e animações de alto nível. Motion virou
dimensão PRÓPRIA e pontuada na Task 18: A julga cada efeito (8 pontos da página, com "qual valor
mudar"); B mede (getAnimations sem propriedades de layout, grep de transition:all/ease-in,
reduced-motion que reduz sem zerar o :active, long tasks durante scroll).

Task 17 rodada 3 (commits a5ef141 H2, ce7c58d H1; H3 testado e revertido sem ganho):
  Foto do hero 132KB WebP 750w -> 49KB AVIF 640w (-63%). Peso total da página -20%.
  LCP devtools (throttling REAL): 3,31s -> 2,21s  DENTRO da meta de 2,5s.
  LCP simulate (Lantern):         4,36s -> 3,85s  ainda acima — banda compartilhada com ~280KB
                                                   de fontes/CSS/logo preloaded. Próxima alavanca:
                                                   images.qualities (não testada — H1+H2 já bateu
                                                   a meta real; sem número que justifique a rodada).
  Achado colateral: em 85vw o navegador ALTERNAVA entre 640w e 750w em runs idênticos (corrida de
  seleção de srcset, 27px da borda do breakpoint). Resolvido com 80vw (63px de margem), 6/6 estável.
  O implementador reconheceu que "Lantern descolado" estava errado — as 7 ablações não tocavam o
  caminho crítico. Seção de LCP do task-17-report.md corrigida.
  orcamento.test.ts continua VERMELHO de propósito (lê o valor simulado). Decisão do parceiro no
  fechamento: aceitar vermelho documentado (teste vira relatório) ou mais uma rodada em qualities.
  220/221 testes, build e eslint limpos.
Task 17: re-review da rodada 3 (commits 2828b2f..ce7c58d) — 4/4 ADDRESSED com verificação
  independente: conta do sizes refeita (85vw=612,85px físicos, 27px do corte de 640w; 80vw=576,8px,
  63px de margem), AVIF conferido na doc local e na medição viva (49.011 bytes, image/avif), encoder
  real do Next (sharp .avif) rodado contra logo.png/logo-branco.png/sorriso-arco.png: alfa
  PRESERVADO; motion.tsx idêntico ao pré-rodada; git status limpo; vermelho do teste honesto.
Task 17: complete (commits 8ac06af..ce7c58d, review clean). 220/221 — orcamento.test.ts vermelho
  de propósito (LCP simulado 3847ms > 2500; LCP real 2211ms DENTRO da meta). Decisão do parceiro
  no fechamento.
Task 17: minor (deferred): relatório não menciona que AVIF custa ~50% mais no PRIMEIRO request de
  cada tamanho (doc local image.md:771); requests seguintes vêm do cache. A doc local não diz nada
  sobre persistência do cache de imagens na Vercel — confirmar antes de publicar.
>>> Task 18 começa: build limpo do estado final ce7c58d, servidor único na 4173.
Task 18: A (design, não-ancorada) e B (mecânica) despachadas em PARALELO e ISOLADAS contra o servidor único 4173 (build ce7c58d).
Task 18 prep: task-18-fix-notes.md com as receitas dos 2 P1 do axe (aria:'hidden' no SplitText + aria-label no h1 com teste mais forte; Pilares h3 -> p/strong com teste por texto). Só Pilares muda de teste; profissional.test.tsx (Como Funciona) NÃO.
Task 18: a sessão do Claude Code reiniciou com A e B em andamento. Em disco: detect.json limpo ([]) e lh-final-mobile/desktop.json (B); nenhum relatório ainda. Servidor 4173 sobreviveu (HTTP 200), git limpo em ce7c58d. A e B RETOMADAS por SendMessage com contexto preservado, instruídas a salvar o relatório cedo.

Task 18 — Avaliação A (design, não-ancorada) ENTREGUE: heurísticas 28/32 (7 e 10 n/a), motion 3/4,
  0 P0 / 0 P1 / 3 P2 / 2 P3. Especificidade: É a Smile de verdade (paleta, fotos, vídeos, CNPJ,
  @smileipiranga), mas "Sorriso com propósito" — assinatura mais repetida no feed — só existe na
  meta description, nunca no texto visível.
  Ressalva metodológica honesta: painel não compositou frames; motion dirigido por rAF (GSAP,
  Motion, Lenis) foi medido no código e em repouso, não sentido tocando.
  P2-1 StaggeredMenu: abertura ~1,3s no código vs teto de 300ms do guia para ESTE componente;
        fechamento com power3.in (família proibida); --ease-gaveta definido e NUNCA referenciado.
        → VIRA CORREÇÃO OBRIGATÓRIA: o parceiro exigiu motion de alto nível, e é a navegação
        primária no mobile.
  P2-2 Cinco seções seguidas em bg-creme (Profissional→Localização, ~3470px no mobile) logo após o
        pico preto de Sorrisos — a página esfria antes do CTA. → corrigir: uma seção para bg-branco.
  P2-3 FAQ com 2 perguntas, no plural, logo antes do CTA final — composição fina. Conteúdo é
        pendência do cliente, não inventar. → decisão do parceiro (não corrigir agora).
  P3-1 "Sorriso com propósito" só na meta. → acrescentar visível no rodapé (copy da própria marca,
        BRIEFING §7 — não é invenção).
  P3-2 href="#" no logo. → trivial, incluir.
  Heurística 1 / persona Casey: lightbox sem indicador de carregamento enquanto o .mp4 baixa no
        clique (em 3G, player parado sem feedback). → corrigir: estado de carregamento até canplay.
  Forças reconhecidas: ticker calibrado (40px/s, boost capado em 2,5×), fallback do CircularGallery
  com dignidade, FAB que entra/sai em vez de aparecer/sumir.
Aguardando B para sintetizar. Fix brief sendo rascunhado com os itens de A + os 2 P1 do axe.
Task 18 fix-brief: fatos confirmados por grep — CustomEase presente (gsap 3.15.0), timing do StaggeredMenu bate com a leitura de A (0.8s/0.06 power4.out, fechamento 0.28 power3.in), --ease-gaveta órfão.

Task 18 — Avaliação B (mecânica, isolada) ENTREGUE: audit 15/20 (A11y 2, Perf 3, Tema 4,
  Responsivo 2, Integridade 4); 0 P0 / 3 P1 / 2 P2 / 2 P3. Detector [] limpo. Lighthouse final
  mobile 0.64/0.94/1.00/1.00, desktop 0.99/0.94/1.00/1.00. Os 2 P1 do axe RECONFIRMADOS
  (aria-prohibited-attr, heading-order), idênticos mobile/desktop.
  P1 NOVO: 4 links do nav desktop a 19,5px de altura em 768/1024/1280/1440/1920 — WCAG 2.5.8 (24px).
  P2: overflow de 8px em 768px (CTA do header em 760.9 vs clientWidth 753); fundo (main/header)
      NÃO fica inert com o drawer aberto (medido: mainInert=false).
  P3: subtítulo do hero font-corpo a 15px; microcopy do rodapé 13-14px sem font-rotulo (ambíguo).
  Confirmado ao vivo e LIMPO: hash nav opacity=1 desde t=0 nos 3 alvos; drawer abre/fecha/reabre
  em chamadas separadas; lightbox trap bidirecional + Escape + retorno de foco + lenis-stopped;
  zero .mp4 na carga; mapa 0→1 request; grep de dados inventados vazio; paleta sem violação real
  (3 hex fora = comentário/default não usado/grafia); console só THREE.Clock (conhecido).
  NÃO VERIFICÁVEL (document.hidden=true no harness): getAnimations pós-scroll, long tasks no
  scroll, reduced-motion ao vivo, latência real <220ms. Cobertos por código + suíte.
Task 18 — SÍNTESE dual-agent escrita (task-18-critique.md, banner "Method: dual-agent (A:
  aaef2b1365bac5552 · B: a8c05b05bd4dc3af9)"). Consolidado: P0 0 / P1 3 / P2 7 / P3 4.
  Achado NOVO da síntese (#10, P2): o painel do drawer NÃO tem botão de fechar — o ✕ do header
  (z-50) fica sob o backdrop (z-65) e sob o painel (z-70); A deu 4/4 em "controle e liberdade"
  citando um botão que não está visível (sem compositing, não viu). Pré-requisito para deixar o
  header inerte. Confirmado no código: StaggeredMenu.tsx (toggle removido na vendorização),
  MobileMenu.tsx z-[65]/z-[70], Header.tsx z-50.
  DECISÕES (minhas, em nome do parceiro, registradas em deferred-minors.md): #7 FAQ fino =
  decisão do parceiro no fechamento (não inventar conteúdo); #14 microcopy do rodapé 13-14px =
  exceção aceita. Não mover o corte do drawer md->lg (B sugeriu como alternativa; tablet paisagem
  com mouse perderia o nav) — F2 resolve com gap-6 lg:gap-8.
Task 18 fix-brief COMPLETO: A1, A2 (axe), B (menu motion), C (bg-branco), D (lightbox loading),
  E1, E2, F1 (nav min-h-11), F2 (gap 768), F3a (✕ no painel via prop cabecalho), F3b (helper
  lib/fundoInerte.ts compartilhado por drawer E lightbox; restaurar antes do focus() no fechar),
  F4 (hero 15->16px). UM despacho, depois UMA re-review escopada.
Task 18: snapshot do critique persistido em .impeccable/critique/2026-08-21T21-09-16Z__site-app-page-tsx.md
  (slug site-app-page-tsx, trend com 1 entrada) — commit ac966a1.
Task 18: UM agente de correção despachado (12 itens A1..F4), em background.
!!! DESCOBERTA DE PROCESSO: .superpowers/ está no .gitignore (linha 5). NADA deste workspace está
  no git — ledger, briefs, relatórios, guias (design/ux/qa/reactbits). A etapa do SDD que apaga o
  workspace no fechamento DESTRUIRIA o histórico. PASSO OBRIGATÓRIO NO FECHAMENTO (antes de
  finishing-a-development-branch): copiar o workspace — menos os review-*.diff (deriváveis do git)
  e menos os .json/.stderr — para docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/ e
  commitar. Só depois apagar o workspace.
!!! progress.md da RAIZ (rastreado) parou na entrega ao Claude Design (fase 3). Atualizar no
  fechamento com o estado final: 19 tasks, decisões, bloqueios de publicação, como rodar.
Task 18: não existe template re-review-prompt.md no workspace — brief da re-review escrito em
  task-18-rereview-brief.md com placeholders <<BASE>>/<<HEAD>> para preencher no despacho.
Task 18 — CORREÇÃO ENTREGUE (agente único): 12/12 itens, commits 1b08ec1..b51783d (A1 1b08ec1,
  A2 c426133, B 98a7aaf, C a03c0c5, D f4a3966, E1 b0fd804, E2 d939902, F1 09ed968, F2 410345c,
  F3a 919d4c7, F3b a2c86b1, F4 b51783d). Suíte 242/243 (só orcamento.test.ts vermelho; baseline
  220/221 → +22 testes). build ✓ eslint ✓. Lighthouse a11y mobile 0.94→1.00, desktop 0.94→1.00;
  perf desktop 0.99→0.99, mobile 0.64→0.78/0.73 (bimodalidade de TBT já documentada; LCP igual).
  E2 foi para o fallback #topo + <main id="topo"> (href="/" recarregaria). F2 não precisou mexer
  no CTA. Relatório: task-18-fix-report.md. Painel sem compositing de novo — provas por DOM.
Task 18: re-review escopada despachada (ac966a1..b51783d), brief task-18-rereview-brief.md.
Task 18: re-review escopada (ac966a1..b51783d) — 12 ADDRESSED / 0 PARTIAL / 0 NOT, com medição
  independente (F1 alturas, F2 overflow, F3a elementFromPoint, F3b inert por DOM). Suíte 242/243
  (só orcamento.test.ts). build ✓ eslint ✓. Lighthouse a11y 1.00/1.00, zero audits reprovados;
  perf mobile 0.74 (LCP sim 3846ms, TBT 555ms), desktop 0.99 (LCP 917ms). Limitação declarada:
  rAF não observável (painel oculto) — coberto pela suíte. Recomendação: SIM para review final.
Task 18: complete (commits 1b08ec1..b51783d + docs ac966a1). Snapshot do critique em .impeccable.
  Pendente para o parceiro no fechamento: FAQ fino (A P2-3), orcamento.test.ts vermelho (LCP sim).
>>> REVIEW FINAL DA BRANCH: base 7e6b144, head b51783d. Pacote review-7e6b144..b51783d.diff
  (sem package-lock, public/, imagens/vídeos). Modelo mais capaz (fable). Depois: 1 onda de
  correção se houver, 1 re-review, arquivar workspace em docs/superpowers/, atualizar progress.md
  da raiz, finishing-a-development-branch (decisão do parceiro sobre o vermelho do orcamento).
REVIEW FINAL DA BRANCH (7e6b144..b51783d, modelo fable) ENTREGUE: 0 Critical / 5 Important /
  12 Minor — "Ready to merge? With fixes". Relatório: final-review-report.md.
  Important: I1 npm test trava (fileParallelism); I2 README é boilerplate (entregável da Task 18
  Step 6 nunca feito — caiu quando a 18 virou QA do impeccable); I3 heroBackdrop.test passa por
  construção (dynamic import assíncrono, sem controle positivo); I4 galeria WebGL monta na
  hidratação e não na viewport (desvio do plano l.62 originado no brief da Task 13, nunca
  registrado; 134 KB de retratos + chunk ogl sem rolar) → FOLLOW-UP + decisão do parceiro;
  I5 justificativa fora do git (.superpowers ignorado, 5 ponteiros para task-19-report.md
  inexistente no repo, progress.md da raiz desatualizado, orcamento.test.ts sem comentário).
  Triagem deferred-minors: 0 bloqueiam merge / 6 follow-up / 5 checklist de publicação / 12
  descartar. Constraints verbatim: todas ✓ exceto corpo<16px (M2, 4 casos) e Faq anima height (M1).
  first-load JS ~249 KB gzip vs 180 do plano — NUNCA marcado como estouro; entra no pacote R2.
  DECISÃO DO PARCEIRO (R2, apresentar junto no fechamento): LCP simulado 3847 vs 2500 (real 2211);
  first-load 249 vs 180 KB; custo React Bits (Silk+CircularGallery = 42% bytes, -74% TBT quando
  desligados); I4 gate por viewport da galeria.
Onda única pós-review: brief final-fix-brief.md — I1, I5 (arquivar workspace em docs/, ponteiros,
  comentário no orcamento.test, progress.md da raiz a partir do rascunho), I2, I3, M9, M2, M7,
  M8, M10, M5, M6 (2 testes), M1 (registrar), M12. Follow-up pós-merge: M3, M4, M11, I4, R4,
  motion.test setTimeout. Despachada.
ONDA FINAL DE CORREÇÃO — COMPLETA. Commits e20b607..5b59e01 (15 commits, 13 itens: I1, I5.1-5.4,
  I2, I3, M9, M10, M2, M7, M8, M5, M6, M1+M12). Relatório: final-fix-report.md.
  O agente despachado caiu no limite de sessão depois do I1 e no meio do I5 (30 arquivos
  modificados, sem commit). Verifiquei que era SÓ comentário (zero linha de código): era a
  expansão de todo ponteiro de doc para o caminho completo, 59 ocorrências com reflow. Revertido
  a favor de 1 linha de convenção no README (I5.2) — os docs agora existem no repo, então o nome
  puro do arquivo já é localizável. O resto executei direto, sem subagente.
  npm test: 26 arquivos, 244 testes, 243 verdes, 62,9s (I1 resolvido — antes travava).
  eslint, tsc e build limpos. git status limpo. launch.json sem diff.
  Provas por quebra feitas: I3 (gate removido -> 2 negativos falham) e M6 (playOpen sem play(0)
  -> teste novo falha; o antigo passaria).
  Ao vivo na 4702: sem overflow em 320/375/1265; nav 4x44px; aria-label no h1; hero renderiza o
  reveal completo. Lighthouse NÃO rodado (nada de runtime mudou além de 3 fontes, 1 token de cor
  e 1 curva) — declarado como raciocínio, não medição.
  ERRO MEU, corrigido: um `git commit --amend` caiu no commit errado (M1/M12 em vez de M6) e
  levou junto a correção de eslint do stub. Desfeito com reset --soft + restore --staged; cada
  item voltou para o seu commit.
  A 4173 (servidor compartilhado da Task 18) já não estava de pé — morreu com a sessão do agente.
RE-REVIEW DA ONDA FINAL: 12 ADDRESSED / 1 PARTIAL / 0 NOT. PARTIAL foi o I5.4 — erro meu no
  progress.md da raiz: contagem de testes da véspera (243/242 em vez de 244/243) e faixa da onda
  escrita como "e20b607..HEAD", que não identifica nada depois do merge. Corrigido com os números
  finais. Suíte da re-review: 244/245, 57,5s. Relatório: final-rereview-report.md.
TROCA DA FOTO DO HERO (pedido do parceiro, 24/08): o Claude Design usa a foto do Dr. Vinicius
  ("FOTO HERO.jpg" do cliente); o site usava a paciente. Origem da divergência: task de assets do
  cliente (20/08) decidiu manter a antiga e guardar a nova como hero-alternativa.jpg, sem comparar
  com o design — não existe cópia local do .dc.html no repositório, então ninguém no build nunca
  conferiu o resultado contra o design. Vale como lição de processo.
  ACHADO no levantamento, que nenhuma review pegou: hero-foto.jpg era usado em 4 lugares, um deles
  a galeria SORRISOS, cujas 9 fotos têm alt "Paciente da Smile sorrindo" — repontar só o hero teria
  posto o dentista na galeria de pacientes rotulado como paciente. Tratado junto: a paciente virou
  retrato-9.jpg e segue na galeria; SORRISOS agora é retrato-1..9.
  Também ajustados: aspect-[928/1143] (proporção mudou; sem isso cortaria o topo do letreiro), alt
  que NÃO afirma especialidade, dimensões do Open Graph, assets.test e hero.test,
  hero-alternativa.jpg apagada. Commit 07a3df8. Suíte 245 testes, 244 verdes.
  Verificado ao vivo (4705): proporção do contêiner idêntica à da foto (0.8119), imagem 200, sem
  overflow, galeria com 9 pacientes e sem o hero. Captura de tela não foi possível (painel sem
  compositing) — evidência é de DOM.
