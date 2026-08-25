'use client';

import { useSyncExternalStore } from 'react';

/**
 * "A tela é larga?" — o mesmo corte de 768px que o Tailwind chama de `md`.
 *
 * Existe porque várias seções precisam de MEDIDAS diferentes por faixa de
 * tela, não só de classes diferentes: o `DepthCarousel`, o `OptionWheel`, a
 * `AccordionGallery` e o `TextLoop` recebem pixels em prop, e pixel em prop
 * não atende media query. Antes desta função, quatro arquivos tinham cada um
 * a sua cópia do mesmo `useEffect` com `window.innerWidth` e um listener de
 * `resize` — quatro listeners para uma pergunta só, e quatro lugares para o
 * número 768 divergir.
 *
 * Por que `useSyncExternalStore` e não `useState` + `useEffect`: assim existe
 * UM listener de `resize` no módulo inteiro, não um por componente montado. É
 * também o padrão que `lib/motion.tsx` já usa para o Lenis, pela mesma razão
 * (fonte externa ao React, lida sem setState dentro de efeito — o que a regra
 * `set-state-in-effect` do eslint deste Next reprova).
 *
 * O valor no servidor é `false`: sem janela para medir, o primeiro HTML é o de
 * celular. É a escolha certa por dois motivos — é a faixa em que o site precisa
 * ser mais leve, e é a que erra menos se a hidratação demorar.
 *
 * `matchMedia` continua fora: quem responde por `prefers-reduced-motion`,
 * `pointer` e economia de dados é `useCapability()`, fonte única, e esta função
 * não invade esse território.
 */
export const LARGURA_TELA_LARGA = 768;

const ouvintes = new Set<() => void>();
let larga = false;
let ligado = false;

function avaliar() {
  const atual = window.innerWidth >= LARGURA_TELA_LARGA;
  if (atual === larga) return;
  larga = atual;
  ouvintes.forEach((l) => l());
}

function assinar(onChange: () => void) {
  ouvintes.add(onChange);
  if (!ligado) {
    ligado = true;
    larga = window.innerWidth >= LARGURA_TELA_LARGA;
    window.addEventListener('resize', avaliar);
  }
  return () => {
    ouvintes.delete(onChange);
    if (ouvintes.size === 0) {
      window.removeEventListener('resize', avaliar);
      ligado = false;
    }
  };
}

export function useTelaLarga(): boolean {
  return useSyncExternalStore(
    assinar,
    () => larga,
    () => false
  );
}
