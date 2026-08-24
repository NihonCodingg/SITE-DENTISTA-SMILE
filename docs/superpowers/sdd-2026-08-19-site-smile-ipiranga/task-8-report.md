# Task 8 — Motion do hero + fundo WebGL

## O que foi feito

- **`site/lib/useCapability.ts`** — adicionado `pontoFino: boolean`, computado a partir de
  `matchMedia('(pointer: fine)')`, na mesma função/efeito que já cuidava de reduced-motion.
  Continua sendo a única leitura de `matchMedia` do projeto — nenhum componente novo consulta
  a media query por conta própria.
- **`site/components/reactbits/`** — criado (primeira task a vendorizar React Bits). Contém
  `LICENSE.md` (cópia da licença do repo), `README.md` (proveniência + toda modificação de cada
  arquivo) e dois componentes vendorizados de `DavidHDev/react-bits` (commit
  `4e0e030193b563be6be33d928f77d0d01cefe237`, variante `ts-tailwind`): `SplitText.tsx` e
  `Magnet.tsx`. **`Silk` não foi vendorizado** — ver "Desvio 1" abaixo.
- **`site/components/ui/Silk.tsx`** — implementação própria do fundo WebGL, com `ogl` em vez do
  `Silk` do React Bits. Ver "Desvio 1".
- **`site/components/sections/HeroBackdrop.tsx`** — wrapper que monta `<Silk>` via
  `next/dynamic({ssr:false})` só quando `podePesado && montado`. Container com `aria-hidden="true"`
  sempre presente, para não haver layout shift quando o canvas entra.
- **`site/components/sections/Hero.tsx`** — modificado: `<HeroBackdrop>` atrás do conteúdo (dentro
  do container creme, com `relative` + `overflow-hidden`); headline vira `<SplitText>` quando
  `podeAnimar` e `<h1>` puro quando não; os dois CTAs (`Agendar minha avaliação`, `Conhecer a
  clínica`) envolvidos por `<Magnet>`, `disabled` quando `!podeAnimar || !pontoFino`.
- **`site/vitest.setup.ts`** — três stubs de ambiente de teste (jsdom não implementa): já existia
  `ResizeObserver`; adicionados `document.fonts` (Font Loading API) e `IntersectionObserver`. Ver
  "Ambiente de teste" abaixo para o porquê de cada um.
- **Testes:** `site/__tests__/heroBackdrop.test.tsx` (novo, conforme o brief), `useCapability.test.tsx`
  (3 testes novos para `pontoFino`), `hero.test.tsx` (1 teste novo para o ramo reduced-motion; 1
  assert ajustado — ver "Achado" abaixo).

## Desvio 1 — `Silk` do React Bits não foi vendorizado (usa `three`, não `ogl`)

O brief e o `reactbits-vendoring.md` partem do princípio de que `Silk` usa `ogl`. Não é mais
verdade: conferi as 4 variantes do repositório (`ts-tailwind`, `tailwind`, `ts-default`, `default`)
e **todas** importam `@react-three/fiber` + `three`. Fui até o commit inicial do arquivo
(`0ae4082`, maio/2025, "FEAT: Add New Silk component") — já nascia assim. Não é uma migração
recente que passou despercebida; a premissa do vendoring doc nunca foi verdade para este repo, ou
era verdade numa versão muito mais antiga do React Bits.

Isso bate exatamente na regra de parar do próprio `reactbits-vendoring.md`: *"se um componente
exigir three, pare e reporte: three.js num site de clínica não se paga."* Segui a saída que o
mesmo documento autoriza ("Quando NÃO usar o componente... implemente à mão"):
`site/components/ui/Silk.tsx` é uma implementação própria usando `ogl` (a dependência leve que o
orçamento de performance da task já previa), com o mesmo shader GLSL do React Bits (mesma
matemática de ruído/rotação de UV — GLSL é dado, não identificador, e a licença MIT + Commons
Clause permite modificar) rodando sobre `Renderer`/`Program`/`Mesh`/`Triangle` do `ogl` em vez do
`Canvas`/`useFrame` do react-three-fiber. Só o motor de render mudou.

