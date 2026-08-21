import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Seção "O Profissional" (Task 14). Server Component puro — igual a
 * Pilares.tsx/Tratamentos.tsx, o único cliente é o próprio <Reveal>, que já
 * carrega 'use client' internamente.
 *
 * DUAS pendências reais nesta seção, não uma só (correção pós-review: a
 * primeira versão só marcava o CRO). BRIEFING.md §4 marca separadamente:
 *   - CRO: "—" (⚠️ PENDENTE — obrigatório na publicidade odontológica)
 *   - Especialidade: "Ortodontista (bordado no jaleco)" mas
 *     "⚠️ PENDENTE — confirmar se é especialidade registrada"
 * São dados distintos. Pela Resolução CFO-196/2019 não se anuncia
 * especialidade sem registro correspondente — exibir "Ortodontista" como
 * fato afirmado sem essa confirmação carrega o mesmo risco regulatório que
 * inventar um número de CRO. Por isso os DOIS trechos (não só o CRO) levam
 * `border-bottom: 2px dashed` dourado (`PENDENTE`, abaixo) — nem o texto
 * nem a ordem mudam, só fica visualmente óbvio que ambos são dados a
 * confirmar antes de publicar. Ver PERGUNTAS-CLIENTE.md, pendência nº1.
 *
 * O parágrafo abaixo não pode citar formação, tempo de atuação ou qualquer
 * fato específico não confirmado (COPY.md §6 marca esse texto como
 * "⚠️ a escrever com o cliente" — exatamente essas três coisas). Só usa o
 * que já está confirmado: o nome e o traço real do negócio que o
 * BRIEFING.md já aprova (§3: consultório boutique, 1 cadeira — "o ativo
 * real é atendimento pessoal e especializado").
 *
 * O `alt` da foto (correção pós-review) descreve a CENA, não a credencial:
 * a primeira versão dizia "...ortodontista da Smile Ipiranga", e isso
 * afirmava a especialidade como fato para quem usa leitor de tela — sem a
 * ressalva de pendência que quem enxerga recebe pelo tracejado do `PENDENTE`
 * logo abaixo. Duas pessoas recebendo informação diferente, e a versão sem
 * ressalva é justamente a alegação que a Resolução CFO-196/2019 restringe.
 * `alt` existe para dizer o que a imagem MOSTRA (um retrato do Dr. Vinicius
 * no consultório), não para repetir uma credencial que já está no texto da
 * seção — que o leitor de tela lê logo em seguida, com a marcação de
 * pendente intacta. Testado: o `alt` não pode conter "ortodontista" (nem
 * variação), o texto da seção continua contendo.
 */

// Classe compartilhada pelas duas pendências (Ortodontista e CRO-SP) — uma
// fonte só, para as duas marcações nunca divergirem visualmente por acidente.
const PENDENTE = 'border-b-[2px] border-dashed border-dourado pb-0.5';

export function Profissional() {
  return (
    <section id="profissional" className="bg-creme px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1080px] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-[clamp(32px,6vw,80px)]">
        <Reveal className="mx-auto w-full max-w-[380px]">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-borda">
            <Image
              src="/img/dr-vinicius.jpg"
              alt="Dr. Vinicius Aracena no consultório da Smile Ipiranga"
              fill
              sizes="(max-width: 768px) 80vw, 380px"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="flex flex-col gap-5">
          <SectionHeading sobretitulo="Quem vai te atender" titulo="Dr. Vinicius Aracena" />

          <p className="font-rotulo text-[15px] tracking-wide text-grafite">
            <span className={PENDENTE}>Ortodontista</span>{' '}
            <span aria-hidden="true">·</span>{' '}
            <span className={PENDENTE}>CRO-SP a confirmar</span>
          </p>

          <p className="max-w-[46ch] font-corpo text-[16px] leading-relaxed text-grafite">
            Dr. Vinicius atende pessoalmente cada paciente da Smile, do diagnóstico ao
            acompanhamento do tratamento, com calma para explicar cada etapa antes de começar.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
