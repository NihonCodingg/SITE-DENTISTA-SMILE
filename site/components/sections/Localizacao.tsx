'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ENDERECO, MAPS_URL, TELEFONE, TELEFONE_DISPLAY, WHATSAPP_DISPLAY, waLink } from '@/lib/contact';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { PENDENTE } from './Profissional';

// URL de embed do Google Maps sem chave de API (formato `output=embed`,
// documentado publicamente pelo próprio Google) — MAPS_URL (lib/contact.ts)
// é o link de BUSCA usado pelo botão "Abrir no Google Maps" (abre app/aba
// nova); o mapa embutido precisa de um formato de URL diferente, por isso
// não reaproveita a mesma constante.
const MAPS_EMBED_URL =
  'https://www.google.com/maps?q=' +
  encodeURIComponent(`${ENDERECO.rua}, ${ENDERECO.numero}, ${ENDERECO.bairro}, ${ENDERECO.cidade}`) +
  '&output=embed';

/**
 * Card "foto da fachada → mapa" (Task 15). O iframe do Google Maps é o
 * maior peso de terceiro da página (~300KB) — o requisito duro do brief é
 * não montá-lo de cara.
 *
 * Solução de duas camadas, não montagem condicional em React:
 *   1. O `<iframe loading="lazy">` já nasce no HTML, sempre — é assim que o
 *      teste de regressão (`rodape.test.tsx`) confirma o comportamento, e é
 *      também a técnica que de fato economiza a banda: `loading="lazy"` é
 *      nativo do navegador e adia o download do conteúdo do iframe até ele
 *      chegar perto da viewport, sem precisar de nenhum JavaScript rodando
 *      para isso funcionar (inclusive com JS desligado). Como Localização é
 *      a penúltima seção da página, o iframe começa fora da tela — o
 *      navegador não busca o conteúdo no carregamento inicial.
 *   2. Por cima dele, a foto real da fachada cobre o card inteiro com um
 *      botão "Ver no mapa" — ninguém vê o iframe (nem interage com ele) até
 *      clicar OU até a seção entrar na viewport, o que vier primeiro. Isso
 *      é controlado por estado React (IntersectionObserver + onClick), uma
 *      decisão independente da camada 1: mesmo que o navegador ainda não
 *      tenha buscado o iframe (ou não suporte `loading="lazy"`), a pessoa
 *      já vê a foto real da clínica em vez de uma tela vazia.
 */
function CardMapa() {
  const [revelado, setRevelado] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setRevelado(true);
        observer.disconnect();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // aspect-ratio reserva o espaço final antes de qualquer imagem/iframe
    // carregar — é o que mantém o CLS desta seção perto de zero (teto do
    // brief: 0.05), independente de quando a foto ou o mapa terminam de
    // chegar.
    <div ref={containerRef} className="relative aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-borda">
      <iframe
        src={MAPS_EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa de localização da Smile Ipiranga, na Rua Clemente Pereira, 507"
        className="absolute inset-0 h-full w-full border-0"
      />

      <div
        aria-hidden={revelado}
        className={
          'absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-[var(--ease-saida)] ' +
          (revelado ? 'pointer-events-none opacity-0' : 'opacity-100')
        }
      >
        <Image
          src="/img/fachada.jpg"
          alt="Fachada da Smile Ipiranga, na Rua Clemente Pereira, 507"
          fill
          sizes="(max-width: 768px) 90vw, 460px"
          style={{ objectPosition: 'center 62%' }}
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-preto/55 via-preto/5 to-transparent"
        />
        <button
          type="button"
          onClick={() => setRevelado(true)}
          tabIndex={revelado ? -1 : 0}
          className="pressable relative flex min-h-11 items-center gap-2 rounded-full bg-branco/94 px-6 font-rotulo text-[13px] font-medium tracking-[.08em] text-preto uppercase backdrop-blur-[6px] pointer-fine:hover:bg-branco"
        >
          <PinIcon />
          Ver no mapa
        </button>
      </div>
    </div>
  );
}

export function Localizacao() {
  return (
    <section id="localizacao" className="bg-creme px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1080px] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-[clamp(32px,6vw,80px)]">
        <Reveal className="flex flex-col gap-6">
          {/* Sem `tituloClassName`, de propósito — mesma convenção (bug
              pré-existente de tamanho de fonte, ver Faq.tsx e
              task-15-report.md) que Clinica/Depoimentos/Sorrisos/
              Profissional já seguem: sem uma classe `text-[...]` explícita,
              o preflight do Tailwind v4 reseta o `<h2>` para ~16px. Deixado
              assim para não destoar do ComoFunciona logo acima no scroll —
              o conserto é único, para o site inteiro. */}
          <SectionHeading sobretitulo="Como chegar" titulo="No coração do Ipiranga" />

          <div className="flex flex-col gap-2 font-corpo text-[16px] leading-relaxed text-grafite">
            <p>
              {ENDERECO.rua}, {ENDERECO.numero} — {ENDERECO.bairro}, {ENDERECO.cidade}/{ENDERECO.uf}
            </p>
            <p>CEP {ENDERECO.cep}</p>
            <p>Referência: {ENDERECO.referencia}</p>
            <p>
              Horário: <span className={PENDENTE}>a confirmar</span>
            </p>
            <p>
              <a
                href={`tel:${TELEFONE}`}
                className="pressable inline-flex min-h-11 items-center pointer-fine:hover:text-preto"
              >
                {TELEFONE_DISPLAY}
              </a>
            </p>
            <p>WhatsApp {WHATSAPP_DISPLAY}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex min-h-11 items-center justify-center rounded-full border-[1.5px] border-preto px-7 font-rotulo text-[13px] font-medium tracking-[.08em] text-preto uppercase pointer-fine:hover:bg-preto pointer-fine:hover:text-branco"
            >
              Abrir no Google Maps
            </a>
            <a
              href={waLink()}
              className="pressable inline-flex min-h-11 items-center justify-center rounded-full bg-preto px-7 font-rotulo text-[13px] font-medium tracking-[.08em] text-branco uppercase pointer-fine:hover:bg-escuro-linha"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto w-full max-w-[460px]">
          <CardMapa />
        </Reveal>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5c-2.5 0-4.5 2-4.5 4.5 0 3.4 4.5 8.5 4.5 8.5s4.5-5.1 4.5-8.5c0-2.5-2-4.5-4.5-4.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
