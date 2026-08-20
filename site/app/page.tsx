import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-branco">
        <HeroSection />
        {/* Demais seções chegam nas próximas tasks (8-15) */}
      </main>
      <WhatsAppFab />
    </>
  );
}
