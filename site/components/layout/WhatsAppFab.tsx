'use client';

import { useEffect, useRef, useState } from 'react';
import { waLink } from '@/lib/contact';
import { useCapability } from '@/lib/useCapability';

/**
 * O FAB só aparece depois que a pessoa rolou cerca de uma viewport de altura —
 * uma aproximação de "o hero saiu de tela" que não depende do Hero existir
 * (esta task roda antes da Task 7, que cria o Hero). Um sentinel invisível de
 * 1x1px, posicionado a `100vh` do topo do documento, é observado via
 * IntersectionObserver: enquanto ele ainda não foi ultrapassado o CTA do hero
 * está por perto e o FAB não compete com ele; assim que some por cima da
 * viewport, o FAB entra.
 *
 * A entrada é de mão única (uma vez visível, continua visível mesmo se a
 * pessoa rolar de volta ao topo) — decisão deliberada, não uma sobra de
 * implementação: um FAB que soma e some toda vez que o scroll cruza a borda
 * do hero é o tipo de movimento nervoso que o guia de craft pede para evitar.
 */
export function WhatsAppFab() {
  const { podeAnimar, montado } = useCapability();
  const [visivel, setVisivel] = useState(false);
  const sentinelaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!montado) return;
    if (typeof IntersectionObserver === 'undefined') return; // ambiente sem suporte (ex.: teste)

    const sentinela = sentinelaRef.current;
    if (!sentinela) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) return; // sentinel ainda em tela: hero por perto, não mexe
        if (entrada.boundingClientRect.top >= 0) return; // sentinel abaixo da viewport: ainda não chegou lá
        setVisivel(true);
        observer.disconnect(); // decisão de mão única — ver nota acima
      },
      { threshold: 0 }
    );
    observer.observe(sentinela);
    return () => observer.disconnect();
  }, [montado]);

  return (
    <>
      {/* Sentinel invisível: 1 viewport de altura a partir do topo do documento */}
      <div ref={sentinelaRef} aria-hidden="true" style={{ position: 'absolute', top: '100vh', left: 0, width: 1, height: 1 }} />

      <div
        className={
          'fixed right-4 bottom-4 z-[60] transition-[transform,opacity] duration-[280ms] ease-saida ' +
          (visivel ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 ' + (podeAnimar ? 'scale-95' : 'scale-100'))
        }
      >
        <a
          href={waLink('Olá! Vim pelo site e quero falar sobre um tratamento.')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp"
          tabIndex={visivel ? 0 : -1}
          className="pressable flex h-[58px] w-[58px] items-center justify-center rounded-full bg-amarelo text-preto shadow-[0_12px_30px_rgba(17,17,17,0.28)] pointer-fine:hover:brightness-95"
        >
          <WhatsAppIcon />
        </a>
      </div>
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.02 3C9.4 3 4 8.36 4 14.94c0 2.18.59 4.22 1.61 5.98L4 29l8.28-2.17a12.9 12.9 0 0 0 3.74.55h.01c6.62 0 12.02-5.36 12.02-11.94C28.05 8.36 22.65 3 16.02 3Zm0 21.8h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-4.92 1.29 1.31-4.77-.24-.39a9.79 9.79 0 0 1-1.52-5.19c0-5.42 4.43-9.83 9.9-9.83 5.46 0 9.89 4.41 9.89 9.83 0 5.42-4.43 9.86-9.9 9.86Zm5.42-7.38c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.86 1.22 3.06.15.2 2.1 3.2 5.09 4.48.71.31 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
      />
    </svg>
  );
}
