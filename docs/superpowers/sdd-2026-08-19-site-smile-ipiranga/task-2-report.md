# Task 2 — Pipeline de assets — Relatório

## Resumo

Todos os 8 steps do brief foram executados na ordem. `npm test -- assets` passa com 26/26
testes; a suíte completa do projeto (`npm test`) passa com 29/29 (2 arquivos de teste).

---

## Step 1 — Vídeos já processados

Copiados `VIDEOS/web/{previews,posters,completos}` para `site/public/videos/`. Sem alterações.

## Step 2 — Vídeo da recepção (`Cy1Yw5iOXfz.mp4`)

**Duração real do original:** 15,67s, 720×1280 (obtida via `ffprobe`, já que o
`.info.json` do `yt-dlp` não trouxe `duration`/`width`/`height` — só a descrição).

### Instantes inspecionados

Extraí frames em `scale=360:-1` e olhei cada um com a ferramenta Read, em passos de 1s de
0s a 15s, mais alguns pontos extras para resolver zonas de transição:

| Instante | Conteúdo observado |
|---|---|
| 0.0s | Fachada: letreiro "SMILE ODONTOLOGIA INTEGRADA", telefone, porta de vidro, tela promocional dentro |
| 1s–2s | Mesmo enquadramento da fachada, câmera ainda parada na entrada |
| 3s | Câmera cruzando a porta de vidro, ainda de fora olhando pra dentro |
| 4s | Já do lado de dentro: planta, poltronas brancas/douradas da recepção |
| 5s–6s | Recepção — poltronas, almofadas, espelho, plantas. Sem pessoas |
| 7s–9s | **Consultório vazio** — cadeira odontológica e mocho, sem paciente, sem procedimento em andamento (equipamento parado, nenhum instrumento em uso) |
| 10s | Estação de café/água da recepção (Dolce Gusto, potes, taça) |
| 10.5s–11.6s | **Borrão de movimento** — a câmera está panorâmica/andando entre a estação de café e a parede verde (frames instáveis, não utilizáveis) |
| 11.8s–15.67s | Parede verde com o letreiro de neon "SMILE ODONTOLOGIA INTEGRADA" e a cadeira de balanço suspensa — a mesma composição icônica usada no `tour-clinica`. Imagem nítida, estática, sem borrão |

**Nenhum frame, em nenhum instante inspecionado, mostra procedimento em andamento** (boca
aberta, afastador bucal, instrumento inserido). O trecho de 7–9s mostra a sala de
atendimento, mas vazia — equipamento parado, sem paciente — o que não configura
"procedimento em andamento" nos termos da Resolução CFO-196/2019 (mesmo critério já usado
pelo `tour-clinica`, que também mostra salas de atendimento vazias).

### Trecho escolhido: `INICIO=0.0` `DURACAO=5.0`

Optei pelos primeiros 5,0s (fachada → atravessa a porta → chega na recepção) em vez do
trecho da parede verde (11,8–15,67s, ~3,9s) por três motivos:
1. Preenche o orçamento completo de ~5s pedido no brief, sem precisar encurtar.
2. Narrativa coerente com o slug `recepcao`: começa na fachada (contexto/local) e termina
   exatamente na área de espera — é literalmente "chegando na recepção".
3. Zero risco de conteúdo problemático: os 5 segundos inteiros já foram inspecionados
   quadro a quadro (0,1,2,3,4,5s) e estão limpos.

Observação à parte, sem relação com a Resolução CFO-196: o vídeo original tem uma marca
d'água "CapCut" no canto superior direito (fica visível nos frames 0–11s; nos frames
12–15,67s ela também está lá, só menos perceptível contra o fundo verde). Isso já vinha
gravado no arquivo exportado do Instagram — não é algo que eu adicionei, e está presente
em qualquer trecho escolhido dentro deste vídeo. Registro aqui para o parceiro decidir se
vale a pena pedir um re-export sem marca d'água.

### Comandos usados (ffmpeg, valores do brief)

