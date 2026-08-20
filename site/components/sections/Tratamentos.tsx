import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { TRATAMENTOS } from '@/lib/content';
import { waLink } from '@/lib/contact';
import { Reveal } from '@/components/ui/Reveal';

// design-guidance.md: "em listas longas (as 7 linhas de tratamento), limite
// o stagger aos primeiros 4-5 e deixe o resto entrar junto — cascata longa
// demais faz a página parecer lenta". As linhas 6 e 7 recebem o mesmo delay
// da 5ª: entram junto com ela, não esticam a cascata.
const STAGGER_MAX = 5;
const STAGGER_STEP = 0.06; // 60ms — dentro da janela de 30-80ms

/**
 * As 7 imagens `trat-*.jpg` não existem em `public/img` (o cliente ainda não
 * entregou) e não vão existir nesta task. Checar em disco no servidor — em
 * vez de tentar carregar a imagem no cliente e reagir a um erro depois —
 * evita qualquer flash do ícone de imagem quebrada do navegador antes do
 * fallback aparecer: a decisão já está pronta no primeiro HTML que o
 * servidor manda, sem estado de cliente nenhum. Funciona sem nenhuma
 * modificação no dia em que o cliente entregar as fotos de verdade.
 *
 * `Tratamentos` não tem 'use client' — é puro Server Component, e por isso
 * pode ler o disco aqui.
 */
function existeFoto(img: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', img));
  } catch {
    return false;
  }
}

export function Tratamentos() {
  return (
    <section id="tratamentos" className="bg-creme px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1040px]">
        {TRATAMENTOS.map((t, i) => {
          const delay = Math.min(i, STAGGER_MAX - 1) * STAGGER_STEP;
          const temFoto = existeFoto(t.img);

          return (
            <Reveal key={t.slug} delay={delay}>
              <a
                href={waLink(`Olá! Quero agendar uma avaliação sobre ${t.nome.toLowerCase()}.`)}
                className="linha-tratamento pressable group grid min-h-11 grid-cols-[auto_auto_1fr_auto] items-center gap-4 border-b border-borda py-5 pointer-fine:hover:bg-branco md:gap-6"
              >
                <span className="font-rotulo text-[15px] tabular-nums text-dourado">{t.n}</span>

                <div className="relative aspect-square w-[clamp(60px,8vw,92px)] shrink-0 overflow-hidden rounded-[14px] border border-borda bg-creme">
                  {temFoto ? (
                    <Image src={t.img} alt="" fill sizes="92px" className="object-cover" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center font-titulo text-[22px] text-dourado"
                    >
                      ✦
                    </span>
                  )}
                </div>

                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-titulo text-[clamp(21px,3vw,34px)] leading-[1.05] uppercase text-preto">
                    {t.nome}
                  </span>{' '}
                  {/* Espaço explícito entre nome e descrição: os dois são
                      <span> irmãos sem nenhum texto entre eles no DOM — sem
                      esse separador, o nome do computedname (ex.: "...
                      implante" + "Solução...") gruda o fim de uma palavra no
                      início da outra, sem pausa nenhuma pra quem ouve por
                      leitor de tela. */}
                  <span className="font-corpo text-[15px] text-grafite">{t.desc}</span>
                </span>

                <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-preto">
                  <SetaIcon />
                </span>
              </a>
            </Reveal>
          );
        })}

        <div className="mt-10 flex justify-center">
          <a
            href={waLink()}
            className="pressable inline-flex min-h-11 items-center justify-center rounded-full bg-preto px-7 font-rotulo text-[13px] font-medium tracking-[.08em] text-branco uppercase pointer-fine:hover:bg-escuro-linha"
          >
            Agendar minha avaliação
          </a>
        </div>
      </div>
    </section>
  );
}

function SetaIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-200 ease-[var(--ease-movimento)] pointer-fine:group-hover:translate-x-0.5 pointer-fine:group-hover:-translate-y-0.5"
    >
      <path
        d="M4 12 12 4M12 4H5.5M12 4v6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
