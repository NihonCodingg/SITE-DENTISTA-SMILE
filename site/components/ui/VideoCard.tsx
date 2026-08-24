import Image from 'next/image';

type Props = {
  /** Nome do pôster em `public/videos/posters/<slug>.webp`. */
  slug: string;
  titulo: string;
  legenda: string;
  /** URL do reel no Instagram da clínica. */
  reel: string;
};

/**
 * Cartão de vídeo: pôster estático + selo de play, e o clique abre o reel no
 * Instagram da clínica, em aba nova.
 *
 * O site **não hospeda vídeo**. Até 24/08 este componente carregava uma prévia
 * `.mp4` muda por IntersectionObserver e abria o vídeo completo num lightbox
 * com `<video>` nativo — 17 MB de arquivo no repositório, um coordenador de
 * "um por vez" entre cards, e um player nativo feio no diálogo. O dono do
 * projeto pediu o contrário, e é também o que o design aprovado desenhava
 * desde o começo: o acervo de vídeo vive no Instagram, que é onde o público da
 * clínica já está, e o site só mostra a porta de entrada.
 *
 * O que isso apaga de complexidade: o `<video>`, o observer, o coordenador
 * entre instâncias, os gates de `podePesado`/`saveData` (um pôster é uma
 * imagem como qualquer outra, já otimizada pelo `next/image`), o Lightbox
 * inteiro, e o estado compartilhado que existia em `PaginaComVideo.tsx` só
 * para dizer qual vídeo estava aberto. Este componente virou um link.
 *
 * Server Component: não tem estado nem evento. Não precisa de `'use client'`.
 */
export function VideoCard({ slug, titulo, legenda, reel }: Props) {
  return (
    <a
      href={reel}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Assistir no Instagram: ${titulo}`}
      className="group pressable relative block aspect-[9/14] w-full overflow-hidden rounded-[24px] bg-borda text-left"
    >
      <Image
        src={`/videos/posters/${slug}.webp`}
        alt={legenda}
        fill
        sizes="(max-width: 768px) 78vw, 260px"
        className="pointer-events-none object-cover"
      />

      {/* group-hover, não hover direto: o span é pointer-events-none (o link pai
          é quem recebe o clique/hover de verdade). Só background-color muda —
          nunca transform aqui, para não competir com o scale(0.97) do :active
          de .pressable no link pai (mesma propriedade, duas fontes). */}
      <span className="pointer-events-none absolute right-3.5 bottom-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-amarelo text-preto transition-colors duration-200 pointer-fine:group-hover:bg-dourado">
        <PlayIcon />
      </span>
    </a>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 2.5v11l10-5.5-10-5.5Z" fill="currentColor" />
    </svg>
  );
}
