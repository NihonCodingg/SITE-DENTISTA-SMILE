import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Hero } from '@/components/sections/Hero';
import { Tratamentos } from '@/components/sections/Tratamentos';
import { Clinica } from '@/components/sections/Clinica';
import { Sorrisos } from '@/components/sections/Sorrisos';
import { Profissional } from '@/components/sections/Profissional';
import { Depoimentos } from '@/components/sections/Depoimentos';
import { AntesDepois } from '@/components/sections/AntesDepois';
import { ComoFunciona } from '@/components/sections/ComoFunciona';
import { Localizacao } from '@/components/sections/Localizacao';
import { Faq } from '@/components/sections/Faq';
import { CtaFinal } from '@/components/sections/CtaFinal';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false,
  media: q,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

/**
 * Bug site-wide (ver .superpowers/sdd/2026-08-19-site-smile-ipiranga/fix-titulos-report.md):
 * SectionHeading.tsx não definia tamanho de fonte para o `<h2>` — só a Hero
 * (h1) passava `tituloClassName` com um `clamp()` próprio. O preflight do
 * Tailwind v4 zera o tamanho nativo de heading, então todo `<h2>` das outras
 * nove seções renderizava a ~16px, igual ao corpo do texto — medido no
 * navegador (getComputedStyle) antes desta correção.
 *
 * jsdom não resolve `clamp()` em `getComputedStyle` (não há layout real), então
 * não dá para medir o `fontSize` renderizado aqui como se mede no navegador. A
 * prova possível em teste é estrutural: todo `<h2>` do site precisa carregar,
 * na própria className, uma classe de tamanho explícita baseada em
 * `text-[clamp(...)]` — a convenção que a Hero já usa para o h1. Um `<h2>`
 * sem essa classe fica, na prática, do tamanho do corpo (o bug). Isso também
 * é o que trava a próxima seção nascer sem tamanho: se alguém adicionar uma
 * seção nova sem passar tituloClassName E sem herdar o default do
 * SectionHeading (ex.: um `<h2>` cru, como Faq/CtaFinal fazem), este teste
 * falha.
 */
const CLASSE_TAMANHO = /text-\[clamp\(/;
const CLASSE_TRACKING = /tracking-\[-0\.01em\]/;

type Caso = { nome: string; render: () => ReactElement };

const SECOES: Caso[] = [
  { nome: 'Tratamentos', render: () => <Tratamentos /> },
  { nome: 'Clinica', render: () => <Clinica onAbrirVideo={() => {}} /> },
  { nome: 'Sorrisos', render: () => <Sorrisos /> },
  { nome: 'Profissional', render: () => <Profissional /> },
  { nome: 'Depoimentos', render: () => <Depoimentos onAbrirVideo={() => {}} /> },
  { nome: 'AntesDepois', render: () => <AntesDepois /> },
  { nome: 'ComoFunciona', render: () => <ComoFunciona /> },
  { nome: 'Localizacao', render: () => <Localizacao /> },
  { nome: 'Faq', render: () => <Faq /> },
  { nome: 'CtaFinal', render: () => <CtaFinal /> },
];

describe('Todo <h2> de seção carrega tamanho de fonte próprio (regressão site-wide)', () => {
  SECOES.forEach(({ nome, render: renderSecao }) => {
    it(`${nome}: o <h2> não herda o tamanho do corpo — tem clamp() e tracking -0.01em próprios`, () => {
      const { container } = render(renderSecao());
      const h2s = Array.from(container.querySelectorAll('h2'));
      expect(h2s.length).toBeGreaterThan(0);
      h2s.forEach((h2) => {
        expect(h2.className).toMatch(CLASSE_TAMANHO);
        expect(h2.className).toMatch(CLASSE_TRACKING);
      });
    });
  });

  it('Hero: o h1 mantém o próprio clamp (Task 8) — não é afetado pelo default de h2', () => {
    const { container } = render(<Hero onAbrirVideo={() => {}} />);
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1!.className).toMatch(/text-\[clamp\(42px,7\.6vw,104px\)\]/);
  });
});
