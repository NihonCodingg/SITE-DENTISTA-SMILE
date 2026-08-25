# Minors adiados e itens parkeados — consolidado do ledger para a review final

Gerado em 2026-08-21 a partir de progress.md. A review final tria: o que bloqueia merge, o que vira follow-up.

## minor (deferred)
- L6 · Task 1: minor (deferred): tokens.test.tsx citado em Files mas ausente nos Steps do brief — sem teste dedicado de tokens
- L7 · Task 1: minor (deferred): package.json sem "type":"module" gera warning do Vitest a cada rodada
- L30 · Task 2: minor (deferred): marca d'água CapCut queimada no vídeo da recepção — decisão do parceiro
- L31 · Task 2: minor (deferred): posters/recepcao sem par .jpg (os outros 4 slugs têm) — assimetria herdada do brief
- L32 · Task 2: minor (deferred): logo-branco.png com o arco acinzentado em vez de branco chapado
- L51 · Task 2: minor (deferred): `npm i -D sharp` criou package-lock.json na raiz; Turbopack agora avisa
- L56 · Task 2: minor (deferred): ramo if(.png) em preparar-assets.mjs virou código morto após a troca
- L57 · Task 2: minor (deferred): dr-vinicius.jpg tem marca d'água "Smile" do vídeo no canto superior direito
- L76 · Task 4: minor (deferred): regex do FAQ não guarda "duração da avaliação" nem "emergência/dor"
- L151 · Task 6: minor (deferred) — reduced-motion (matchMedia prefers-reduced-motion:reduce) não foi testado
- L183 · Task 6: minor (deferred): hover do FAB troca brightness sem transição de filter
- L184 · Task 6: minor (deferred): hover do nav usa ease-out onde o guia prescreve ease
- L304 · Task 7: minor (deferred): brief citava useCapability() como consumido, Hero não usa (correto — motion é Task 8)
- L341 · Task 9: minor (deferred): o rAF continua se reagendando quando pausado (early-return), não cancela
- L343 · Task 9: minor (deferred): calibragem visual do boost/decay não feita (rAF não dispara no ambiente)
- L365 · Task 10: minor (deferred): comentário em globals.css afirma que a decisão do GlareHover está no
- L367 · Task 10: minor (deferred): fs.existsSync é sólido hoje, mas frágil se o deploy migrar para
- L443 · Task 11: minor (deferred): desempate do coordenador depende da ordem de entrega entre observers
- L445 · Task 11: minor (deferred): falta recepcao.jpg no pipeline de assets (contornado no componente)
- L489 · Task 12: minor (deferred): href="#" da logo no Header continua usando jump nativo (excluído de
- L683 · Task 15: minor (deferred): titulos-tamanho.test.tsx cobre lista fixa de seções — a defesa real
- L781 · Task 19: minor (deferred): warning THREE.Clock deprecated no console, 2x por carga, vindo da lib.

## parked / BLOCKED / deferred (outros)

## Bloqueios de PUBLICAÇÃO conhecidos (não de merge) — pendências do cliente
- CRO do responsável técnico (site mostra 'CRO-SP a confirmar' em 2 lugares)
- Confirmação de que 'Ortodontista' é especialidade registrada (marcado tracejado)
- Autorização de uso de imagem dos pacientes (retratos, antes/depois, vídeos)
- Horário de atendimento (site mostra 'a confirmar'; JSON-LD sem openingHours de propósito)
- Trecho de procedimento nos vídeos completos caso-protese e facetas-transformacao (VIDEOS/README.md)
- Marca d'água CapCut no vídeo da recepção
- Logo em vetor; domínio definitivo (NEXT_PUBLIC_SITE_URL, build-time)

## Task 18 — decisões tomadas na síntese (para o parceiro confirmar no fechamento)
- A P2-3: FAQ com só 2 perguntas confirmadas, título no plural, logo antes do CTA final. NÃO é
  conteúdo (3 perguntas do COPY.md dependem do cliente). Opções: (a) manter como está até o
  cliente responder; (b) reduzir o peso visual da seção (título menor, menos padding); (c)
  reposicionar para antes de Localização. Decisão do parceiro — não alterado.
- B P3: bloco de contato do rodapé (endereço, CEP, telefones, CNPJ, disclaimer) em 13-14px sem a
  classe `font-rotulo`. ACEITO como exceção: microcopy legal/contato de rodapé é rótulo por
  natureza. Não alterado.
- A "Perguntas provocativas" (Silk vs. custo, frase manuscrita no CTA final) — registradas em
  task-18-critique.md; não são defeitos.

## Review final da branch (2026-08-21) — itens registrados, não corrigidos

**Desvio aceito**
- `Faq.tsx` anima `height` (0 → auto) com a Motion, única violação da regra "só transform,
  opacity e clip-path" no projeto. 250ms, 2 perguntas, abaixo da dobra; `clip-path` exigiria
  medir a altura em JS. Registrado no comentário do próprio componente (M1).
- Bloco de contato do rodapé em 13-14px sem `font-rotulo`: microcopy legal/contato é rótulo por
  natureza (P3 da Avaliação B da Task 18). O aviso legal do Antes e Depois entrou na mesma
  exceção, a 14px (M2).

**Follow-up pós-merge (nenhum bloqueia merge)**
- M3: `travarScroll`/`destravarScroll` (28 linhas) e o trap de Tab duplicados entre
  `MobileMenu.tsx` e `Lightbox.tsx`; `FOCAVEIS_SELETOR` divergente (o do Lightbox inclui
  `video[controls]`). Consolidar num `lib/overlay.ts`, como a Task 18 fez com `lib/fundoInerte.ts`.
- M4: `EASE_SAIDA` duplicado em `Lightbox.tsx` e `Faq.tsx`; `STAGGER_STEP` repetido em 3 seções e
  inline em 2; escala de z-index (50/60/65/70/85/90) coerente por acaso, não por design.
  Consolidar em `lib/motionTokens.ts` e `lib/zIndex.ts`, com teste contra o `globals.css`.
- M11: sob reduced-motion, o reset global do `globals.css` comprime para .01ms o fade de
  opacidade do painel do drawer (CSS), enquanto o Lightbox (Motion, JS) mantém os 200ms que o
  guia pede. Inconsistência entre os dois overlays; ou exceção para `.sm-panel-scope` no reset,
  ou aceitar.
- I4: a galeria WebGL monta na hidratação, não quando a seção entra na viewport (desvio do plano
  l.62, originado no brief da Task 13). 134 KB de retratos + chunk do `ogl` baixados por quem
  nunca chega em "Sorrisos". Correção: `IntersectionObserver` com `rootMargin: '100%'` antes de
  `mostrarWebgl`. **Entra no pacote de decisão de performance do dono do projeto.**
- R4: teste que rode o grep de padrões proibidos contra o HTML prerenderizado quando ele existir
  (mesmo padrão condicional do `orcamento.test.ts`) — fecha o gap da copy que vive em componentes
  e não passa pela whitelist de `lib/content.ts`.
- `motion.test.tsx`: dois testes provam "não chamou" com `setTimeout(80)`.
- L7 (Task 1): warning do Vitest sobre `"type": "module"`.
- L56 (Task 2): ramo `.png` morto em `preparar-assets.mjs:75`.
- L76 (Task 4): regex do FAQ em `content.test.ts:27` não guarda "duração" nem "emergência".
- L781 (Task 19): warning `THREE.Clock deprecated` no console, vindo da lib.

**Checklist de publicação (acrescentados nesta review)**
- Custo do primeiro request de cada AVIF é ~50% maior; confirmar que o cache de `/_next/image`
  persiste na hospedagem (minor da Task 17, ledger L958 — não estava nesta lista).
- `AntesDepois.tsx` já afirma "publicadas com autorização dos pacientes": publicar antes da
  autorização existir torna a frase falsa.
- `public/` precisa ir no deploy (`Tratamentos.tsx` lê do disco no servidor).
- Teste manual de `prefers-reduced-motion` e `saveData` em aparelho real (o ambiente nunca
  compositou frames).

## Follow-up encontrado na troca da foto do hero (24/08)
- `scripts/preparar-assets.mjs` tem **um mapeamento com fonte inexistente**:
  `Gemini_Generated_Image_x8t572x8t572x8t5.jpg -> antes-depois-1.jpg`. A fonte saiu da pasta
  `IMAGENS DO INSTAGRAM/` em algum momento (provavelmente substituída pelas fotos reais do
  cliente); a saída `antes-depois-1.jpg` continua versionada e correta no repositório. Efeito:
  rodar o pipeline de ponta a ponta hoje falha nesse item e não processa os seguintes. Pré-existente,
  não foi introduzido pela troca do hero. Corrigir apontando para a fonte certa ou removendo a
  linha (a imagem já está gerada).

## Task 20 — custo medido da fita (TextLoop)
- A fita curva dos tratamentos anima `startOffset` de um `<textPath>` de SVG a cada quadro —
  atributo, não transform: o navegador repinta o SVG no main thread. Medido com a máquina limpa:
  TBT mobile ~1.000ms contra ~350ms da faixa anterior (ScrollVelocity, transform/GPU). LCP e CLS
  não mudaram. Decisão do dono do projeto: React Bits ao máximo, custo registrado. Alavanca, se
  precisar recuperar TBT: voltar a faixa reta ou pausar a fita até a primeira interação.
