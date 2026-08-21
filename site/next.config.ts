import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Há um package-lock.json na raiz do repositório (fora de site/), então o
    // Turbopack infere a raiz errada e detecta múltiplos lockfiles. Fixamos
    // explicitamente em site/ para o aviso sumir.
    root: __dirname,
  },
  images: {
    // Task 17 (H1): default do Next é só `['image/webp']`. `curl -H "Accept:
    // image/avif" .../_next/image?...` contra o build anterior devolvia
    // `image/webp` — confirma que AVIF nunca era servido. AVIF na frente,
    // WebP como fallback (ordem importa — Next usa o primeiro match do
    // Accept header, doc: node_modules/next/dist/docs/01-app/03-api-reference/
    // 02-components/image.md#formats). Medido em task-17-report.md.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
