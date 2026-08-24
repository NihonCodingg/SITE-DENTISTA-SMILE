'use client';

import Image from 'next/image';
import { useCapability } from '@/lib/useCapability';
import GlareHover from '@/components/reactbits/GlareHover';

/**
 * Uma linha da faixa de Tratamentos, envolvida pelo `GlareHover` do React
 * Bits (Task 19, "maximizar React Bits" — ver
 * components/reactbits/README.md). Client Component só por causa disso:
 * `GlareHover` usa `onMouseEnter`/`onMouseLeave` e precisa saber se o
 * aparelho tem ponteiro fino (mouse/trackpad) — e como ele não pode
 * consultar `matchMedia` por conta própria (política do projeto: fonte
 * única é `useCapability()`), esse hook só pode rodar aqui, num Client
 * Component. `Tratamentos.tsx` continua Server Component (lê o disco pra
 * decidir qual foto existe) e só passa os dados prontos por prop.
 */
export function TratamentoLinha({
  href,
  n,
  nome,
  desc,
  img,
  temFoto,
}: {
  href: string;
  n: string;
  nome: string;
  desc: string;
  img: string;
  temFoto: boolean;
}) {
  const { pontoFino } = useCapability();

  return (
    <GlareHover
      disabled={!pontoFino}
      glareColor="#F0B40C"
      glareOpacity={0.35}
      glareAngle={-20}
      glareSize={200}
      transitionDuration={550}
      className="block"
    >
      <a
        href={href}
        className="pressable group grid min-h-11 grid-cols-[auto_auto_1fr_auto] items-center gap-4 border-b border-borda py-5 pointer-fine:hover:bg-branco md:gap-6"
      >
        <span className="font-rotulo text-[15px] tabular-nums text-dourado">{n}</span>

        <div className="relative aspect-square w-[clamp(60px,8vw,92px)] shrink-0 overflow-hidden rounded-[14px] border border-borda bg-creme">
          {temFoto ? (
            <Image src={img} alt="" fill sizes="92px" className="object-cover" />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center font-titulo text-[22px] text-dourado"
            >
              ✦
            </span>
          )}
        </div>

        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-titulo text-[clamp(21px,3vw,34px)] leading-[1.05] uppercase text-preto">{nome}</span>{' '}
          {/* Espaço explícito entre nome e descrição: os dois são <span>
              irmãos sem nenhum texto entre eles no DOM — sem esse
              separador, o nome do computedname (ex.: "... implante" +
              "Solução...") gruda o fim de uma palavra no início da outra,
              sem pausa nenhuma pra quem ouve por leitor de tela. */}
          <span className="font-corpo text-[16px] text-grafite">{desc}</span>
        </span>

        <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-preto">
          <SetaIcon />
        </span>
      </a>
    </GlareHover>
  );
}

function SetaIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-200 ease-[var(--ease-movimento)] pointer-fine:group-hover:translate-x-0.5 pointer-fine:group-hover:-translate-y-0.5"
    >
      <path
        d="M4 12 12 4M12 4H5.5M12 4v6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
