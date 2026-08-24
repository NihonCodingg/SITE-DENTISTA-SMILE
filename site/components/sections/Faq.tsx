'use client';

import { useRef, useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQ } from '@/lib/content';
import { useCapability } from '@/lib/useCapability';
import { TITULO_TRACKING } from '@/components/ui/SectionHeading';

// Mesma curva de --ease-saida (globals.css), no formato de array que a
// Motion aceita — abertura/fechamento do conteúdo da pergunta.
const EASE_SAIDA: [number, number, number, number] = [0.23, 1, 0.32, 1];

/**
 * Um item do acordeão. `<details>`/`<summary>` nativos por baixo de tudo —
 * sem JavaScript, um clique no `<summary>` continua abrindo/fechando o
 * `<details>` do jeito normal do navegador, sem nenhuma perda de
 * acessibilidade ou funcionalidade.
 *
 * Com JavaScript, o clique é interceptado (`preventDefault`) para o
 * conteúdo poder ser animado pela Motion em vez de aparecer/desaparecer
 * instantaneamente — mas o atributo `open` do `<details>` continua sendo a
 * fonte de verdade que leitores de tela enxergam:
 *   - Ao ABRIR: `open` vira `true` no MESMO instante em que o estado muda,
 *     antes da animação começar — o conteúdo já existe de verdade no DOM
 *     enquanto a Motion anima de 0 até a altura real.
 *   - Ao FECHAR: `open` só vira `false` DEPOIS que a animação de saída
 *     termina (`onExitComplete`), não no clique. Se o atributo fosse
 *     removido na hora, o navegador escondería o conteúdo (`display: none`
 *     nativo do `<details>` fechado) antes da Motion conseguir animar a
 *     saída — a pessoa veria o conteúdo sumir instantaneamente, não fechar.
 */
function ItemFaq({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const { podeAnimar } = useCapability();
  const detalhesRef = useRef<HTMLDetailsElement>(null);
  const [aberto, setAberto] = useState(false);

  function alternar(e: MouseEvent<HTMLElement>) {
    e.preventDefault();
    if (aberto) {
      setAberto(false);
      return;
    }
    if (detalhesRef.current) detalhesRef.current.open = true;
    setAberto(true);
  }

  return (
    <details ref={detalhesRef} className="border-t border-borda py-1 last:border-b">
      <summary
        onClick={alternar}
        className="pressable flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-4 font-rotulo text-[16px] text-preto [&::-webkit-details-marker]:hidden"
      >
        <span>{pergunta}</span>
        <span
          aria-hidden="true"
          className={
            'shrink-0 font-titulo text-[22px] leading-none text-dourado transition-transform duration-200 ease-[var(--ease-saida)] ' +
            (aberto ? 'rotate-45' : '')
          }
        >
          +
        </span>
      </summary>

      <AnimatePresence
        initial={false}
        onExitComplete={() => {
          if (detalhesRef.current) detalhesRef.current.open = false;
        }}
      >
        {aberto && (
          <motion.div
            key="conteudo"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: podeAnimar ? 0.25 : 0, ease: EASE_SAIDA }}
            className="overflow-hidden"
          >
            <p className="max-w-[68ch] pb-5 font-corpo text-[16px] leading-relaxed text-grafite">{resposta}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </details>
  );
}

/**
 * Seção "Perguntas frequentes" (Task 15). COPY.md §11 tem 5 perguntas, mas
 * só 2 estão confirmadas em `lib/content.ts` (`FAQ`) — as outras (convênio,
 * pagamento, duração da avaliação, emergência) dependem de resposta do
 * cliente e não entram aqui. `FAQ` já é a fonte única da Task 4; esta seção
 * só renderiza o que existir nela, sem hardcoded extra.
 *
 * O `<h2>` abaixo tem tamanho próprio (`clamp(26px,4vw,40px)`, do design
 * aprovado) menor que o default das outras seções — o FAQ é uma lista longa
 * de perguntas, então um título grande aqui competiria pela atenção com o
 * conteúdo real da seção. `TITULO_TRACKING` vem de SectionHeading.tsx (não
 * repetido como literal) pela mesma razão de todo outro `<h2>` cru do site
 * (ver fix-titulos-report.md).
 */
export function Faq() {
  return (
    <section id="faq" className="bg-branco px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[820px]">
        <h2
          className={`font-titulo uppercase leading-[0.96] ${TITULO_TRACKING} text-balance text-preto text-[clamp(26px,4vw,40px)]`}
        >
          Perguntas frequentes
        </h2>

        <div className="mt-8 md:mt-10">
          {FAQ.map((item) => (
            <ItemFaq key={item.p} pergunta={item.p} resposta={item.r} />
          ))}
        </div>
      </div>
    </section>
  );
}
