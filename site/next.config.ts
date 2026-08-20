import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Há um package-lock.json na raiz do repositório (fora de site/), então o
    // Turbopack infere a raiz errada e detecta múltiplos lockfiles. Fixamos
    // explicitamente em site/ para o aviso sumir.
    root: __dirname,
  },
};

export default nextConfig;
