'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { waLink } from '@/lib/contact';
import { useCapability } from '@/lib/useCapability';
import { useLenis } from '@/lib/motion';
import { isolarFundo } from '@/lib/fundoInerte';
import { StaggeredMenu, MOTION_GAVETA } from '@/components/reactbits/StaggeredMenu';
import type Lenis from 'lenis';

type Item = { rotulo: string; href: string };

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

/**
 * O painel em si (o retângulo que desliza, os itens em stagger, os painéis
 * de cor por trás) veio do `StaggeredMenu` do React Bits — vendorizado e
 * fortemente modificado em `components/reactbits/StaggeredMenu.tsx` (Task
 * 19, "maximizar React Bits" — ver `components/reactbits/README.md`).
 *
 * Este componente continua dono de TUDO que o painel sozinho não resolve:
 * o botão hambúrguer (que o React Bits também oferecia, mas duplicado com o
 * nosso — removido da versão vendorizada), o foco preso nas duas direções,
 * `Escape`, o retorno de foco ao fechar, a trava de scroll via
 * `useLenis()?.stop()`, e o portal pra `document.body` (que resolve o
 * mesmo bug de containing-block do `backdrop-filter` do header que já
 * exigiu 3 rodadas de correção — inalterado pela troca).
 */
export function MobileMenu({ items }: { items: readonly Item[] }) {
  const [aberto, setAberto] = useState(false);
  // Enquanto fechado, o overlay do drawer não é PINTADO (`visibility:hidden`).
  // Estar pintado desde a hidratação custava 0,107 de CLS no Lighthouse
  // mobile — o maior deslocamento da página inteira, acima do limite de 0,1
  // (medido: 0,00003 antes, 0,107 depois de a fronteira client da página
  // mudar em 24/08, 0 de novo com isto).
  //
  // `visibility`, não `display:none`: o GSAP converte `xPercent` usando a
  // largura medida do elemento, e um elemento com `display:none` mede zero —
  // a primeira abertura deixava o painel parado fora da tela (testado). Com
  // `visibility` o layout continua existindo, o GSAP mede certo, e mesmo
  // assim nada é pintado nem entra na conta de layout shift.
  //
  // Não dá para amarrar direto em `aberto`: o painel precisa continuar no
  // layout durante a animação de fechamento. Por isso `visivel` só desliga
  // depois que ela termina, e qualquer reabertura no meio cancela o
  // desligamento (a exigência de "reabrir em menos de 220ms" da Task 6).
  const [visivel, setVisivel] = useState(false);
  const timerOcultarRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { podeAnimar, montado } = useCapability();
  const lenis = useLenis();
  const painelId = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLElement | null>(null);
  // Wrapper único do portal (backdrop + painel) — é o que fica de fora do
  // isolamento do fundo (Task 18, F3b). Sem classes: os filhos são `fixed`,
  // o wrapper não entra no layout.
  const portalRef = useRef<HTMLDivElement>(null);
  const restaurarFundoRef = useRef<(() => void) | null>(null);

  const fechar = () => {
    setAberto(false);
    if (timerOcultarRef.current) clearTimeout(timerOcultarRef.current);
    timerOcultarRef.current = setTimeout(
      () => setVisivel(false),
      MOTION_GAVETA.fechamento * 1000 + 60
    );
    destravarScroll(lenis);
    // Restaura o fundo ANTES de devolver o foco: com o header ainda inerte,
    // `focus()` no hambúrguer seria um no-op (elemento inerte não é focável).
    restaurarFundoRef.current?.();
    restaurarFundoRef.current = null;
    botaoRef.current?.focus();
  };

  const abrir = () => {
    if (timerOcultarRef.current) {
      clearTimeout(timerOcultarRef.current);
      timerOcultarRef.current = null;
    }
    setVisivel(true);
    setAberto(true);
    travarScroll(lenis);
  };

  // Escape fecha, Tab/Shift+Tab prende o foco dentro do painel, e o foco
  // inicial vai para o primeiro elemento focável do painel ao abrir — que,
  // desde a Task 18 (F3a), é o botão ✕ dentro do painel (é o que um diálogo
  // faz; o ✕ do header da página fica sob o backdrop/painel quando aberto,
  // invisível e fora do alcance do toque — por isso o painel tem o seu).
  useEffect(() => {
    if (!aberto) return;
    const painel = painelRef.current;
    if (!painel) return;

    // Tudo que não é este portal (header, main, footer, FAB, o portal do
    // lightbox) fica inert + aria-hidden enquanto o drawer está aberto.
    restaurarFundoRef.current = isolarFundo([portalRef.current]);

    const focaveis = () => Array.from(painel.querySelectorAll<HTMLElement>(FOCAVEIS_SELETOR));
    // Um quadro de folga: o StaggeredMenu acabou de tirar `inert` no mesmo
    // commit que abriu — em navegador real isso já é síncrono o bastante,
    // mas dar um `requestAnimationFrame` de folga custa nada e blinda contra
    // qualquer navegador que adie a remoção de `inert` do layout.
    const raf = requestAnimationFrame(() => focaveis()[0]?.focus());

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
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', aoTeclar);
      // Idempotente: `fechar()` normalmente já restaurou; aqui cobre
      // desmontagem e qualquer fechamento que não passe por `fechar()`.
      restaurarFundoRef.current?.();
      restaurarFundoRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const variantesFundo = {
    fechado: { opacity: 0, transition: { duration: 0.22 } },
    aberto: { opacity: 1, transition: { duration: 0.3 } },
  };

  useEffect(() => () => {
    if (timerOcultarRef.current) clearTimeout(timerOcultarRef.current);
  }, []);

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

      {/*
        Backdrop e painel são renderizados via portal em document.body.
        `montado` (useCapability) evita montar o portal antes do cliente
        confirmar (SSR não tem document.body do jeito que o cliente vai
        hidratar).

        O painel do StaggeredMenu NUNCA desmonta (GSAP anima o mesmo nó pra
        sempre, ao contrário do motion.div + AnimatePresence de antes) — por
        isso só o backdrop usa AnimatePresence aqui. `aria-hidden`/`inert`
        do painel são props diretas amarradas a `aberto`, sem timing de
        desmontagem para correr atrás.
      */}
      {montado &&
        createPortal(
          <div ref={portalRef}>
            <AnimatePresence>
              {aberto && (
                <motion.div
                  key="drawer-fundo"
                  onClick={fechar}
                  initial="fechado"
                  animate="aberto"
                  exit="fechado"
                  variants={variantesFundo}
                  className="fixed inset-0 z-[65] bg-preto/40"
                />
              )}
            </AnimatePresence>

            {/* `inset-y-0 right-0` com a largura do painel, não `inset-0`: um
                caixote fixo de viewport inteira mede 100% do bloco recipiente
                inicial, que INCLUI a barra de rolagem — 380px contra os 375 de
                `clientWidth`, e esses 5px viravam rolagem horizontal no
                documento. O painel e as camadas já são `right-0` com esta
                mesma largura, então nada muda de posição. */}
            <div
              className={`pointer-events-none fixed inset-y-0 right-0 z-[70] w-[min(320px,86vw)] overflow-hidden${visivel ? '' : ' invisible'}`}
            >
              <StaggeredMenu
                ref={painelRef}
                open={aberto}
                panelId={painelId}
                items={items.map((item) => ({ label: item.rotulo, ariaLabel: item.rotulo, link: item.href }))}
                onItemClick={fechar}
                reducedMotion={!podeAnimar}
                colors={['#F0B40C', '#FCCC24']}
                accentColor="#F0B40C"
                cabecalho={
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={fechar}
                      aria-label="Fechar menu"
                      className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-borda-forte text-preto"
                    >
                      <HamburgerIcon aberto />
                    </button>
                  </div>
                }
                footer={
                  <a
                    href={waLink()}
                    onClick={fechar}
                    className="pressable flex min-h-11 items-center justify-center rounded-full bg-amarelo px-6 font-rotulo text-[13px] font-medium uppercase tracking-[.08em] text-preto"
                  >
                    Agendar avaliação
                  </a>
                }
              />
            </div>
          </div>,
          document.body
        )}
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
