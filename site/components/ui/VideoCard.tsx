'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCapability } from '@/lib/useCapability';

type Props = {
  slug: string;
  titulo: string;
  legenda: string;
  onAbrir: (slug: string) => void;
};

// "Centralizado o bastante para tocar". Cada card observa só a si mesmo — não é a
// interseção entre cards que decide isso, é o coordenador logo abaixo.
const LIMIAR_CENTRALIZADO = 0.6;

/**
 * Coordenador de "um vídeo por vez", compartilhado por TODAS as instâncias de
 * VideoCard montadas na página. É estado de módulo (não de componente/contexto) de
 * propósito: cards irmãos não têm relação de pai-filho entre si, e um Map aqui é a
 * forma mais simples de todos concordarem sobre quem tem permissão para tocar sem
 * precisar de um Provider por cima deles.
 *
 * Cada card se registra com sua proporção de interseção atual sempre que cruza
 * LIMIAR_CENTRALIZADO; a cada mudança, só o de maior proporção recebe play() — os
 * demais levam pause(), mesmo os que também passaram do próprio limiar
 * individualmente. Sem isso, dois cards 9:14 lado a lado numa tela larga (grade,
 * carrossel) tocariam ao mesmo tempo.
 */
const candidatos = new Map<HTMLVideoElement, number>();

function tentarTocar(v: HTMLVideoElement) {
  // jsdom (ambiente de teste) devolve undefined em vez de Promise — optional
  // chaining cobre os dois. Em browser real play() sempre devolve Promise; se ela
  // rejeitar (política de autoplay do navegador, aba em segundo plano etc.), não há
  // nada de útil a fazer além de deixar o poster visível.
  v.play()?.catch(() => {});
}

function reavaliarCandidatos() {
  let melhor: HTMLVideoElement | null = null;
  let melhorProporcao = -1;
  candidatos.forEach((proporcao, video) => {
    if (proporcao > melhorProporcao) {
      melhorProporcao = proporcao;
      melhor = video;
    }
  });
  candidatos.forEach((_, video) => {
    if (video === melhor) tentarTocar(video);
    else video.pause();
  });
}

function registrarCandidato(v: HTMLVideoElement, proporcao: number) {
  candidatos.set(v, proporcao);
  reavaliarCandidatos();
}

function removerCandidato(v: HTMLVideoElement) {
  if (!candidatos.has(v)) return;
  candidatos.delete(v);
  v.pause();
  reavaliarCandidatos();
}

export function VideoCard({ slug, titulo, legenda, onAbrir }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const carregadoRef = useRef(false);
  const { podePesado, montado } = useCapability();

  useEffect(() => {
    const v = videoRef.current;
    // !podePesado cobre reduced-motion, economia de dados e aparelho fraco — nesses
    // casos o próprio JSX abaixo nem monta o <video>, então este efeito não tem
    // nada para observar. É o "nunca dá play, fica no poster" do contrato.
    if (!v || !montado || !podePesado) return;

    // React trata `muted` como caso especial: escreve só a propriedade JS
    // (`node.muted = true`), nunca o atributo HTML — ao contrário de `loop` e
    // `playsInline`, que ganham os dois. A propriedade já é o que faz o vídeo
    // tocar mudo de verdade, mas o atributo também importa (é o que o HTML
    // enviado por SSR carrega antes da hidratação, e é o que ferramentas que
    // inspecionam o DOM cru enxergam), então é setado explicitamente aqui.
    v.setAttribute('muted', '');

    const aoInterseccionar: IntersectionObserverCallback = ([entrada]) => {
      if (!entrada.isIntersecting) {
        removerCandidato(v);
        return;
      }

      // Regra do contrato: o <source> só ganha src quando o card entra na
      // viewport — qualquer proporção de interseção conta como "entrou", não só o
      // limiar de reprodução. Anexado via DOM (não JSX condicional) porque
      // adicionar um <source> a um <video> que já passou pela seleção de recurso
      // (preload="none", zero <source> no primeiro render) não é notado pelo
      // browser sozinho — load() precisa ser chamado explicitamente para o
      // navegador reconsiderar as fontes. Guardado por ref para não reanexar/
      // recarregar ao rolar para frente e para trás pela mesma viewport.
      if (!carregadoRef.current) {
        const fonte = document.createElement('source');
        fonte.src = `/videos/previews/${slug}.mp4`;
        fonte.type = 'video/mp4';
        v.appendChild(fonte);
        v.load();
        carregadoRef.current = true;
      }

      if (entrada.intersectionRatio > LIMIAR_CENTRALIZADO) {
        registrarCandidato(v, entrada.intersectionRatio);
      } else {
        removerCandidato(v);
      }
    };

    const io = new IntersectionObserver(aoInterseccionar, { threshold: [0, LIMIAR_CENTRALIZADO, 1] });
    io.observe(v);

    return () => {
      io.disconnect();
      removerCandidato(v);
    };
  }, [montado, podePesado, slug]);

  return (
    <button
      type="button"
      onClick={() => onAbrir(slug)}
      aria-label={`Assistir: ${titulo}`}
      className="group pressable relative block aspect-[9/14] w-full cursor-pointer overflow-hidden rounded-[24px] bg-borda text-left"
    >
      {montado && podePesado ? (
        <video
          ref={videoRef}
          poster={`/videos/posters/${slug}.webp`}
          muted
          loop
          playsInline
          preload="none"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // Poster em .webp, não .jpg: existe para os 5 slugs (o .jpg não existe
        // para "recepcao", processado depois dos outros quatro) e o Image do
        // Next já otimiza/reamostra a fonte de qualquer forma.
        <Image
          src={`/videos/posters/${slug}.webp`}
          alt={legenda}
          fill
          sizes="(max-width: 768px) 78vw, 260px"
          className="pointer-events-none object-cover"
        />
      )}

      {/* group-hover, não hover direto: o span é pointer-events-none (o botão pai
          é quem recebe o clique/hover de verdade). Só background-color muda —
          nunca transform aqui, para não competir com o scale(0.97) do :active
          de .pressable no botão pai (mesma propriedade, duas fontes). */}
      <span className="pointer-events-none absolute right-3.5 bottom-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-amarelo text-preto transition-colors duration-200 pointer-fine:group-hover:bg-dourado">
        <PlayIcon />
      </span>
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 2.5v11l10-5.5-10-5.5Z" fill="currentColor" />
    </svg>
  );
}
