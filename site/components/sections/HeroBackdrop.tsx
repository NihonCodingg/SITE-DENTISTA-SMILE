'use client';

import dynamic from 'next/dynamic';
import { useCapability } from '@/lib/useCapability';

// Task 19 ("maximizar React Bits"): troca o `ui/Silk.tsx` (reimplementação
// própria em `ogl`, criada na Task 8 porque o Silk original do React Bits
// exige three.js) pelo componente ORIGINAL do React Bits, vendorizado em
// `components/reactbits/Silk.tsx` — decisão do parceiro, "forçar o máximo
// possível". `three` + `@react-three/fiber` entram como dependência nova;
// custo medido em `task-19-report.md`.
//
// ssr:false + montagem condicionada a `podePesado` continua sendo o que
// garante `three`/`@react-three/fiber` fora do first-load JS da rota — ver
// task-19-report.md para a saída do `npm run build` que prova isso.
const Silk = dynamic(() => import('@/components/reactbits/Silk'), { ssr: false, loading: () => null });

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
