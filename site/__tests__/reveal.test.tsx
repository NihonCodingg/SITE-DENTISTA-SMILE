import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Reveal } from '@/components/ui/Reveal';

/**
 * O `Reveal` deixou de usar `ScrollTrigger` do GSAP na revisão de entrega:
 * eram 23 gatilhos numa página só, e desligá-los valia ~80 a 140ms de
 * bloqueio. Agora são um `IntersectionObserver` COMPARTILHADO
 * (`lib/observadorReveal.ts`) e CSS.
 *
 * O que estes testes protegem não mudou:
 *   - o conteúdo existe sem JavaScript de animação;
 *   - sob `prefers-reduced-motion` o conteúdo NUNCA é escondido antes da hora
 *     (se o observador falhar, a página não pode sumir);
 *   - sob `prefers-reduced-motion` o `transform` nunca é tocado — quem tem
 *     sensibilidade vestibular é machucado pelo deslocamento, não pelo fade;
 *   - o fade realmente acontece quando o bloco entra (é a diferença entre
 *     "não rodou" e "rodou sem deslocar").
 *
 * Um teste novo entrou junto: o observador precisa ser UM só para a página
 * inteira. Era o ponto da mudança, e sem trava ele volta a se multiplicar na
 * primeira refatoração.
 */

class EntradaFalsa {
  static instancias: EntradaFalsa[] = [];
  callback: IntersectionObserverCallback;
  alvos: Element[] = [];
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    EntradaFalsa.instancias.push(this);
  }
  observe = (el: Element) => {
    this.alvos.push(el);
  };
  unobserve = (el: Element) => {
    this.alvos = this.alvos.filter((a) => a !== el);
  };
  disconnect = () => {
    this.alvos = [];
  };
  /** Dispara a entrada em tela para todos os alvos registrados. */
  entrar() {
    this.callback(
      this.alvos.map((target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry),
      this as unknown as IntersectionObserver
    );
  }
}

function reduzido(ligado: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: ligado ? q.includes('reduce') : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

// O observador é um SINGLETON de módulo — criado uma vez por carregamento de
// página, que é justamente o ponto da mudança. Por isso o stub é montado uma
// vez para o arquivo inteiro e as instâncias não são zeradas entre casos:
// zerá-las esconderia o singleton em vez de testá-lo. Quem drena é o
// `unobserve` do cleanup do próprio Reveal, que o RTL dispara ao desmontar.
vi.stubGlobal('IntersectionObserver', EntradaFalsa);

/** O único observador da página, criado no primeiro `Reveal` que montar. */
function oObservador(): EntradaFalsa {
  expect(EntradaFalsa.instancias).toHaveLength(1);
  return EntradaFalsa.instancias[0];
}

beforeEach(() => {
  reduzido(true);
});

afterEach(() => {
  reduzido(true);
});

describe('Reveal', () => {
  it('renderiza o conteúdo mesmo sem JS de animação', () => {
    render(
      <Reveal>
        <p>conteúdo visível</p>
      </Reveal>
    );
    expect(screen.getByText('conteúdo visível')).toBeInTheDocument();
  });

  it('não esconde o conteúdo sob prefers-reduced-motion', () => {
    render(
      <Reveal>
        <p>sempre legível</p>
      </Reveal>
    );
    const el = screen.getByText('sempre legível').parentElement!;
    expect(el.style.opacity).not.toBe('0');
  });

  it('não desloca o conteúdo sob prefers-reduced-motion (sem translateY)', () => {
    render(
      <Reveal y={24}>
        <p>sem deslocamento</p>
      </Reveal>
    );
    const el = screen.getByText('sem deslocamento').parentElement!;
    expect(el.style.transform).toBe('');
  });

  it('quando o bloco entra sob reduced-motion, o fade acontece e o transform continua intocado', () => {
    render(
      <Reveal y={24}>
        <p>disparado</p>
      </Reveal>
    );
    const el = screen.getByText('disparado').parentElement!;

    act(() => {
      oObservador().entrar();
    });

    // O fade existe de verdade — é a animação de opacidade declarada em
    // globals.css, que parte do zero só no instante em que começa.
    expect(el.style.animation).toMatch(/reveal-suave/);
    // ...e mesmo tendo rodado, nunca tocou transform.
    expect(el.style.transform).toBe('');
    // ...e o conteúdo nunca ficou preso em opacidade 0.
    expect(el.style.opacity).not.toBe('0');
  });

  it('com movimento permitido, esconde antes e revela ao entrar', () => {
    reduzido(false);
    render(
      <Reveal y={24}>
        <p>com movimento</p>
      </Reveal>
    );
    const el = screen.getByText('com movimento').parentElement!;

    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toContain('24px');

    act(() => {
      oObservador().entrar();
    });

    expect(el.style.opacity).not.toBe('0');
    expect(el.style.transform).toBe('');
  });

  it('usa UM observador para a página inteira, não um por bloco', () => {
    reduzido(false);
    render(
      <div>
        <Reveal>
          <p>um</p>
        </Reveal>
        <Reveal>
          <p>dois</p>
        </Reveal>
        <Reveal>
          <p>três</p>
        </Reveal>
      </div>
    );
    // Três blocos, um observador só — era o ponto de trocar o ScrollTrigger.
    expect(oObservador().alvos).toHaveLength(3);
  });

  it('aceita a tag do elemento', () => {
    render(
      <Reveal as="section">
        <p>x</p>
      </Reveal>
    );
    expect(document.querySelector('section')).toBeTruthy();
  });
});
