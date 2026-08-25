import { waLink } from '@/lib/contact';
import { Reveal } from '@/components/ui/Reveal';
import { TITULO_TRACKING } from '@/components/ui/SectionHeading';

/**
 * CTA final (Task 15) — COPY.md §12. Bloco amarelo, cantos bem arredondados
 * (`rounded-[32px]`, mesmo raio do card do Hero), centralizado.
 *
 * "sorriso" em Caveat (`font-script`) é o ÚNICO acento manuscrito do site
 * inteiro (design-guidance.md: "no máximo 1 ou 2 acentos manuscritos na
 * página toda, e este é o escolhido") — por isso a classe `font-script` não
 * aparece em nenhum outro componente. `normal-case` cancela o
 * `uppercase` herdado do resto do título: uma fonte script inteira em
 * caixa alta perderia a legibilidade manuscrita que o efeito busca.
 */
export function CtaFinal() {
  return (
    // `id="agendar"`: a IlhaContato observa esta seção para SUMIR enquanto
    // ela está na tela — quando o convite grande está à vista, a pílula
    // flutuante só cobriria o botão dele.
    <section id="agendar" className="bg-branco px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1080px]">
        <Reveal
          as="div"
          className="flex flex-col items-center gap-6 rounded-[32px] bg-amarelo px-6 py-16 text-center md:px-16 md:py-20"
        >
          {/* Tamanho próprio (clamp(32px,5.5vw,64px), do design aprovado) —
              o maior `<h2>` do site, de propósito: é o título de fechamento
              da página. `TITULO_TRACKING` vem de SectionHeading.tsx (ver
              fix-titulos-report.md). `text-[1.18em]` no "sorriso" abaixo
              continua relativo a ESSE tamanho — cresce junto com ele. */}
          <h2
            className={`max-w-[16ch] font-titulo uppercase leading-[0.96] ${TITULO_TRACKING} text-balance text-preto text-[clamp(32px,5.5vw,64px)]`}
          >
            Vamos cuidar do seu{' '}
            <span className="font-script text-[1.18em] normal-case">sorriso</span>?
          </h2>

          <p className="max-w-[46ch] font-corpo text-[16px] leading-relaxed text-preto">
            Manda uma mensagem contando o que você quer resolver. A gente responde e agenda sua
            avaliação.
          </p>

          <a
            href={waLink()}
            className="pressable inline-flex min-h-11 items-center justify-center rounded-full bg-preto px-8 font-rotulo text-[13px] font-medium tracking-[.08em] text-branco uppercase pointer-fine:hover:bg-branco pointer-fine:hover:text-preto"
          >
            Falar no WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