```
ffmpeg -nostdin -v error -ss 0.0 -t 5.0 -i originais/Cy1Yw5iOXfz.mp4 -an \
  -vf "scale=432:-2,fps=20" -c:v libx264 -crf 32 -preset veryslow -profile:v main \
  -pix_fmt yuv420p -movflags +faststart -y web/previews/recepcao.mp4

ffmpeg -nostdin -v error -ss 0.0 -i originais/Cy1Yw5iOXfz.mp4 -frames:v 1 \
  -vf "scale=720:-2" -c:v libwebp -quality 78 -y web/posters/recepcao.webp

ffmpeg -nostdin -v error -i originais/Cy1Yw5iOXfz.mp4 -vf "scale=720:-2" \
  -c:v libx264 -crf 27 -preset slow -profile:v main -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 1 -movflags +faststart -y web/completos/recepcao.mp4
```

`web/completos/recepcao.mp4` usa o vídeo original inteiro (15,67s, com áudio), no mesmo
padrão dos outros 4 — inclui o trecho da sala vazia (7–9s), mas, como já dito, sem
paciente nem procedimento em andamento.

### Tamanho final de cada preview (em `site/public/videos/previews/`)

| Slug | Tamanho | Abaixo de 260KB? |
|---|---|---|
| `tour-clinica.mp4` | 194.217 bytes (~190 KB) | sim |
| `caso-protese.mp4` | 213.068 bytes (~208 KB) | sim |
| `facetas-resina.mp4` | 168.710 bytes (~165 KB) | sim |
| `facetas-transformacao.mp4` | 101.872 bytes (~99 KB) | sim |
| `recepcao.mp4` (novo) | 155.253 bytes (~152 KB) | sim |
| **Total** | **833.120 bytes (~814 KB)** | **abaixo de 1 MB** |

Poster gerado: `site/public/videos/posters/recepcao.webp` — 47.726 bytes.
Completo gerado: `site/public/videos/completos/recepcao.mp4` — 2.384.759 bytes (~2,3 MB).

## Step 3–4 — Script de imagens

`scripts/preparar-assets.mjs` criado exatamente como no brief (root do projeto, não em
`site/`), lendo de `IMAGENS DO INSTAGRAM/` e escrevendo em `site/public/img/`. `sharp`
instalado na raiz (`npm i -D sharp`, criou `package.json` na raiz — não existia antes).

Rodei `node scripts/preparar-assets.mjs`: saída — uma linha `ok <arquivo>` por entrada,
17 linhas, sem erro:

```
ok hero-foto.jpg
ok clinica-interior.png
ok fachada.jpg
ok antes-depois-1.jpg
ok antes-depois-2.jpg
ok antes-depois-3.jpg
ok antes-depois-4.jpg
ok antes-depois-5.jpg
ok retrato-1.jpg
ok retrato-2.jpg
ok retrato-3.jpg
ok retrato-4.jpg
ok retrato-5.jpg
ok retrato-6.jpg
ok retrato-7.jpg
ok retrato-8.jpg
ok dr-vinicius.jpg
```

## Step 5 — Assets de marca (fallback local, sem acesso ao Claude Design)

**Estes três arquivos são fallback gerado localmente, não o export do Claude Design.**
O parceiro deve substituí-los pelo export limpo assim que disponível.

Fonte: `IMAGENS DO INSTAGRAM/766322335_18029281163845208_6745603955996636678_n.jpg`
(1137×1516), que tem o logotipo em alta no canto superior direito, sobre fundo branco.

Script: `scripts/gerar-marca-fallback.py` (Pillow), rodado com `python scripts/gerar-marca-fallback.py`.

Método:
1. Localizei a caixa do logotipo por inspeção visual (crops de teste) e varredura de
   pixel (bounding-box por cor, evitando o painel preto diagonal do pôster à esquerda e
   a headline "SEU NOVO SORRISO" abaixo, que tem uma faixa em branco separando-a do
   logotipo). Caixa final: `(615, 8, 1090, 250)` em coordenadas da imagem original.
