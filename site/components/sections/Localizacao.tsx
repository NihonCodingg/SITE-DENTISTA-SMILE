'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ENDERECO, MAPS_URL, TELEFONE, TELEFONE_DISPLAY, WHATSAPP_DISPLAY, waLink } from '@/lib/contact';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { PENDENTE } from '@/components/ui/pendente';

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
 * O iframe do Google Maps, montado SÓ quando `<CardMapa>` decide revelar
 * (clique ou interseção — ver abaixo). Componente próprio só para poder dar
 * um fade de entrada (`pronto`, `requestAnimationFrame` de um tick — dá
 * tempo do navegador pintar o estado inicial `opacity-0` antes de animar
 * para `opacity-100`, senão a transição não teria de onde partir) sem
 * misturar esse detalhe decorativo com a lógica de revelar do card.
 *
 * Correção de review (Task 15): a primeira versão desta seção montava o
 * `<iframe loading="lazy">` incondicionalmente no HTML — `loading="lazy"`
 * de fato adia a *busca* do conteúdo até chegar perto da viewport, mas essa
 * NUNCA foi a mesma garantia que "não montar de cara" pede: numa página de
 * seção única, rolar até aqui é exatamente o que a pessoa faz, e os ~270KB
 * entram de qualquer jeito, só um pouco mais tarde. E medido em revisão:
 * pode nem esperar — cache de perfil do navegador é conhecido por
 * desativar esse adiamento. A garantia real só existe não colocando o
 * `<iframe>` no HTML até a ativação de verdade.
 */
function IframeMapa() {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPronto(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <iframe
      src={MAPS_EMBED_URL}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Mapa de localização da Smile Ipiranga, na Rua Clemente Pereira, 507"
      className={
        'absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ease-[var(--ease-saida)] ' +
        (pronto ? 'opacity-100' : 'opacity-0')
      }
    />
  );
}

/**
 * Card "foto da fachada → mapa" (Task 15). O iframe do Google Maps é o
 * maior peso de terceiro da página (~270KB medidos, ver task-15-report.md)
 * — o requisito duro do brief é não montá-lo de cara.
 *
 * `revelado` decide entre DOIS ramos que se excluem: enquanto `false`, o
 * card inteiro é um `<button>` mostrando a foto real da fachada com um
 * rótulo "Ver no mapa" (mesmo padrão de `VideoCard.tsx` — poster/vídeo
 * trocam por um ternário, não por camadas sobrepostas com opacidade);
 * quando `true`, vira `<IframeMapa>`. O `<iframe>` só existe no DOM depois
 * que `revelado` vira `true` — clicando no botão OU quando o card entra na
 * viewport (`IntersectionObserver`, `rootMargin: 200px`), o que vier
 * primeiro. Antes disso, `document.querySelector('iframe')` dentro desta
 * seção não encontra nada — é o que `rodape.test.tsx` prova.
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
      {revelado ? (
        <IframeMapa />
      ) : (
        <button
          type="button"
          onClick={() => setRevelado(true)}
          className="pressable group absolute inset-0 flex h-full w-full items-center justify-center text-left"
        >
          <Image
            src="/img/fachada.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 90vw, 460px"
            style={{ objectPosition: 'center 62%' }}
            className="pointer-events-none object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-preto/55 via-preto/5 to-transparent"
          />
          {/* Nome acessível do botão vem deste texto — nada de aria-hidden
              aqui (só no ícone, decorativo por si). */}
          <span className="pointer-events-none relative flex min-h-11 items-center gap-2 rounded-full bg-branco/94 px-6 font-rotulo text-[13px] font-medium tracking-[.08em] text-preto uppercase backdrop-blur-[6px] pointer-fine:group-hover:bg-branco">
            <PinIcon />
            Ver no mapa
          </span>
        </button>
      )}
    </div>
  );
}

export function Localizacao() {
  return (
    <section id="localizacao" className="bg-creme px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1080px] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-[clamp(32px,6vw,80px)]">
        <Reveal className="flex flex-col gap-6">
          {/* Sem `tituloClassName`, de propósito: esta seção usa o mesmo
              tamanho default do `SectionHeading` (TITULO_TAMANHO_PADRAO,
              clamp(28px,4.5vw,48px) — ver fix-titulos-report.md) que
              Clinica/Depoimentos/AntesDepois/ComoFunciona também usam. */}
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
