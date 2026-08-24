# Task 3 — Detecção de capacidade do dispositivo — Relatório

## Adendo — correção pós-review (cobertura de testes)

A review aprovou a conformidade com a spec (lógica do hook e `turbopack.root` corretos) mas
reprovou a qualidade da suíte: os 4 testes originais eram o mínimo do brief e deixavam três
branches sem cobertura — `hardwareConcurrency < 4` isolado, o fallback `?? 8` quando o browser
não expõe as APIs, e a reatividade/cleanup do listener de `change`. Como este hook é a única
porta de entrada para `matchMedia`/`navigator.connection` e gateia WebGL e autoplay em 11 tasks
seguintes, uma regressão silenciosa nele não seria pega por ninguém. Este adendo documenta a
correção. **`site/lib/useCapability.ts` não foi alterado** — só o teste.

### O que foi adicionado

Em `site/__tests__/useCapability.test.tsx`:

1. **`hardwareConcurrency < 4` isoladamente** — `deviceMemory: 8`, `saveData: false`,
   `hardwareConcurrency: 2`; afirma `podePesado === false` e `podeAnimar === true`. Antes,
   nenhum teste forçava só os núcleos a ficarem abaixo do limite mantendo o resto capaz, então
   o termo `nucleos >= 4` nunca era exercitado isoladamente.
2. **Fallback `?? 8`** — `navigator` stubado **sem** `deviceMemory` e **sem**
   `hardwareConcurrency` (só `connection: { saveData: false }`), com `prefers-reduced-motion`
   false; afirma `podePesado === true`. Prova que ausência da API (caso real em Safari/Firefox)
   é lida como aparelho capaz, não como aparelho fraco — diferente do teste antigo "sem stub de
   navigator", que não provava nada porque nele `podeAnimar` já era `false` e o `&&`
   curto-circuitava antes de olhar memória/núcleos.
3. **Reatividade** — captura o handler passado a `addEventListener('change', ...)`, dispara ele
   dentro de `act()` com `mql.matches = true`, e afirma que `podeAnimar` (e `podePesado`) viram
   `false` em tempo real.
4. **Cleanup no unmount** — usa `unmount()` do `renderHook` e afirma
   `expect(mql.removeEventListener).toHaveBeenCalledWith('change', handler)` — a mesma função
   referenciada em `addEventListener`, não só "foi chamado com alguma coisa".

Para os testes 3 e 4, o helper `mockMatchMedia` foi ajustado: em vez de criar um objeto novo a
cada chamada de `matchMedia(...)`, ele agora cria a instância (`mql`) **uma vez**, com
`addEventListener`/`removeEventListener` como `vi.fn()` guardados em variáveis, e devolve essa
mesma instância a cada chamada de `matchMedia`. A função retorna `mql` para o teste poder ler
`mql.addEventListener.mock.calls` e mutar `mql.matches`. Os 4 testes originais continuam
passando sem alteração de asserção — só o helper por baixo mudou de forma.

### Prova de que cada teste novo pega o bug que deveria pegar

Mutação aplicada em `site/lib/useCapability.ts`, teste rodado, mutação desfeita, teste rodado de
novo — para as quatro mutações abaixo:

**Mutação 1 — `nucleos >= 4` → `true`** (remove a checagem de `hardwareConcurrency`):
```
❯ __tests__/useCapability.test.tsx (8 tests | 1 failed)
  × bloqueia o pesado em aparelho com poucos núcleos
    AssertionError: expected true to be false
 Test Files  1 failed (1)
      Tests  1 failed | 7 passed (8)
```
Só o teste de "poucos núcleos" cai; os outros 7 continuam verdes. Confirma que esse teste (e
só ele) é quem prende esse branch.

**Mutação 2 — `nav.deviceMemory ?? 8` → `?? 2` e `nav.hardwareConcurrency ?? 8` → `?? 2`**
(fallback errado para aparelho fraco):
```
❯ __tests__/useCapability.test.tsx (8 tests | 1 failed)
  × trata ausência de deviceMemory e hardwareConcurrency como aparelho capaz
    AssertionError: expected false to be true
 Test Files  1 failed (1)
      Tests  1 failed | 7 passed (8)
```
Só o teste de fallback cai. Os outros testes que sempre stubam `deviceMemory`/
`hardwareConcurrency` explicitamente não são afetados por essa mutação — o que confirma que
eles não cobrem esse caminho, só o novo teste cobre.

**Mutação 3 — comentar `mq.addEventListener('change', avaliar);`** (listener nunca registrado):
```
❯ __tests__/useCapability.test.tsx (8 tests | 2 failed)
  × reage em tempo real quando a preferência de reduced-motion muda
    AssertionError: expected "vi.fn()" to be called with arguments: [ 'change', Any<Function> ]
    Number of calls: 0
  × remove o listener de change ao desmontar
    TypeError: Cannot read properties of undefined (reading '1')
 Test Files  1 failed (1)
      Tests  2 failed | 6 passed (8)
```
Os dois testes novos de listener caem (o segundo falha ao tentar capturar um handler que nunca
foi registrado — também uma falha legítima, não um passe silencioso). Os 6 restantes continuam
verdes.

