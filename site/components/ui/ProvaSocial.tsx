import { AvatarCircles } from '@/components/magicui/AvatarCircles';
import { PENDENTE } from '@/components/ui/pendente';

/**
 * A fileira de rostos + cinco estrelas + "Mais de mil sorrisos transformados",
 * abaixo do CTA do hero (Task 22, pedido do dono do projeto, com referência
 * visual própria).
 *
 * ⚠️ **A frase e as estrelas são dado NÃO CONFIRMADO, e é por isso que o bloco
 * inteiro nasce com a marcação de pendência** (`PENDENTE`, o sublinhado
 * tracejado dourado que o site já usa no CRO, na especialidade e no horário).
 *
 * O que falta para tirar a marcação, e são duas coisas diferentes:
 *   1. O NÚMERO. "Mais de mil" é uma afirmação sobre o negócio; ninguém no
 *      material do cliente disse quantos pacientes a clínica atendeu.
 *   2. AS ESTRELAS. Cinco estrelas cheias afirmam uma nota — e o site não tem
 *      fonte de avaliação nenhuma (não há Google Reviews coletado, não há
 *      pesquisa). Ou elas passam a refletir a nota real da clínica, com o
 *      número de avaliações ao lado, ou saem.
 *
 * Enquanto isso não vier, o bloco fica visível E marcado: é exatamente a
 * regra do projeto — nunca inventar dado da clínica, e tornar a ausência
 * visível em vez de silenciosa. Ver o checklist em `site/README.md`.
 *
 * Os quatro rostos NÃO são novos: são retratos que a galeria "Sorrisos feitos
 * aqui" já exibe, então não entram pendências de autorização de imagem além
 * das que já existem.
 */

/** Quatro dos nove retratos da galeria, espaçados para não parecerem sequência. */
const ROSTOS = ['/img/retrato-2.jpg', '/img/retrato-4.jpg', '/img/retrato-6.jpg', '/img/retrato-8.jpg'];

const AFIRMACAO = 'Mais de mil sorrisos transformados';

type Props = {
  /** `claro` = sobre creme/branco; `escuro` = sobre preto. */
  tema?: 'claro' | 'escuro';
  className?: string;
};

export function ProvaSocial({ tema = 'claro', className = '' }: Props) {
  const corBorda = tema === 'escuro' ? 'var(--color-preto)' : 'var(--color-creme)';
  const corTexto = tema === 'escuro' ? 'text-escuro-texto' : 'text-grafite';

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <AvatarCircles imagens={ROSTOS} corBorda={corBorda} tamanho={38} />

      {/* Estrelas e frase dentro da MESMA marcação de pendência: as duas são
          afirmação sobre a clínica, e nenhuma das duas tem fonte hoje. */}
      <div className={`flex flex-col items-start gap-0.5 ${PENDENTE}`}>
        <Estrelas />
        <span className={`font-corpo text-[13px] leading-snug ${corTexto}`}>{AFIRMACAO}</span>
      </div>
    </div>
  );
}

/**
 * Cinco estrelas. `aria-hidden` porque a nota não existe como dado — não há o
 * que anunciar; o texto ao lado é o que o leitor de tela recebe.
 */
function Estrelas() {
  return (
    <span className="flex gap-0.5 text-amarelo" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 1.5l2.47 5.27 5.53.72-4.06 3.98.99 5.53L10 14.4l-4.93 2.6.99-5.53L2 7.49l5.53-.72L10 1.5Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}
