'use client';

import { TRATAMENTOS } from '@/lib/content';
import { useCapability } from '@/lib/useCapability';
import TextLoop from '@/components/reactbits/TextLoop';
import { useTelaLarga } from '@/lib/useTelaLarga';

/**
 * Faixa decorativa dos 7 tratamentos, logo abaixo do Hero. É repetida (o
 * mesmo conteúdo já existe, de verdade, na seção de Tratamentos da Task 10) —
 * por isso a faixa inteira leva `aria-hidden="true"`: sem isso o leitor de
 * tela leria a lista duas vezes.
 *
 * Task 19 ("maximizar React Bits"): até aqui esta faixa era implementada à
 * mão com um `requestAnimationFrame` próprio — decisão registrada em
 * `components/reactbits/README.md`, revertida pela decisão do parceiro
 * ("forçar o máximo possível"). Agora usa o `TextLoop` do
 * React Bits, vendorizado e corrigido em
 * `components/reactbits/TextLoop.tsx` — a correção principal foi
 * ACRESCENTAR a pausa fora da viewport/aba oculta que o original não tinha
 * (mesmo padrão do antigo `TrilhaAnimada`, agora dentro do componente
 * vendorizado).
 *
 * A aceleração pela velocidade do scroll não vem mais do Lenis diretamente
 * (o `Ticker` antigo lia `lenis.on('scroll', ...)`) — o `TextLoop`
 * calcula a própria velocidade via `useScroll`/`useVelocity` do
 * `motion/react`, que observa `window.scrollY`. Como o Lenis (`lib/motion.tsx`)
 * roda em modo "window" (anima `window.scrollTo` de verdade, não um
 * transform virtual), `window.scrollY` reflete o scroll suavizado do Lenis
 * igual antes — só a fonte de leitura da velocidade mudou de "Lenis emite"
 * para "Motion observa o scroll nativo", sem precisar de `useLenis()` aqui.
 */

const SEPARADOR = ' ✦ ';

/**
 * A fita é a MESMA nas duas faixas de tela — o que muda são as medidas de
 * desenho dela (Task 22, correção pedida pelo dono do projeto: "a linha está
 * muito pequena e fora de proporção com o resto do site").
 *
 * Por que ela encolhe sozinha e é preciso compensar à mão: o SVG do
 * `TextLoop` tem caixa FIXA de 1200×520 e escala para a largura disponível.
 * Numa tela de 375px sobram 351px de contêiner, ou seja, escala 0,29 — as
 * medidas de desenho do desktop (texto 22, fita 64) viram 6px de texto e 19px
 * de fita na tela. Um risco amarelo com letra ilegível.
 *
 * A correção é dividir cada medida pela escala daquela faixa. Os números
 * abaixo são o resultado disso, e o que eles produzem NA TELA é o que
 * importa: texto de ~13px (a mesma régua dos outros rótulos do site) e fita
 * de ~50px de altura no celular; ~23px e ~67px no desktop.
 *
 * A ONDULAÇÃO é a exceção: ela NÃO é dividida pela escala (Task 24, achado do
 * dono do projeto — "não está bom dessa forma"). Compensar a escala aqui
 * também dava uma onda de 22px de amplitude numa fita de 50px, e o texto
 * passava a subir e descer em ângulos íngremes, difícil de ler numa linha
 * curta. A curviness do celular é praticamente a mesma do desktop: a fita
 * ondula de leve e as letras continuam quase na horizontal.
 *
 * REVISÃO DE 25/08/2026 (captura de aparelho real, "a fita amarela"): três
 * coisas juntas faziam ela parecer errada no celular.
 *  - O invólucro tinha `mx-3` e cantos arredondados: 12px de branco de cada
 *    lado, e a onda era cortada no meio do ciclo nas duas pontas. Agora ela
 *    SANGRA de borda a borda no celular, como faixa decorativa deve fazer.
 *  - Texto de ~13px dentro de faixa de ~53px: muito amarelo, pouca palavra.
 *    Agora ~17px de texto em ~49px de faixa.
 *  - O invólucro media 92px para uma faixa de 53px — 39px de vazio que
 *    somavam ao respiro das seções vizinhas e afastavam a fita de tudo.
 *    Agora 58px, colado na altura real da faixa.
 */