**Mutação 4 — isolando o cleanup: `return () => mq.removeEventListener(...)` → `return () => {}`**
(listener registrado mas nunca removido):
```
❯ __tests__/useCapability.test.tsx (8 tests | 1 failed)
  × remove o listener de change ao desmontar
    AssertionError: expected "vi.fn()" to be called with arguments: [ 'change', [Function avaliar] ]
    Number of calls: 0
 Test Files  1 failed (1)
      Tests  1 failed | 7 passed (8)
```
Isola exatamente o teste de cleanup — o teste de reatividade continua verde (ele não depende de
cleanup), confirmando que os dois testes de listener são independentes e cada um prende o seu
próprio bug.

Depois de cada mutação, `cp lib/useCapability.ts.orig lib/useCapability.ts` restaurou o arquivo;
ao final, `diff <(git show HEAD:site/lib/useCapability.ts) site/lib/useCapability.ts` confirmou
que o arquivo ficou byte-a-byte igual ao commit anterior (nenhuma mutação sobrou).

### Saída real — suíte completa depois da correção

```
> site@0.1.0 test
> vitest run

 Test Files  3 passed (3)
      Tests  37 passed (37)
```

(37 = 33 anteriores + 4 testes novos em `useCapability.test.tsx`, que passou de 4 para 8 testes.)

### Commit

- `fix: cobre hardwareConcurrency, fallback de API ausente e reatividade/cleanup do listener em
  useCapability` — `site/__tests__/useCapability.test.tsx` (só teste; `site/lib/useCapability.ts`
  intocado).

---

## O que foi feito

1. **`site/__tests__/useCapability.test.tsx`** — teste criado exatamente como no brief
   (4 casos: reduced-motion bloqueia tudo; aparelho capaz libera tudo; saveData bloqueia
   só o pesado; pouca memória bloqueia só o pesado).
2. Confirmado que o teste **falha** antes da implementação (módulo `@/lib/useCapability`
   não existe).
3. **`site/lib/useCapability.ts`** — hook implementado exatamente como no brief, exportando
   `useCapability()` e o tipo `Capacidade`.
4. Confirmado que os 4 testes **passam** depois da implementação. Suíte completa do projeto
   também rodada (33/33 passam), para garantir que nada quebrou.
5. **Tarefa extra**: `site/next.config.ts` corrigido para fixar `turbopack.root` e o
   Turbopack parar de inferir a raiz errada (detalhe abaixo).
6. Dois commits na raiz do repo, branch `feat/site`.

## Decisões

- Segui o código do brief ao pé da letra (teste e implementação) — não havia motivo para
  desviar, e o brief já é a fonte de verdade combinada com a emenda do `design-guidance.md`.
- **Distinção de dois níveis** (emenda do design-guidance): `prefers-reduced-motion: reduce`
  zera `podeAnimar`, mas isso por si só já também zera `podePesado` (que exige
  `podeAnimar && ...`). Isso é intencional e correto: WebGL/autoplay são sempre desligados sob
  reduced-motion, mas os *componentes* que consultam `podeAnimar` (não `podePesado`) continuam
  livres para manter fade de opacidade, transição de cor e o `scale(0.97)` de `:active` — o hook
  só define os dois flags; a decisão de "o que fazer com movimento leve sob reduced-motion" fica
  nos componentes consumidores (Tasks futuras), como o guia pede.
- `montado` começa `false` e só vira `true` dentro do `useEffect` (nunca roda no servidor),
  eliminando hydration mismatch — os componentes devem renderizar o estado estático/estável até
  `montado` ser `true`.
- Fallbacks de `deviceMemory` e `hardwareConcurrency` em `8` quando a API não existe no browser
  (ex. Safari não expõe `deviceMemory`) — tratados como capazes por padrão, já que a ausência da
  API não é sinal de aparelho fraco.
- `mq.addEventListener('change', avaliar)` com cleanup no unmount, para reagir se a pessoa mudar
  a preferência do SO em tempo real (ex. em testes de acessibilidade ou em sistemas que
  permitem toggle rápido).
- Não criei nenhum outro arquivo além dos dois pedidos — nenhum componente ainda consome o hook
  (isso é trabalho das próximas 11 tasks).

## Saída real dos testes

### Antes da implementação (confirmação de falha)

```
> site@0.1.0 test
> vitest run useCapability

 RUN  v4.1.11 D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA/site

 ❯ __tests__/useCapability.test.tsx (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  __tests__/useCapability.test.tsx [ __tests__/useCapability.test.tsx ]
Error: Failed to resolve import "@/lib/useCapability" from "__tests__/useCapability.test.tsx". Does the file exist?
  Plugin: vite:import-analysis
  ...

 Test Files  1 failed (1)
      Tests  no tests
```

