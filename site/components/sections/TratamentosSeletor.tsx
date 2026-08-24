'use client';

import { useState } from 'react';
import Image from 'next/image';
import OptionWheel from '@/components/reactbits/OptionWheel';
import GlareHover from '@/components/reactbits/GlareHover';
import { waLink } from '@/lib/contact';
import { useCapability } from '@/lib/useCapability';

export type ItemTratamento = {
  n: string;
  nome: string;
  desc: string;
  img: string;
  /** Decidido no servidor (`Tratamentos.tsx` lê o disco) — o cliente não checa arquivo. */
  temFoto: boolean;
};

/**
 * "Soluções que transformam sorrisos" (Task 20, pedido do dono do projeto):
 * a lista de sete linhas virou uma roda de opções (`OptionWheel` do React
 * Bits) com o tratamento escolhido aberto ao lado.
 *
 * **O que a troca preservou de propósito.** Uma roda mostra um item por vez,
 * e a lista antiga mostrava os sete com foto, descrição e um link de
 * WhatsApp cada. Perder isso seria perder conteúdo real de uma clínica —
 * então: os sete nomes continuam no HTML (a roda renderiza todos, é assim
 * que ela funciona), o painel ao lado traz foto, descrição e o CTA do
 * escolhido, e um bloco `sr-only` mantém os sete pares nome + descrição
 * acessíveis a leitor de tela e a buscador, mesmo os que não estão em tela.
 * É o mesmo padrão que `SorrisosGaleria.tsx` já usa para o equivalente
 * textual do WebGL.
 *
 * Sob `prefers-reduced-motion` a roda perde a suavização (vai direto ao
 * item) e o desfoque das opções distantes — continua inteira, navegável por
 * seta e por toque; "reduzir não é zerar".
 */
export function TratamentosSeletor({ itens }: { itens: readonly ItemTratamento[] }) {
  const [indice, setIndice] = useState(0);
  const { podeAnimar, pontoFino } = useCapability();
  const atual = itens[indice] ?? itens[0];

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12">
      <div className="h-[320px] md:h-[420px]">
        <OptionWheel
          items={itens.map((t) => t.nome)}
          defaultSelected={0}
          onChange={setIndice}
          rotulo="Tratamentos"
          side="left"
          textColor="var(--color-grafite)"
          activeColor="var(--color-preto)"
          fontSize={1.6}
          blur={podeAnimar ? 1.4 : 0}
          smoothing={podeAnimar ? 220 : 1}
          loop
        />
      </div>

      <div className="flex flex-col gap-5">
        {/* O `GlareHover` (React Bits) vinha da linha de tratamento que esta
            roda substituiu; migrou para a foto do painel para o componente
            não sair do site. `disabled` sai de `useCapability().pontoFino`:
            o efeito usa handlers de MOUSE, e em toque o navegador dispara
            `mouseenter` sintético sem um `mouseleave` confiável depois. */}
        <GlareHover
          disabled={!pontoFino}
          glareColor="#F0B40C"
          glareOpacity={0.35}
          glareAngle={-20}
          glareSize={200}
          transitionDuration={550}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-borda"
        >
          {atual.temFoto ? (
            <Image
              key={atual.img}
              src={atual.img}
              alt=""
              fill
              sizes="(max-width: 768px) 92vw, 520px"
              className="object-cover"
            />
          ) : (
            // Mesmo fallback da lista antiga: um glifo, nunca uma imagem
            // quebrada, se o arquivo sumir do disco.
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center font-titulo text-[40px] text-dourado"
            >
              ✦
            </span>
          )}
        </GlareHover>

        {/* aria-live: quem usa leitor de tela e muda a roda pela seta ouve o
            tratamento novo, em vez de a região trocar em silêncio. */}
        <div aria-live="polite" className="flex flex-col gap-3">
          <p className="font-rotulo text-[13px] tracking-[.14em] text-dourado uppercase">{atual.n}</p>
          <h3 className="font-titulo text-[clamp(22px,3vw,30px)] leading-[1.05] text-preto">{atual.nome}</h3>
          <p className="max-w-[52ch] font-corpo text-[16px] leading-relaxed text-grafite">{atual.desc}</p>
        </div>

        <a
          href={waLink(`Olá! Quero agendar uma avaliação sobre ${atual.nome.toLowerCase()}.`)}
          className="pressable inline-flex min-h-11 w-fit items-center rounded-full bg-amarelo px-6 font-rotulo text-[13px] font-medium tracking-[.08em] text-preto uppercase pointer-fine:hover:bg-dourado"
        >
          Falar sobre {atual.nome.toLowerCase()}
        </a>
      </div>

      {/* Os sete tratamentos por extenso, para leitor de tela e buscador: a
          roda mostra um de cada vez, mas o conteúdo da clínica não pode
          depender de interação para existir no documento. */}
      <ul className="sr-only">
        {itens.map((t) => (
          <li key={t.nome}>
            {t.nome}: {t.desc}
          </li>
        ))}
      </ul>
    </div>
  );
}
