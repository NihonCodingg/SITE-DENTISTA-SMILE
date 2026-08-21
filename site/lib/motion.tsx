'use client';
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from './useCapability';

/**
 * Lenis vive fora do React (é uma instância de classe presa ao DOM/rAF), então a
 * ligação com o React usa `useSyncExternalStore` em vez de `useState` dentro do
 * `useEffect` — a criação do Lenis é assíncrona em relação à renderização (só
 * acontece depois que `useCapability()` confirma que pode animar) e precisa
 * notificar os consumidores de `useLenis()` sem chamar um setState direto de
 * dentro do efeito, o que o eslint-plugin-react-hooks do Next 16 recusa (regra
 * `set-state-in-effect` — "force update / external sync: use
 * useSyncExternalStore").
 */
type LenisStore = {
  getSnapshot: () => Lenis | null;
  subscribe: (onChange: () => void) => () => void;
  set: (lenis: Lenis | null) => void;
};

function createLenisStore(): LenisStore {
  let lenis: Lenis | null = null;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => lenis,
    subscribe(onChange) {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    set(next) {
      lenis = next;
      listeners.forEach((l) => l());
    },
  };
}

const Ctx = createContext<LenisStore | null>(null);

const semProvider: LenisStore = {
  getSnapshot: () => null,
  subscribe: () => () => {},
  set: () => {},
};

export function useLenis(): Lenis | null {
  const store = useContext(Ctx) ?? semProvider;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
}

/**
 * Espera o layout assentar antes de recalcular os `ScrollTrigger` da página
 * (ver o uso em `MotionProvider`, ramo "existe hash na montagem"). Exportada
 * só para o teste conseguir espionar/controlar sem depender de
 * `document.fonts`/`decode()` reais.
 *
 * `document.fonts.ready` é o sinal real de "o texto parou de mudar de
 * largura/altura" — melhor que um `setTimeout` chutado, que tanto pode
 * disparar cedo demais (fonte ainda no FOUT) quanto tarde demais (atraso
 * perceptível). Ambientes sem a Font Loading API caem no catch e seguem sem
 * esperar, em vez de travar o efeito.
 *
 * Depois, espera decodificar as imagens que já estão dentro da viewport no
 * momento do salto — são as que mais importam pro layout da seção-alvo, e
 * medir contra um placeholder que ainda vai trocar de tamanho reproduziria o
 * mesmo tipo de posição errada que este refresh existe para corrigir.
 */
