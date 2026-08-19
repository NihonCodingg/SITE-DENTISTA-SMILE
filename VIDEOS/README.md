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

## Contrato para o build (FASE 5/6)

```html
<figure class="depoimento">
  <video
    class="preview"
    poster="/videos/posters/tour-clinica.webp"
    muted loop playsinline preload="none"
    aria-label="Prévia do tour pela clínica">
    <source src="/videos/previews/tour-clinica.mp4" type="video/mp4">
  </video>
  <button class="play" aria-label="Assistir o tour completo">▶</button>
</figure>
```

Regras obrigatórias:
- `preload="none"` — nada baixa antes da hora
- **IntersectionObserver**: ao entrar na viewport, seta o `src` e dá `play()`; ao sair, `pause()`
- **Um por vez**: se vários cards estiverem visíveis, toca só o mais centralizado
- Se `matchMedia('(prefers-reduced-motion: reduce)')` → nunca dá play, fica no poster
- Se `navigator.connection?.saveData` → nunca dá play, fica no poster
- O vídeo completo (`web/completos/`) só carrega no clique, dentro do lightbox
- `muted` + `playsinline` são obrigatórios para autoplay no iOS

## Ganho de conteúdo — o que as legendas revelaram

Das legendas dos quatro posts:
- Sobrenome do dentista é **Aracena** (hashtag `#DrViniciusAracena` nos quatro)
- **Clareamento dental** é oferecido (hashtag `#ClareamentoDental`)
- Assinatura da marca: **"Sorriso com propósito"** (`#sorrisocompropósito`)
- Frase recorrente: *"No coração do Ipiranga, cuidando de toda a região"*
