import { describe, it, expect } from 'vitest';
import { statSync, existsSync } from 'node:fs';

const IMGS = [
  'hero-foto.jpg','clinica-interior.jpg','fachada.jpg','dr-vinicius.jpg',
  'logo.png','logo-branco.png','sorriso-arco.png',
  'retrato-1.jpg','retrato-2.jpg','retrato-3.jpg','retrato-4.jpg',
  'retrato-5.jpg','retrato-6.jpg','retrato-7.jpg','retrato-8.jpg','retrato-9.jpg',
  'antes-depois-1.jpg','antes-depois-2.jpg','antes-depois-3.jpg',
  'antes-depois-4.jpg','antes-depois-5.jpg',
  'trat-facetas.webp','trat-implantes.jpg','trat-protocolo.jpg',
  'trat-proteses.jpg','trat-ortodontia.jpg','trat-limpeza.jpg',
  'trat-clareamento.jpg',
];
// O site não hospeda vídeo desde 24/08 (ver components/ui/VideoCard.tsx): o
// que sobrou de `public/videos/` são os pôsteres, que são o que o card mostra.
const POSTERS = ['tour-clinica','caso-protese','facetas-resina','facetas-transformacao','recepcao'];

describe('assets', () => {
  it.each(IMGS)('a imagem %s existe', (nome) => {
    expect(existsSync(`public/img/${nome}`)).toBe(true);
  });

  it.each(POSTERS)('o pôster %s existe e cabe no orçamento', (nome) => {
    const p = `public/videos/posters/${nome}.webp`;
    expect(existsSync(p)).toBe(true);
    expect(statSync(p).size).toBeLessThan(120 * 1024);
  });

  it('nao sobrou nenhum video hospedado no repositorio', () => {
    expect(existsSync('public/videos/previews')).toBe(false);
    expect(existsSync('public/videos/completos')).toBe(false);
  });
});
