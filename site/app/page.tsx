import { Header } from '@/components/layout/Header';
import { PaginaComVideo } from '@/components/sections/PaginaComVideo';
import { Ticker } from '@/components/sections/Ticker';
import { Pilares } from '@/components/sections/Pilares';
import { Tratamentos } from '@/components/sections/Tratamentos';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-branco">
        {/* Hero, Clínica e Depoimentos precisam do mesmo estado "qual vídeo
            está aberto" e de um único <Lightbox> — PaginaComVideo é a
            fronteira 'use client' que segura isso (Task 12), recebendo
            Ticker/Pilares/Tratamentos (Server Components, sem estado de
            vídeo) já prontos por prop para manter a ordem certa da página
            sem importar um módulo server dentro de um arquivo client. */}
        <PaginaComVideo ticker={<Ticker />} pilares={<Pilares />} tratamentos={<Tratamentos />} />
        {/* A ordem final da página tem Sorrisos e Profissional entre Clínica
            e Depoimentos — essas duas seções ainda não existem, então
            Depoimentos fica logo após Clínica por enquanto (brief da Task
            12). Demais seções chegam nas Tasks 13-15. */}
      </main>
      <WhatsAppFab />
    </>
  );
}
