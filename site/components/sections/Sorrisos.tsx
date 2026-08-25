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
          <SectionHeading
            flutuar
            tema="escuro"
            sobretitulo="Pacientes reais"
            titulo="Sorrisos feitos aqui"
            tituloClassName="text-[clamp(28px,4.5vw,52px)]"
          />
        </Reveal>
      </div>
      <div className="mt-10 md:mt-14">
        <SorrisosGaleria />
      </div>
      {/* Dica de uso (pedido do dono do projeto): a galeria arrasta, mas nada
          na tela dizia isso. Rótulo de interface sobre o fundo preto — a cor
          é a mesma do texto secundário do rodapé, que já passou AA aqui. */}
      {/* `px-4`: a galeria sangra até a borda, mas o texto não pode — sem o
          padding esta linha media 375px numa tela de 375 e encostava nos dois
          lados (medido). O `mx-auto max-w-` mantém a linha curta em tela
          larga. */}
      <p className="mx-auto mt-6 max-w-[46ch] px-4 text-center font-rotulo text-[13px] tracking-[.12em] text-escuro-texto uppercase">
        Arraste para o lado para ver mais sorrisos
      </p>
    </section>
  );
}
