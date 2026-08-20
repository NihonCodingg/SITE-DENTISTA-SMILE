import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { SorrisosGaleria } from './SorrisosGaleria';

/**
 * Seção "Sorrisos feitos aqui" (Task 13) — o momento de impacto da página:
 * os 9 retratos de pacientes reais (lib/content.ts → SORRISOS) numa galeria
 * com inércia. Primeira seção de fundo escuro do site (`bg-preto`,
 * `--color-preto: #111111`) — por isso `SectionHeading` ganhou a prop
 * `tema="escuro"` (sobretítulo amarelo, título branco) em vez de um
 * componente novo: o resto do padrão (fonte, tracking, gap) é idêntico.
 *
 * Server Component: só o veículo da galeria (WebGL vs. scroller de
 * fallback) depende de `useCapability()` no cliente — isolado em
 * `SorrisosGaleria.tsx`, mesma fronteira mínima que `HeroBackdrop.tsx`
 * (Task 8) já usa para o Silk. O título e o sobretítulo nascem no HTML do
 * servidor nos dois modos — não dependem de JS para existir.
 *
 * A galeria (WebGL ou scroller) fica FORA do container `max-w-[1360px]` do
 * cabeçalho de propósito: as duas variantes usam a largura cheia da seção
 * (sangria até a borda), só o texto do cabeçalho segue a coluna padrão que
 * o resto do site usa.
 */
export function Sorrisos() {
  return (
    <section id="sorrisos" className="bg-preto py-16 md:py-24">
      <div className="mx-auto max-w-[1360px] px-4 md:px-8">
        <Reveal>
          <SectionHeading tema="escuro" sobretitulo="Pacientes reais" titulo="Sorrisos feitos aqui" />
        </Reveal>
      </div>
      <div className="mt-10 md:mt-14">
        <SorrisosGaleria />
      </div>
    </section>
  );
}
