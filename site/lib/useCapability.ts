'use client';
import { useEffect, useState } from 'react';

export type Capacidade = {
  podeAnimar: boolean;
  podePesado: boolean;
  pontoFino: boolean;
  /** Largura de tablet para cima (>= 768px) — o mesmo corte do `md:` do Tailwind. */
  telaLarga: boolean;
  montado: boolean;
};

export function useCapability(): Capacidade {
  const [cap, setCap] = useState<Capacidade>({
    podeAnimar: false,
    podePesado: false,
    pontoFino: false,
    telaLarga: false,
    montado: false,
  });

  useEffect(() => {
    const mqReduzido = matchMedia('(prefers-reduced-motion: reduce)');
    // `pointer: fine` identifica mouse/trackpad (vs. touch). Fica aqui, e não num
    // componente, pela mesma razão do reduced-motion: fonte única de verdade sobre
    // capacidade do aparelho. Componentes como Magnet não podem consultar
    // matchMedia por conta própria.
    const mqPonteiro = matchMedia('(pointer: fine)');
    // Mesma razão das outras duas: quem precisa saber a faixa de tela pergunta
    // aqui, não chama matchMedia por conta própria. 768px é o corte do `md:`
    // do Tailwind — o Hero usa isso para decidir se a abertura com scroll
    // acontece (ela exige o hero cabendo numa tela, o que só vale de tablet
    // para cima).
    const mqLarga = matchMedia('(min-width: 768px)');

    const avaliar = () => {
      const podeAnimar = !mqReduzido.matches;
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      const economia = nav.connection?.saveData === true;
      const memoria = nav.deviceMemory ?? 8;
      const nucleos = nav.hardwareConcurrency ?? 8;
      setCap({
        podeAnimar,
        podePesado: podeAnimar && !economia && memoria >= 4 && nucleos >= 4,
        pontoFino: mqPonteiro.matches,
        telaLarga: mqLarga.matches,
        montado: true,
      });
    };

    avaliar();
    mqReduzido.addEventListener('change', avaliar);
    mqPonteiro.addEventListener('change', avaliar);
    mqLarga.addEventListener('change', avaliar);
    return () => {
      mqReduzido.removeEventListener('change', avaliar);
      mqPonteiro.removeEventListener('change', avaliar);
      mqLarga.removeEventListener('change', avaliar);
    };
  }, []);

  return cap;
}