### Depois da implementação

```
> site@0.1.0 test
> vitest run useCapability

 RUN  v4.1.11 D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA/site

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

### Suíte completa (regressão)

```
> site@0.1.0 test
> vitest run

 Test Files  3 passed (3)
      Tests  33 passed (33)
```

## Como resolvi o `turbopack.root`

**Sintoma:** `npm i -D sharp` (Task 2) rodou na raiz do repo e criou `package-lock.json` ali,
além do já existente `site/package-lock.json`. Com dois lockfiles no disco, o Turbopack passou
a inferir a raiz do workspace como a raiz do repo (não `site/`) e avisar em todo `next dev`:

```
Warning: Next.js inferred your workspace root, but it may not be correct. We detected multiple
lockfiles and selected the directory of .../package-lock.json as the root directory.
```

**O que a doc local dizia** (`site/node_modules/next/dist/docs/01-app/03-api-reference/05-config/
01-next-config-js/turbopack.md`, seções "Options" e "Root directory"):

- A tabela de opções lista `root` — "Sets the application root directory. Should be an absolute
  path." — dentro do objeto `turbopack` no nível raiz do `NextConfig`, **não** dentro de
  `experimental`. A doc ainda cita explicitamente: *"The `turbopack` option was previously named
  `experimental.turbo` in Next.js versions 13.0.0 to 15.2.x. The `experimental.turbo` option will
  be removed in Next.js 16."* — ou seja, na 16.3.1 a chave certa é `turbopack.root`, e usar
  `experimental.turbo.root` (o que eu talvez chutasse de memória de versões antigas) estaria
  errado/removido.
- A seção "Root directory" explica a causa raiz exata do meu sintoma: Next.js detecta a raiz
  automaticamente procurando `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lock` ou
  `bun.lockb` — e recomenda setar `root` manualmente quando a estrutura do projeto não é a
  esperada, com o exemplo `root: path.join(__dirname, '..')` (mostrando que deve ser caminho
  absoluto).

**Correção aplicada** em `site/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Há um package-lock.json na raiz do repositório (fora de site/), então o
    // Turbopack infere a raiz errada e detecta múltiplos lockfiles. Fixamos
    // explicitamente em site/ para o aviso sumir.
    root: __dirname,
  },
};

export default nextConfig;
```

Como `next.config.ts` já vive em `site/`, `__dirname` resolve exatamente para `site/` — não
precisei do `path.join(__dirname, '..')` do exemplo da doc (esse exemplo é para quando o config
está um nível abaixo da raiz desejada; aqui o config já *é* a raiz desejada).

**Verificação:** rodei `npm run dev -- -p 3101` (a porta 3000 já tinha um dev server de outra
sessão rodando; 3100 também estava ocupada, usei 3101). Saída:

```
▲ Next.js 16.3.1 (Turbopack)
- Local:         http://localhost:3101
- Network:       http://26.0.211.234:3101
✓ Ready in 733ms
✓ Running next.config.ts took 60ms
⚠ Slow filesystem detected. The benchmark took 228ms. If \\?\D:\...\site\.next\dev is a network
drive, consider moving it to a local folder.
```

O aviso de múltiplos lockfiles não aparece mais. Restou apenas um aviso não relacionado
("Slow filesystem detected" — específico da máquina/disco local, fora do escopo desta task).
Servidor foi parado logo em seguida (processo do `timeout 20` encerrou; confirmei com
`netstat` que a porta 3101 ficou livre).

## Commits

- `dc3f080` — `feat: hook de capacidade do dispositivo para gatear motion pesado`
  (`site/lib/useCapability.ts`, `site/__tests__/useCapability.test.tsx`)
- `895ad36` — `fix: fixa turbopack.root em site/ para o Turbopack parar de inferir a raiz errada`
  (`site/next.config.ts`)

## Concerns / observações para as próximas tasks

- `site/.claude/` apareceu como untracked no `git status` antes de eu tocar em qualquer coisa —
  não é meu, não mexi nele, deixei como estava.
- Vitest emite um aviso não-fatal em todo `npm test`: `ESM syntax in a file loaded as CommonJS
  (vitest.config.ts:1:1)`, sugerindo `.mjs` ou `"type": "module"` no `package.json`. Não é
  bloqueante e está fora do escopo desta task — fica registrado caso vire ruído recorrente.
- Nenhum componente ainda importa `useCapability` — é esperado, é o hook-base para as próximas
  11 tasks (WebGL, autoplay de vídeo, tickers, etc.), que devem consumir `podeAnimar`/`podePesado`
  em vez de consultar `matchMedia`/`navigator.connection` diretamente.
