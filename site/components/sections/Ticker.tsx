'use client';

import { useEffect, useRef } from 'react';
import { TRATAMENTOS } from '@/lib/content';
import { useCapability } from '@/lib/useCapability';
import { useLenis } from '@/lib/motion';

/**
 * Faixa decorativa dos 7 tratamentos, logo abaixo do Hero. É repetida (o
 * mesmo conteúdo já existe, de verdade, na seção de Tratamentos da Task 10) —
 * por isso a faixa inteira leva `aria-hidden="true"`: sem isso o leitor de
 * tela leria a lista duas vezes.
 *
 * `ScrollVelocity` do React Bits NÃO foi vendorizado para esta faixa —
 * decisão registrada em `components/reactbits/README.md`. Resumo: o
 * componente original (`src/ts-tailwind/TextAnimations/ScrollVelocity/
 * ScrollVelocity.tsx`) monta seis hooks do `motion/react`
 * (useScroll+useVelocity+useSpring+useTransform+useMotionValue+
 * useAnimationFrame) e não pausa fora da viewport nem com a aba oculta —
 * exigência dura desta task. `design-guidance.md` também nomeia "ticker"
 * como exemplo do que deve preferir CSS/JS direto a Motion ("é o que é
 * predeterminado"). Implementado à mão abaixo, seguindo o MESMO padrão de
 * pausa do `components/ui/Silk.tsx` (Task 8): IntersectionObserver cobre a
 * faixa saindo da viewport por scroll, `document.hidden` cobre a aba em
 * segundo plano.
 */

const SEPARADOR = ' ✦ ';
const BASE_SPEED = 40; // px/s parado — calma, a marca não é nervosa
const BOOST_MAX = 260; // px/s adicionais no pico de um scroll rápido
const BOOST_FACTOR = 22; // converte lenis.velocity (px por frame de scroll) em boost
const BOOST_HALF_LIFE = 0.35; // segundos até o boost cair pela metade sem novo impulso
const NUM_COPIAS = 4; // cópias lado a lado na trilha — cobre monitores ultra-wide sem buraco no loop

function textoTratamentos(): string {
  return TRATAMENTOS.map((t) => t.nome).join(SEPARADOR);
}

// Mesma função `wrap` do ScrollVelocity original (min/max/valor), só
// renomeada: mantém o deslocamento sempre dentro de uma cópia de largura,
// pra trilha nunca "escapar" visualmente.
function envolver(valor: number, min: number, max: number): number {
  const alcance = max - min;
  if (alcance <= 0) return min;
  return (((valor - min) % alcance) + alcance) % alcance + min;
}

function TrilhaAnimada({ texto }: { texto: string }) {
  const trilhaRef = useRef<HTMLDivElement>(null);
  const copiaRef = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const trilha = trilhaRef.current;
    const copia = copiaRef.current;
    if (!trilha || !copia) return;

    let largura = copia.offsetWidth;
    let offset = 0;
    let boost = 0;
    let visivel = true;
    // `null`, não `0`: 0 é um timestamp real e válido de rAF (primeiro
    // quadro após navegação), e `0 ? ... : ...` trataria esse quadro como
    // "sem timestamp anterior" de novo no quadro seguinte — dt ficaria preso
    // em 0 para sempre. `null` é um sentinel que nenhum `DOMHighResTimeStamp`
    // real produz.
    let ultimo: number | null = null;
    let raf = 0;

    const resizeObserver = new ResizeObserver(() => {
      largura = copia.offsetWidth;
    });
    resizeObserver.observe(copia);

    // Mesmo padrão de pausa do Silk.tsx (Task 8): um ticker que roda pra
    // sempre é o candidato número um a queimar bateria mesmo invisível.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(trilha);

    // A faixa acelera com a velocidade real do scroll. O Lenis já calcula
    // `velocity` (px por frame) a cada evento de scroll — reaproveitado aqui
    // em vez de recalcular com useScroll/useVelocity do motion/react (o que
    // o ScrollVelocity do React Bits faz). Fonte única sobre o estado do
    // scroll: o mesmo Lenis que já move a página inteira.
    const desligarLenis = lenis?.on('scroll', (l) => {
      boost = Math.min(BOOST_MAX, Math.abs(l.velocity) * BOOST_FACTOR);
    });

    const decaimentoPorSegundo = Math.pow(0.5, 1 / BOOST_HALF_LIFE);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visivel || document.hidden) {
        ultimo = t;
        return;
      }
      const dt = ultimo !== null ? Math.min((t - ultimo) / 1000, 0.1) : 0;
      ultimo = t;
      // 1º quadro (dt=0): só registra `ultimo`, sem mexer no transform. Sem
      // essa guarda, `envolver(offset, -largura, 0)` com offset=0 mapeia pro
      // limite oposto do intervalo (-largura) — inofensivo visualmente
      // (todas as cópias são idênticas), mas um salto de posição gratuito
      // logo no mount, sem nenhum tempo ter passado.
      if (dt <= 0) return;

      boost *= Math.pow(decaimentoPorSegundo, dt);
      const velocidade = BASE_SPEED + boost;
      const proximo = offset - velocidade * dt;
      offset = largura > 0 ? envolver(proximo, -largura, 0) : proximo;

      // Escrita direta em `style.transform` (não uma custom property no
      // elemento pai) — a mesma regra de performance que design-guidance.md
      // documenta para o scroller de sorrisos/depoimentos: variável CSS no
      // pai recalcula estilo de todos os filhos a cada frame.
      trilha.style.transform = `translate3d(${offset}px,0,0)`;
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      desligarLenis?.();
    };
  }, [lenis]);

  return (
    <div data-ticker-trilha className="overflow-hidden">
      <div ref={trilhaRef} className="flex w-max will-change-transform">
        {Array.from({ length: NUM_COPIAS }).map((_, i) => (
          <span key={i} ref={i === 0 ? copiaRef : undefined} className="shrink-0 whitespace-nowrap pr-[1.5em] pl-[1.5em]">
            {texto}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrilhaEstatica({ texto }: { texto: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-5 py-3.5 text-center">
      {texto}
    </div>
  );
}

export function Ticker() {
  const { podeAnimar, montado } = useCapability();
  const texto = textoTratamentos();

  return (
    <div
      data-testid="ticker"
      aria-hidden="true"
      className="mx-3 mt-1.5 overflow-hidden rounded-[16px] bg-amarelo font-rotulo text-[14px] font-medium tracking-[.22em] text-preto uppercase"
    >
      {montado && podeAnimar ? <TrilhaAnimada texto={texto} /> : <TrilhaEstatica texto={texto} />}
    </div>
  );
}
