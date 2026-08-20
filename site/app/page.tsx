import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { Ticker } from '@/components/sections/Ticker';
import { Pilares } from '@/components/sections/Pilares';
import { Tratamentos } from '@/components/sections/Tratamentos';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-branco">
        <HeroSection />
        <Ticker />
        <Pilares />
        <Tratamentos />
        {/* Demais seções chegam nas próximas tasks (11-15) */}
      </main>
      <WhatsAppFab />
    </>
  );
}
