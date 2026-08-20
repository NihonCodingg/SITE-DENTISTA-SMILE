'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { waLink } from '@/lib/contact';
import { useCapability } from '@/lib/useCapability';
import { useLenis } from '@/lib/motion';
import type Lenis from 'lenis';

type Item = { rotulo: string; href: string };

// Mesma curva de --ease-gaveta (globals.css), traduzida para o formato de array
// que a Motion aceita — os dois lugares descrevem a mesma curva com a mesma
// intenção: entrada e saída do drawer do menu mobile.
const EASE_GAVETA: [number, number, number, number] = [0.32, 0.72, 0, 1];

// Mesma curva de --ease-saida (globals.css) — feedback de toque nos itens do
// drawer. Não pode depender da classe CSS .pressable ali: a Motion escreve o
// transform de entrada como estilo inline no elemento assentado
// ("transform: translateX(0px)"), e estilo inline sempre vence regra de
// classe, com ou sem pseudo-classe — o :active de .pressable nunca ganharia.
// whileTap injeta o scale no MESMO sistema que já é dono do transform desses
// itens, então compõe corretamente em vez de perder a corrida de cascata — mas
// só compõe de verdade se o transform de entrada TAMBÉM estiver nesse sistema
// (ver o comentário em variantesItem, mais abaixo, sobre por que ele usa `x`
// em vez do literal `transform: 'translateX()'`).
const EASE_SAIDA: [number, number, number, number] = [0.23, 1, 0.32, 1];

const FOCAVEIS_SELETOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function travarScroll(lenis: Lenis | null) {
  if (lenis) {
    lenis.stop();
    return;
  }
  // Sem Lenis (reduced-motion, onde o MotionProvider nem chega a criar a
  // instância), a trava usa position:fixed no scroll atual em vez de
  // overflow:hidden — que remove a barra de rolagem e causa o salto lateral
  // que o brief pede para evitar.
  const y = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${y}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
}

function destravarScroll(lenis: Lenis | null) {
  if (lenis) {
    lenis.start();
    return;
  }
  const top = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  window.scrollTo(0, top ? -parseInt(top, 10) : 0);
}

