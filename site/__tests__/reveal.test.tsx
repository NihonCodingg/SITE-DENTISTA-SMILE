import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Reveal } from '@/components/ui/Reveal';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: q.includes('reduce'), media: q,
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

// jsdom não faz layout: por padrão getBoundingClientRect() devolve tudo zerado, o
// que faz o ScrollTrigger concluir que o elemento já passou do ponto de disparo no
// instante em que é criado — um artefato do ambiente de teste, não um cenário real.
// Simulamos aqui uma posição abaixo da dobra (fora da viewport de 768px do jsdom),
// que é como o <Reveal> realmente aparece no mount em produção, para que o gatilho
// de scroll só dispare quando de fato mandarmos a página rolar.
beforeEach(() => {
  Element.prototype.getBoundingClientRect = () => ({
    top: 2000, bottom: 2100, left: 0, right: 100, width: 100, height: 100,
    x: 0, y: 2000, toJSON() {},
  });
});

describe('Reveal', () => {
  it('renderiza o conteúdo mesmo sem JS de animação', () => {
    render(<Reveal><p>conteúdo visível</p></Reveal>);
    expect(screen.getByText('conteúdo visível')).toBeInTheDocument();
  });

  it('não esconde o conteúdo sob prefers-reduced-motion', () => {
    render(<Reveal><p>sempre legível</p></Reveal>);
    const el = screen.getByText('sempre legível').parentElement!;
    expect(el.style.opacity).not.toBe('0');
  });

  it('não desloca o conteúdo sob prefers-reduced-motion (sem translateY)', () => {
    // Reduzir não é zerar: o fade de opacidade continua, mas quem tem sensibilidade
    // vestibular é machucado pelo deslocamento, não pela mudança de opacidade — por
    // isso o transform nunca pode ser tocado nesse modo.
    render(<Reveal y={24}><p>sem deslocamento</p></Reveal>);
    const el = screen.getByText('sem deslocamento').parentElement!;
    expect(el.style.transform).toBe('');
  });

  it('aceita a tag do elemento', () => {
    render(<Reveal as="section"><p>x</p></Reveal>);
    expect(document.querySelector('section')).toBeTruthy();
  });
});