Efeito prático: **nenhum three.js entra no projeto.** `ogl` sozinho, minificado, é ~48KB — a
`Silk`+`react-three-fiber`+`three` do React Bits teria sido uma ordem de grandeza maior para o
mesmo resultado visual (uma textura de ruído fluido em baixa opacidade atrás do hero).

Detalhes técnicos do `Silk.tsx`:
- `Triangle` (geometria fullscreen padrão do `ogl`, um único triângulo cobrindo o clip space) +
  vertex shader minúsculo (`gl_Position = vec4(position, 0, 1)`) — sem câmera, sem matrizes de
  projeção, porque não há necessidade nenhuma delas para um shader de tela cheia.
- Uniforms (`uTime`, `uSpeed`, `uScale`, `uNoiseIntensity`, `uRotation`, `uColor`) atualizados por
  um efeito separado do de montagem, para não recriar o contexto WebGL a cada re-render.
- `Color` do `ogl` aceita hex string direto (`new Color('#F0B40C')`) — sem conversão manual.
- **Pausa fora da viewport** (exigência dura da task): `IntersectionObserver` no container; o loop
  de `requestAnimationFrame` só atualiza `uTime`/renderiza quando `visivel && !document.hidden`.
  Cobre tanto "hero fora da viewport, aba em foco" quanto "aba em segundo plano".
- **Cleanup completo**: `cancelAnimationFrame`, `resizeObserver.disconnect()`,
  `intersectionObserver.disconnect()`, `gl.getExtension('WEBGL_lose_context')?.loseContext()`
  (libera a GPU) e remoção do canvas do DOM.
- `dpr` capado em `[1,2]` (`Math.min(devicePixelRatio, 2)`), igual ao `Canvas dpr={[1,2]}` que o
  React Bits usava.

## Desvio 2 — dois componentes vendorizados tinham `set-state-in-effect` (regra do eslint do Next 16)

Não estava nos requisitos do brief, mas `npm run lint` reprovou os dois arquivos vendorizados como
foram baixados (antes das minhas modificações "documentadas" já corrigirem outra coisa):

- **`Magnet.tsx`**: o ramo `if (disabled)` do efeito chamava `setPosition({x:0,y:0})`
  sincronamente dentro do corpo do efeito. Troquei por: o efeito só retorna cedo sem registrar o
  `mousemove`, e o valor renderizado é forçado a `{0,0}`/`false` diretamente no render
  (`posAgora`/`activeAgora`), sem depender de resetar estado de dentro do efeito.
- **`SplitText.tsx`**: o `useState`+`useEffect` que esperava `document.fonts.ready` chamava
  `setFontsLoaded(true)` sincronamente dentro do efeito. Troquei por `useSyncExternalStore` — o
  mesmo padrão que `lib/motion.tsx` já usa para o Lenis, pela mesma razão (sincronizar com um
  sistema externo ao React sem `setState` direto no corpo do efeito).

Ambos documentados em `components/reactbits/README.md`. `npm run lint` e `npm run build` (que roda
`tsc`) saem limpos.

## Achado — GSAP `SplitText` + `y` animado corrompe texto **só em jsdom**, não no navegador

Ao rodar `npm test -- hero` pela primeira vez com o `SplitText` já ligado, um teste pré-existente
(`hero.test.tsx`, Task 7) quebrou: `container.textContent` vinha como
`"Seu novo sorriso começaaqui"` — sem o espaço entre "começa" e "aqui", e com um espaço extra
solto no início da string.

