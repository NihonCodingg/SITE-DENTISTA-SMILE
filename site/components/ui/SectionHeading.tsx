import type { ReactNode } from 'react';

type Props = {
  /** Elemento semântico do título. Só a Hero usa 'h1' — é o único h1 da página. */
  as?: 'h1' | 'h2';
  sobretitulo: string;
  titulo: ReactNode;
  align?: 'left' | 'center';
  /** Slot opcional entre o sobretítulo e o título — a Hero usa para o arco decorativo. */
  children?: ReactNode;
  className?: string;
  tituloClassName?: string;
  /** 'claro' (default, inalterado) é para fundo claro/creme — sobretítulo grafite,
   *  título preto. 'escuro' é para fundo escuro (Task 13, seção Sorrisos, fundo
   *  #111111/--color-preto) — sobretítulo amarelo, título branco. Prop em vez de
   *  um componente novo porque o resto do padrão (fonte, tracking, gap) é idêntico
   *  nos dois casos; só a cor muda. */
  tema?: 'claro' | 'escuro';
  /** Nome acessível do título, quando o conteúdo visível não serve de nome
   *  (Task 18, A1: a Hero fatia a headline em spans via SplitText — o
   *  `aria-label` vai no heading, único lugar onde é válido). */
  tituloAriaLabel?: string;
};

const CORES_TEMA = {
  claro: { sobretitulo: 'text-grafite', titulo: 'text-preto' },
  escuro: { sobretitulo: 'text-amarelo', titulo: 'text-branco' },
} as const;

/**
 * Tamanho default do `<h2>` de seção — todo `SectionHeading` que NÃO passa
 * `tituloClassName` cai aqui (ver correção site-wide em
 * fix-titulos-report.md). Sem uma classe `text-[...]` explícita no título,
 * o preflight do Tailwind v4 zera o tamanho nativo do heading, e ele
 * renderiza do mesmo tamanho do corpo do texto (~16px) — foi exatamente
 * isso que aconteceu nas nove seções que usam `SectionHeading` sem passar
 * tamanho próprio. Um default aqui, em vez de exigir que toda seção nova se
 * lembre de passar o próprio `tituloClassName`, é a defesa real: a seção
 * que esquecer ainda sai com um tamanho de destaque, nunca com o tamanho do
 * corpo herdado por acidente.
 *
 * `clamp(28px,4.5vw,48px)` é o valor do design aprovado (Claude Design) que
 * mais se repete entre as seções (Clínica, Depoimentos, Antes e Depois,
 * Como Funciona, Localização) — as exceções com tamanho próprio (Sorrisos,
 * Profissional, FAQ, CTA Final) continuam passando `tituloClassName`, que
 * sobrepõe este default por inteiro (nunca soma — evita as duas classes de
 * `font-size` competindo na mesma cascata).
 */
export const TITULO_TAMANHO_PADRAO = 'text-[clamp(28px,4.5vw,48px)]';

// Letter-spacing do título de seção no design aprovado. Só o `<h2>` — a
// Hero (`as="h1"`) tem tratamento tipográfico próprio via `tituloClassName`
// e não deve herdar esta faixa (o `<h1>` medido no navegador não pode
// mudar).
export const TITULO_TRACKING = 'tracking-[-0.01em]';

/**
 * Padrão repetido em quase toda seção do site: um sobretítulo pequeno em
 * caixa alta (Jost, tracking largo) seguido do título de destaque (Archivo
 * Black). A Hero é a única a pedir `as="h1"` e um tamanho de fonte próprio
 * via `tituloClassName` — as demais seções (Tratamentos, Clínica, ...) usam
 * o `TITULO_TAMANHO_PADRAO` de `h2` por default, ou o próprio `tituloClassName`
 * quando o design pede um tamanho diferente do default (Sorrisos, Profissional).
 */
export function SectionHeading({
  as: Tag = 'h2',
  sobretitulo,
  titulo,
  align = 'left',
  children,
  className,
  tituloClassName,
  tema = 'claro',
  tituloAriaLabel,
}: Props) {
  const alinhamento = align === 'center' ? 'items-center text-center' : 'items-start text-left';
  const cores = CORES_TEMA[tema];
  const tracking = Tag === 'h2' ? ` ${TITULO_TRACKING}` : '';

  return (
    <div className={`flex flex-col gap-3 ${alinhamento}${className ? ` ${className}` : ''}`}>
      <p className={`font-rotulo text-[13px] uppercase tracking-[.34em] ${cores.sobretitulo}`}>{sobretitulo}</p>
      {children}
      <Tag
        aria-label={tituloAriaLabel}
        className={`font-titulo uppercase leading-[0.96]${tracking} text-balance ${cores.titulo} ${
          tituloClassName ?? TITULO_TAMANHO_PADRAO
        }`}
      >
        {titulo}
      </Tag>
    </div>
  );
}
