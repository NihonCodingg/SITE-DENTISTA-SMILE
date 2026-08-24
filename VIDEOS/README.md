# VÍDEOS — acervo e contrato de implementação

## Estrutura

```
VIDEOS/
  originais/   arquivos como vieram do Instagram (não usar no site)
  web/
    previews/  loops mudos ~5s  → o que roda no card
    posters/   frame estático   → o que aparece antes do vídeo carregar
    completos/ vídeo com áudio  → o que abre no lightbox ao clicar
```

## Os quatro vídeos

| Slug | Conteúdo | Original | Preview | Poster | Completo |
|---|---|---|---|---|---|
| `tour-clinica` | **Tour da clínica.** Caminha pela rua no Ipiranga, chega na fachada, entra, mostra recepção e parede verde | 38s · 1080×1920 · 18,3MB | **190 KB** | 42 KB webp | 7,3 MB |
| `caso-protese` | Caso de prótese antiga → sorriso novo. Dr. Vinicius de jaleco branco explicando | 45s · 720×1280 · 6,0MB | **208 KB** | 41 KB webp | 4,9 MB |
| `facetas-resina` | Facetas em resina, macro do sorriso, paciente masculino | 9s · 720×1280 · 1,3MB | **165 KB** | 33 KB webp | 1,0 MB |
| `facetas-transformacao` | Facetas em resina, transformação de paciente feminina | 9s · 720×1280 · 754KB | **99 KB** | 27 KB webp | 599 KB |

**Total dos previews: 676 KB** — e nenhum deles carrega antes de entrar na viewport.

## ⚠️ Trechos de procedimento — evitar

A Resolução CFO-196/2019 proíbe divulgar imagem do **procedimento em andamento**.
Dois vídeos contêm cena com afastador bucal:

- `caso-protese` — por volta de **16s**
- `facetas-transformacao` — por volta de **3s**

**As prévias já foram cortadas fora desses trechos.** Mas os arquivos de `web/completos/`
ainda contêm as cenas. Antes de publicar, decidir uma das opções:
1. Cortar o trecho do vídeo completo, ou
2. Não usar esses dois no lightbox, deixando só a prévia, ou
3. Confirmar com o cliente / assessoria jurídica se o enquadramento se aplica

`tour-clinica` e `facetas-resina` estão limpos.

## Como os previews foram gerados

- Recorte de ~5s escolhido manualmente, evitando cena de procedimento
- `scale=480:-2` (432 no tour, que tem câmera em movimento), `fps=24` (20 no tour)
- `libx264 -crf 31 -preset slow -profile:v main -pix_fmt yuv420p -movflags +faststart`
- `-an` — **sem faixa de áudio**, o que também garante autoplay em qualquer navegador

**Sem WebM.** VP9 foi testado e perdeu: 500 KB contra 295 KB do H.264 no tour. Em clipes
curtos o VP9 não amortiza o overhead. H.264 é universal, então um arquivo só por preview.

## Contrato para o build — ATUALIZADO EM 24/08

**O site não hospeda vídeo.** Cada card mostra o pôster e o clique abre o reel no Instagram
da clínica, em aba nova. Foi o que o design aprovado desenhou e o que o dono do projeto pediu;
até 24/08 o site carregava prévias `.mp4` e servia os vídeos completos num lightbox.

```tsx
<VideoCard slug="tour-clinica" titulo="Tour pela clínica" legenda="…" reel={REEL_TOUR} />
```

- `site/public/videos/posters/<slug>.webp` é o único arquivo de vídeo que sobrou no repositório.
  `previews/` e `completos/` foram removidos (17 MB).
- As URLs vivem em `site/lib/content.ts`: `reel` em cada item de `DEPOIMENTOS`, mais
  `REEL_TOUR` e `REEL_RECEPCAO`.
- `target="_blank"` + `rel="noopener noreferrer"`.

| Slug | Reel |
|---|---|
| `tour-clinica` | https://www.instagram.com/reel/DQUVleFju0U/ |
| `recepcao` | https://www.instagram.com/reel/Cy1Yw5iOXfz/ |
| `caso-protese` | https://www.instagram.com/reel/DQxpqgejgst/ |
| `facetas-resina` | https://www.instagram.com/reel/DRPmt1UjlUH/ |
| `facetas-transformacao` | https://www.instagram.com/reel/DRXSyLJDkhA/ |

Os originais e as prévias geradas continuam em `VIDEOS/` (fora do site, `originais/` é
gitignored), caso um dia se decida hospedar de novo.

### O que isso muda nos bloqueios de publicação

O trecho de procedimento (CFO-196/2019) em `caso-protese` e `facetas-transformacao` **deixa de
ser servido pelo site** — quem assiste vê o post no Instagram, publicado pela própria clínica.
Isso tira o site da equação, mas **não resolve o conteúdo**: o post segue no ar, publicado pela
clínica, e a mesma avaliação continua valendo para ele. Levar ao cliente, não dar por encerrado.
A marca d'água do CapCut na recepção segue pelo mesmo raciocínio.

## Ganho de conteúdo — o que as legendas revelaram

Das legendas dos quatro posts:
- Sobrenome do dentista é **Aracena** (hashtag `#DrViniciusAracena` nos quatro)
- **Clareamento dental** é oferecido (hashtag `#ClareamentoDental`)
- Assinatura da marca: **"Sorriso com propósito"** (`#sorrisocompropósito`)
- Frase recorrente: *"No coração do Ipiranga, cuidando de toda a região"*
