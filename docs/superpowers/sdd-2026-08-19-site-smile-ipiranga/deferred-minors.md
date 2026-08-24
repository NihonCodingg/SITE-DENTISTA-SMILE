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
