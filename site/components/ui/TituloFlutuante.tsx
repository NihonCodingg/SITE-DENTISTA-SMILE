'use client';

import ScrollFloat from '@/components/reactbits/ScrollFloat';
import { useCapability } from '@/lib/useCapability';

/**
 * O conteúdo de um título de seção com o efeito de letras flutuando
 * (`ScrollFloat`, React Bits — Task 20, "os textos importantes").
 *
 * Folha client mínima: o `SectionHeading` continua Server Component e só
 * monta isto quando a seção pede (`flutuar`). Antes da hidratação — e sob
 * `prefers-reduced-motion` — o texto é a string pura: o HTML que o servidor
 * manda é conteúdo real, e "reduzir não é zerar" vira "nem fatiar".
 *
 * Quem esconde as letras do leitor de tela é o próprio `ScrollFloat`
 * (`aria-hidden` no contêiner); o nome acessível fica no heading pai, que o
 * `SectionHeading` preenche via `tituloAriaLabel` sempre que `flutuar` está
 * ligado.
 */
export function TituloFlutuante({ texto }: { texto: string }) {
  const { podeAnimar, montado } = useCapability();

  if (!montado || !podeAnimar) return texto;
  return <ScrollFloat texto={texto} />;
}
