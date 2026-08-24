# progress.md — Site Smile Ipiranga

## Status

**Build completo na branch `feat/site`.** As 19 tasks do plano foram executadas uma a uma
(subagent-driven development, com review por task), seguidas de QA em duas avaliações isoladas
(design e mecânica), uma rodada de correção, re-review, review final da branch inteira e a onda
de correção que ela pediu. Fases 1 a 8 do processo estão fechadas; a fase 9 (entrega) depende das
pendências do cliente listadas mais abaixo.

| Medida (estado final) | Valor |
|---|---|
| Testes | 26 arquivos · 245 testes · 244 verdes · 1 vermelho de propósito (`orcamento.test.ts`, LCP **simulado**) |
| Lighthouse — acessibilidade | **1.00** mobile · **1.00** desktop, zero audits reprovados |
| Lighthouse — performance | desktop **0.99** (LCP 0,9s) · mobile 0,64–0,80 no simulado (bimodal em TBT); LCP simulado ~3,85s, LCP com throttling **real** 2,21s — dentro da meta de 2,5s |
| Lighthouse — best practices / SEO | 1.00 / 1.00 |
| Critique (dual-agent) | heurísticas 28/32 · motion 3/4 · audit técnico 15/20 → depois da correção, 0 P0 e 0 P1 |
| Review final da branch | 0 Critical · 5 Important · 12 Minor — "ready to merge with fixes"; os Important foram corrigidos |
| Dados inventados | zero (grep no HTML gerado + teste de whitelist de dígitos) |

## Como rodar

```bash
cd site
npm install
npm run dev      # http://localhost:3000
npm test         # suíte completa
npm run build && npm run start
```

O `orcamento.test.ts` fica vermelho de propósito — o motivo está no comentário do próprio teste e
em `task-17-report.md`. Detalhes de build, assets e publicação estão em `site/README.md`.

## O que foi construído

| # | Task | Commits |
|---|---|---|
| 1 | Scaffold, tokens e fontes | `7e6b144..f8b8f3f` |
| 2 | Pipeline de assets (imagens, posters, prévias de vídeo) | `f8b8f3f..167ed72` |
| 3 | `useCapability()` — fonte única de `matchMedia`/`connection` | `167ed72..5722b20` |
| 4 | Conteúdo centralizado (`lib/content.ts`, `lib/contact.ts`) | `5722b20..505dd97` |
| 5 | Fundação de motion (Lenis + GSAP ScrollTrigger, `<Reveal>`) | `505dd97..6d633e7` |
| 6 | Header, drawer mobile e WhatsApp flutuante | `6d633e7..b120400` |
| 7 | Hero estático | `b120400..f3c384f` |
| 8 | Motion do hero + fundo WebGL (`Silk`) | `f3c384f..06eb0cb` |
| 9 | Ticker reativo ao scroll | `06eb0cb..93f5bf1` |
| 10 | Pilares e Tratamentos | `93f5bf1..4ea4e8a` |
| 11 | Sistema de vídeo — `VideoCard` e `Lightbox` | `76d32ab..95a3513` |
| 12 | A Clínica e Depoimentos | `95a3513..337f1a6` |
| 13 | Sorrisos — galeria WebGL (`CircularGallery`) | `9cf2dd1..fd0080b` |
| 14 | Profissional, Antes e Depois, Como Funciona | `fd0080b..4db4bcf` |
| 15 | Localização, FAQ, CTA final e rodapé | `4db4bcf..273281a` |
| 16 | SEO local e dados estruturados (JSON-LD `Dentist`) | `273281a..5920512` |
| 19 | Emenda: maximizar React Bits + skills de design | `5920512..e35afd3` |
| 17 | Passada de performance (ablação, AVIF, `sizes`) | `8ac06af..ce7c58d` |
| 18 | QA: critique dual-agent, 12 correções, re-review | `1b08ec1..b51783d` |
| — | Onda final pós-review da branch + troca da foto do hero | `b51783d..07a3df8` |

Componentes do React Bits vendorizados (MIT + Commons Clause, aviso em
`site/components/reactbits/LICENSE.md`, modificações documentadas no `README.md` da mesma pasta):
SplitText, Magnet, GradualBlur, CircularGallery, StaggeredMenu, Silk, ScrollVelocity, GlareHover.

## Decisões tomadas

- **Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4; GSAP/ScrollTrigger, Lenis e
  Motion; `three` e `ogl` só atrás de `podePesado` e `next/dynamic({ ssr:false })`.
- **Paleta** branco e amarelo (`#FFFFFF` `#FCF0E4` `#FCCC24` `#F0B40C` `#111111` `#5A5A55`),
  amostrada dos arquivos reais da marca. **Mobile-first** é a restrição número 1.
