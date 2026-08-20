# React Bits — componentes vendorizados

O registry do shadcn (`npx shadcn add @react-bits/...`) não funciona (devolve o HTML do site, não
JSON — ver `.superpowers/sdd/2026-08-19-site-smile-ipiranga/reactbits-vendoring.md`). Os arquivos
abaixo foram baixados direto do repositório oficial, variante TypeScript + Tailwind
(`src/ts-tailwind/...`), e vivem aqui por exigência da licença (MIT + Commons Clause: o aviso de
copyright tem que acompanhar o código — ver `LICENSE.md` nesta pasta).

Repositório: https://github.com/DavidHDev/react-bits
Commit de referência: `4e0e030193b563be6be33d928f77d0d01cefe237` (branch `main`, 2026-08-15)

## Arquivos e modificações

### `SplitText.tsx`

- **Origem:** `src/ts-tailwind/TextAnimations/SplitText/SplitText.tsx`
- **Usado em:** Task 8 (reveal da headline do Hero)
- **Dependências que arrasta:** `gsap` + `gsap/ScrollTrigger` + `gsap/SplitText` (todas já no
  projeto — `gsap@3.15.0` inclui o `SplitText` de graça desde a versão 3.13, não é mais plugin
  pago) e, no original, `@gsap/react` (pacote novo, **não** trazido — ver modificação abaixo).
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o componente não consulta nada por conta própria — quem decide
  se ele deve existir na árvore é o chamador, via `useCapability().podeAnimar` (ver
  `components/sections/Hero.tsx`). Fonte única preservada.
- **Modificações:**
  1. Trocado o hook `useGSAP` (de `@gsap/react`, dependência que este projeto não tinha) por
     `useEffect` + cleanup manual — o mesmo idioma que `components/ui/Reveal.tsx` já usa para
     gsap. Evita adicionar um pacote novo para o que o React já resolve nativamente. O estado de
     `document.fonts` (que o original lia via `useState` dentro de um `useEffect`) virou
     `useSyncExternalStore`: setState síncrono dentro do corpo de um efeito é o que a regra
     `set-state-in-effect` do eslint-plugin-react-hooks do Next 16 reprova — mesmo padrão que
     `lib/motion.tsx` já usa para o Lenis.
  2. Removidas as opções `linesClass`/`wordsClass`/`charsClass` passadas ao construtor de
     `GSAPSplitText`: conferido em `node_modules/gsap/SplitText.js` (v3.15.0) que essa build não
     tem essas chaves de configuração — ficariam mortas no código. As classes que o GSAP aplica
     por padrão (`.char`/`.word`/`.line`) já bastam, já que nada no site as consulta.
  3. Removido `overflow-hidden` do `split-parent`: útil no split original para mascarar
     `splitType="lines"` (linhas entrando de baixo pra cima), mas a Hero usa `splitType="words"`
     com `y: '0.4em'`, e o `leading-[0.96]` bem apertado da headline (mais a cedilha de "começa")
     cria risco real de corte com uma caixa `overflow-hidden` ajustada ao texto. Decisão preventiva
     por análise, não por defeito observado: com o `overflow-hidden` já removido, a Task 8 conferiu
     no Chrome real (`getComputedStyle` do `.split-parent` → `overflow: visible`) que não há corte.
     Ver `task-8-report.md`.
  4. Registro de `gsap.registerPlugin(ScrollTrigger, GSAPSplitText)` movido do escopo do módulo
     (onde o React Bits original registra) para dentro do efeito — mesmo padrão que
     `components/ui/Reveal.tsx` já usa. `ScrollTrigger.register` toca `matchMedia` internamente, e
     um módulo é avaliado antes de qualquer stub de `matchMedia` rodar; no navegador real `window.
     matchMedia` sempre existe, mas em SSR/testes isso quebra por um gap do ambiente, não do
     código — corrigido pela mesma razão do padrão já estabelecido no projeto.
  5. Adicionado `'use client'` no topo (o original não declara; como só é importado por Client
     Components neste projeto, é redundante, mas mantém o padrão explícito do resto do código).

### `Magnet.tsx`

- **Origem:** `src/ts-tailwind/Animations/Magnet/Magnet.tsx`
- **Usado em:** Task 8 (efeito magnético nos CTAs do Hero)
- **Dependências que arrasta:** nenhuma além de React.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** idem — não consulta nada sozinho. O gate (`podeAnimar` **e**
  `pontoFino`, os dois vindos de `useCapability()`) é passado de fora via a prop `disabled` já
  existente no componente original. Nenhuma modificação necessária para isso.
- **Cleanup:** o `mousemove` no `window` já tinha remoção correta no `useEffect` original — nada a
  consertar.
- **Só `transform`:** já animava só `transform: translate3d(...)` — dentro da regra.
- **Modificações:**
  1. Os defaults de `activeTransition`/`inactiveTransition` trocaram `ease-out 0.3s`/`ease-in-out
     0.5s` (curvas nativas do CSS, valores do React Bits) pelos tokens da marca
     `var(--ease-movimento)` (entrada, puxado pelo cursor, 200ms) e `var(--ease-saida)` (saída,
     solta e volta, 150ms) — `design-guidance.md` veta curva nativa em qualquer lugar do site, e
     manda a saída mais rápida que a entrada ("a saída é sempre mais rápida que a entrada"). Numa
     primeira versão inverti sem querer a duração (entrada 200ms, saída 400ms — saída mais lenta
     que a entrada, direção errada); corrigido na review da Task 8.
  2. O ramo `disabled` do efeito original chamava `setPosition({x:0,y:0})` de forma síncrona
     dentro do corpo do efeito — a regra `set-state-in-effect` do eslint-plugin-react-hooks do
     Next 16 reprova isso (mesma regra documentada em `lib/motion.tsx`). Troquei por: o efeito só
     retorna cedo sem registrar o listener, e o valor renderizado (`posAgora`/`activeAgora`) é
     forçado a `{0,0}`/`false` diretamente quando `disabled`, sem depender de resetar estado de
     dentro do efeito.
  3. Adicionado `'use client'` no topo, mesma razão do `SplitText.tsx`.

### `Silk` — **não vendorizado**

O brief pedia o `Silk` do React Bits para o fundo do Hero. Não foi trazido: toda variante do
componente no repositório (`ts-tailwind`, `tailwind`, `ts-default`, `default` — conferido inclusive
no commit inicial do arquivo, maio/2025) usa `@react-three/fiber` + `three`, não `ogl`. A política
deste projeto (`reactbits-vendoring.md`) é explícita: *"se um componente exigir three, pare e
reporte: three.js num site de clínica não se paga."*

Em vez disso, `site/components/ui/Silk.tsx` é uma implementação própria com `ogl` (a dependência
leve que o orçamento de performance desta task já previa), reaproveitando a mesma matemática de
ruído do shader original do React Bits (GLSL, MIT + Commons Clause) — só o motor de render mudou.
Detalhes e o porquê no `task-8-report.md`.
