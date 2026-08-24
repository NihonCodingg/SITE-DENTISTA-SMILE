# Task 9 — Ticker reativo ao scroll

## O que foi feito

- **`site/components/sections/Ticker.tsx`** (novo) — faixa `bg-amarelo rounded-[16px] mx-3 mt-1.5`,
  Jost (`font-rotulo`) peso 500, 14px, `tracking-[.22em]`, caixa alta, os 7 nomes de
  `TRATAMENTOS` (Task 4) separados por `✦`. Container inteiro com `data-testid="ticker"` e
  `aria-hidden="true"` (é decorativo e repete conteúdo que a Tratamentos real, Task 10, ainda vai
  ter). Dois ramos, decididos por `useCapability()`:
  - `podeAnimar` → `TrilhaAnimada`: 4 cópias do texto lado a lado, deslocadas continuamente via
    `requestAnimationFrame`, velocidade base 40px/s acelerando com a velocidade real do scroll.
  - sem `podeAnimar` (inclusive antes da hidratação confirmar) → `TrilhaEstatica`: mesmo texto,
    `flex-wrap`, sem nenhuma animação — não desaparece, só para de rolar.
- **`site/__tests__/ticker.test.tsx`** (novo) — 9 testes: os 2 do brief (lista os 7 tratamentos;
  `aria-hidden="true"`) mais 7 que escrevi para cobrir os requisitos de craft que o brief não
  testava explicitamente: separador `✦` presente; a trilha animada duplica o texto (mais de uma
  ocorrência de "Facetas"); sob `prefers-reduced-motion` fica estática (nenhuma duplicação, nenhum
  `[data-ticker-trilha]` na árvore) e continua visível; desmonta sem lançar; e dois testes de
  motion com `requestAnimationFrame` mockado manualmente (ver "Testes de motion" abaixo) que
  provam avanço linear contínuo e a pausa por `IntersectionObserver`/`document.hidden`.
- **`site/components/reactbits/README.md`** — nova seção `ScrollVelocity — não vendorizado`,
  registrando a decisão (ver "Desvio" abaixo).
