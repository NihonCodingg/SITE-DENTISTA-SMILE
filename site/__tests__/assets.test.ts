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
