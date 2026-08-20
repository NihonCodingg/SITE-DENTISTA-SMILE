'use client';
import { useEffect, useState } from 'react';

export type Capacidade = { podeAnimar: boolean; podePesado: boolean; montado: boolean };

export function useCapability(): Capacidade {
  const [cap, setCap] = useState<Capacidade>({ podeAnimar: false, podePesado: false, montado: false });

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');

    const avaliar = () => {
      const podeAnimar = !mq.matches;
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      const economia = nav.connection?.saveData === true;
      const memoria = nav.deviceMemory ?? 8;
      const nucleos = nav.hardwareConcurrency ?? 8;
      setCap({
        podeAnimar,
        podePesado: podeAnimar && !economia && memoria >= 4 && nucleos >= 4,
        montado: true,
      });
    };

    avaliar();
    mq.addEventListener('change', avaliar);
    return () => mq.removeEventListener('change', avaliar);
  }, []);

  return cap;
}