- **`site/app/page.tsx`** — **não tocado**. O brief desta task (`task-9-brief.md`) lista só
  `Create: Ticker.tsx` e `Create: ticker.test.tsx` em "Files" — nem esta nem a Task 10
  (`Pilares`/`Tratamentos`) listam `page.tsx`, ao contrário das Tasks 6/7/8, que listavam
  explicitamente. Segui o mesmo padrão que a Task 1 já documentou ("brief desta task não pede
  para editá-la"): a montagem em `page.tsx` fica para quando a task que a lista chegar. Para
  verificar visualmente esta task, usei uma rota temporária (`site/app/preview-ticker/`),
  **removida antes do commit** — não faz parte do diff.

## Desvio — `ScrollVelocity` do React Bits não foi vendorizado

Li o componente inteiro (`src/ts-tailwind/TextAnimations/ScrollVelocity/ScrollVelocity.tsx`,
180 linhas) antes de decidir. Ele:
- não consulta `matchMedia`/`navigator.connection` (sem conflito de fonte de verdade);
- não faz chamada de rede;
- não arrasta dependência nova (`motion/react`, já usado no projeto desde a Task 6);
- só anima `transform` (o `x` do Motion, escrito via `style.transform`, mesmo caminho de GPU que
  uma string literal — confirmado na Task 6 no fonte do `motion-dom`).

Mas **não pausa fora da viewport nem com a aba oculta** — monta seis hooks do `motion/react`
(`useScroll`+`useVelocity`+`useSpring`+`useTransform`+`useMotionValue`+`useAnimationFrame`) que
ficam ativos pra sempre enquanto montado, e nenhum deles verifica visibilidade. Essa é uma
exigência dura desta task ("Um ticker que roda para sempre é o candidato número um a queimar
bateria... garanta que ele pausa"). Corrigir isso não é uma modificação pontual como as que
`SplitText.tsx`/`Magnet.tsx` receberam (trocar um hook, mover um registro de plugin) — seria
reescrever o motor de movimento do componente por dentro (o corpo do `useAnimationFrame`), o que
já deixa de ser "vendorizar com ajuste".

`design-guidance.md` também nomeia "ticker" explicitamente como caso que deve preferir CSS/JS
direto a Motion: *"Para o que é predeterminado (reveal, hover, ticker), prefira CSS. Guarde o
Motion para o que é dinâmico e interrompível (lightbox, drawer)."*

Implementei à mão em vez disso, seguindo o **mesmo padrão de pausa do `Silk.tsx`** (Task 8):
`IntersectionObserver` cobre a faixa saindo da viewport por scroll, `document.hidden` cobre a aba
em segundo plano — os dois checados dentro do próprio loop de `rAF`, sem custo de recriar nada ao
pausar/retomar.

Para a aceleração com a velocidade do scroll, em vez de recalcular com `useScroll`/`useVelocity`
do `motion/react` (que rastreiam `window.scrollY`), reaproveitei o `velocity` que o **Lenis já
calcula** a cada evento de `scroll` (`lib/motion.tsx` já usa esse mesmo Lenis como fonte única
para o `ScrollTrigger`). Um `lenis.on('scroll', (l) => ...)` lê `l.velocity` (px por frame,
`lenis.js:674`) e vira um "boost" de velocidade que decai exponencialmente (meia-vida de 0.35s)
quando o scroll para — sem depender de o `motion/react` conseguir ver corretamente a posição de
scroll que o Lenis está smoothing (confirmei no fonte do Lenis, `setScroll()` chama
`window.scrollTo(...)` a cada frame lerp, então `window.scrollY` real de fato acompanha — mas usar
o `velocity` que o Lenis já calculou é mais direto e evita duplicar o cálculo).

`ScrollVelocity.tsx` **não foi criado** em `components/reactbits/` — mesmo precedente do `Silk`
(Task 8): quando a decisão é não vendorizar, o arquivo não entra na pasta, só a decisão é
registrada no README.

## Testes de motion — como provei "roda", "acelera" e "pausa" sem depender de câmera lenta manual

O brief só pedia 2 testes (texto + aria-hidden). Adicionei 2 testes de motion que mockam
`requestAnimationFrame` (capturando o callback pra chamar manualmente, com timestamps
controlados) e `IntersectionObserver` (capturando o callback pra simular saída/entrada da
viewport):

1. **Linear e contínua:** com `offsetWidth` mockado (jsdom não faz layout — retorna 0 de
   verdade), disparo 3 quadros manuais (`t=0,30,90`) e confirmo que o deslocamento nunca para
   nem inverte, e que o intervalo de 60ms desloca ~2× o intervalo de 30ms (proporção entre 1.8 e
   2.2) — prova que não há curva de easing por trás, só `velocidade × dt`.
2. **Pausa:** avanço a trilha, simulo `IntersectionObserver` reportando `isIntersecting: false`
   (saiu da viewport) e confirmo que outros quadros não mudam mais o `transform`; devolvo a
   viewport mas seto `document.hidden = true` e confirmo que continua parada.

## Achado — bug real de sentinel (`0` é falsy) pego pelo próprio teste que escrevi

Na primeira versão do loop eu usava `let ultimo = 0` como sentinel de "ainda não tem timestamp
anterior" (`ultimo ? dt real : 0`). O teste de "linear" acusou: no 2º quadro manual (`t=100`) o
`dt` saía `0` de novo, porque o 1º quadro tinha sido chamado com `t=0` — e `0` é falsy em JS, então
`ultimo ? ... : 0` tratava `ultimo=0` (um timestamp real e válido) como "sem timestamp". Na
prática isso quase nunca aparece (o primeiro `rAF` de uma página real quase nunca cai em
`performance.now() === 0` exato), mas é um bug de verdade — travaria `dt` em `0` pra sempre se
algum dia o primeiro timestamp fosse exatamente `0`. Troquei o sentinel pra `null`
(`let ultimo: number | null = null`), que nenhum `DOMHighResTimeStamp` real produz. Comentário no
código explica o porquê.

Enquanto corrigia isso também adicionei uma guarda pro próprio primeiro quadro (`dt <= 0`): sem
ela, `envolver(offset, -largura, 0)` com `offset=0` no instante exato do mount mapeia pro limite
oposto do intervalo (`-largura`) sem nenhum tempo ter passado — inofensivo visualmente (as 4
cópias são idênticas, então `-largura` e `0` parecem o mesmo quadro), mas um salto de posição
gratuito que não precisa acontecer.

## Verificação visual — limitação do ambiente, não do componente

Segui o processo pedido: subi `npm run dev -- -p 3100` (porta 3000 já ocupada) e abri
`/preview-ticker` (rota temporária, removida antes do commit) no Browser pane. `read_page` e
`get_page_text` confirmaram o DOM esperado: 4 cópias do texto em caixa alta com `✦` como
separador, sem erros no console.

Não consegui confirmar visualmente a animação rodando (screenshot, ou o `requestAnimationFrame`
disparando de verdade): o Browser pane desta sessão não está sendo exibido/composto
(`"the Browser pane is not displayed, so the page is not compositing frames"` — erro do próprio
tool). Confirmei que é uma limitação do ambiente e não do componente com um teste isolado: agendei
um `requestAnimationFrame` de contagem simples na página (nada relacionado ao Ticker) e, depois de
2s de espera real, o contador continuava em `0` — o navegador está genuinamente suspendendo `rAF`
nesta aba porque ela não está sendo pintada em lugar nenhum (o mesmo motivo por trás de
`document.hidden === true` que constatei ao inspecionar a página).

Dado isso, a prova de "roda", "acelera" e "pausa" ficou nos testes determinísticos descritos acima
(rAF mockado e chamado manualmente), que testam a lógica real do componente sem depender do
navegador estar de fato compondo frames. Registro como pendência: quando alguém tiver o Browser
pane visível numa sessão futura (ou testar manualmente no Chrome), vale um `npm run dev` rápido em
`/preview-ticker` (ou já com o Ticker montado numa task futura) só pra confirmar a sensação visual
— velocidade calma, aceleração perceptível mas não nervosa — que só o olho humano valida.

## Testes — resultado

```
npm test -- ticker
 Test Files  1 passed (1)
      Tests  9 passed (9)

npm test          # suíte inteira
 Test Files  10 passed (10)
      Tests  81 passed (81)
```

`npm run lint` — 0 erros, 0 warnings.
`npm run build` (Next 16 + Turbopack, roda `tsc`) — compila e type-checa limpo.

## Craft — checklist do design-guidance.md

- [x] Movimento constante usa cálculo linear por quadro (`velocidade × dt`), nenhum `ease`/CSS
      `transition` no caminho da trilha.
- [x] Só `transform` anima (`style.transform` direto na trilha); nenhum `padding`/`width`/
      `height`/`top`/`left`.
- [x] Nenhum `transition: all`, nenhum `ease-in`.
- [x] Pausa fora da viewport (`IntersectionObserver`) e com a aba oculta (`document.hidden`) —
      mesmo padrão do `Silk.tsx`, provado pelos 2 testes de motion.
- [x] Cleanup completo: `cancelAnimationFrame`, `resizeObserver.disconnect()`,
      `intersectionObserver.disconnect()`, `desligarLenis?.()` (o `off` que o próprio
      `lenis.on()` devolve).
- [x] Sem `podeAnimar`, a faixa continua visível e legível (estática), nunca some.
- [x] Velocidade base baixa (40px/s) — calma, não nervosa; aceleração tem teto (`BOOST_MAX=260`)
      pra nunca disparar mesmo num scroll muito rápido.

## Concerns / pendências

1. **Verificação visual real ainda não feita** (ver seção acima) — limitação do ambiente desta
   sessão, não do código. Os testes de motion cobrem a lógica; falta o olho humano confirmar a
   sensação (calma vs. nervosa) e a suavidade do boost/decay num navegador de verdade.
2. **`Ticker` ainda não está montado em `page.tsx`** — por desenho: o brief desta task não pede
   isso, e nenhuma task até aqui monta uma seção nova em `page.tsx` sem listar isso
   explicitamente em "Files". Fica para a task que integrar a home completa.
3. Constantes de tuning (`BASE_SPEED`, `BOOST_MAX`, `BOOST_FACTOR`, `BOOST_HALF_LIFE`) foram
   escolhidas por raciocínio (mantendo `40` como base, o mesmo valor que o brief original citava
   pro `ScrollVelocity`) mas não foram calibradas visualmente por falta do Browser pane — podem
   precisar de ajuste fino depois que alguém rodar `npm run dev` e olhar de verdade.
