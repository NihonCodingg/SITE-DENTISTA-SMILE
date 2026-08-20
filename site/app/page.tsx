'use client';

import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/sections/Hero';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';

// O Lightbox real (Task 11) é quem vai consumir o slug clicado no card de
// vídeo do Hero. Até lá não há para onde abrir — placeholder documentado,
// não um esquecimento.
//
// `page.tsx` virou Client Component por causa disso: React Server
// Components não aceitam passar uma função como prop para um Client
// Component (não é serializável através da fronteira RSC, mesmo sendo uma
// função pura definida em module scope — confirmado batendo em "Event
// handlers cannot be passed to Client Component props" no `next build`).
// Como o Hero precisa de um `onClick` de verdade, `page.tsx` precisa estar
// do lado client para poder entregar essa função. Isso já era o destino
// planejado: a Task 12 do plano descreve exatamente isso ("manter o estado
// videoAberto: string | null... em app/page.tsx") quando o Lightbox chegar.
function onAbrirVideo() {}

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-branco">
        <Hero onAbrirVideo={onAbrirVideo} />
        {/* Demais seções chegam nas próximas tasks (8-15) */}
      </main>
      <WhatsAppFab />
    </>
  );
}
