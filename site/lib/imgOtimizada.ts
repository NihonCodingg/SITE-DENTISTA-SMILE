/**
 * Constrói a URL do otimizador de imagem embutido do Next (`/_next/image`)
 * na mão, pra quem carrega textura fora do `next/image` — hoje só o
 * `CircularGallery` (React Bits, `ogl`), que faz `new Image(); img.src = ...`
 * direto (ver components/reactbits/CircularGallery.tsx) porque WebGL precisa
 * de um `HTMLImageElement` cru, não do componente `<Image>`.
 *
 * Medido (task-17-report.md): sem isso, cada retrato da galeria baixava o
 * JPEG original inteiro (700–950px, 70–240KB cada, 9 fotos) — o maior item
 * isolado do `total-byte-weight` da rota inteira. `/_next/image` é a rota
 * pública que o próprio `next/image` gera para todo `src`/`srcset`; os
 * parâmetros `url`/`w`/`q` são o contrato documentado do otimizador
 * (node_modules/next/dist/docs/.../image.md), não um detalhe interno.
 *
 * ⚠️ `largura` PRECISA ser um valor de `deviceSizes`/`imageSizes`. O
 * comentário aqui dizia que "outros valores também funcionam, o otimizador
 * arredonda pro próximo permitido" — **é falso**, e custou um hero sem parede
 * de fotos: `/_next/image?...&w=300` responde **400 Bad Request**, e os 92
 * azulejos ficaram invisíveis. Conferido contra o servidor de produção:
 * w=256 → 200, w=300 → 400, w=384 → 200.
 *
 * Por isso a função agora ARREDONDA ela mesma, para cima, até o próximo valor
 * permitido — quem chama passa a largura que precisa e não precisa decorar a
 * lista.
 */
const LARGURAS_PERMITIDAS = [
  // `imageSizes` e `deviceSizes` padrão do Next (image-config), em ordem.
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
] as const;

export function urlImagemOtimizada(src: string, largura: number, qualidade = 75): string {
  const permitida = LARGURAS_PERMITIDAS.find((l) => l >= largura) ?? LARGURAS_PERMITIDAS[LARGURAS_PERMITIDAS.length - 1];
  return `/_next/image?url=${encodeURIComponent(src)}&w=${permitida}&q=${qualidade}`;
}
