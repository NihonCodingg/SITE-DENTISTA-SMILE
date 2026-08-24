### Task 2: Pipeline de assets

**Files:**
- Create: `scripts/preparar-assets.mjs`
- Create: `site/public/img/*`, `site/public/videos/*`
- Create: `site/__tests__/assets.test.ts`

**Interfaces:**
- Produces: arquivos em `public/img/` com os nomes usados pelo design (`hero-foto.jpg`, `clinica-interior.png`, `fachada.jpg`, `dr-vinicius.jpg`, `retrato-1..10.jpg`, `hero-paciente.jpg`, `antes-depois-1..5`, `trat-*.jpg`, `logo.png`, `logo-branco.png`, `sorriso-arco.png`) e em `public/videos/` (previews, posters, completos)

- [ ] **Step 1: Copiar os vídeos já processados**

```bash
cd "D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA"
mkdir -p site/public/videos
cp -r VIDEOS/web/previews site/public/videos/
cp -r VIDEOS/web/posters  site/public/videos/
cp -r VIDEOS/web/completos site/public/videos/
```

- [ ] **Step 2: Processar o vídeo da recepção**

O reel `Cy1Yw5iOXfz` (recepção) ainda está só em `VIDEOS/originais/`. Gerar preview, poster e completo no mesmo padrão dos outros quatro, **conferindo antes se há cena de procedimento** (ver `VIDEOS/README.md`).

```bash
FF="/c/Users/Pichau/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffmpeg"
cd "D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA/VIDEOS"
# inspecionar frames antes de escolher o trecho
"$FF" -nostdin -v error -ss 2 -i originais/Cy1Yw5iOXfz.mp4 -frames:v 1 -vf scale=240:-1 -y /tmp/recep_a.jpg
```

Repetir a extração de frame em 2s, 5s, 8s, 12s e 16s, olhar cada um, e escolher um trecho de 5s
que mostre a recepção **sem nenhuma cena de procedimento**. Substituir `INICIO` e `DURACAO` pelos
valores escolhidos (`DURACAO` = 5.0 salvo se o trecho limpo for mais curto):

```bash
"$FF" -nostdin -v error -ss INICIO -t DURACAO -i originais/Cy1Yw5iOXfz.mp4 -an \
  -vf "scale=432:-2,fps=20" -c:v libx264 -crf 32 -preset veryslow -profile:v main \
  -pix_fmt yuv420p -movflags +faststart -y web/previews/recepcao.mp4
"$FF" -nostdin -v error -ss INICIO -i originais/Cy1Yw5iOXfz.mp4 -frames:v 1 \
  -vf "scale=720:-2" -c:v libwebp -quality 78 -y web/posters/recepcao.webp
"$FF" -nostdin -v error -i originais/Cy1Yw5iOXfz.mp4 -vf "scale=720:-2" \
  -c:v libx264 -crf 27 -preset slow -profile:v main -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 1 -movflags +faststart -y web/completos/recepcao.mp4
```

Verificar: `ls -la web/previews/recepcao.mp4` deve ficar abaixo de 250 KB.

- [ ] **Step 3: Escrever o script de imagens**

Criar `scripts/preparar-assets.mjs`. Ele lê os originais, recorta e gera as versões que o design referencia. Instalar `sharp` primeiro:

```bash
cd "D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA" && npm i -D sharp
```

