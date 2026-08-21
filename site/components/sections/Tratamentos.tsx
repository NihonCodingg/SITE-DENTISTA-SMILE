import fs from 'node:fs';
import path from 'node:path';
import { TRATAMENTOS } from '@/lib/content';
import { waLink } from '@/lib/contact';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TratamentoLinha } from '@/components/sections/TratamentoLinha';

// design-guidance.md: "em listas longas (as 7 linhas de tratamento), limite
// o stagger aos primeiros 4-5 e deixe o resto entrar junto — cascata longa
// demais faz a página parecer lenta". As linhas 6 e 7 recebem o mesmo delay
// da 5ª: entram junto com ela, não esticam a cascata.
const STAGGER_MAX = 5;
const STAGGER_STEP = 0.06; // 60ms — dentro da janela de 30-80ms

/**
 * As 7 imagens `trat-*` existem em `public/img` (entregues pelo cliente —
 * `trat-clareamento.jpg` foi a última, processada na rodada de correção da
 * Task 19). Checar em disco no servidor — em vez de tentar carregar a
 * imagem no cliente e reagir a um erro depois — evita qualquer flash do
 * ícone de imagem quebrada do navegador antes do fallback aparecer: a
 * decisão já está pronta no primeiro HTML que o servidor manda, sem estado
 * de cliente nenhum. A checagem em disco fica, mesmo com as 7 fotos
 * completas hoje: se um arquivo um dia sumir do disco, a linha volta a
 * mostrar o glifo `✦` em vez de uma `<img>` quebrada.
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
        {/* Bloco de título (COPY.md §4) — esquecido na Task 10, não pego por
            nenhuma review (achado pós-fix-titulos-report.md: a seção pulava
            direto da margem para a linha "01 Facetas"). tituloClassName com
            52px porque essa seção difere do default de 48px do
            SectionHeading (ver fix-titulos-report.md); max-w-[16ch] e o
            parágrafo em 17px/62ch vêm do design aprovado. */}
        <Reveal className="mb-10 flex flex-col gap-4 md:mb-14">
          <SectionHeading
            sobretitulo="O que fazemos"
            titulo="Soluções que transformam sorrisos"
            tituloClassName="max-w-[16ch] text-[clamp(28px,4.5vw,52px)]"
          />
          <p className="max-w-[62ch] font-corpo text-[17px] leading-relaxed text-grafite">
            Cada caso começa com uma avaliação. A partir dela, montamos o plano de tratamento que
            faz sentido para a sua boca, sua rotina e o seu orçamento.
          </p>
        </Reveal>

        {TRATAMENTOS.map((t, i) => {
          const delay = Math.min(i, STAGGER_MAX - 1) * STAGGER_STEP;
          const temFoto = existeFoto(t.img);

          return (
            <Reveal key={t.slug} delay={delay}>
              <TratamentoLinha
                href={waLink(`Olá! Quero agendar uma avaliação sobre ${t.nome.toLowerCase()}.`)}
                n={t.n}
                nome={t.nome}
                desc={t.desc}
                img={t.img}
                temFoto={temFoto}
              />
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
