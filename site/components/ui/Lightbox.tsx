'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCapability } from '@/lib/useCapability';
import { useLenis } from '@/lib/motion';
import type Lenis from 'lenis';

type Props = {
  slug: string | null;
  legenda: string;
  onFechar: () => void;
};

// Mesma curva de --ease-saida (globals.css) — entrada e saída do lightbox.
// Duplicada aqui em vez de importada de um módulo compartilhado porque é assim
// que o resto do projeto já faz (MobileMenu.tsx, WhatsAppFab.tsx, Magnet.tsx têm
// cada um sua própria cópia): é um valor de design, não lógica de negócio, e cada
// arquivo de motion do projeto o declara localmente.
const EASE_SAIDA: [number, number, number, number] = [0.23, 1, 0.32, 1];

const FOCAVEIS_SELETOR = 'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';

// Exportada — ao contrário de EASE_SAIDA acima, este valor NÃO é só estética
// local: qualquer elemento decorativo com z-index próprio (ex.: GradualBlur
// nas bordas do carrossel de Depoimentos, Task 12) precisa ficar abaixo do
// fundo escurecido do lightbox para não vazar por cima dele visualmente —
// bug real, encontrado por review empírica (screenshot com o fundo pintado
// de vermelho). Um número duplicado nos dois arquivos poderia divergir sem
// nenhum teste acusando; importar esta constante (em vez de repetir "85")
// é o que faz o teste de regressão provar contra o valor real, não uma
// cópia dele. Aplicada via `style` abaixo, não via classe Tailwind
// `z-[85]` — só assim ela é garantidamente a MESMA fonte que o CSS
// renderizado usa, sem risco de a classe e a constante divergirem.
export const Z_INDEX_BACKDROP = 85;

