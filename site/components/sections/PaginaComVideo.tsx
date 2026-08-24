import { Hero } from './Hero';
import { TourExpandido } from './TourExpandido';
import { Clinica } from './Clinica';
import { Depoimentos } from './Depoimentos';
import { AntesDepois } from './AntesDepois';
import { ComoFunciona } from './ComoFunciona';
import type { ReactNode } from 'react';

type Props = {
  ticker: ReactNode;
  pilares: ReactNode;
  tratamentos: ReactNode;
  sorrisos: ReactNode;
  profissional: ReactNode;
};

/**
 * Ordem das seções do corpo da página.
 *
 * Este componente já foi a fronteira `'use client'` que segurava o estado
 * "qual vídeo está aberto no lightbox", compartilhado por Hero, Clínica e
 * Depoimentos. Em 24/08 os vídeos passaram a abrir no Instagram (ver
 * `components/ui/VideoCard.tsx`): não há mais lightbox, nem estado a
 * compartilhar, e ele voltou a ser um Server Component — as seções que
 * precisam de cliente (`Depoimentos`, `AntesDepois`, `ComoFunciona`)
 * carregam o próprio `'use client'`.
 *
 * As que chegam por prop (`ticker`, `pilares`, `tratamentos`, `sorrisos`,
 * `profissional`) continuam vindo de `app/page.tsx` assim por herança dessa
 * fronteira. Hoje seria possível importá-las direto aqui; ficou como está
 * para a mudança dos vídeos não arrastar junto um remanejo de árvore que
 * nada tem a ver com ela.
 */
export function PaginaComVideo({ ticker, pilares, tratamentos, sorrisos, profissional }: Props) {
  return (
    <>
      <Hero />
      <TourExpandido />
      {ticker}
      {pilares}
      {tratamentos}
      <Clinica />
      {sorrisos}
      {profissional}
      <Depoimentos />
      <AntesDepois />
      <ComoFunciona />
    </>
  );
}
