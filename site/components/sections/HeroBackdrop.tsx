'use client';

import dynamic from 'next/dynamic';
import { useCapability } from '@/lib/useCapability';

// ssr:false + montagem condicionada a `podePesado` é o que garante `ogl`
// (dependência do Silk) fora do first-load JS da rota — ver task-8-report.md
// para a saída do `npm run build` que prova isso.
const Silk = dynamic(() => import('@/components/ui/Silk'), { ssr: false, loading: () => null });

export function HeroBackdrop() {
  const { podePesado, montado } = useCapability();

  return (
    // O container existe sempre, com aria-hidden, para que o layout não mude
    // quando o canvas entra (nada de layout shift no LCP do hero).
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
      {montado && podePesado && (
        // opacity:.22 mantém o dourado como textura, não protagonista — a
        // headline preta continua com contraste sobre o creme (verificado
        // visualmente, ver task-8-report.md).
        <div className="absolute inset-0 opacity-[.22]">
          <Silk speed={2.4} scale={1.1} color="#F0B40C" noiseIntensity={1.1} rotation={0.12} />
        </div>
      )}
    </div>
  );
}
