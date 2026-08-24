import { describe, it, expect, vi } from 'vitest';
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Sorrisos } from '@/components/sections/Sorrisos';
import { SORRISOS } from '@/lib/content';

// O CircularGallery real (components/reactbits/CircularGallery.tsx) usa `ogl`,
// que exige um contexto WebGL de verdade — jsdom não tem. As internas dele
// (pausa, cleanup, ausência de rede) já são cobertas por
// __tests__/circularGallery.test.tsx com um mock de `ogl`; aqui o que importa
// é só a decisão de QUAL veículo a seção monta (WebGL vs. fallback) e o
// equivalente textual — por isso o componente inteiro é trocado por um stub.
let circularGalleryDeveFalhar = false;
vi.mock('@/components/reactbits/CircularGallery', () => ({
  // Nome com maiúscula: o stub tem hook dentro, e a regra rules-of-hooks só
  // reconhece como componente uma função nomeada assim.
  default: function CircularGalleryStub(props: { onError?: (falhou: boolean) => void }) {
    // O aviso de falha vai num efeito, não no corpo do render: chamar
    // `onError` durante o render é setState do pai enquanto o filho ainda
    // renderiza, o que o React reprova em aviso de console.
    useEffect(() => {
      if (circularGalleryDeveFalhar) props.onError?.(true);
    }, [props]);
    return <div data-testid="circular-gallery-stub" aria-hidden="true" />;
  },
}));

function cap(reduz: boolean, memoria: number, saveData = false) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce') ? reduz : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('navigator', {
    deviceMemory: memoria,
    hardwareConcurrency: 8,
    connection: { saveData },
  });
}

describe('Sorrisos — conteúdo e título (iguais nos dois modos)', () => {
  it('mostra o sobretítulo e o h2 corretos, sob qualquer capacidade', () => {
    cap(true, 8); // fallback
    render(<Sorrisos />);
    expect(screen.getByText('Pacientes reais')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Sorrisos feitos aqui' })).toBeInTheDocument();
  });

  it('carrega o id #sorrisos', () => {
    cap(true, 8);
    const { container } = render(<Sorrisos />);
    expect(container.querySelector('#sorrisos')).toBeTruthy();
  });
});

describe('Sorrisos — fallback (reduced-motion, economia de dados ou aparelho fraco)', () => {
  it('sob prefers-reduced-motion, mostra o scroller com as 9 fotos e alt correto — nenhum canvas', async () => {
    cap(true, 8);
    const { container } = render(<Sorrisos />);
    await waitFor(() => {
      expect(screen.getAllByAltText('Paciente da Smile sorrindo')).toHaveLength(SORRISOS.length);
    });
    expect(container.querySelector('[data-testid="circular-gallery-stub"]')).toBeNull();
  });

  it('em aparelho de pouca memória, cai no mesmo fallback', async () => {
    cap(false, 2);
    render(<Sorrisos />);
    await waitFor(() => {
      expect(screen.getAllByAltText('Paciente da Smile sorrindo')).toHaveLength(SORRISOS.length);
    });
  });

  it('com economia de dados ligada, cai no mesmo fallback', async () => {
    cap(false, 8, true);
    render(<Sorrisos />);
    await waitFor(() => {
      expect(screen.getAllByAltText('Paciente da Smile sorrindo')).toHaveLength(SORRISOS.length);
    });
  });

  it('usa todas as 9 fotos reais de lib/content.ts — nenhuma inventada, nenhuma faltando', async () => {
    cap(true, 8);
    const { container } = render(<Sorrisos />);
    await waitFor(() => {
      SORRISOS.forEach((s) => {
        expect(container.querySelector(`img[src*="${encodeURIComponent(s.img)}"], img[src*="${s.img}"]`)).toBeTruthy();
      });
    });
  });

  it('o scroller tem overflow-x próprio, nunca a seção inteira', async () => {
    cap(true, 8);
    const { container } = render(<Sorrisos />);
    await waitFor(() => expect(screen.getAllByAltText('Paciente da Smile sorrindo')).toHaveLength(SORRISOS.length));
    const secao = container.querySelector('section#sorrisos');
    const scroller = container.querySelector('.sorrisos-scroller');
    expect(scroller).not.toBeNull();
    expect(scroller?.className).toMatch(/overflow-x-auto/);
    expect(secao?.className ?? '').not.toMatch(/overflow-x-auto/);
  });
});

describe('Sorrisos — WebGL (aparelho capaz) e acessibilidade', () => {
  it('com capacidade plena, monta a galeria WebGL em vez do scroller', async () => {
    circularGalleryDeveFalhar = false;
    cap(false, 8);
    const { container } = render(<Sorrisos />);
    await waitFor(() => {
      expect(container.querySelector('[data-testid="circular-gallery-stub"]')).not.toBeNull();
    });
    expect(container.querySelectorAll('img[alt="Paciente da Smile sorrindo"]')).toHaveLength(0);
  });

  it('quando o WebGL está ativo, existe um equivalente textual (sr-only) com as 9 fotos', async () => {
    circularGalleryDeveFalhar = false;
    cap(false, 8);
    const { container } = render(<Sorrisos />);
    await waitFor(() => {
      expect(container.querySelector('[data-testid="circular-gallery-stub"]')).not.toBeNull();
    });
    const equivalente = container.querySelector('.sr-only');
    expect(equivalente).not.toBeNull();
    expect(equivalente?.textContent ?? '').toMatch(new RegExp(String(SORRISOS.length)));
  });

  it('se o WebGL falhar ao iniciar mesmo em aparelho capaz, cai pro fallback acessível (onError)', async () => {
    circularGalleryDeveFalhar = true;
    cap(false, 8);
    render(<Sorrisos />);
    await waitFor(() => {
      expect(screen.getAllByAltText('Paciente da Smile sorrindo')).toHaveLength(SORRISOS.length);
    });
    circularGalleryDeveFalhar = false;
  });
});