Isolei com um script standalone (`node` + `jsdom` + `gsap/SplitText`, fora do Vitest) até achar a
causa exata: **não é `smartWrap`, não é `stagger`, não é `ScrollTrigger`** — é especificamente
`gsap.fromTo(self.words, {y: ...}, {y: 0, ...})` sobre os alvos gerados pelo `SplitText`. Com
`{opacity}` sozinho, sem `y`, o texto sai correto. Com `y` (qualquer unidade, `px` ou `em`), o nó
de texto de espaço entre duas palavras migra de posição, do meio para o início da string.

Antes de mexer no componente (que seria mascarar um bug sem confirmar se é real), verifiquei no
Chrome de verdade via o dev server: `document.querySelector('h1').textContent` ===
`"Seu novo sorriso começa aqui"`, correto, espaços no lugar certo, `aria-label` do split também
correto. **O bug não existe fora do jsdom** — é uma incompatibilidade de jsdom com algum caminho
interno do `gsap/SplitText` quando ele mede/reordena os elementos splitados durante uma animação
de `y` (jsdom não faz layout real; `getBoundingClientRect`/`getComputedStyle` devolvem valores
degenerados que provavelmente empurram o gsap para um branch de fallback que normalmente não roda
em produção).

Como é comprovadamente um gap do ambiente de teste (mesma categoria de `ResizeObserver`,
`document.fonts` e `IntersectionObserver`, todos já stubados em `vitest.setup.ts` por não existirem
em jsdom) e não um bug de produção, a correção certa não é tocar no componente — é deixar a
asserção do teste tolerante a esse artefato específico. Troquei `/Seu novo sorriso começa aqui/i`
por `/Seu\s*novo\s*sorriso\s*começa\s*aqui/i` (com comentário explicando o porquê) — `\s*` casa
tanto com o espaço real (navegador) quanto com a ausência dele (artefato do jsdom), sem enfraquecer
o que o teste garante: a headline certa, num h1 único. Ver
`site/__tests__/hero.test.tsx`.

## Ambiente de teste — três stubs novos/ajustados em `vitest.setup.ts`

jsdom (usado pelo Vitest deste projeto) não implementa três APIs que o código de produção desta
task usa de verdade em todo navegador real:

1. **`document.fonts`** (Font Loading API) — `SplitText` espera `document.fonts.ready` antes de
   splitar. Stub: `{status:'loaded', ready: Promise.resolve(), addEventListener, removeEventListener}`.
2. **`IntersectionObserver`** — `Silk.tsx` usa para pausar o rAF fora da viewport. Stub no-op
   (mesma forma do `ResizeObserver` que já existia).

Sem esses dois, qualquer teste que monte a `Hero` com `podeAnimar`/`podePesado` verdadeiros
quebra por uma lacuna do ambiente, não do código — mesmo raciocínio já documentado no arquivo para
o `ResizeObserver` (usado pelo Lenis).

## Testes — resultado

```
npm test
 Test Files  9 passed (9)
      Tests  72 passed (72)
```

`npm run lint` — 0 erros, 0 warnings.
`next build` (que roda `tsc`) — compila e type-checa limpo.

## `npm run build` — prova de que `ogl` está fora do first-load JS

O Next 16 com Turbopack não imprime mais a tabela clássica "Route / First Load JS" do build
webpack. A prova ficou nos manifests gerados em `.next/server/app/page/`:

```
$ grep -rl "2.71828182845904523536" .next/static/    # constante única do shader (uNoiseIntensity)
.next/static/chunks/41eu60mhej8ft.js

$ cat .next/server/app/page/build-manifest.json
{
  ...
  "rootMainFiles": [
    "static/chunks/2zynomd7rkcis.js",
    "static/chunks/1o6whawhpwyz5.js",
    "static/chunks/227kwhsrjlnp4.js",
    "static/chunks/turbopack-35tz8pjg55lw-.js"
  ],
  ...
}

$ cat .next/server/app/page/react-loadable-manifest.json
{
  "7536": {
    "id": 7536,
    "files": ["static/chunks/41eu60mhej8ft.js"]
  }
}
```

