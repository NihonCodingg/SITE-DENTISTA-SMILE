'use client';
import { useEffect, useRef, useState } from 'react';
import { useCapability } from '@/lib/useCapability';
import { observarReveal } from '@/lib/observadorReveal';

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

/**
 * O bloco entra deslizando de baixo quando chega perto da tela.
 *
 * **Sem GSAP desde a revisão de entrega.** Antes, cada `Reveal` criava um
 * `ScrollTrigger` próprio — e são 23 na página (contados no DOM montado, não
 * no código: alguns saem de `.map()`). Medido: desligar o efeito por completo
 * valia ~80 a 140ms de bloqueio, quase tudo custo de instanciar os gatilhos,
 * não de animar. Agora são um `IntersectionObserver`
 * compartilhado (`lib/observadorReveal.ts`) e uma transição de CSS: mesmo
 * deslocamento, mesma duração, mesma curva, um objeto no lugar de quarenta.
 *
 * **Nasce visível.** O estado inicial é `revelado = !montado`, então o HTML
 * que o servidor manda — e o que qualquer navegador sem JavaScript recebe —
 * já está com opacidade 1 e sem deslocamento. Só depois que o cliente confirma
 * que pode animar é que o bloco volta para o estado "antes" e espera o
 * observador. Sem isso, uma falha de JS deixaria a página inteira invisível.
 *
 * **Reduzir não é zerar:** sob `prefers-reduced-motion` o reveal continua
 * existindo, só perde o deslocamento e encurta para 200ms. Quem tem
 * sensibilidade vestibular é machucado pelo movimento, não pelo fade.
 */
export function Reveal({ children, as: Tag = 'div', delay = 0, y = 24, className, 'aria-label': ariaLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { podeAnimar, montado } = useCapability();
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !montado) return;
    return observarReveal({ el, aoEntrar: () => setRevelado(true) });
  }, [montado]);

  // Só o ramo COM movimento esconde o bloco antes da hora. Sob
  // `prefers-reduced-motion` o conteúdo fica visível o tempo todo e o fade sai
  // por `@keyframes reveal-suave` (app/globals.css), que parte do zero apenas
  // no instante em que começa — se o observador falhar, nada some da tela.
  const escondido = montado && podeAnimar && !revelado;
  const fadeReduzido = montado && !podeAnimar && revelado;

  // A tag é dinâmica (`div`, `h2`, `li`…) e a união de todos os elementos
  // intrínsecos colapsa para `never` nas props — por isso a versão anterior
  // precisava de um `@ts-expect-error`. Ele cobria só a primeira linha, e com
  // as props agora em várias linhas deixaria as outras descobertas. Um tipo
  // explícito de "componente que aceita atributos de HTML e uma ref" diz a
  // verdade sobre o que `Tag` é, sem suprimir nada.
  const Componente = Tag as unknown as React.FC<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >;

  return (
    <Componente
      ref={ref}
      aria-label={ariaLabel}
      className={className}
      style={{
        opacity: escondido ? 0 : undefined,
        transform: escondido ? `translate3d(0, ${y}px, 0)` : undefined,
        transition:
          montado && podeAnimar
            ? `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`
            : undefined,
        animation: fadeReduzido ? `reveal-suave 200ms var(--ease-saida) ${delay}s both` : undefined,
        willChange: escondido ? 'opacity, transform' : undefined,
      }}
    >
      {children}
    </Componente>
  );
}
