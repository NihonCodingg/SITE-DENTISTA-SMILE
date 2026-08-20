import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Reveal } from '@/components/ui/Reveal';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
    //
    // Este teste roda com o elemento fora da viewport (beforeEach acima), então o
    // ScrollTrigger nunca dispara aqui — ele prova que nada é tocado ANTES da hora
    // (protege contra a remoção acidental de `immediateRender: false`). Ele NÃO
    // prova, sozinho, que o fade de verdade acontece sem deslocamento quando o
    // gatilho dispara de fato — é isso que o teste seguinte cobre.
    render(<Reveal y={24}><p>sem deslocamento</p></Reveal>);
    const el = screen.getByText('sem deslocamento').parentElement!;
    expect(el.style.transform).toBe('');
  });

  it('quando o gatilho dispara de verdade sob reduced-motion, o fade roda até o fim sem tocar transform', () => {
    // Reposiciona o elemento DENTRO da zona de disparo (top 88% da viewport de
    // 768px do jsdom = 676px) — o oposto do beforeEach acima, que o mantém fora.
    // Isso obriga o ScrollTrigger a considerar o gatilho já cruzado quando
    // chamamos refresh(), disparando onEnter -> play() de verdade, em vez de só
    // confirmar o estado anterior ao scroll.
    Element.prototype.getBoundingClientRect = () => ({
      top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100,
      x: 0, y: 100, toJSON() {},
    });

    render(
      <Reveal y={24}>
        <p>disparado</p>
      </Reveal>
    );
    const el = screen.getByText('disparado').parentElement!;

    act(() => {
      ScrollTrigger.refresh();
    });

    const trigger = ScrollTrigger.getAll().find((st) => st.trigger === el);
    expect(trigger).toBeTruthy();

    // Avança a tween de 200ms até o fim. Chamar progress(1) direto na animation
    // ligada ao ScrollTrigger é mais confiável neste setup do que fake timers +
    // requestAnimationFrame (o ticker do gsap pode já ter capturado a referência
    // real do rAF antes de qualquer vi.useFakeTimers()).
    act(() => {
      trigger?.animation?.progress(1);
    });

    // A animação de fato rodou até completar — não foi pulada nem ficou presa no
    // estado "de" (é a diferença entre "não rodou" e "rodou sem deslocar").
    expect(el.style.opacity).toBe('1');
    // ...e, mesmo tendo rodado, nunca tocou transform: se alguém reintroduzir `y`
    // no ramo reduzido do Reveal.tsx, o gsap passa a escrever
    // `transform: translate(...)` mesmo na posição de repouso (0,0), e esta
    // asserção quebra.
    expect(el.style.transform).toBe('');
  });

  it('aceita a tag do elemento', () => {
    render(<Reveal as="section"><p>x</p></Reveal>);
    expect(document.querySelector('section')).toBeTruthy();
  });
});
