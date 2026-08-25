'use client';

/**
 * Letras que flutuam para o lugar conforme a seção entra, amarradas ao scroll
 * (scrub) — Task 20, os títulos de seção. Origem:
 * src/ts-tailwind/TextAnimations/ScrollFloat/ScrollFloat.tsx (ver
 * components/reactbits/README.md para o commit e a lista completa).
 *
 * Modificações sobre o original:
 * 1. `'use client'` no topo (o original não declara).
 * 2. **Cleanup adicionado.** O original cria o tween com ScrollTrigger e
 *    nunca os mata — cada desmontagem vazava um trigger vivo apontando para
 *    um nó morto. Mesmo padrão de `Reveal.tsx`.
 * 3. **`registerPlugin` movido do escopo do módulo para dentro do efeito** —
 *    mesmo motivo do `SplitText` (Task 8): o registro toca `matchMedia`, e
 *    módulo é avaliado antes de qualquer stub de teste existir.
 * 4. **Render neutro.** O original renderizava um `<h2>` próprio com
 *    tamanho de fonte cravado — aqui ele vive DENTRO do heading que o
 *    `SectionHeading` já constrói, então virou `<span>` e herda a tipografia
 *    por cascata, como o `SplitText` fazia no hero.
 * 5. **`aria-hidden` no contêiner fatiado.** Texto quebrado em letras é lido
 *    letra por letra — a mesma violação que o axe apontou no hero (Task 18,
 *    A1). O nome acessível vai no heading pai, via `tituloAriaLabel` do
 *    `SectionHeading`.
 * 6. **As letras são agrupadas por palavra** (Task 21). O original põe cada
 *    caractere — inclusive o espaço — num `inline-block` solto, e aí o
 *    navegador pode quebrar a linha ENTRE DUAS LETRAS da mesma palavra. Era
 *    visível: "As histórias valem mais d / o que qualquer anúncio". Cada
 *    palavra agora vive num `inline-block whitespace-nowrap`, com espaço de
 *    verdade entre elas, então a quebra só acontece onde existe espaço. A
 *    animação continua letra a letra: o GSAP passou a mirar `.sf-letra` em
 *    vez de `.inline-block`, que agora casaria também com os invólucros de
 *    palavra.
 */

import { Fragment, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollFloatProps {
  /** Só string: o efeito fatia em letras. */
  texto: string;
  className?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
}

export default function ScrollFloat({
  texto,
  className = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
}: ScrollFloatProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  // Palavra por palavra por fora, letra por letra por dentro (ver modificação
  // 6): `whitespace-nowrap` no invólucro é o que segura a palavra inteira na
  // mesma linha, e o espaço entre invólucros é um espaço normal, onde a
  // quebra pode acontecer.
  const letras = useMemo(
    () =>
      texto.split(' ').map((palavra, iPalavra, palavras) => (
        <Fragment key={iPalavra}>
          <span className="inline-block whitespace-nowrap">
            {palavra.split('').map((char, i) => (
              <span className="sf-letra inline-block" key={i}>
                {char}
              </span>
            ))}
          </span>
          {/* O espaço fica FORA do invólucro: dentro dele, o
              `whitespace-nowrap` o impediria de ser um ponto de quebra, que é
              justamente o que precisamos que ele seja. */}
          {iPalavra < palavras.length - 1 ? ' ' : null}
        </Fragment>
      )),
    [texto]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const chars = el.querySelectorAll('.sf-letra');
    const tween = gsap.fromTo(
      chars,
      {
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%',
      },
      {
        duration: animationDuration,
        ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger,
        scrollTrigger: {
          trigger: el,
          scroller: window,
          start: scrollStart,
          end: scrollEnd,
          scrub: true,
          // MODIFICAÇÃO ADICIONAL (travamento no hero). O original punha
          // `willChange: 'opacity, transform'` nas variáveis iniciais do
          // tween — ou seja, em cada letra, para sempre. Cada letra com
          // `will-change` é uma camada composta permanente, e este site fatia
          // vários títulos: MEDIDO, 86 das 177 camadas da página eram
          // `span.sf-letra`, de seções a três telas de distância. O custo não
          // é de pintura (juntas elas não chegam a 1 megapixel) — é a árvore
          // de camadas, que o compositor serializa a cada quadro.
          //
          // Com `scrub`, a animação anda nos dois sentidos enquanto o título
          // está na faixa, então o `will-change` tem razão de existir — mas só
          // enquanto está. `onToggle` liga na entrada e devolve para `auto` na
          // saída.
          onToggle: (self) => {
            gsap.set(chars, { willChange: self.isActive ? 'opacity, transform' : 'auto' });
          },
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(chars, { clearProps: 'all' });
    };
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger, texto]);

  return (
    <span ref={containerRef} aria-hidden="true" className={`inline-block ${className}`.trim()}>
      {letras}
    </span>
  );
}
