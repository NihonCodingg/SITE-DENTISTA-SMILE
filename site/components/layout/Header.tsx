'use client';

import Image from 'next/image';
import { TELEFONE, waLink } from '@/lib/contact';
import { MobileMenu } from './MobileMenu';

// Âncoras das seções que as Tasks 7 (hero/#tratamentos via Task 10), 12 e 15
// ainda vão criar. ids combinados aqui para as próximas tasks honrarem.
const NAV = [
  { rotulo: 'Tratamentos', href: '#tratamentos' },
  { rotulo: 'A Clínica', href: '#clinica' },
  { rotulo: 'Depoimentos', href: '#depoimentos' },
  { rotulo: 'Como Chegar', href: '#localizacao' },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F1E7DB] bg-branco/94 backdrop-blur-[8px]">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-[10px] md:px-8">
        <a href="#" className="shrink-0">
          <Image src="/img/logo.png" alt="Smile Ipiranga" width={82} height={46} priority className="h-[46px] w-auto" />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-rotulo text-[13px] tracking-[.14em] text-grafite uppercase transition-[color] duration-200 ease-out pointer-fine:hover:text-preto"
            >
              {item.rotulo}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${TELEFONE}`}
            aria-label="Ligar para a Smile"
            className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-borda-forte text-preto pointer-fine:hover:border-preto"
          >
            <TelefoneIcon />
          </a>

          <a
            href={waLink()}
            className="pressable hidden min-h-11 items-center rounded-full bg-amarelo px-6 font-rotulo text-[13px] font-medium tracking-[.08em] text-preto uppercase md:inline-flex pointer-fine:hover:bg-dourado"
          >
            Agendar avaliação
          </a>

          <MobileMenu items={NAV} />
        </div>
      </div>
    </header>
  );
}

function TelefoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6.6 3.4 4.4 5.6a1.4 1.4 0 0 0-.3 1.5c1 2.6 2.6 5 4.7 7.1 2.1 2.1 4.5 3.7 7.1 4.7.5.2 1.1 0 1.5-.3l2.2-2.2a1.3 1.3 0 0 0 0-1.9l-2.6-2c-.4-.3-.9-.3-1.3 0l-1 .8a10.7 10.7 0 0 1-4.6-4.6l.8-1c.3-.4.3-.9 0-1.3l-2-2.6a1.3 1.3 0 0 0-1.9 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
