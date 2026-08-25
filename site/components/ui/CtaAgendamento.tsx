'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import { waLink, ENDERECO, INSTAGRAM } from '@/lib/contact';
import { useCapability } from '@/lib/useCapability';
import { Expandable, ExpandableContent, useExpandable } from '@/components/cultui/Expandable';
import SpecularButton from '@/components/reactbits/SpecularButton';

/**
 * O CTA "Agendar minha avaliação" (Task 21, pedido do dono do projeto): em vez
 * de sair direto para o WhatsApp, o botão abre um cartão com quem vai atender,
 * o que a clínica faz e onde ela fica — e é de lá que sai o botão do WhatsApp.
 *
 * O componente que abre é o `Expandable` do cult-ui, vendorizado em
 * components/cultui/Expandable.tsx.
 *
 * Task 23: o botão em si virou o `SpecularButton` do React Bits onde faz
 * sentido (ver `Gatilho`, abaixo), e o `Magnet` — que fazia o botão seguir o
 * cursor — saiu a pedido do dono do projeto. Os dois efeitos juntos seriam
 * dois motivos diferentes para a mesma peça se mexer com o ponteiro.
 *
 * Uma consequência que vale dizer em voz alta: quem antes chegava ao WhatsApp
 * em um toque agora precisa de dois. Os caminhos diretos continuam existindo —
 * o botão do topo, o do menu no celular e a ilha flutuante levam ao WhatsApp
 * sem parada. Este aqui virou o caminho com contexto.
 *
 * Todo dado do cartão já estava no site (a faixa logo abaixo do hero) e sai de
 * `lib/contact.ts`. Nada de horário, nota, convênio ou número de pacientes —
 * nenhum deles está confirmado.
 */

type Props = {
  /** `amarelo` no hero (sobre o creme), `preto` em Tratamentos. */
  tema?: 'amarelo' | 'preto';
  /**
   * Liga o reflexo especular (WebGL) no botão — só o hero usa. Ele monta
   * mesmo assim só quando há ponteiro fino: ver `Gatilho` abaixo.
   */
  brilho?: boolean;
  /**
   * Cartão sem a foto e sem a linha do Instagram. É o que o hero usa: lá o
   * cartão abre DENTRO do palco fixo, com a headline em cima, e o cartão
   * inteiro (385px medidos) não cabe na tela de um celular junto com ela. O
   * compacto mede ~230px. Em Tratamentos, que é fluxo normal de página e não
   * tem teto, vai o cartão inteiro.
   */
  compacto?: boolean;
  className?: string;
};

const ROTULO = 'Agendar minha avaliação';