- **Motion ousado, com WebGL** em dois lugares (fundo do hero e galeria de sorrisos). Só
  `transform`, `opacity` e `clip-path` animam; `prefers-reduced-motion` reduz em vez de zerar;
  `saveData` desliga vídeo e WebGL.
- **React Bits forçado ao máximo**, por decisão do dono do projeto, com o custo medido e
  registrado em vez de discutido (`task-19-report.md`).
- **Nenhum dado inventado.** Sem avaliações, estrelas, contagem de pacientes, horário ou convênio.
  O que depende do cliente aparece marcado como pendência ("a confirmar", sublinhado tracejado).
- **Vídeos:** `preload="none"`, prévia muda só quando entra na viewport, vídeo completo só no
  clique (lightbox). **Mapa:** o iframe só monta ao clicar.
- **Foto do hero: o Dr. Vinicius**, como no design aprovado. O site chegou a usar a foto de uma
  paciente no mesmo cenário — divergência introduzida ao integrar as fotos do cliente e corrigida
  em 24/08. A paciente continua no site, como o nono retrato da galeria de sorrisos.

## Decisões pendentes (dono do projeto)

**Performance — quatro faces da mesma escolha entre motion ousado e orçamento.** Decidir junto
evita quatro rodadas separadas:

1. LCP simulado 3847ms contra a meta de 2500ms, enquanto o LCP com throttling real mede 2211ms —
   aceitar o vermelho documentado, ou abrir mais uma rodada mexendo em `images.qualities`.
2. First-load JS de ~249 KB gzip contra os 180 KB previstos no plano (GSAP, ScrollTrigger, Motion
   e Lenis entram estáticos; o React Bits soma ~6,5 KB).
3. Custo do React Bits: Silk e CircularGallery somam 42% dos bytes; desligados, o TBT cai 74% e o
   TTI 39%.
4. A galeria WebGL monta na hidratação, não quando a seção entra na viewport — 134 KB de retratos
   e o chunk do `ogl` são baixados por quem nunca chega em "Sorrisos".

**FAQ.** A seção tem só 2 perguntas confirmadas (3 das 5 do `COPY.md` dependem do cliente), no
plural e logo antes do CTA final. Não é conteúdo a inventar: as opções são manter como está,
reduzir o peso visual da seção, ou reposicioná-la.

## Bloqueios de publicação (não bloqueiam o merge)

Estão todos marcados como pendência no próprio site — nenhum placeholder virou afirmação.

- CRO do responsável técnico (o site mostra "CRO-SP a confirmar")
- Confirmação de que "Ortodontista" é especialidade registrada (marcada com tracejado)
- Autorização de uso de imagem dos pacientes (retratos, antes e depois, vídeos) — **atenção:** a
  seção Antes e Depois já afirma "publicadas com autorização dos pacientes"; publicar antes da
  autorização existir torna a frase falsa
- Horário de atendimento (o JSON-LD fica sem `openingHours` de propósito)
- Trecho de procedimento nos 2 vídeos completos (Resolução CFO-196/2019) — ver `VIDEOS/README.md`
- Marca d'água do CapCut no vídeo da recepção
- Logo em vetor
- Domínio definitivo em `NEXT_PUBLIC_SITE_URL` (é build-time: exige rebuild)
- Cache de `/_next/image` persistente na hospedagem (o primeiro request de cada AVIF custa ~50% a
  mais; os seguintes vêm do cache)
- Teste manual de `prefers-reduced-motion` e `saveData` em aparelho real

## Onde está o histórico

- Plano: `docs/superpowers/plans/2026-08-19-site-smile-ipiranga.md`
- Ledger, briefs e relatórios de cada task, guias de design/UX/QA, critique e reviews:
  `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/` (o `progress.md` de lá é o ledger completo)
- Snapshots do critique: `.impeccable/critique/`
- Briefing, copy e material do cliente: `BRIEFING.md`, `COPY.md`, `REFERENCIAS-PREMIADAS.md`,
  `PERGUNTAS-CLIENTE.md`, `ASSETS-INVENTARIO.md`

## Ferramentas instaladas nesta máquina

`yt-dlp` (via pip), `Pillow` (via pip), `ffmpeg 9.0` (via winget — binário em
`%LOCALAPPDATA%/Microsoft/WinGet/Packages/Gyan.FFmpeg_*/ffmpeg-9.0-full_build/bin`, o PATH só
recarrega em shell novo). Lighthouse via `npx`, apontando `CHROME_PATH` para o Edge — não há
Chrome nesta máquina. O `@axe-core/cli` não funciona aqui (o chromedriver trava); a acessibilidade
foi medida com o axe embutido no Lighthouse.
