# progress.md — Site Smile Ipiranga

## Status
**FASE 0 — Descoberta & Briefing:** concluída (com pendências mapeadas para o cliente)
**FASE 1 — Copy:** concluída (`COPY.md`, com pendências marcadas)
**FASE 2 — Referências & Moodboard:** concluída (paleta fechada; tipografia definida por características, escolha final no Claude Design)
**FASE 3 — Design:** concluída — `Smile Ipiranga.dc.html` aprovado no Claude Design
**FASE 4 — Arquitetura técnica:** concluída — stack decidida, plano escrito
**FASE 5+ — Build:** EM ANDAMENTO — 16 de 18 tasks completas + 2 extras. Task 19 implementada, pendente de review.
  Execução por subagente, ledger em `.superpowers/sdd/2026-08-19-site-smile-ipiranga/progress.md`
  **Ao retomar, leia o ledger primeiro** — ele tem o estado exato e o que não pode se perder.
  Branch `feat/site`, 40 commits, working tree limpo, 217 testes.
  **Retomada: review da Task 19 (range 5920512..c36436d), depois Task 17 (performance), 18 (QA) e review final.**
**Tier do projeto:** 2 — site institucional de uma página, motion moderado

## Feito
- **Acervo real recebido:** 20 fotos em alta em `IMAGENS DO INSTAGRAM/`, catalogadas em `ASSETS-INVENTARIO.md`
- Endereço resolvido: **507** (lido na fachada em alta resolução)
- Definido mobile-first como restrição número 1
- Definida a estratégia de vídeo: loop mudo via IntersectionObserver + lightbox no clique
- **4 vídeos baixados e processados** → `VIDEOS/web/` (previews, posters, completos). Total dos previews: 676 KB
- Achado: 2 vídeos contêm cena de procedimento (afastador) — previews já cortadas fora, completos ainda não
- Novos dados vindos das legendas: clareamento é oferecido; assinatura "Sorriso com propósito"
- Briefing consolidado em `BRIEFING.md`
- Instagram @smileipiranga extraído: 12 posts + foto de perfil em `ASSETS INSTAGRAM/`
- Identidade visual real identificada: **preto + dourado/amarelo + branco** (NÃO azul)
- Fachada e interior reais capturados
- Profissional: **Dr. Vinicius Aracena**, Ortodontista (grafia confirmada por hashtag da clínica; falta o CRO)
- Restrições da Resolução CFO-196/2019 mapeadas

## Decisões tomadas
- WhatsApp +55 11 2274-0228 é o CTA primário (canal validado da bio do IG)
- Paleta: branco + amarelo (hex amostrado do material real)
- Mobile-first é a restrição número 1
- Tipografia: famílias escolhidas pelo Claude Design; o brief fixa só as características
  (grotesca pesada tipo Arial Black para títulos + geométrica leve com tracking largo para rótulos)
- Hero segue a estrutura das 3 referências, **menos** o bloco de credibilidade —
  aquele é substituído por dados reais, porque a Smile não tem os números das referências
- Vídeo: prévia mudo em loop + lightbox no clique; sem WebM
- Pendências com o cliente ficam com placeholder e entram depois

## Aberto
- **2 pendências bloqueiam a publicação:** CRO do responsável técnico e autorização de uso de imagem dos pacientes
- 5 pendências bloqueiam a copy final (especialidades, horário, convênios, pagamento, urgência)
- Decidir o que fazer com o trecho de procedimento nos 2 vídeos completos (cortar / não usar no lightbox / validar)
- Retrato decente do Dr. Vinicius — o que temos é frame de vídeo com legenda queimada
- Ver lista completa no fim do `BRIEFING.md`

## Decisão de paleta
Branco `#FFFFFF` + creme `#FCF0E4` + amarelo `#FCCC24` + dourado `#F0B40C` + preto `#111`.
Amostrada dos arquivos reais da marca.

## Ferramentas instaladas nesta máquina
`yt-dlp` (via pip), `Pillow` (via pip), `ffmpeg 9.0` (via winget — binário em
`%LOCALAPPDATA%/Microsoft/WinGet/Packages/Gyan.FFmpeg_*/ffmpeg-9.0-full_build/bin`,
o PATH só recarrega em shell novo).

## Stack decidida (FASE 4)
Next.js 15 App Router · React 19 · TypeScript · Tailwind v4 · GSAP + ScrollTrigger · Lenis ·
Motion · OGL (via React Bits) · React Bits pelo registry do shadcn · deploy Vercel.

**Por que Next e não Astro:** o motion escolhido é page-wide (Lenis + ScrollTrigger coordenando
timelines entre seções) e as ilhas do Astro isolariam cada componente, quebrando isso.
Next dá HTML real para SEO local, uma árvore React contínua e `next/image` completo.

**Motion:** nível ousado, com WebGL em dois lugares apenas — fundo do hero (Silk) e a galeria
de sorrisos (CircularGallery). Ambos atrás de `useCapability()`, fora do bundle inicial.

## Vídeos
5 processados. O da recepção (`Cy1Yw5iOXfz`) foi baixado e ainda precisa de corte
(Task 2 do plano).

## Histórico: pacote entregue ao Claude Design

1. `PROMPT-CLAUDE-DESIGN.md` — colar o conteúdo como prompt
2. `COPY.md` — anexar
3. Fotos a anexar, de `IMAGENS DO INSTAGRAM/`:
   - `Gemini_Generated_Image_j80nk9j80nk9j80n.jpg` (hero)
   - `ChatGPT Image 19 de ago. de 2026, 16_27_05.png` (a clínica)
   - `569880150_17995144052845208_3540625868543828159_n.jpg` (fachada)
   - `766322335_18029281163845208_6745603955996636678_n.jpg` (logo em alta)
   - 3 ou 4 retratos de paciente à escolha
4. As 3 referências de `IMAGENS DESIGN INSPIRAÇÃO/`
5. Posters de `VIDEOS/web/posters/` (para os cards de depoimento)

Referências premiadas verificadas em `REFERENCIAS-PREMIADAS.md` (já embutidas no prompt).

**Quando o design voltar aprovado:** FASE 4 — arquitetura técnica (stack, setup, repositório),
depois FASE 5 (build estático), FASE 6 (motion), 7 (performance), 8 (QA), 9 (entrega).

**Antes de publicar, obrigatoriamente:** preencher as pendências do cliente e resolver
o trecho de procedimento nos 2 vídeos completos (ver `VIDEOS/README.md`).
