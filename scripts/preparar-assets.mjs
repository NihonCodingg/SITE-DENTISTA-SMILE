import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'IMAGENS DO INSTAGRAM';
const OUT = 'site/public/img';

// [origem, destino, largura alvo, qualidade jpeg opcional (padrão 84)]
const MAPA = [
  ['Gemini_Generated_Image_j80nk9j80nk9j80n.jpg', 'hero-foto.jpg', 1200],
  // foto de tom contínuo (sem transparência): JPEG, não PNG -- PNG aciona
  // quantização por paleta no sharp e degrada a cor sem ganho nenhum aqui.
  // quality 88 (não o padrão 84) porque é uma foto de interior com bastante
  // gradiente/luz, mais sensível a banding do que os retratos e antes/depois.
  ['ChatGPT Image 19 de ago. de 2026, 16_27_05.png', 'clinica-interior.jpg', 1200, 88],
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
  ['extraidas/dr-vinicius-40.3s.jpg', 'dr-vinicius.jpg', 900],
];

await mkdir(OUT, { recursive: true });
for (const [de, para, largura, qualidade = 84] of MAPA) {
  const destino = path.join(OUT, para);
  const pipe = sharp(path.join(SRC, de)).resize({ width: largura, withoutEnlargement: true });
  if (para.endsWith('.png')) await pipe.png({ quality: 88, compressionLevel: 9 }).toFile(destino);
  else await pipe.jpeg({ quality: qualidade, mozjpeg: true }).toFile(destino);
  console.log('ok', para);
}
