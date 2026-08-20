'use client';

import { Hero } from './Hero';

// O Lightbox real (Task 11) é quem vai consumir o slug clicado no card de
// vídeo do Hero. Até lá não há para onde abrir — placeholder documentado,
// não um esquecimento.
//
// Este wrapper existe só para carregar a fronteira 'use client'. React
// Server Components não aceitam passar uma função como prop para um Client
// Component (não é serializável através da fronteira RSC, mesmo sendo uma
// função pura em module scope — confirmado batendo em "Event handlers
// cannot be passed to Client Component props" no `next build`). Em vez de
// subir `app/page.tsx` inteiro para o lado client por causa disso, a
// fronteira desce só até aqui: é o padrão idiomático (empurrar 'use client'
// o mais fundo possível na árvore) e mantém `page.tsx` como Server
// Component, livre para exportar `metadata`/`generateMetadata` quando a
// Task 16 (SEO local) chegar.
function onAbrirVideo() {}

export function HeroSection() {
  return <Hero onAbrirVideo={onAbrirVideo} />;
}
