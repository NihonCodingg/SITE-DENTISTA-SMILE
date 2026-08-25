import { describe, it, expect } from 'vitest';
import { urlImagemOtimizada } from '@/lib/imgOtimizada';

/**
 * Regressão da revisão de entrega. O otimizador do Next (`/_next/image`) só
 * aceita larguras que estejam em `deviceSizes`/`imageSizes`; qualquer outro
 * valor responde **400 Bad Request**, e a imagem simplesmente não aparece.
 *
 * O comentário de `lib/imgOtimizada.ts` afirmava o contrário ("o otimizador
 * arredonda pro próximo permitido") e isso quase entregou um hero com os 92
 * azulejos da parede de fotos invisíveis: a largura pedida era 300, que não
 * está na lista. Conferido no servidor de produção: w=256 → 200, w=300 → 400,
 * w=384 → 200.
 *
 * Agora quem arredonda é a própria função. Estes testes travam isso.
 */
const PERMITIDAS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

function larguraDaUrl(url: string): number {
  return Number(new URLSearchParams(url.split('?')[1]).get('w'));
}

describe('urlImagemOtimizada', () => {
  it('nunca emite uma largura que o otimizador recusa', () => {
    for (let pedida = 1; pedida <= 4000; pedida += 7) {
      const emitida = larguraDaUrl(urlImagemOtimizada('/img/x.jpg', pedida));
      expect(PERMITIDAS).toContain(emitida);
    }
  });

  it('arredonda para CIMA — nunca serve uma imagem menor do que a pedida', () => {
    for (const pedida of [100, 300, 500, 700, 900, 1500]) {
      const emitida = larguraDaUrl(urlImagemOtimizada('/img/x.jpg', pedida));
      expect(emitida).toBeGreaterThanOrEqual(pedida);
    }
  });

  it('mantém a largura quando ela já é permitida', () => {
    for (const w of PERMITIDAS) {
      expect(larguraDaUrl(urlImagemOtimizada('/img/x.jpg', w))).toBe(w);
    }
  });

  it('não estoura acima do maior valor da lista', () => {
    expect(larguraDaUrl(urlImagemOtimizada('/img/x.jpg', 99999))).toBe(3840);
  });

  it('codifica o caminho e leva a qualidade', () => {
    const url = urlImagemOtimizada('/img/foto com espaço.jpg', 640, 60);
    expect(url).toContain('url=%2Fimg%2Ffoto%20com%20espa%C3%A7o.jpg');
    expect(url).toContain('q=60');
  });
});
