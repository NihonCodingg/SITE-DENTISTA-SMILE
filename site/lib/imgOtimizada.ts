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
 * `largura` deve ser um valor de `deviceSizes`/`imageSizes` (config padrão:
 * 640, 750, 828, 1080…) — outros valores também funcionam (o otimizador
 * arredonda pro próximo permitido), mas usar um valor exato evita esse
 * arredondamento silencioso.
 */
export function urlImagemOtimizada(src: string, largura: number, qualidade = 75): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${largura}&q=${qualidade}`;
}