export function CtaAgendamento({ tema = 'amarelo', brilho = false, compacto = false, className = '' }: Props) {
  const { podeAnimar } = useCapability();
  const [aberto, setAberto] = useState(false);
  const idConteudo = useId();

  return (
    <Expandable
      expanded={aberto}
      onToggle={() => setAberto((v) => !v)}
      reducedMotion={!podeAnimar}
      contentId={idConteudo}
      className={`flex w-full flex-col items-center ${className}`.trim()}
    >
      <Gatilho tema={tema} brilho={brilho} />

      <ExpandableContent preset="slide-up" className="w-full">
        <div className="flex justify-center pt-4">
          {/* `w-full max-w-[440px]`, não `w-[min(92vw,440px)]`: o cartão vive
              dentro de um contêiner com `overflow: hidden` (é assim que a
              altura anima), e uma largura calculada a partir da viewport pode
              passar da largura desse contêiner e ser cortada em silêncio. */}
          <div className="w-full max-w-[440px] rounded-[24px] border border-borda-forte bg-branco p-5 text-left shadow-[0_24px_60px_rgba(17,17,17,0.16)]">
            <div className="flex items-start gap-4">
              {!compacto && (
                <div className="relative h-[92px] w-[74px] shrink-0 overflow-hidden rounded-[16px] bg-borda">
                  <Image
                    src="/img/hero-foto.jpg"
                    alt="Dr. Vinicius Aracena sorrindo sob o letreiro da Smile Ipiranga"
                    fill
                    sizes="74px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <p className="font-rotulo text-[12px] tracking-[.12em] text-preto uppercase">
                  Facetas • Implantes • Próteses
                </p>
                <p className="font-corpo text-[14px] leading-relaxed text-grafite">
                  Consultório de cadeira única — aqui você não é encaixado entre um paciente e outro.
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-borda pt-4 font-corpo text-[14px] leading-relaxed text-grafite">
              <p>
                {ENDERECO.rua}, {ENDERECO.numero} — {ENDERECO.bairro}, {ENDERECO.cidade}/{ENDERECO.uf}
              </p>
              {!compacto && (
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable inline-flex min-h-11 items-center underline underline-offset-4 pointer-fine:hover:text-preto"
                >
                  @smileipiranga
                </a>
              )}
            </div>

            {/* O destino final: daqui a pessoa vai para o WhatsApp. Amarelo com
                o símbolo do WhatsApp, igual ao botão flutuante do site — a
                paleta da marca não tem verde, e o ícone já diz para onde vai. */}
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable mt-4 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-amarelo px-6 font-rotulo text-[13px] font-medium tracking-[.08em] text-preto uppercase pointer-fine:hover:bg-dourado"
            >
              <WhatsAppIcon />
              Falar no WhatsApp
            </a>

            {!compacto && (
              <p className="mt-3 text-center font-rotulo text-[11px] tracking-[.12em] text-grafite uppercase">
                Abre a conversa no WhatsApp
              </p>
            )}
          </div>
        </div>
      </ExpandableContent>
    </Expandable>
  );
}

/**
 * O botão que abre o cartão. Duas variantes do MESMO botão — mesmas classes,
 * mesmo rótulo, mesmo estado anunciado:
 *
 * - Com ponteiro fino e aparelho folgado, é o `SpecularButton` do React Bits
 *   (Task 23, pedido do dono do projeto): um reflexo corre pela borda do
 *   botão seguindo o cursor.
 * - Em qualquer outro caso, um `<button>` comum.
 *
 * O corte não é economia arbitrária: o efeito é literalmente guiado pelo
 * ponteiro. Num aparelho de toque não existe ponteiro para seguir, o brilho
 * nunca acenderia (`bright` fica em zero), e o que sobraria seria um contexto
 * WebGL desenhando um contorno parado a 60 quadros por segundo. `podePesado`
 * cobre o resto: aparelho fraco, economia de dados e movimento reduzido.
 *
 * As duas variantes precisam carregar `aria-expanded` e `aria-controls` — por
 * isso o gatilho lê o contexto do `Expandable` direto, em vez de usar o
 * `ExpandableTrigger` (que renderiza o próprio `<button>`, e dois botões não
 * se aninham).
 */
function Gatilho({ tema, brilho }: { tema: 'amarelo' | 'preto'; brilho: boolean }) {
  const { isExpanded, toggleExpand, contentId } = useExpandable();
  const { podeAnimar, podePesado, pontoFino } = useCapability();

  const cores =
    tema === 'amarelo'
      ? 'bg-amarelo text-preto pointer-fine:hover:bg-dourado'
      : 'bg-preto text-branco pointer-fine:hover:bg-escuro-linha';

  const classes = `pressable inline-flex min-h-11 items-center gap-2 rounded-full px-7 font-rotulo text-[13px] font-medium tracking-[.08em] uppercase ${cores}`;

  const conteudo = (
    <>
      {ROTULO}
      <Seta aberto={isExpanded} animar={podeAnimar} />
    </>
  );

  const comuns = {
    type: 'button' as const,
    onClick: toggleExpand,
    'aria-expanded': isExpanded,
    'aria-controls': contentId,
  };

  if (brilho && pontoFino && podePesado) {
    return (
      <SpecularButton
        {...comuns}
        size="livre"
        // `radius` alto vira pílula: o shader já limita o raio a metade do
        // menor lado, então qualquer número grande dá o mesmo arredondamento
        // que o `rounded-full` das classes.
        radius={999}
        // O botão pinta o PRÓPRIO fundo (o original nasce transparente). Sem
        // isto, a classe `bg-amarelo` e o `background` que o componente emite
        // disputariam a mesma cascata.
        tint="var(--color-amarelo)"
        tintOpacity={1}
        textColor="var(--color-preto)"
        // Reflexo branco sobre um traço dourado escuro: é o amarelo da marca
        // ganhando luz, não um botão cinza de demonstração.
        lineColor="#FFFFFF"
        baseColor="var(--color-dourado)"
        intensity={1.15}
        thickness={1.4}
        proximity={280}
        reducedMotion={!podeAnimar}
        className={classes}
      >
        {conteudo}
      </SpecularButton>
    );
  }

  return (
    <button {...comuns} className={classes}>
      {conteudo}
    </button>
  );
}

/** Vira para cima quando o cartão está aberto. Só `transform`. */
function Seta({ aberto, animar }: { aberto: boolean; animar: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={`${animar ? 'transition-transform duration-300 ease-saida' : ''} ${aberto ? 'rotate-180' : ''}`.trim()}
    >
      <path d="M2 4.2 6 8.2l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** O mesmo símbolo da ilha flutuante (components/layout/IlhaContato.tsx). */
function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.02 3C9.4 3 4 8.36 4 14.94c0 2.18.59 4.22 1.61 5.98L4 29l8.28-2.17a12.9 12.9 0 0 0 3.74.55h.01c6.62 0 12.02-5.36 12.02-11.94C28.05 8.36 22.65 3 16.02 3Zm0 21.8h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-4.92 1.29 1.31-4.77-.24-.39a9.79 9.79 0 0 1-1.52-5.19c0-5.42 4.43-9.83 9.9-9.83 5.46 0 9.89 4.41 9.89 9.83 0 5.42-4.43 9.86-9.9 9.86Zm5.42-7.38c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.86 1.22 3.06.15.2 2.1 3.2 5.09 4.48.71.31 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
      />
    </svg>
  );
}