export async function esperarLayoutAssentar(): Promise<void> {
  try {
    await document.fonts?.ready;
  } catch {
    /* ambiente sem Font Loading API — segue sem esperar */
  }

  // Tentativa de decodificar as imagens já na viewport — mas com teto: uma
  // `<img loading="lazy">` que o navegador ainda não começou a buscar (achado
  // em navegador real, medido nesta correção: `decode()` numa imagem lazy
  // ainda `complete:false` pode ficar mais de 2s sem resolver NEM rejeitar)
  // não pode travar o refresh indefinidamente — isso reintroduziria o
  // próprio bug que este código existe pra corrigir, só que calado, sem
  // nenhum erro. Todo `<Image>` deste site fica dentro de uma caixa de
  // aspect-ratio fixo (`aspect-square`/`fill`), então a posição dos
  // `ScrollTrigger` já está correta mesmo antes da imagem terminar de
  // decodificar — a espera aqui é só uma folga extra, nunca uma condição
  // necessária.
  const imgsNaViewport = Array.from(document.images ?? []).filter((img) => {
    const r = img.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  });
  const decodesOuTeto = Promise.race([
    Promise.all(imgsNaViewport.map((img) => img.decode?.().catch(() => {}) ?? Promise.resolve())),
    new Promise<void>((resolve) => setTimeout(resolve, 500)),
  ]);
  await decodesOuTeto;
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  // Estado com inicializador preguiçoso: cria o store uma única vez, mas — ao
  // contrário de um ref — pode ser lido durante a renderização (é isso que o
  // `<Ctx.Provider value={store}>` abaixo faz) sem violar a regra `react-hooks/refs`
  // do Next 16, que proíbe ler `ref.current` fora de efeitos/handlers. O setter
  // nunca é chamado de novo: quem muda é o objeto externo, via `store.set(...)`.
  const [store] = useState<LenisStore>(() => createLenisStore());

  const { podeAnimar, montado } = useCapability();
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!montado) return;
    gsap.registerPlugin(ScrollTrigger);

    // Navegação direta para uma URL que JÁ chega com hash (link de bio/story
    // do Instagram, reload, back/forward do navegador) nunca dispara nenhum
    // evento de `click` — é o navegador quem faz o salto nativo pro
    // elemento sozinho. Os ScrollTrigger de cada <Reveal> (Reveal.tsx)
    // calculam a posição de disparo contra o layout NAQUELE instante da
    // montagem; se o layout ainda não assentou (fontes carregando, imagens
    // sem decodificar), essa posição fica errada, e sem ninguém chamar
    // `.refresh()` depois, ela nunca se corrige — a seção renderiza presa
    // em opacity:0 mesmo com a pessoa já rolada até ela.
    //
    // Correção de review (este bloco morava inteiro dentro do guard de
    // `podeAnimar`, abaixo): <Reveal> cria um ScrollTrigger de verdade
    // INDEPENDENTE de `podeAnimar` — as duas branches do `gsap.fromTo` de
    // Reveal.tsx têm `scrollTrigger: {...once:true}`, porque "reduzir não é
    // zerar": o reveal continua existindo sob `prefers-reduced-motion`, só
    // sem o deslocamento. Then, o bug de hash-na-montagem também afeta quem
    // tem movimento reduzido — e é o pior segmento pra deixar quebrado,
    // porque em geral essa preferência é ligada por necessidade, não
    // estética. Por isso este bloco roda sempre que há `ScrollTrigger` na
    // página (ou seja, sempre que `montado`), não só quando o Lenis existe.
    //
    // `cancelado` evita chamar `ScrollTrigger.refresh()` depois que este
    // efeito já foi desmontado (StrictMode, ou a capacidade mudando entre
    // renders enquanto a promise ainda está pendente).
    let cancelado = false;
    if (typeof location !== 'undefined' && location.hash) {
      esperarLayoutAssentar().then(() => {
        if (cancelado) return;
        // UMA chamada só, depois da espera — ScrollTrigger.refresh() é caro
        // (recalcula TODOS os triggers da página), então nunca deve rodar em
        // loop nem em resposta a scroll; aqui é uma vez por montagem, só
        // quando existe hash. `once: true` em cada <Reveal> (Reveal.tsx) já
        // mata o próprio ScrollTrigger assim que dispara — um refresh()
        // depois disso não reanima nada que já tenha completado, só corrige
        // os triggers que ainda não tiveram chance de disparar.
        ScrollTrigger.refresh();
      });
    }

    // Tudo daqui pra baixo depende do Lenis existir de verdade. Sem
    // movimento (podeAnimar=false), o comportamento nativo de scroll deve
    // valer sem interferência nenhuma: nenhum listener de clique
    // interceptando âncoras, nenhuma instância de Lenis sendo criada — só o
    // bloco acima (que não depende de Lenis) continua rodando.
    if (!podeAnimar) {
      return () => {
        cancelado = true;
      };
    }

    const l = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.6 });
    store.set(l);

    l.on('scroll', ScrollTrigger.update);
    const loop = (t: number) => { l.raf(t); raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop);

    // Links de âncora (`href="#clinica"` etc., no Header/MobileMenu/Hero) não
    // passam pelo Lenis por padrão: um clique nativo dispara o jump-to-anchor
    // do próprio browser, que anima `scrollTop` por fora do rAF do Lenis.
    // O `scroll-behavior: smooth` do CSS (globals.css) até deixa esse jump
    // suave, mas o Lenis continua escrevendo sua própria posição alvo a cada
    // frame sem saber que o scroll nativo está em andamento — as duas
    // animações competem pela mesma `scrollTop`, e o resultado é a página
    // tremer ou voltar para trás no meio do scroll (guia de UX: "Lenis
    // intercepta o scroll nativo e scroll-behavior:smooth sozinho pode não
    // bastar"). Interceptar o clique e delegar para `lenis.scrollTo()`
    // mantém o Lenis como única fonte de verdade sobre a posição da página.
    const ALTURA_HEADER_FALLBACK = 80;
    const aoClicarAncora = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const alvo = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!alvo) return;
      const href = alvo.getAttribute('href');
      if (!href || href === '#' || !document.querySelector(href)) return;
      e.preventDefault();
      const header = document.querySelector('header');
      const alturaHeader = header ? header.getBoundingClientRect().height : ALTURA_HEADER_FALLBACK;
      l.scrollTo(href, {
        offset: -(alturaHeader + 16),
        // Bug real (achado de review em navegador, fix-titulos-report.md):
        // cada <Reveal> cria seu próprio ScrollTrigger (`start: 'top 88%'`)
        // com a posição de disparo calculada em pixel de documento no
        // instante em que ele monta — sem saber que o Lenis ainda vai rolar
        // a página até `href`. Sem recalcular depois que o scroll pára, uma
        // seção cujo Reveal ainda não tinha tido chance de disparar podia
        // ficar presa em opacity:0 mesmo com o scroll parado bem nela.
        // `onComplete` do próprio Lenis (não um `setTimeout` chutado) é o
        // sinal certo de "a animação de scroll realmente terminou" — chamar
        // cedo demais recalcularia contra uma posição de scroll que ainda
        // ia mudar. Este `onComplete` só existe quando há Lenis de verdade
        // (o clique nem é interceptado sem ele, ver guard acima) — ao
        // contrário do refresh por hash-na-montagem, que roda mesmo sem
        // Lenis.
        onComplete: () => ScrollTrigger.refresh(),
      });
    };
    document.addEventListener('click', aoClicarAncora);

    return () => {
      cancelado = true;
      cancelAnimationFrame(raf.current);
      document.removeEventListener('click', aoClicarAncora);
      l.destroy();
      ScrollTrigger.getAll().forEach((s) => s.kill());
      store.set(null);
    };
  }, [montado, podeAnimar, store]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
