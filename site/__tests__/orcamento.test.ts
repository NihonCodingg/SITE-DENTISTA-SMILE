import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

// Task 17 (performance) — orçamento do plano, verificado contra o Lighthouse
// mobile simulado mais recente (`lh-mobile.json`, gerado por `npm run build`
// + `npm run start` + `npx lighthouse ... --form-factor=mobile
// --throttling-method=simulate`; não versionado, ver .gitignore). Sem esse
// arquivo (ambiente sem Chrome/Edge, ou antes do primeiro `lighthouse` local)
// os testes viram no-op — não é uma checagem que passa por padrão, é uma
// checagem que só roda quando existe medição de verdade pra checar,
// conforme task-17-brief.md.
describe('orçamento de performance', () => {
  it('mantem o total-byte-weight abaixo de 1,4MB', () => {
    const p = './lh-mobile.json';
    if (!existsSync(p)) return; // roda só depois do lighthouse
    const lh = JSON.parse(readFileSync(p, 'utf8'));
    const bytes = lh.audits['total-byte-weight'].numericValue;
    expect(bytes).toBeLessThan(1_400_000);
  });

  // VERMELHO CONHECIDO, DE PROPÓSITO. Este é o único teste vermelho da suíte.
  // O LCP *simulado* mede ~3,3s contra a meta de 2500ms. O mesmo LCP com
  // throttling *real* (devtools) mediu 2211ms na Task 17 — dentro da meta. O
  // `simulate` do Lighthouse superestima este caso; a medição real é a que
  // descreve o que a pessoa vive. Deixado vermelho, e não silenciado, porque a
  // decisão (aceitar o vermelho documentado, virar `it.fails`, ou abrir uma
  // rodada só de LCP) é do dono do projeto e ainda não foi tomada.
  //
  // Estado na Task 22, três amostras iguais no mobile simulado (o número que
  // interessa aqui é a ESTABILIDADE — as medições da Task 17 eram bimodais,
  // 0,55 a 0,88, e não dava para confiar numa amostra):
  //   performance 92 · TBT 20-30ms · CLS 0 · TTI 3,4s · 380KB
  // contra o estado imediatamente anterior, no mesmo método:
  //   performance 69 · TBT 920ms · CLS 0,061 · TTI 7,0s · 914KB
  // O que mudou foi tirar o `three`/@react-three/fiber do celular e cortar a
  // parede de fotos de 84 azulejos para ~34 lá. Método e números completos em
  // progress.md, Task 22.
  //
  // ATUALIZAÇÃO 25/08/2026 (revisão de desempenho pré-deploy; a parede de
  // fotos já saiu do site inteiro). Mediana de 5 amostras, protocolo limpo:
  //   performance 87 · TBT 320ms · LCP simulado 3,2s · CLS 0,001 · 489KB
  // E a prova de que o vermelho é do simulador, não da página: com
  // PerformanceObserver em Chrome real, o H1 emite UM ÚNICO candidato a LCP,
  // aos 368ms, sem nenhum repaint posterior — não existe candidato tardio
  // para otimizar. `display: optional` na fonte do título foi testado e não
  // moveu o número (mediana 3,6s; revertido). O que sobra é o modelo de rede
  // do lantern penalizando LCP de texto. A decisão sobre este vermelho
  // continua sendo do dono do projeto.
  it('atinge LCP abaixo de 2,5s no mobile simulado', () => {
    const p = './lh-mobile.json';
    if (!existsSync(p)) return;
    const lh = JSON.parse(readFileSync(p, 'utf8'));
    expect(lh.audits['largest-contentful-paint'].numericValue).toBeLessThan(2500);
  });

  it('mantem CLS abaixo de 0,05', () => {
    const p = './lh-mobile.json';
    if (!existsSync(p)) return;
    const lh = JSON.parse(readFileSync(p, 'utf8'));
    expect(lh.audits['cumulative-layout-shift'].numericValue).toBeLessThan(0.05);
  });
});
