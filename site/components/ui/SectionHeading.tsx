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
};

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
}: Props) {
  const alinhamento = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-3 ${alinhamento}${className ? ` ${className}` : ''}`}>
      <p className="font-rotulo text-[13px] uppercase tracking-[.34em] text-grafite">{sobretitulo}</p>
      {children}
      <Tag
        className={`font-titulo uppercase leading-[0.96] text-balance text-preto${
          tituloClassName ? ` ${tituloClassName}` : ''
        }`}
      >
        {titulo}
      </Tag>
    </div>
  );
}