2. Removi o fundo branco convertendo para alfa com **des-premultiply**: para cada pixel,
   `alpha = 255 - min(r,g,b)`; abaixo de um corte de ruído (15) o pixel vira 100%
   transparente; acima disso, a cor é recuperada assumindo que o pixel observado é uma
   mistura entre branco e a "tinta" real (`cor_real = (observado - (255-alpha)) *
   255/alpha`). Isso evita o halo esbranquiçado que apareceria nas bordas se eu só
   tivesse jogado fora os pixels quase-brancos sem recalcular a cor — confirmei
   compositando o `logo.png` sobre um fundo amarelo (#f5b63c) e sobre um fundo branco:
   nenhum halo visível em nenhum dos dois.
3. `logo.png` — logotipo completo (arco + "Smile" + "Saúde & Estética Orofacial"),
   cores originais, canal alfa. 430×242px, modo RGBA (confirmado com Pillow).
4. `logo-branco.png` — mesma silhueta/alfa, recolorida 100% branco (para o rodapé
   preto). Fica legível e nítido sobre preto; o arco (originalmente dourado com leve
   gradiente/brilho no design) sai com uma textura sutil em vez de branco totalmente
   chapado, porque o gradiente do dourado original virou variação de alfa — esteticamente
   é um detalhe menor, mas vale o parceiro conferir contra o export oficial.
5. `sorriso-arco.png` — recortei uma caixa generosa em torno do arco `(720, 5, 980,
   110)`, apliquei a mesma remoção de fundo e, além disso, zerei o alfa de qualquer pixel
   que não tivesse "cara de dourado" (fórmula de matiz simples) — isso descartou os
   fragmentos pretos que apareciam nas quinas (topo do "S" e o pingo do "i" da palavra
   "Smile", que entravam na caixa de recorte). Resultado: 240×101px, só o arco, fundo
   limpo, sem restos de letra.

Qualidade do recorte: verifiquei compositando cada um dos três PNGs sobre fundo branco,
amarelo e preto (script Python ad-hoc, depois removido) — bordas limpas, sem halo, sem
fragmentos de letra vazando no arco isolado. `logo.png` e `logo-branco.png` estão
levemente enviesados (a foto original tem uma leve rotação de câmera), mas dentro do que
se espera de um recorte manual de uma peça gráfica de post — não tentei corrigir rotação
para não inventar geometria que não está no arquivo original.

```
$ ls -la site/public/img/logo.png site/public/img/logo-branco.png site/public/img/sorriso-arco.png
logo.png          56.315 bytes  430x242  RGBA (tem canal alfa)
logo-branco.png   33.576 bytes  430x242  RGBA
sorriso-arco.png  27.903 bytes  240x101  RGBA
```

## Sobre `trat-*.jpg` (7 tratamentos)

**Não fazem parte do escopo desta task.** O brief da Task 4 vai referenciar 7 imagens
`trat-*.jpg` que não existem em `IMAGENS DO INSTAGRAM/` nem em lugar nenhum do acervo
atual — não há fonte para recortar sem inventar conteúdo. Fica registrado aqui para
resolver antes da Task 4 (precisa de fotos reais dos 7 tratamentos, ou decidir usar
ilustrações/ícones em vez de fotos).

## Step 6–7 — Teste e execução

`site/__tests__/assets.test.ts` criado exatamente como no brief. Rodado a partir de
`site/`:

```
$ npm test -- assets

 RUN  v4.1.11 .../site

 Test Files  1 passed (1)
      Tests  26 passed (26)
   Duration  2.61s
```

Suíte completa do projeto (`npm test`, sem filtro) também passa:

```
 Test Files  2 passed (2)
      Tests  29 passed (29)
```

(26 testes de `assets.test.ts` + 3 de `contact.test.ts`, que já existia da Task 1.)

## Arquivos criados/alterados

- `scripts/preparar-assets.mjs` (novo)
- `scripts/gerar-marca-fallback.py` (novo, fallback dos 3 assets de marca)
- `package.json` + `package-lock.json` na raiz (novo — `npm i -D sharp` criou porque não
  havia `package.json` de raiz antes)
- `site/public/img/*` — 20 imagens (novo)
- `site/public/videos/{previews,posters,completos}/*` — 5 slugs completos (4 copiados da
  Task 1 + `recepcao` novo)
- `site/__tests__/assets.test.ts` (novo)

## Pendências para o humano

1. Substituir `logo.png`, `logo-branco.png`, `sorriso-arco.png` pelo export limpo do
   Claude Design quando disponível — os atuais são fallback recortado manualmente.
2. Decidir o que fazer com a marca d'água "CapCut" visível no preview/poster/completo de
   `recepcao` (vem do arquivo original, não foi introduzida por mim).
3. Resolver a origem das 7 imagens `trat-*.jpg` antes da Task 4 (não existem no acervo).
4. `VIDEOS/web/completos/caso-protese.mp4` e `facetas-transformacao.mp4` ainda contêm as
   cenas de procedimento identificadas no `VIDEOS/README.md` — decisão já registrada lá,
   não é escopo desta task, só repito o alerta.

---

## Correção pós-review (2 achados de qualidade)

A review de conformidade aprovou a task (inclusive checou o requisito CFO extraindo
frames do preview de `recepcao` e confirmou que está limpo), mas reprovou em qualidade
com dois achados. Ambos corrigidos abaixo.

### CRITICAL — `dr-vinicius.jpg` tinha legenda de vídeo queimada

**Causa raiz:** o `MAPA` apontava para `extraidas/dr-vinicius-26.0s.jpg`, um frame que já
tinha sido extraído do vídeo `DQxpqgejgst.mp4` (caso de prótese) numa etapa anterior ao
Task 2, com a legenda amarela/preta "SUA PRÓTESE" cravada no rodapé do quadro — exatamente
como o `ASSETS-INVENTARIO.md` já alertava. Como esse frame já tinha só 720px de largura
(a resolução nativa do vídeo, 720×1280), o `resize({width:900, withoutEnlargement:true})`
não fazia nada — não era ele quem devia remover a legenda, e nunca removeria mesmo.

**Correção:**

1. Reextraí frames de `VIDEOS/originais/DQxpqgejgst.mp4` (45,3s, 720×1280) em vários
   instantes e abri cada um com a ferramenta Read:
   - **0–20s**: intro com closes de antes/depois de dentes e telinha picture-in-picture
     do Dr. Vinicius — sempre com legenda grande cobrindo boa parte do quadro, não serve
     de retrato.
   - **14–21s**: cenas de procedimento com afastador bucal (mesmo tipo de conteúdo vedado
     pela Res. CFO-196/2019) — descartadas de cara, nem cogitadas como fonte de retrato.
   - **22–36s**: Dr. Vinicius em plano frontal, jaleco branco, falando para a câmera —
     mas com **legenda queimada em praticamente todo frame** (são legendas automáticas
     palavra-por-palavra, quase sem intervalo em branco). Testei 22s, 22.5s, 23s, 25s,
     26s (o frame usado antes), 26.5s, 27s, 32s, 36s — todos com texto no rodapé.
   - **38.5–44s**: mesmo padrão de legenda contínua, exceto por uma folga breve em
     **40.3s**, entre a legenda "CONOSCO" (que aparece em 40.0s) e a legenda seguinte —
     nesse instante específico não há nenhum texto queimado no quadro.
   - Confirmei em resolução nativa (720×1280) que o frame de **40.3s** está limpo: boca
     fechada, expressão tranquila (sorriso discreto, não é meio de palavra), mãos
     cruzadas à frente, jaleco branco, sem legenda, sem afastador, sem procedimento.
2. Recortei esse frame para proporção 4/5 exata (`(0, 40, 720, 940)` → 720×900,
   `720/900 = 0.8`), como pedido para a Task 14, e salvei em
   `IMAGENS DO INSTAGRAM/extraidas/dr-vinicius-40.3s.jpg` (mesma convenção de nome dos
   outros frames extraídos naquela pasta).
3. Atualizei o `MAPA` de `scripts/preparar-assets.mjs`: a entrada de `dr-vinicius.jpg`
   agora aponta para `extraidas/dr-vinicius-40.3s.jpg` (mantive a largura-alvo em 900 —
   o `withoutEnlargement` segue sem efeito porque a fonte é 720px nativos, mas o valor
   continua correto como teto: nunca faz upscale).
4. Rodei `node scripts/preparar-assets.mjs` de novo — `dr-vinicius.jpg` foi regerado a
   partir da nova fonte, 720×900px, 40.833 bytes, sem legenda, canal RGB (sem alfa,
   como esperado pra um JPEG).

Não apaguei os frames antigos (`dr-vinicius-23.6s.jpg`, `-26.0s.jpg`, `-30.8s.jpg`) da
pasta `extraidas/` — continuam lá como material bruto, só não são mais referenciados pelo
script.

### IMPORTANT — `clinica-interior.png` com 960KB e cor degradada

**Causa raiz:** `sharp(...).png({quality:88, compressionLevel:9})` aciona quantização por
paleta (o parâmetro `quality` do encoder PNG do sharp só existe para decidir *quantas*
cores usar numa paleta — ele não tem efeito num PNG "true color"). O arquivo fonte é uma
foto de tom contínuo, sem transparência nenhuma; sair como PNG indexado de 256 cores
introduzia banding real na parede verde e no gradiente de luz, sem nenhum ganho de peso
que justificasse — na real, saiu mais pesado (960KB) do que uma boa compressão JPEG teria
ficado.

**Correção:**

1. Troquei a entrada do `MAPA` em `scripts/preparar-assets.mjs`: destino agora é
   `clinica-interior.jpg` (era `.png`), com um 4º elemento opcional na tupla para
   qualidade JPEG customizada (`88`, em vez do padrão `84` usado nas outras fotos —
   comentário no código explica que é por causa do gradiente/luz da foto de interior,
   mais sensível a banding do que os retratos).
2. Ajustei o loop do script pra aceitar essa qualidade por-imagem com
   `[de, para, largura, qualidade = 84]`, sem mudar o comportamento das outras 16
   entradas (todas continuam saindo com `quality: 84, mozjpeg: true`).
3. Rodei `node scripts/preparar-assets.mjs` de novo, apaguei
   `site/public/img/clinica-interior.png` manualmente (o script não apaga saídas
   antigas quando o nome do destino muda).
4. Resultado: `clinica-interior.jpg`, 960×1638px (mesma resolução nativa da fonte, o
   `withoutEnlargement` também é no-op aqui porque a fonte já é menor que os 1200px
   alvo), **484.637 bytes** — menos da metade do PNG anterior (960.016 bytes) — e sem
   banding visível na parede verde (conferido abrindo o arquivo com a ferramenta Read).
5. Atualizei a lista `IMGS` em `site/__tests__/assets.test.ts`: `'clinica-interior.png'`
   → `'clinica-interior.jpg'`.

Busquei por outras referências a `clinica-interior.png` ou `dr-vinicius-26.0s` em código
vivo (`*.mjs`, `*.ts`, `*.tsx`) — não há nenhuma; as únicas ocorrências restantes são nos
documentos de plano/brief (`.superpowers/sdd/.../task-2-brief.md`,
`docs/superpowers/plans/...md`, `progress.md`), que são registro histórico e não código,
então não mexi neles.

### Teste

Rodado de dentro de `site/`:

```
$ npm test

 Test Files  2 passed (2)
      Tests  29 passed (29)
```

### Tamanho final dos dois arquivos corrigidos

| Arquivo | Antes | Depois |
|---|---|---|
| `site/public/img/dr-vinicius.jpg` | 79.178 bytes, 900px alvo (mas source 720px, com legenda) | **40.833 bytes**, 720×900 (4:5), sem legenda |
| `site/public/img/clinica-interior.png` → `.jpg` | 960.016 bytes, PNG indexado (256 cores, banding) | **484.637 bytes**, JPEG quality 88, 960×1638, cor contínua sem banding |

### Arquivos alterados nesta correção

- `scripts/preparar-assets.mjs` — MAPA atualizado (2 entradas) + qualidade JPEG
  configurável por imagem
- `site/__tests__/assets.test.ts` — `clinica-interior.png` → `.jpg` na lista `IMGS`
- `site/public/img/dr-vinicius.jpg` — regerado (novo frame-fonte)
- `site/public/img/clinica-interior.jpg` — novo (substitui o `.png`, que foi apagado)
- `IMAGENS DO INSTAGRAM/extraidas/dr-vinicius-40.3s.jpg` — novo frame-fonte, sem legenda

