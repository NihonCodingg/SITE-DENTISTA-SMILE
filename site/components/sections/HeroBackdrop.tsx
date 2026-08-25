'use client';

import dynamic from 'next/dynamic';
import { useCapability } from '@/lib/useCapability';
import { useTelaLarga } from '@/lib/useTelaLarga';

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
//
// Task 17 (performance): cheguei a testar adiar esta montagem pro momento em
// que o main thread ficasse ocioso (`requestIdleCallback`), na hipótese de
// que rodar no mesmo tick de `useCapability()` competia com o LCP do hero.
// Medido com A/B controlado (mesmo build, só essa variável mudando, 2
// amostras por lado): TBT eager 2291/3257ms vs. TBT adiado 4503/2131ms —
// faixas sobrepostas, nenhuma diferença confiável, ver task-17-report.md.
// Hipótese do porquê: adiar dispara o dynamic import (rede nova) mais tarde,
// o que empurra a janela de "rede ociosa" que o Lighthouse usa pra fechar o
// trace — captura MAIS do loop de render contínuo do canvas, não menos.
// Reduz TBT precisa cortar trabalho de CPU, não só adiar quando ele roda.
// Reduzido de volta pro mount direto: mais simples, e a versão adiada não
// tinha número que a justificasse.
const Silk = dynamic(() => import('@/components/reactbits/Silk'), { ssr: false, loading: () => null });

/**
 * Task 22 — o `three` + `@react-three/fiber` NÃO descem mais para o celular.
 *
 * Medido no Lighthouse mobile (build de produção, CPU 4× lenta): o pacote do
 * three é o maior recurso da página (230KB transferidos, 868KB descompactados)
 * e sozinho responde por ~665ms de execução de script, com uma tarefa longa de
 * 211ms. Isso num fundo que é desenhado a 22% de opacidade, ATRÁS da parede de
 * fotos e do recorte da moldura — numa tela de celular ele é praticamente
 * invisível.
 *
 * `podePesado` já barrava aparelho fraco, economia de dados e movimento
 * reduzido. O que faltava era barrar o celular BOM: 8GB de RAM e 8 núcleos
 * passam no teste de capacidade, e aí o telefone baixava e executava um motor
 * 3D inteiro para pintar uma textura que ninguém vê. A régua de largura é o que
 * separa "o aparelho aguenta" de "vale a pena".
 *
 * CORREÇÃO DE 25/08/2026, achada por uma captura do dono do projeto ("tirou o
 * fundo amarelo"): o portão era `podePesado`, que inclui `podeAnimar` — então
 * quem liga "reduzir movimento" no sistema perdia o dourado INTEIRO e ficava
 * com a moldura em creme chapado. Isso quebra a regra da base ("reduzir não é
 * zerar"): o dourado é a TEXTURA da marca, não uma animação. Agora o portão é
 * `aguentaPeso` — só aparelho e rede — e a preferência de movimento apenas
 * CONGELA a textura (ver `reducedMotion` em Silk.tsx). Quem pediu menos
 * movimento recebe menos movimento, não menos marca.
 */
export function HeroBackdrop() {
  const { aguentaPeso, podeAnimar, montado } = useCapability();
  const telaLarga = useTelaLarga();

  return (
    // O container existe sempre, com aria-hidden, para que o layout não mude
    // quando o canvas entra (nada de layout shift no LCP do hero).
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
      {montado && aguentaPeso && telaLarga && (
        // opacity:.22 mantém o dourado como textura, não protagonista — a
        // headline preta continua com contraste sobre o creme (verificado
        // visualmente, ver task-8-report.md).
        <div className="absolute inset-0 opacity-[.22]" data-diag="silk">
          <Silk
            speed={2.4}
            scale={1.1}
            color="#F0B40C"
            noiseIntensity={1.1}
            rotation={0.12}
            reducedMotion={!podeAnimar}
          />
        </div>
      )}
    </div>
  );
}
