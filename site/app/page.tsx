import { Header } from '@/components/layout/Header';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-branco">{/* Seções chegam nas próximas tasks (7-15) */}</main>
      <WhatsAppFab />
    </>
  );
}
