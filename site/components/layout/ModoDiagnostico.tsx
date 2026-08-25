'use client';

import { useEffect } from 'react';

/**
 * Modo diagnóstico de desempenho — desligado por padrão, sem efeito no site.
 *
 * Abrir o site com `?teste=chave1,chave2` marca o `<html>` com classes
 * `diag-<chave>`, e as regras de app/globals.css (bloco "Modo diagnóstico")
 * desligam UMA fonte de custo por chave:
 *
 *   semparede    — remove a parede de fotos do hero
 *   paredeparada — mantém a parede, congela a deriva
 *   semsilk      — remove a textura WebGL dourada do hero (só desktop a tem)
 *   semgaleria   — remove a galeria WebGL de "Sorrisos feitos aqui"
 *   comblur      — devolve o backdrop-blur ao header (removido por custo)
 *
 * Existe porque travamento de compositor depende da GPU de cada aparelho:
 * medição em headless (rasterização por software) não reproduz a máquina de
 * ninguém — foi medido aqui variando 2× para o MESMO build. A régua final é
 * a mão da pessoa no aparelho dela, e estas chaves transformam isso num
 * teste de um minuto por URL.
 */
const CHAVES = ['semparede', 'paredeparada', 'semsilk', 'semgaleria', 'comblur'] as const;

export function ModoDiagnostico() {
  useEffect(() => {
    const brutas = new URLSearchParams(location.search).get('teste');
    if (!brutas) return;
    const ativas = brutas
      .split(',')
      .map((c) => c.trim())
      .filter((c): c is (typeof CHAVES)[number] => (CHAVES as readonly string[]).includes(c));
    if (ativas.length === 0) return;
    for (const chave of ativas) document.documentElement.classList.add(`diag-${chave}`);
    console.info('[modo diagnóstico] ligado:', ativas.join(', '));
    return () => {
      for (const chave of ativas) document.documentElement.classList.remove(`diag-${chave}`);
    };
  }, []);
  return null;
}