export function MobileMenu({ items }: { items: readonly Item[] }) {
  const [aberto, setAberto] = useState(false);
  const { podeAnimar } = useCapability();
  const lenis = useLenis();
  const painelId = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);

  const fechar = () => {
    setAberto(false);
    destravarScroll(lenis);
    botaoRef.current?.focus();
  };

  const abrir = () => {
    setAberto(true);
    travarScroll(lenis);
  };

  // Escape fecha, Tab/Shift+Tab prende o foco dentro do painel, e o foco
  // inicial vai para o primeiro elemento focável do painel ao abrir.
  useEffect(() => {
    if (!aberto) return;
    const painel = painelRef.current;
    if (!painel) return;

    const focaveis = () => Array.from(painel.querySelectorAll<HTMLElement>(FOCAVEIS_SELETOR));
    focaveis()[0]?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        fechar();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focaveis();
      if (els.length === 0) return;
      const primeiro = els[0];
      const ultimo = els[els.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const variantesFundo = {
    fechado: { opacity: 0, transition: { duration: 0.22 } },
    aberto: { opacity: 1, transition: { duration: 0.3 } },
  };

  const variantesPainel = podeAnimar
    ? {
        // `opacity` é fixado em 1 nos dois estados (a visibilidade é só o
        // transform) de propósito: useCapability() começa com podeAnimar
        // false até o efeito resolver, então o primeiríssimo commit usa o
        // ramo reduced-motion abaixo (que define opacity:0 em "fechado"). A
        // Motion só atualiza propriedades presentes no variant atual — se
        // este ramo não declarasse opacity, o 0 herdado daquele primeiro
        // commit ficaria preso para sempre e o painel nunca apareceria.
        fechado: { transform: 'translateX(100%)', opacity: 1, transition: { duration: 0.22, ease: EASE_GAVETA } },
        aberto: {
          transform: 'translateX(0%)',
          opacity: 1,
          transition: { duration: 0.3, ease: EASE_GAVETA, staggerChildren: 0.04, delayChildren: 0.08 },
        },
      }
    : {
        // Sob reduced-motion o drawer não desliza — só um fade curto, sem
        // escalonamento nos itens (abre tudo junto).
        fechado: { transform: 'translateX(0%)', opacity: 0, transition: { duration: 0.2 } },
        aberto: { transform: 'translateX(0%)', opacity: 1, transition: { duration: 0.2 } },
      };

  // Único lugar do projeto onde a entrada usa o atalho `x` da Motion em vez do
  // `transform` literal que o resto do código prefere (ver COPY/guia de
  // craft). Comprovado ao vivo no navegador que a mistura quebra o whileTap
  // abaixo: quando a entrada escreve `transform: 'translateX(...)'` como
  // string crua, a Motion trata isso como um valor opaco e não sabe compor
  // scale (do whileTap) com ele — o pointerdown disparava normalmente
  // (onTapStart chegava a rodar) mas o estilo nunca ganhava o scale(0.97).
  // Trocar para `x` bota a translação no MESMO sistema de valores compostos
  // que o `scale` do whileTap usa, e os dois passam a se combinar num único
  // `transform` corretamente. Sem essa troca não existe jeito de dar
  // feedback de toque nesses itens.
  const variantesItem = podeAnimar
    ? {
        fechado: { opacity: 0, x: 16 },
        aberto: { opacity: 1, x: 0, transition: { duration: 0.22, ease: EASE_GAVETA } },
      }
    : {
        fechado: { opacity: 0 },
        aberto: { opacity: 1, transition: { duration: 0.2 } },
      };

  return (
    <div className="md:hidden">
      <button
        ref={botaoRef}
        type="button"
        aria-expanded={aberto}
        aria-controls={painelId}
        aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => (aberto ? fechar() : abrir())}
        className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-borda-forte text-preto"
      >
        <HamburgerIcon aberto={aberto} />
      </button>

      <motion.div
        aria-hidden={!aberto}
        onClick={fechar}
        initial="fechado"
        animate={aberto ? 'aberto' : 'fechado'}
        variants={variantesFundo}
        className={'fixed inset-0 z-[65] bg-preto/40' + (aberto ? '' : ' pointer-events-none')}
      />

      <motion.div
        ref={painelRef}
        id={painelId}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!aberto}
        inert={!aberto}
        initial="fechado"
        animate={aberto ? 'aberto' : 'fechado'}
        variants={variantesPainel}
        className={
          'fixed right-0 top-0 z-[70] flex h-dvh w-[min(320px,86vw)] flex-col justify-between bg-creme px-6 py-6 shadow-[-12px_0_30px_rgba(17,17,17,0.14)]' +
          (aberto ? '' : ' pointer-events-none')
        }
      >
        <div>
          <div className="mb-8 flex justify-end">
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar menu"
              className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-borda-forte text-preto"
            >
              <FecharIcon />
            </button>
          </div>

          <nav className="flex flex-col">
            {items.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={fechar}
                variants={variantesItem}
                whileTap={{ scale: 0.97, transition: { duration: 0.16, ease: EASE_SAIDA } }}
                className="pressable flex min-h-[56px] items-center gap-4 border-b border-borda font-rotulo text-[15px] uppercase tracking-[.1em] text-preto"
              >
                <span className="font-rotulo text-[12px] text-dourado">{String(i + 1).padStart(2, '0')}</span>
                {item.rotulo}
              </motion.a>
            ))}
          </nav>
        </div>

        <a
          href={waLink()}
          onClick={fechar}
          className="pressable flex min-h-11 items-center justify-center rounded-full bg-amarelo px-6 font-rotulo text-[13px] font-medium uppercase tracking-[.08em] text-preto"
        >
          Agendar avaliação
        </a>
      </motion.div>
    </div>
  );
}

function HamburgerIcon({ aberto }: { aberto: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {aberto ? (
        <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

function FecharIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
