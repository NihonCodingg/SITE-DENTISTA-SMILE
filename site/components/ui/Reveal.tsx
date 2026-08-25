'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from '@/lib/useCapability';

type Props = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  y?: number;
  className?: string;
  /**
   * Nome acessível repassado ao elemento. Existe porque AntesDepois.tsx usa
   * `<Reveal as="h2">` com o título fatiado em letras `aria-hidden` (Task 20,
   * ScrollFloat) — sem o repasse, o heading ficava sem nome e o atributo
   * morria em silêncio aqui.
   */
  'aria-label'?: string;
};

export function Reveal({ children, as: Tag = 'div', delay = 0, y = 24, className, 'aria-label': ariaLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { podeAnimar, montado } = useCapability();

  useEffect(() => {
    const el = ref.current;
    if (!el || !montado) return;
    gsap.registerPlugin(ScrollTrigger);

    // Reduzir não é zerar: sob prefers-reduced-motion o reveal continua existindo,
    // só perde o deslocamento (y) e encurta para ~200ms. Quem tem sensibilidade
    // vestibular é machucado pelo movimento, não pelo fade de opacidade.
    //
    // `immediateRender: false` no ramo reduzido é o que garante que o conteúdo
    // nunca fica escondido antes da hora: sem ele, o gsap aplicaria o estado
    // "de" (opacity 0) de forma síncrona no instante em que o efeito roda, mesmo
    // que o elemento ainda esteja longe do ponto de disparo do scroll.
    const anim = podeAnimar
      ? gsap.fromTo(
          el,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        )
      : gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.2,
            delay,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
      gsap.set(el, { clearProps: 'all' });
    };
  }, [montado, podeAnimar, delay, y]);

  // @ts-expect-error tag dinâmica
  return <Tag ref={ref} aria-label={ariaLabel} className={className}>{children}</Tag>;
}
