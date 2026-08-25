'use client';
import { useEffect, useState } from 'react';

export type Capacidade = {
  podeAnimar: boolean;
  /**
   * O APARELHO e a REDE aguentam trabalho pesado. Não leva a preferência de
   * movimento em conta de propósito — são dois eixos diferentes, e confundir
   * os dois foi um bug real: quem liga "reduzir movimento" perdia o fundo
   * dourado da marca no hero (uma TEXTURA, não uma animação), porque ele
   * estava atrás de `podePesado`. Use este para conteúdo pesado que pode ser
   * exibido PARADO; use `podePesado` para o que só existe se animar.
   */
  aguentaPeso: boolean;
  podePesado: boolean;
  pontoFino: boolean;
  montado: boolean;
};

export function useCapability(): Capacidade {
  const [cap, setCap] = useState<Capacidade>({
    podeAnimar: false,
    aguentaPeso: false,
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
      const aguentaPeso = !economia && memoria >= 4 && nucleos >= 4;
      setCap({
        podeAnimar,
        aguentaPeso,
        podePesado: podeAnimar && aguentaPeso,
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