const MEDIDAS_FITA = {
  // Sangrando de borda a borda, o contêiner é a largura da tela: 393 ÷ 1200
  // = escala 0,33. Texto 46 → ~15px na tela; fita 150 → ~49px; ondulação
  // 20 → ~6,5px de amplitude; espacejamento 16 → ~5px.
  //
  // O espacejamento acompanha o corpo, não é livre: a razão entre os dois é
  // o que decide se as letras respiram. Numa tentativa com corpo 52 e
  // espacejamento 11 (razão 0,21 contra os 0,31 de antes) as palavras
  // colavam sobre a curva — "PROTOCOLO DE IMPLANTE" virava um bloco só.
  celular: { fontSize: 46, ribbonWidth: 150, curviness: 20, letterSpacing: 16, altura: 'h-[58px]' },
  // Acima de 768px a caixa praticamente não é reduzida (escala ~1).
  tela: { fontSize: 22, ribbonWidth: 64, curviness: 40, letterSpacing: 3, altura: 'h-[190px]' },
};


/**
 * O texto da fita, com o espaço INTERNO de cada nome alargado.
 *
 * Por que: o `letterSpacing` da fita separa TODOS os caracteres, inclusive o
 * espaço — então a distância entre letras cresce e a distância entre palavras
 * fica igual, e as duas se confundem. Na tela, "PROTOCOLO DE IMPLANTE" virava
 * um bloco só. Dois ` ` (espaço inquebrável) devolvem a hierarquia:
 * inquebrável, e não espaço comum, porque o SVG colapsa espaços repetidos ao
 * traçar texto sobre curva — o inquebrável sobrevive.
 *
 * Vale só na FITA CURVA, e por isso mora em `textoFita` e não em
 * `textoTratamentos`: a faixa reta do movimento reduzido desenha texto em
 * linha, onde o espaço normal já separa as palavras — alargar ali só criaria
 * buracos. E vale só na cópia decorativa: a fita é `aria-hidden`, e a lista
 * de verdade, que leitor de tela e busca leem, está na seção de Tratamentos
 * com os nomes intactos.
 */
function textoTratamentos(): string {
  return TRATAMENTOS.map((t) => t.nome).join(SEPARADOR);
}

/** Só a fita curva alarga o espaço; a faixa reta usa o texto como ele é. */
function textoFita(): string {
  return TRATAMENTOS.map((t) => t.nome.replace(/ /g, '  ')).join(SEPARADOR);
}

function TrilhaEstatica({ texto }: { texto: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-5 py-3.5 text-center">
      {texto}
    </div>
  );
}

export function Ticker() {
  const { podeAnimar, montado } = useCapability();
  const telaLarga = useTelaLarga();
  const texto = textoTratamentos();
  const paraFita = textoFita();
  const medidas = telaLarga ? MEDIDAS_FITA.tela : MEDIDAS_FITA.celular;
  const mostrarFita = montado && podeAnimar;

  return (
    <div
      data-testid="ticker"
      aria-hidden="true"
      // Sangra no celular (sem margem nem canto); em tela larga mantém a
      // margem e o arredondamento, onde a fita é um bloco contido e não uma
      // faixa que atravessa a tela.
      className={`mt-1.5 overflow-hidden font-rotulo text-[14px] font-medium tracking-[.22em] text-preto uppercase md:mx-3 md:rounded-[16px]${
        mostrarFita ? '' : ' bg-amarelo'
      }`}
    >
      {mostrarFita ? (
        // Task 20, pedido do dono do projeto: a faixa reta virou a FITA
        // curva do `TextLoop` (React Bits), com os tratamentos correndo por
        // ela. A fita desenha o próprio fundo amarelo, então o `bg-amarelo`
        // do envoltório sai neste ramo — sobrariam duas faixas amarelas, uma
        // reta atrás da curva.
        // A caixa do SVG da fita é fixa em 1200×520 — em tela cheia isso
        // vira ~43% da largura em ALTURA, quase toda vazia acima e abaixo da
        // onda (achado do dono do projeto: "não pode tomar tanto espaço
        // assim"). O invólucro corta para a faixa útil: altura própria,
        // overflow escondido, e o SVG centralizado verticalmente — a onda
        // fica, o vazio some.
        <div className={`relative overflow-hidden ${medidas.altura}`}>
          <div className="absolute top-1/2 left-0 w-full -translate-y-1/2">
            <TextLoop
              text={paraFita}
              shape="wave"
              separator={SEPARADOR.trim()}
              speed={90}
              curviness={medidas.curviness}
              fontSize={medidas.fontSize}
              fontWeight={600}
              letterSpacing={medidas.letterSpacing}
              color="var(--color-preto)"
              ribbon
              ribbonColor="var(--color-amarelo)"
              ribbonWidth={medidas.ribbonWidth}
              reducedMotion={!podeAnimar}
              className="w-full"
            />
          </div>
        </div>
      ) : (
        <TrilhaEstatica texto={texto} />
      )}
    </div>
  );
}
