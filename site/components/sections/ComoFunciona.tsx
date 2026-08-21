'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PASSOS } from '@/lib/content';
import { Reveal } from '@/components/ui/Reveal';
import { useCapability } from '@/lib/useCapability';

// 60ms — teto da janela de 30-80ms do guia de craft (correção pós-review:
// o brief original pedia i*0.1 = 100ms, acima do teto; alinhado aqui com o
// mesmo STAGGER_STEP que AntesDepois.tsx já usa, por consistência entre
// seções).
const STAGGER_STEP = 0.06;

/**
 * Linha de progresso vertical "ligando os quatro números" (brief), scaleY
 * 0→1 via ScrollTrigger, só `transform`.
 *
 * Decisão sobre o mobile (registrada em task-14-report.md, o brief pede
 * para decidir e justificar): o grid é o `repeat(auto-fit,minmax(min(230px,100%),1fr))`
 * do brief — o MESMO padrão que Pilares.tsx já usa. Com o container desta
 * seção (max-w-[1080px], px-4 abaixo de md), 2 colunas já cabem a partir de
 * ~516px de largura de viewport (2×230 + 24 de gap + 32 de padding). Ou
 * seja: a única largura em que uma linha vertical "liga" os quatro números
 * de fato — coluna única, um embaixo do outro — é a mobile. A partir daí os
 * quatro ficam lado a lado numa única linha horizontal, e uma linha
 * vertical não conecta nada; forçá-la ali ficaria estranha (o próprio
 * risco que o brief avisa, só que invertido: aqui é o desktop que quebra a
 * metáfora, não o mobile).
 *
 * Por isso: a linha só é renderizada visualmente até 480px (`max-[480px]:block`,
 * puro CSS — folga de segurança abaixo do ponto real de quebra em ~516px,
 * para nunca aparecer já com 2 colunas), e escondida (não desmontada) daí
 * pra cima. A animação em si continua rodando por trás mesmo quando
 * escondida — o custo é só transform, então não vale complicar com
 * ResizeObserver/JS para ligar e desligar por breakpoint.
 */
function LinhaProgresso() {
  const ref = useRef<HTMLDivElement>(null);
  const { podeAnimar, montado } = useCapability();

  useEffect(() => {
    const el = ref.current;
    // Sob reduced-motion (podeAnimar false) o efeito não roda, e o elemento
    // fica no estado padrão (sem transform = escala cheia, sempre visível)
    // — "reduzir não é zerar": remove o movimento decorativo, não o
    // elemento (design-guidance.md, tabela de reduced-motion: "Parallax,
    // translate, scale → Remover o movimento").
    if (!el || !montado || !podeAnimar) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.set(el, { scaleY: 0 });
    const anim = gsap.to(el, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: 0.6,
      },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
      gsap.set(el, { clearProps: 'all' });
    };
  }, [montado, podeAnimar]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="hidden max-[480px]:block absolute top-0 bottom-0 left-0 -z-10 w-[2px] bg-amarelo/40"
      style={{ transformOrigin: 'top center' }}
    />
  );
}

/**
 * Seção "Como Funciona" (Task 14). 'use client' porque a linha de progresso
 * precisa de `useCapability()` + ScrollTrigger — mesma fronteira mínima que
 * Depoimentos.tsx/Clinica.tsx já usam para as próprias necessidades de
 * cliente.
 *
 * Sem sobretítulo: COPY.md §9 só dá "Título: Da primeira mensagem ao seu
 * tratamento", sem sobretítulo aprovado — mesmo caso de AntesDepois.tsx.
 */
export function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-creme px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1080px]">
        <Reveal as="h2" className="font-titulo uppercase leading-[0.96] text-balance text-preto">
          Da primeira mensagem ao seu tratamento
        </Reveal>

        {/* `isolate`: sem isso o `-z-10` da LinhaProgresso escapa deste
            wrapper. `position:relative` sozinho, com z-index:auto, NÃO cria
            um novo contexto de empilhamento — um z-index negativo dentro
            dele sobe até o ancestral mais próximo que cria um (nenhum,
            neste caso), e a linha acaba pintada atrás de TUDO, inclusive do
            `bg-creme` da própria seção (achado de review visual em 375px:
            a linha simplesmente não aparecia). `isolate` (isolation:
            isolate) fecha um contexto de empilhamento aqui, prendendo o
            z-index negativo dentro deste wrapper — a linha fica atrás dos
            4 passos (estáticos), na frente do fundo creme da seção. */}
        <div className="relative isolate mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))] gap-6 md:mt-14">
          <LinhaProgresso />

          {PASSOS.map((p, i) => (
            <Reveal
              key={p.n}
              delay={i * STAGGER_STEP}
              className="flex flex-col gap-2 border-t-[3px] border-borda-forte pt-5"
            >
              <span className="font-titulo text-[40px] leading-none text-amarelo">{p.n}</span>
              <h3 className="font-titulo text-[17px] text-preto">{p.titulo}</h3>
              <p className="font-corpo text-[16px] text-grafite">{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