`41eu60mhej8ft.js` (47.7KB, contém o `ogl` + `Silk.tsx`) **não aparece** em `rootMainFiles` (o
first-load JS da rota `/`) — aparece só em `react-loadable-manifest.json`, o manifest que o Next
usa especificamente para chunks carregados via `next/dynamic`. Confirma que o `ssr:false` +
montagem condicionada a `podePesado` estão fazendo o code-splitting certo.

## O que vi no navegador (`npm run dev`, porta 3000)

- **Canvas aparece**: `<canvas>` presente no DOM, dimensionado certo (buffer 2x o CSS size, dpr
  capado em 2), visível como um sheen diagonal dourado/creme suave atrás do hero — textura, não
  protagonista.
- **Contraste**: headline preta sobre creme+Silk continua nitidamente legível em mobile (375px) e
  desktop (~800-1280px). Não precisei baixar a opacidade abaixo do `.22` do brief (28% pareceu
  mais forte que necessário na review visual; fui para `.22` — ainda assim a decisão de "baixar
  opacidade, não a cor do texto" do design-guidance está seguida caso precise recalibrar depois).
- **Headline**: revela por palavra, texto final idêntico ao aprovado
  ("Seu novo sorriso começa aqui"), sem clipping — `getComputedStyle` confirmou `overflow: visible`
  no `h1` e no `.split-parent` (removi o `overflow-hidden` do React Bits preventivamente, ver
  README; aqui só confirmo que a decisão não introduziu regressão visual).
- **Magnet**: testado de verdade — movi o cursor perto do CTA "Agendar minha avaliação" em desktop
  (`pointer:fine`) e capturei `transform: translate3d(-6.26px, 2.71px, 0)` no wrapper interno,
  confirmando que o efeito de atração está ativo.
- **Reduced-motion / touch**: cobertos pelos testes automatizados (`heroBackdrop.test.tsx`,
  `hero.test.tsx` — ramo `!podeAnimar`), não por inspeção visual manual nesta sessão (o harness de
  browser disponível não emula `prefers-reduced-motion` nem `pointer:coarse` de forma limpa sem
  perder o resto do estado da página).
- Scroll permaneceu fluido nas duas larguras testadas; nenhum layout shift perceptível quando o
  canvas monta (o container do `HeroBackdrop` já ocupa o espaço via `absolute inset-0` desde o
  primeiro render).

## Modificações nos componentes vendorizados (resumo — detalhe completo no README)

| Arquivo | Arrastava | Modificado |
|---|---|---|
| `SplitText.tsx` | `gsap`, `gsap/ScrollTrigger`, `gsap/SplitText` (já no projeto); original também pedia `@gsap/react` | `useGSAP` → `useEffect` manual; `document.fonts` → `useSyncExternalStore`; removidas `linesClass/wordsClass/charsClass` (gsap 3.15 não as suporta); removido `overflow-hidden`; `gsap.registerPlugin` movido para dentro do efeito; `'use client'` |
| `Magnet.tsx` | nenhuma dependência externa | defaults de transição → tokens da marca (`--ease-movimento`/`--ease-saida`); ramo `disabled` não chama mais `setState` no corpo do efeito; `'use client'` |
| `Silk` | — (não vendorizado) | implementação própria com `ogl`, ver Desvio 1 |

Nenhum dos dois componentes vendorizados fazia chamada de rede, nenhum consultava `matchMedia`
por conta própria, e o `mousemove` do `Magnet` já tinha cleanup correto no original.

## Concerns / itens em aberto

- A opacidade final do Silk (`.22`) foi uma escolha de julgamento visual nesta sessão, não uma
  medição de contraste numérica (WCAG). Vale um olhar de quem aprovou o design original.
- Não testei visualmente `prefers-reduced-motion` nem `pointer:coarse` no navegador real (só via
  Vitest) — a cobertura automatizada existe, mas não há confirmação visual humana desses dois
  ramos.
- O achado do jsdom/gsap (`y` animado corrompendo texto) é isolado e documentado, mas fica como
  nota para quem for depurar outro teste de SplitText no futuro sem saber dessa pegadinha do
  ambiente.


---

## Correção pós-review

A review aprovou a conformidade com a spec e validou os dois desvios (Silk sem `three`/vendorizado
à mão, `ogl` fora do first-load JS), confirmando de forma independente `ogl` fora dos 4 root
chunks, zero `three` no lock, headline em texto puro no HTML via `curl`, `useCapability()` como
único leitor de `matchMedia`, cleanup completo do `Silk.tsx`, e contraste 10,5:1–15:1 (bem acima de
AAA — não era achado, ficou como concern por falta de medição, agora medido e fechado). Dois itens
voltaram para correção.

### 1. (Important) Regex frouxa em `hero.test.tsx` virou quase tautologia

`\s*` (zero ou mais) entre as palavras da headline casava até com todos os espaços ausentes —
`"Seunovosorrisocomeçaaqui"` também passaria. O teste tinha parado de proteger contra regressão de
espaçamento, mesmo continuando verde.

Troquei a asserção por igualdade exata do `aria-label` do `.split-parent` (não `textContent` do
h1): o GSAP grava esse atributo com o texto original **antes** de fatiar
(`node_modules/gsap/SplitText.js`), então ele não é afetado pelo artefato do jsdom que reordena os
nós de texto entre as palavras quando `y` é animado sobre os alvos do split. `\s*` saiu do teste.

```diff
- expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Seu\s*novo\s*sorriso\s*começa\s*aqui/i);
+ const splitParent = container.querySelector('.split-parent');
+ expect(splitParent).not.toBeNull();
+ expect(splitParent).toHaveAttribute('aria-label', 'Seu novo sorriso começa aqui');
```

**Prova por quebra proposital** (pedida pela review): troquei `HEADLINE` em `Hero.tsx` de `'Seu
novo sorriso começa aqui'` para `'Seu novo sorrisocomeça aqui'` (removendo um espaço de verdade,
não simulando o artefato do jsdom), rodei `npm test -- hero` e os dois testes que dependem da
headline quebraram exatamente como esperado:

```
 FAIL  __tests__/hero.test.tsx > Hero > usa a headline da marca como h1 unico
   Expected: aria-label="Seu novo sorriso começa aqui"
   Received: aria-label="Seu novo sorrisocomeça aqui"

 FAIL  __tests__/hero.test.tsx > Hero > sob prefers-reduced-motion, a headline continua um h1 puro (sem SplitText)
   Expected element to have text content: Seu novo sorriso começa aqui
   Received: Seu novo sorrisocomeça aqui

 Tests  2 failed | 7 passed (9)
```

Restaurei a string original e os 9 testes de `hero`/`heroBackdrop` voltaram a passar. `npm test`
completo: 72/72.

### 2. (Minor) Timing do Magnet estava invertido

`site/components/reactbits/Magnet.tsx`: os defaults tinham entrada 200ms / saída 400ms — o
design-guidance manda o oposto ("a saída é sempre mais rápida que a entrada"), com teto de 300ms
para qualquer coisa acionável. Já tinha encurtado os dois em relação ao original do React Bits
(300ms/500ms), mas mantive a direção errada.

```diff
  activeTransition = 'transform 0.2s var(--ease-movimento)',
- inactiveTransition = 'transform 0.4s var(--ease-saida)',
+ inactiveTransition = 'transform 0.15s var(--ease-saida)',
```

Entrada continua 200ms com `--ease-movimento` (cursor puxando o elemento), saída agora 150ms com
`--ease-saida` (elemento solta e volta) — mais rápida que a entrada, as duas dentro do teto de
300ms. `components/reactbits/README.md` atualizado com a duração certa e a nota do erro original.

### Verificação final

```
$ npm test
 Test Files  9 passed (9)
      Tests  72 passed (72)

$ npm run lint
(0 erros, 0 warnings)
```
