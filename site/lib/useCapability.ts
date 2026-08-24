'use client';
import { useEffect, useState } from 'react';

export type Capacidade = {
  podeAnimar: boolean;
  podePesado: boolean;
  pontoFino: boolean;
  montado: boolean;
};

export function useCapability(): Capacidade {
  const [cap, setCap] = useState<Capacidade>({
    podeAnimar: false,
    podePesado: false,
    pontoFino: false,
    montado: false,
  });

  useEffect(() => {
    const mqReduzido = matchMedia('(prefers-reduced-motion: reduce)');
    // `pointer: fine` identifica mouse/trackpad (vs. touch). Fica aqui, e não num
    // componente, pela mesma razão do reduced-motion: fonte única de verdade sobre
    // capacidade do aparelho. Componentes como Magnet não podem consultar
    // matchMedia por conta própria.
    const mqPonteiro = matchMedia('(pointer: fine)');

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
        montado: true,
      });
    };

    avaliar();
    mqReduzido.addEventListener('change', avaliar);
    mqPonteiro.addEventListener('change', avaliar);
    return () => {
      mqReduzido.removeEventListener('change', avaliar);
      mqPonteiro.removeEventListener('change', avaliar);
    };
  }, []);

  return cap;
}
