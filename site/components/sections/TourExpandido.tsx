'use client';

import ScrollExpand from '@/components/reactbits/ScrollExpand';
import { useCapability } from '@/lib/useCapability';

/**
 * A fachada da clínica se abrindo conforme a pessoa rola, logo depois do
 * hero (`ScrollExpand` do React Bits — Task 20, pedido do dono do projeto:
 * "teste esse elemento na hero").
 *
 * **Por que depois do hero, e não dentro dele.** O `ScrollExpand` é uma
 * seção inteira: prende a mídia com `position: sticky` e consome mais de uma
 * viewport de rolagem para levá-la de moldura pequena a sangria total. O
 * hero aprovado no Claude Design é uma grade de três colunas (texto + CTA,
 * foto, especialidades) sobre o fundo WebGL, com a headline fatiada e os
 * CTAs magnéticos — o dono do projeto disse literalmente que gostou dele.
 * Encaixar o expand ali dentro exigiria desmontar essa grade. Aqui, ele é a
 * transição entre o hero e o resto da página: a última coisa que a pessoa vê
 * do hero é a fachada crescendo até ocupar a tela.
 *
 * Sem título nem legenda sobrepostos: o `ScrollExpand` aceita os dois, mas
 * qualquer texto novo aqui seria copy inventada, e a regra do projeto é não
 * inventar. A fachada fala sozinha.
 *
 * Sob `prefers-reduced-motion` o componente não anima com o scroll — a
 * mídia entra direto no estado final (aberta), sem o percurso. O conteúdo
 * continua lá; some o movimento.
 */
export function TourExpandido() {
  const { podeAnimar, montado } = useCapability();

  return (
    <section aria-label="A fachada da Smile Ipiranga" className="bg-branco">
      {/* Sem altura no invólucro: o próprio ScrollExpand dimensiona a pista
          interna a partir de `scrollDistance` + `holdDistance` (uma viewport
          de palco mais o percurso). Um `h-[...]` aqui só brigaria com essa
          conta. */}
      <div>
        <ScrollExpand
          src="/img/fachada.jpg"
          alt="Fachada da Smile Ipiranga, na Rua Clemente Pereira"
          useWindowScroll
          reducedMotion={!montado || !podeAnimar}
          startWidth={42}
          startHeight={58}
          startRadius={24}
          endRadius={0}
          mediaZoom={1.2}
          scrollDistance={0.9}
          holdDistance={0.15}
          overlayScrim={0.25}
        />
      </div>
    </section>
  );
}
