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
};

const CORES_TEMA = {
  claro: { sobretitulo: 'text-grafite', titulo: 'text-preto' },
  escuro: { sobretitulo: 'text-amarelo', titulo: 'text-branco' },
} as const;

/**
 * Padrão repetido em quase toda seção do site: um sobretítulo pequeno em
 * caixa alta (Jost, tracking largo) seguido do título de destaque (Archivo
 * Black). A Hero é a única a pedir `as="h1"` e um tamanho de fonte próprio
 * via `tituloClassName` — as demais seções (Tratamentos, Clínica, ...) usam
 * o padrão `h2` default nas próximas tasks.
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
}: Props) {
  const alinhamento = align === 'center' ? 'items-center text-center' : 'items-start text-left';
  const cores = CORES_TEMA[tema];

  return (
    <div className={`flex flex-col gap-3 ${alinhamento}${className ? ` ${className}` : ''}`}>
      <p className={`font-rotulo text-[13px] uppercase tracking-[.34em] ${cores.sobretitulo}`}>{sobretitulo}</p>
      {children}
      <Tag
        className={`font-titulo uppercase leading-[0.96] text-balance ${cores.titulo}${
          tituloClassName ? ` ${tituloClassName}` : ''
        }`}
      >
        {titulo}
      </Tag>
    </div>
  );
}
