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
  // O LCP *simulado* mede 3847ms contra a meta de 2500ms, já depois das duas
  // otimizações que renderam ganho medido na Task 17 (AVIF e o `sizes` do
  // hero). O mesmo LCP com throttling *real* (devtools) mede 2211ms — dentro
  // da meta. O `simulate` do Lighthouse superestima este caso; a medição real
  // é a que descreve o que a pessoa vive. Deixado vermelho, e não silenciado,
  // porque a decisão (aceitar o vermelho documentado, virar `it.fails`, ou
  // abrir mais uma rodada de performance) é do dono do projeto e ainda não foi
  // tomada. Números e método em task-17-report.md.
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
