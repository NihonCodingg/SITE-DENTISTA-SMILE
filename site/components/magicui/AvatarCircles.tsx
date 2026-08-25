/**
 * Fileira de retratos circulares sobrepostos — Task 22, a prova social do
 * hero.
 *
 * Origem: magicui, `apps/www/registry/magicui/avatar-circles.tsx`
 * (https://github.com/magicuidesign/magicui, licença MIT — ver `LICENSE.md`
 * nesta pasta). Ver `README.md` aqui do lado para a lista de modificações.
 *
 * Modificações sobre o original:
 * 1. **`cn()` de `@/lib/utils` trocado por interpolação de string.** Aquele
 *    helper é clsx + tailwind-merge, base do shadcn, que este projeto não usa.
 * 2. **`<img>` trocado por `next/image`.** São nove retratos que o site já
 *    serve em outra seção; passar pelo otimizador é a regra do projeto.
 * 3. **Os retratos deixaram de ser links.** O original envolve cada um num
 *    `<a href={profileUrl} target="_blank">` — faz sentido para avatares do
 *    GitHub, que era o exemplo dele. Aqui são pacientes: não existe perfil
 *    para onde ir, e um link que não leva a lugar nenhum é pior que nenhum
 *    link.
 * 4. **A fileira inteira é `aria-hidden`.** Consequência da 3: sem links, o
 *    que sobra é ornamento. O original dá `alt="Avatar 1"`, `"Avatar 2"` — um
 *    leitor de tela ouviria "Avatar 1, Avatar 2, Avatar 3, Avatar 4" e não
 *    ganharia nada. Quem carrega o sentido é o texto ao lado, que fica fora
 *    deste componente.
 * 5. **O círculo "+N" deixou de ser `<a href="">`.** Href vazio recarrega a
 *    página inteira ao clicar, e o elemento aparece na navegação por teclado
 *    como um link que não faz nada. Virou `<span>`.
 * 6. **`dark:` do shadcn fora**, cores da marca por prop (`corBorda`) — a
 *    borda precisa ser a cor do FUNDO onde a fileira está, para os retratos
 *    parecerem recortados dele.
 */

import Image from 'next/image';

export interface AvatarCirclesProps {
  /** Caminhos das imagens (públicos, servidos pelo `next/image`). */
  imagens: string[];
  /** Se maior que zero, desenha um círculo final com "+N". */
  numPeople?: number;
  /** Cor da borda de cada círculo — use a cor do fundo da seção. */
  corBorda?: string;
  /** Diâmetro em pixels. */
  tamanho?: number;
  className?: string;
}

export function AvatarCircles({
  imagens,
  numPeople = 0,
  corBorda = '#FFFFFF',
  tamanho = 40,
  className = '',
}: AvatarCirclesProps) {
  return (
    <div className={`z-10 flex -space-x-3 ${className}`.trim()} aria-hidden="true">
      {imagens.map((src) => (
        <span
          key={src}
          className="relative block shrink-0 overflow-hidden rounded-full bg-borda"
          style={{ width: tamanho, height: tamanho, border: `2px solid ${corBorda}` }}
        >
          <Image src={src} alt="" fill sizes={`${tamanho * 2}px`} className="object-cover" />
        </span>
      ))}

      {numPeople > 0 && (
        <span
          className="flex shrink-0 items-center justify-center rounded-full bg-preto text-center font-rotulo text-[11px] font-medium text-branco"
          style={{ width: tamanho, height: tamanho, border: `2px solid ${corBorda}` }}
        >
          +{numPeople}
        </span>
      )}
    </div>
  );
}

export default AvatarCircles;
