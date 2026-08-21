'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from '@/lib/useCapability';
import { Reveal } from '@/components/ui/Reveal';
import { ANTES_DEPOIS } from '@/lib/content';

// Texto EXATO de COPY.md §8 — Resolução CFO-196/2019 + LGPD (pessoas
// identificáveis): não encurtar, não parafrasear. "Cada caso é único e os
// resultados variam" é também o que impede a seção de soar como promessa de
// resultado, proibida pela mesma resolução.
const AVISO_LEGAL =
  'Imagens de casos realizados na Smile, publicadas com autorização dos pacientes. Cada caso é único e os resultados variam conforme a condição de cada pessoa.';

const STAGGER_STEP = 0.06; // 60ms — dentro da janela de 30-80ms

/**
 * Uma foto do carrossel. Reveal próprio (não o <Reveal> genérico de
 * Reveal.tsx, que só sabe fazer opacity+translateY): design-guidance.md
 * recomenda por nome esta seção para o `clip-path: inset(0 0 100% 0) →
 * inset(0 0 0 0)` como alternativa "mais bonita" ao slide — decisão tomada
 * (ver task-14-report.md): usar aqui. Mesma estrutura do <Reveal> (gsap +
 * ScrollTrigger, "nasce visível", reduced-motion vira fade de opacidade em
 * vez de zerar) para não introduzir um segundo padrão de animação no
 * projeto — só troca qual propriedade anima.
 *
 * O `round` dentro do próprio clip-path (não só a classe `rounded-[20px]`
 * do elemento) garante que os cantos ficam arredondados também durante os
 * estados intermediários da animação, não só no repouso final — sem isso o
 * clip-path desenharia um retângulo de cantos retos por cima do
 * border-radius enquanto a foto ainda está sendo revelada.
 */
function ImagemAntesDepois({ img, alt, delay }: { img: string; alt: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { podeAnimar, montado } = useCapability();

  useEffect(() => {
    const el = ref.current;
    if (!el || !montado) return;
    gsap.registerPlugin(ScrollTrigger);

    const anim = podeAnimar
      ? gsap.fromTo(
          el,
          { clipPath: 'inset(0% 0% 100% 0% round 20px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 20px)',
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
  }, [montado, podeAnimar, delay]);

  return (
    <div className="shrink-0 snap-start">
      {/* overflow-hidden é o segundo cinto de segurança pedido pelo
          ux-guidance.md ("se usar clip-path para revelar, lembre de clipar
          o wrapper com overflow:hidden") — redundante com o `round` do
          clip-path acima, mas barato e protege qualquer filho futuro
          (ex.: um selo/legenda) que a foto ainda não tem. */}
      <div
        ref={ref}
        className="relative aspect-square w-[min(300px,80vw)] overflow-hidden rounded-[20px] bg-borda"
      >
        <Image src={img} alt={alt} fill sizes="(max-width: 768px) 80vw, 300px" className="object-cover" />
      </div>
    </div>
  );
}

/**
 * Seção "Antes e Depois" (Task 14) — condicional por design: some por
 * completo (sem título órfão) no dia em que `ANTES_DEPOIS` esvaziar, porque
 * a autorização de uso de imagem de algum paciente foi revogada ou nunca
 * confirmada (PERGUNTAS-CLIENTE.md, pendência nº2, "trava a publicação").
 *
 * `overflow-x-auto` vive só no scroller (`.antes-depois-scroller`), nunca
 * na seção — mesma regra que Depoimentos.tsx (Task 12) já segue.
 *
 * Sem sobretítulo: COPY.md §8 só dá "Título: Resultados reais", sem um
 * sobretítulo aprovado — por isso o <h2> não usa <SectionHeading> (que
 * exige a prop), e sim as mesmas classes que ela aplica ao título, para
 * ficar visualmente idêntico ao resto do site.
 */
export function AntesDepois() {
  // `!ANTES_DEPOIS.length` (não `=== 0`): o array vem de `as const` em
  // lib/content.ts, então o TypeScript infere `.length` como o literal `5`
  // (tupla de tamanho fixo) — comparar `5 === 0` é sinalizado como
  // impossível (TS2367) em tempo de compilação. A checagem de truthiness
  // evita o literal-type mismatch e continua funcionando de verdade no dia
  // em que o array esvaziar.
  if (!ANTES_DEPOIS.length) return null;

  return (
    <section id="antes-depois" className="bg-creme px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1360px]">
        <Reveal as="h2" className="font-titulo uppercase leading-[0.96] text-balance text-preto">
          Resultados reais
        </Reveal>

        <div className="antes-depois-scroller mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 pb-2 md:mt-14 md:gap-6 md:scroll-pl-8">
          {ANTES_DEPOIS.map((item, i) => (
            <ImagemAntesDepois key={item.img} img={item.img} alt={item.alt} delay={i * STAGGER_STEP} />
          ))}
        </div>

        <p className="mt-6 max-w-[72ch] font-corpo text-[13.5px] leading-relaxed text-grafite">{AVISO_LEGAL}</p>
      </div>
    </section>
  );
}
