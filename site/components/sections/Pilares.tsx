import { PILARES } from '@/lib/content';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Faixa dos 4 pilares, logo abaixo do Ticker (Task 9). Puro Server
 * Component: o único elemento client-side é o próprio <Reveal> (Task 5),
 * que já carrega 'use client' internamente — nada aqui precisa da
 * fronteira.
 *
 * `delay={i * 0.08}` é o próprio valor do brief: 80ms de passo, exatamente
 * o teto da janela de 30-80ms que design-guidance.md pede para stagger. Só
 * 4 itens, então nenhum limite de cascata é necessário aqui (esse cuidado é
 * da Tratamentos, com 7 linhas).
 */
export function Pilares() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 py-14 md:px-8 md:py-20">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-[28px]">
        {PILARES.map((p, i) => (
          <Reveal
            key={p.titulo}
            delay={i * 0.08}
            className="flex flex-col gap-2 border-t-[3px] border-amarelo pt-5"
          >
            <h3 className="font-titulo text-[17px] text-preto">{p.titulo}</h3>
            <p className="font-corpo text-[16px] text-grafite">{p.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
