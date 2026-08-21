import Image from 'next/image';
import { ENDERECO, INSTAGRAM, TELEFONE, TELEFONE_DISPLAY, WHATSAPP_DISPLAY, waLink } from '@/lib/contact';
import { PENDENTE } from '@/components/sections/Profissional';

// Dimensões reais do arquivo (430×242) — largura calculada para a altura de
// 72px que o brief pede, mantendo a proporção original do logo.
const LOGO_ALTURA = 72;
const LOGO_LARGURA = Math.round((LOGO_ALTURA * 430) / 242);

/**
 * Rodapé (Task 15) — fundo preto (`--color-preto: #111111`), fecha a
 * página. Contraste de cada cor de texto usada aqui, medido contra
 * `#111111` pela fórmula de luminância relativa do WCAG (registrado em
 * task-15-report.md com os números completos):
 *   - `text-branco`  (#FFFFFF) → ~18,9:1
 *   - `text-amarelo` (#FCCC24) → ~12,4:1 (WhatsApp, COPY.md §13 pede essa cor)
 *   - `text-dourado` (#F0B40C) → ~10,1:1 (borda tracejada do CRO pendente)
 *   - `text-escuro-texto` (#B7B7B2) → ~9,4:1  (endereço/telefone/Instagram)
 *   - `text-escuro-fraco` (#8A8A85) → ~5,4:1  (bloco legal, letra menor)
 * Todas acima do mínimo AA de 4,5:1 para texto normal — nenhuma usa
 * `grafite` (#5A5A55), que o design-guidance.md avisa que falha AA neste
 * tipo de fundo.
 */
export function Footer() {
  return (
    <footer className="bg-preto px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-10">
          <div className="flex flex-col gap-4">
            <Image
              src="/img/logo-branco.png"
              alt="Smile Ipiranga"
              width={LOGO_LARGURA}
              height={LOGO_ALTURA}
              className="h-[72px] w-auto"
            />
            <p className="font-rotulo text-[11px] uppercase tracking-[.28em] text-escuro-texto">
              Saúde &amp; Estética Orofacial
            </p>
          </div>

          <div className="flex flex-col gap-2 font-corpo text-[14px] text-escuro-texto">
            <p>
              {ENDERECO.rua}, {ENDERECO.numero} — {ENDERECO.bairro}, {ENDERECO.cidade}/{ENDERECO.uf}
            </p>
            <p>{ENDERECO.cep}</p>
            <a
              href={`tel:${TELEFONE}`}
              className="pressable inline-flex min-h-11 w-fit items-center text-escuro-texto pointer-fine:hover:text-branco"
            >
              {TELEFONE_DISPLAY}
            </a>
            <a
              href={waLink()}
              className="pressable inline-flex min-h-11 w-fit items-center text-amarelo pointer-fine:hover:text-dourado"
            >
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex min-h-11 w-fit items-center text-escuro-texto pointer-fine:hover:text-branco"
            >
              @smileipiranga
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-escuro-linha pt-8 font-corpo text-[13px] leading-relaxed text-escuro-fraco">
          <p>Smile Odontologia Ltda · CNPJ 48.000.577/0001-20</p>
          <p>
            Responsável Técnico: <span className={PENDENTE}>nome a confirmar</span>{' '}
            <span aria-hidden="true">·</span> <span className={PENDENTE}>CRO-SP a confirmar</span>
          </p>
          <p className="italic">
            Este site tem caráter informativo e não substitui a consulta odontológica.
          </p>
        </div>
      </div>
    </footer>
  );
}