// Mesmo padrão de MobileMenu.tsx: com Lenis (podeAnimar), stop()/start() trava e
// destrava o scroll suave. Sem Lenis (reduced-motion, onde o MotionProvider nem
// chega a criar a instância), a trava usa position:fixed no scroll atual em vez de
// overflow:hidden — que remove a barra de rolagem e causa o salto lateral que o
// brief pede para evitar.
function travarScroll(lenis: Lenis | null) {
  if (lenis) {
    lenis.stop();
    return;
  }
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

export function Lightbox({ slug, legenda, onFechar }: Props) {
  const { podeAnimar, montado } = useCapability();
  const lenis = useLenis();
  const painelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gatilhoRef = useRef<HTMLElement | null>(null);

  const aberto = slug !== null;

  // Retém slug/legenda do último vídeo aberto: quando o pai zera `slug` para
  // fechar, a AnimatePresence ainda segura este nó no DOM durante a saída
  // (~200ms) — sem isto o <video> perderia o src no meio do fade. Ajustado
  // durante a própria renderização (não em efeito): garante que `ultimo` já
  // está correto no MESMO ciclo em que `aberto` vira true, sem um frame de
  // atraso — ver "You Might Not Need an Effect" / ajustar estado a partir de
  // props na documentação do React.
  const [ultimo, setUltimo] = useState<{ slug: string; legenda: string } | null>(null);
  if (slug && ultimo?.slug !== slug) {
    setUltimo({ slug, legenda });
  }

  const fechar = () => {
    videoRef.current?.pause();
    // Marca o painel não-interativo já no clique, sem esperar a AnimatePresence
    // terminar a saída (~200ms) — mesmo motivo de MobileMenu.tsx: cobre o
    // intervalo em que o painel ainda está no DOM (saída) mas já devia estar
    // fora do alcance de foco/leitor de tela.
    if (painelRef.current) {
      painelRef.current.setAttribute('aria-hidden', 'true');
      painelRef.current.inert = true;
    }
    gatilhoRef.current?.focus();
    onFechar();
  };

  // Escape fecha, Tab/Shift+Tab prende o foco dentro do painel, foco inicial vai
  // para o primeiro elemento focável ao abrir, e o scroll da página trava
  // enquanto o diálogo está aberto. Travar/destravar scroll fica no
  // setup/cleanup deste efeito (não em handlers próprios, como em MobileMenu.tsx)
  // porque aqui quem decide abrir/fechar é o pai, via prop `slug` — não um
  // estado que este componente possua.
  //
  // `montado` entra nas dependências mesmo não sendo lido diretamente aqui
  // dentro: o portal só existe no DOM quando `montado` é true (guarda no fim da
  // função, por causa do SSR). Se o pai já montar o Lightbox com `slug` truthy
  // desde o início (fora do fluxo normal, mas testável), `aberto` é true desde o
  // primeiro render — o mesmo valor no render em que `montado` ainda é false
  // (painelRef.current nulo, portal nem existe) e no seguinte, em que
  // `montado` vira true e o portal finalmente é criado. Sem `montado` aqui, o
  // efeito não re-executaria nesse segundo render (dependência "aberto"
  // inalterada) e o foco inicial nunca alcançaria o painel de verdade.
  useEffect(() => {
    if (!aberto || !montado) return;

    // Guarda quem tinha o foco no instante da abertura — normalmente o próprio
    // botão do VideoCard que chamou onAbrir — para devolver o foco a ele ao
    // fechar. O Lightbox não recebe uma ref do gatilho por prop (o contrato só
    // tem slug/legenda/onFechar), então captura document.activeElement: funciona
    // sempre para abertura por teclado, e para clique de mouse em todo browser
    // que foca <button> ao clicar (Chrome, Firefox, Edge — Safari desktop é a
    // exceção conhecida que não foca botão por clique de mouse).
    gatilhoRef.current = document.activeElement as HTMLElement | null;
    travarScroll(lenis);

    const painel = painelRef.current;
    if (painel) {
      painel.removeAttribute('aria-hidden');
      painel.inert = false;
    }

    const focaveis = () => (painel ? Array.from(painel.querySelectorAll<HTMLElement>(FOCAVEIS_SELETOR)) : []);
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
      const ultimoFocavel = els[els.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimoFocavel.focus();
      } else if (!e.shiftKey && document.activeElement === ultimoFocavel) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      destravarScroll(lenis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, montado]);

  const variantesFundo = {
    fechado: { opacity: 0, transition: { duration: 0.2 } },
    aberto: { opacity: 1, transition: { duration: 0.25 } },
  };

  // scale desligado sob reduced-motion — "reduzir não é zerar", o fade de
  // opacidade continua. Nunca de scale(0): nada no mundo real aparece do nada.
  // Saída (200ms) mais rápida que entrada (300ms): quem fecha já decidiu.
  const variantesPainel = podeAnimar
    ? {
        fechado: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: EASE_SAIDA } },
        aberto: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE_SAIDA } },
      }
    : {
        fechado: { opacity: 0, scale: 1, transition: { duration: 0.2 } },
        aberto: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
      };

  // `montado` evita montar o portal antes do cliente confirmar: document.body
  // não existe do jeito que o cliente vai hidratar durante SSR.
  if (!montado) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {aberto && (
          <motion.div
            key="lightbox-fundo"
            onClick={fechar}
            initial="fechado"
            animate="aberto"
            exit="fechado"
            variants={variantesFundo}
            style={{ zIndex: Z_INDEX_BACKDROP }}
            className="fixed inset-0 bg-preto/78"
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8">
        <AnimatePresence>
          {aberto && (
            <motion.div
              key="lightbox-painel"
              ref={painelRef}
              role="dialog"
              aria-modal="true"
              aria-label={ultimo?.legenda ?? legenda}
              onClick={(e) => e.stopPropagation()}
              initial="fechado"
              animate="aberto"
              exit="fechado"
              variants={variantesPainel}
              style={{ transformOrigin: 'center' }}
              className="pointer-events-auto relative w-full max-w-[720px] overflow-hidden rounded-[24px] bg-preto shadow-[0_24px_60px_rgba(17,17,17,0.4)]"
            >
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar vídeo"
                className="pressable absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-branco/90 text-preto pointer-fine:hover:bg-branco"
              >
                <FecharIcon />
              </button>

              {ultimo && (
                <video
                  ref={videoRef}
                  key={ultimo.slug}
                  controls
                  preload="metadata"
                  playsInline
                  // tabIndex explícito: focalizabilidade nativa de <video controls>
                  // por Tab varia entre browsers (Safari é inconsistente). Um
                  // tabindex declarado remove a ambiguidade e é o que faz este
                  // elemento aparecer na lista de FOCAVEIS_SELETOR de verdade —
                  // sem ele o navegador decide sozinho, e a trava de foco não tem
                  // como garantir que o vídeo é mesmo o último parada do ciclo.
                  tabIndex={0}
                  src={`/videos/completos/${ultimo.slug}.mp4`}
                  className="block aspect-video w-full bg-preto"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>,
    document.body
  );
}

function FecharIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