```js
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'IMAGENS DO INSTAGRAM';
const OUT = 'site/public/img';

// [origem, destino, largura alvo]
const MAPA = [
  ['Gemini_Generated_Image_j80nk9j80nk9j80n.jpg', 'hero-foto.jpg', 1200],
  ['ChatGPT Image 19 de ago. de 2026, 16_27_05.png', 'clinica-interior.png', 1200],
  ['569880150_17995144052845208_3540625868543828159_n.jpg', 'fachada.jpg', 1600],
  ['Gemini_Generated_Image_x8t572x8t572x8t5.jpg', 'antes-depois-1.jpg', 1200],
  ['Gemini_Generated_Image_u8rmi4u8rmi4u8rm.jpg', 'antes-depois-2.jpg', 1200],
  ['WhatsApp Image 2026-08-19 at 16.28.19.jpeg', 'antes-depois-3.jpg', 1200],
  ['WhatsApp Image 2026-08-19 at 16.28.32.jpeg', 'antes-depois-4.jpg', 1200],
  ['WhatsApp Image 2026-08-19 at 16.28.44.jpeg', 'antes-depois-5.jpg', 1200],
  ['WhatsApp Image 2026-08-19 at 16.28.07.jpeg', 'retrato-1.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.28.12.jpeg', 'retrato-2.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.28.27.jpeg', 'retrato-3.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.28.38.jpeg', 'retrato-4.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.29.05.jpeg', 'retrato-5.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.29.13.jpeg', 'retrato-6.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.29.24.jpeg', 'retrato-7.jpg', 900],
  ['WhatsApp Image 2026-08-19 at 16.29.33.jpeg', 'retrato-8.jpg', 900],
  ['extraidas/dr-vinicius-26.0s.jpg', 'dr-vinicius.jpg', 900],
];

await mkdir(OUT, { recursive: true });
for (const [de, para, largura] of MAPA) {
  const destino = path.join(OUT, para);
  const pipe = sharp(path.join(SRC, de)).resize({ width: largura, withoutEnlargement: true });
  if (para.endsWith('.png')) await pipe.png({ quality: 88, compressionLevel: 9 }).toFile(destino);
  else await pipe.jpeg({ quality: 84, mozjpeg: true }).toFile(destino);
  console.log('ok', para);
}
```

- [ ] **Step 4: Rodar o script**

Run: `cd "D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA" && node scripts/preparar-assets.mjs`
Expected: uma linha `ok <arquivo>` por entrada, sem erro

- [ ] **Step 5: Obter os três assets de marca que só existem no Claude Design**

`logo.png`, `logo-branco.png` e `sorriso-arco.png` foram derivados pelo Claude Design (logo recortado com fundo transparente e o arco isolado). Não existem localmente.

Baixar do projeto do Claude Design pela interface (botão de export/download em cada asset) e salvar em `site/public/img/`.

Verificar: `ls site/public/img/logo.png site/public/img/logo-branco.png site/public/img/sorriso-arco.png` — os três devem existir e `logo.png` precisa ter canal alfa.

Se não for possível exportar, gerar localmente a partir de `IMAGENS DO INSTAGRAM/766322335_....jpg` recortando o logo e removendo o fundo branco — mas prefira o export, que já está limpo.

- [ ] **Step 6: Escrever o teste de presença e orçamento**

Criar `site/__tests__/assets.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { statSync, existsSync } from 'node:fs';

const IMGS = [
  'hero-foto.jpg','clinica-interior.png','fachada.jpg','dr-vinicius.jpg',
  'logo.png','logo-branco.png','sorriso-arco.png',
  'retrato-1.jpg','retrato-2.jpg','retrato-3.jpg','retrato-4.jpg',
  'retrato-5.jpg','retrato-6.jpg','retrato-7.jpg','retrato-8.jpg',
  'antes-depois-1.jpg','antes-depois-2.jpg','antes-depois-3.jpg',
  'antes-depois-4.jpg','antes-depois-5.jpg',
];
const PREVIEWS = ['tour-clinica','caso-protese','facetas-resina','facetas-transformacao','recepcao'];

describe('assets', () => {
  it.each(IMGS)('a imagem %s existe', (nome) => {
    expect(existsSync(`public/img/${nome}`)).toBe(true);
  });

  it.each(PREVIEWS)('o preview %s existe e cabe no orçamento', (nome) => {
    const p = `public/videos/previews/${nome}.mp4`;
    expect(existsSync(p)).toBe(true);
    expect(statSync(p).size).toBeLessThan(260 * 1024);
  });

  it('o conjunto de previews soma menos de 1MB', () => {
    const total = PREVIEWS.reduce((s, n) => s + statSync(`public/videos/previews/${n}.mp4`).size, 0);
    expect(total).toBeLessThan(1024 * 1024);
  });
});
```

- [ ] **Step 7: Rodar o teste**

Run: `cd site && npm test -- assets`
Expected: PASS em todos

- [ ] **Step 8: Commit**

```bash
cd site && git add -A && git commit -m "feat: pipeline de assets, imagens e vídeos otimizados"
```

---

