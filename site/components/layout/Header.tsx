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

/**
 * Destino do logo (Task 18, E2). Não "#": o interceptador de âncoras de
 * lib/motion.tsx o exclui de propósito, e o clique vira o jump nativo bruto,
 * por fora do Lenis. Não "/": numa <a> comum é navegação de documento
 * inteiro — a página recarrega (flash branco, re-hidratação, Silk de novo).
 * "#topo" aponta para o <main id="topo"> de app/page.tsx e cai no caminho
 * normal do interceptador: Lenis rola suave até o topo (sem Lenis, sob
 * reduced-motion, é o salto nativo instantâneo — certo para esse caso).
 */
export const ANCORA_TOPO = '#topo';

export function Header() {
  return (
    // Sem backdrop-blur desde a investigação de travamento: um header sticky
    // com backdrop-filter re-desfoca a faixa inteira em todo quadro em que o
    // conteúdo embaixo muda — e "muda" inclui toda rolagem e toda animação
    // (a parede do hero deriva contínuo; os canvas WebGL redesenham). É um
    // imposto por quadro na página inteira, pago justamente nos trechos mais
    // pesados. A 94% de branco o desfoque era quase invisível; o custo, não.
    // O menu móvel não depende dele (o portal para o body existia justamente
    // por causa do containing-block do filter). `?teste=comblur` devolve o
    // blur para comparar lado a lado no aparelho (ver ModoDiagnostico).
    <header className="sticky top-0 z-50 border-b border-borda-header bg-branco">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-[10px] md:px-8">
        <a href={ANCORA_TOPO} className="shrink-0">
          <Image src="/img/logo.png" alt="Smile Ipiranga" width={82} height={46} preload className="h-[46px] w-auto" />
        </a>

        {/* gap-6 lg:gap-8 (Task 18, F2): em 768px o header estourava 8px
            (scrollWidth 761 vs clientWidth 753, CTA como elemento mais à
            direita). -24px no gap em md resolve; em lg+ nada muda. O corte do
            drawer fica em md — tablet paisagem com mouse não perde o nav. */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              // inline-flex min-h-11 items-center (Task 18, F1): texto puro
              // media 19,5px de altura — abaixo dos 24px da WCAG 2.5.8 e dos
              // 44px que o resto deste header já usa (CTA, telefone). Fonte,
              // tamanho, tracking e cor não mudam; a fileira já tem 44px por
              // causa do botão de telefone, então a altura do header não muda.
              className="inline-flex min-h-11 items-center font-rotulo text-[13px] tracking-[.14em] text-grafite uppercase transition-[color] duration-200 ease-saida pointer-fine:hover:text-preto"
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
