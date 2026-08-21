import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { gsap } from 'gsap';
import {
  MOTION_GAVETA,
  TETO_ACIONADO,
  TETO_CONJUNTO,
  tempoUltimoItem,
} from '@/components/reactbits/StaggeredMenu';
import { EASE_GAVETA_ID, EASE_GAVETA_PONTOS, registrarEaseGaveta } from '@/lib/easeGaveta';

// Task 18 (B): a régua de motion do drawer (design-guidance.md, "Menu mobile —
// checklist de craft") travada pelos NÚMEROS configurados, não mockando o GSAP
// para "ver animar". Se alguém voltar os tempos do React Bits original
// (~1,3s até o último item, power3.in no fechamento), isto falha.

// Quantidade de itens do drawer em produção: NAV de components/layout/Header.tsx.
const ITENS_DO_NAV = 4;

// y(x) de um cubic-bezier CSS (x1,y1,x2,y2): resolve t para x por bissecção.
function bezierCss(x: number, [x1, y1, x2, y2]: readonly number[]): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const t = (lo + hi) / 2;
    const bx = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3;
    if (bx < x) lo = t;
    else hi = t;
  }
  const t = (lo + hi) / 2;
  return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3;
}

describe('StaggeredMenu — régua de motion do drawer', () => {
  it('painel abre em no máximo 300ms (teto do guia para o que a pessoa aciona)', () => {
    expect(MOTION_GAVETA.abertura).toBeLessThanOrEqual(TETO_ACIONADO);
    // As camadas de cor nunca chegam depois do painel.
    MOTION_GAVETA.camadas.forEach((d) => expect(d).toBeLessThanOrEqual(MOTION_GAVETA.abertura));
  });

  it('fecha em no máximo 220ms, mais rápido do que abre', () => {
    expect(MOTION_GAVETA.fechamento).toBeLessThanOrEqual(0.22);
    expect(MOTION_GAVETA.fechamento).toBeLessThan(MOTION_GAVETA.abertura);
  });

  it('stagger dos itens fica na janela de 30-80ms do guia, perto dos 40ms pedidos', () => {
    expect(MOTION_GAVETA.stagger).toBeGreaterThanOrEqual(0.03);
    expect(MOTION_GAVETA.stagger).toBeLessThanOrEqual(0.08);
    expect(Math.abs(MOTION_GAVETA.stagger - 0.04)).toBeLessThan(0.011);
  });

  it('o último item do nav assenta em no máximo 450ms, contado da abertura', () => {
    expect(tempoUltimoItem(ITENS_DO_NAV)).toBeLessThanOrEqual(TETO_CONJUNTO);
    expect(tempoUltimoItem(0)).toBe(0);
  });

  it('a curva do GSAP é a mesma --ease-gaveta do globals.css (token deixa de ser órfão)', () => {
    const css = readFileSync(path.resolve(__dirname, '../app/globals.css'), 'utf8');
    const m = /--ease-gaveta:\s*cubic-bezier\(([^)]+)\)/.exec(css);
    expect(m).not.toBeNull();
    const pontosCss = m![1].split(',').map((n) => Number(n.trim()));
    expect(pontosCss).toEqual([...EASE_GAVETA_PONTOS]);

    // Idempotente (MotionProvider e StaggeredMenu chamam os dois).
    registrarEaseGaveta();
    registrarEaseGaveta();
    const ease = gsap.parseEase(EASE_GAVETA_ID) as (p: number) => number;
    expect(typeof ease).toBe('function');
    // A curva registrada avalia igual à do CSS — não é o default do GSAP.
    for (const x of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      expect(Math.abs(ease(x) - bezierCss(x, EASE_GAVETA_PONTOS))).toBeLessThan(0.01);
    }
    expect(Math.abs(ease(0.5) - 0.5)).toBeGreaterThan(0.1); // não é linear
  });

  it('nenhum ease-in no componente (design-guidance.md: nunca em UI)', () => {
    const src = readFileSync(path.resolve(__dirname, '../components/reactbits/StaggeredMenu.tsx'), 'utf8');
    expect(src).not.toMatch(/ease:\s*['"][a-z0-9]+\.in(Out)?['"]/i);
  });
});
