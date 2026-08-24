# Task 18 — Avaliação B: evidência mecânica e audit técnico (isolada)

Você produz a **Avaliação B** de uma crítica em duas partes do site da clínica Smile Ipiranga.
A **Avaliação A** (revisão de design, heurísticas, personas) roda em paralelo, em outro agente —
**você não faz julgamento de design**. Você coleta o que é **determinístico e mensurável**.

**Diretório:** `D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA`
**Servidor de produção já no ar:** `http://localhost:4173` — **não rebuilde, não suba outro
nesta porta, não altere `.claude/launch.json`.** Abra em **aba nova sua**. Testes:
`npx vitest run --no-file-parallelism` de dentro de `site/`.

## Leia primeiro

`.superpowers/sdd/2026-08-19-site-smile-ipiranga/qa-guidance.md` — inteiro. Em especial:
"O audit técnico — 5 dimensões", "Ferramental de acessibilidade" (o `@axe-core/cli` **não
funciona** nesta máquina — não tente), "Verificações específicas" e "Achados já confirmados pelo
axe" (dois P1 que você vai **re-confirmar** no estado final, não redescobrir).

## O que coletar

### 1. Detector mecânico da `impeccable`
```
node C:/Users/Pichau/.claude/skills/impeccable/scripts/detect.mjs --json site/components site/app
```
Exit 0 = limpo, 2 = achados. Grave a saída em
`.superpowers/sdd/2026-08-19-site-smile-ipiranga/task-18-detect.json`. Para **cada** achado,
abra o arquivo e verifique no contexto: defeito real ou falso positivo? Diga qual e por quê.

### 2. Lighthouse no estado final — mobile e desktop, 1 rodada cada
```
npx lighthouse http://localhost:4173 --output=json --output-path=./lh-final-mobile.json --form-factor=mobile --throttling-method=simulate --quiet
npx lighthouse http://localhost:4173 --output=json --output-path=./lh-final-desktop.json --preset=desktop --quiet
```
(de dentro de `site/`). Extraia: as 4 notas de categoria; LCP/TBT/CLS/TTI; e **todos** os audits
de acessibilidade reprovados, com `node.selector` e `node.snippet` de cada item. Os dois P1
conhecidos (`aria-prohibited-attr` no `span.split-parent`, `heading-order` nos Pilares) devem
aparecer — confirme. Se aparecer algo novo, reporte.

### 3. Varredura responsiva — medida, não olhada
Em **320, 375, 414, 768, 1024, 1280, 1440, 1920** de largura, via `resize_window` +
`javascript_tool`:
- `document.documentElement.scrollWidth === document.documentElement.clientWidth` (sem overflow);
- todo elemento interativo (`a, button, [role=button], summary, input`) com
  `getBoundingClientRect()` ≥ 44×44 — liste os que falham com seletor;
- os `<h2>` com `getComputedStyle().fontSize` ≥ 26px (foi bug: todos a 16px);
- nenhum texto com `fontSize` < 16px em corpo (13px é permitido só em sobretítulo/rótulo).
Tabela: largura × overflow × alvos < 44 × menor h2.

### 4. As 7 verificações específicas do projeto (qa-guidance, seção 7)
Cada uma com o comando/medição que você usou e o resultado:
1. Navegação direta com hash (`/#tratamentos`, `/#depoimentos`, `/#localizacao`): opacidade dos
   blocos = 1 depois de ~2,5s. **Repita com `prefers-reduced-motion`** — emule via
   `resize_window`/`colorScheme` não serve; use `matchMedia` override por script se precisar, ou
   a flag de emulação do navegador se o harness expuser. Se não conseguir emular, **diga**.
2. Drawer mobile (375px): abrir, fechar, reabrir em chamadas de script **separadas** (< 220ms);
   `aria-expanded`, `inert`, foco; `scrollWidth === outerWidth`; `elementFromPoint(200,400)`
   com drawer aberto → elemento do drawer.
3. Lightbox: `Escape`, Tab/Shift+Tab preso, foco devolvido, `lenis-stopped` no `<html>`.
4. Vídeo: `performance.getEntriesByType('resource')` sem `.mp4` na carga; prévia só ao entrar
   na viewport; `completos/` só no clique.
5. Mapa: zero entrada de `google.com/maps` antes de ativar; uma depois.
6. Dados inventados:
   `grep -rEi "[0-9]+\+ (pacientes|clientes|anos)|[0-9],[0-9] estrelas|melhor clínica|garantid" site/.next/server/app/`
   → deve dar vazio.
7. **Paleta**: `grep -rnoE "#[0-9a-fA-F]{6}" site/components site/app --include=*.tsx` → todo hex
   fora de `#FFFFFF #FCF0E4 #FCCC24 #F0B40C #111111 #5A5A55 #F1E7DB #E8DCCA #EFDFC9 #EBDFCE
   #2A2A28 #8A8A85 #B7B7B2` é achado.

### 5. Console
Recarregue a página em 375 e 1280 e colete `read_console_messages`. Erros e warnings, com
origem. (O `THREE.Clock deprecated` é conhecido e deferred — registre, não inflacione.)

### 6. Suíte
`npx vitest run --no-file-parallelism` — total, falhas. O `orcamento.test.ts` pode estar vermelho
de propósito (LCP) — reporte o estado, não "conserte".

## O que entregar — em `.superpowers/sdd/2026-08-19-site-smile-ipiranga/task-18-B-report.md`

**Primeira linha obrigatória:** `Avaliação B — evidência mecânica (sem julgamento de design)`.

1. **Nota das 5 dimensões do audit** (0-4 cada, critérios no qa-guidance), com o achado-chave de
   cada uma. Total /20 e banda.
2. **Achados P0-P3**, cada um com arquivo:linha ou seletor, impacto, padrão violado (WCAG se
   houver), correção concreta. **Separe "detector" de "medido no navegador" de "falso positivo".**
3. As tabelas: Lighthouse final, responsiva, 7 verificações.
4. **Padrões sistêmicos** (o que se repete) e **pontos positivos** (o que manter).

## Regras

- **Não corrija nada.** Você mede. Outra pessoa corrige.
- Onde não conseguir medir, escreva "⚠️ Não verificável: <motivo>". Nunca alegue ter visto o
  que não viu — o painel às vezes não composita; o `javascript_tool` sempre funciona.
- Não feche o servidor; feche só a sua aba. Não deixe arquivo temporário fora de `.superpowers/`.

Na resposta final, retorne APENAS: o caminho do relatório, a nota /20, a contagem P0/P1/P2/P3,
e se os dois P1 conhecidos foram re-confirmados.

---

### 8. Motion — o que dá para medir (acréscimo do parceiro)
O parceiro exige motion de alto nível. A parte que é julgamento fica com a Avaliação A; a sua é
a parte mecânica:
- `document.getAnimations()` após rolar a página inteira: liste as propriedades animadas. Qualquer
  `width`, `height`, `top`, `left`, `padding`, `margin` é achado. `background-position` do
  `GlareHover` é exceção aceita pelo parceiro — registre, não penalize.
- `grep -rn "transition: all\|transition-all\|ease-in\b" site/components site/app` → tem que dar
  vazio (os tokens `--ease-saida`/`--ease-movimento`/`--ease-gaveta` são os únicos permitidos
  além de `ease` e `linear`).
- Com `prefers-reduced-motion` emulado (ou `matchMedia` sobrescrito por script): nenhum `<canvas>`
  montado, nenhum `<video>` tocando, o ticker parado, mas o `:active scale(0.97)` dos botões
  **ainda funciona** (reduzir ≠ zerar).
- Long tasks durante um scroll programático do topo ao fim (`PerformanceObserver` de `longtask`):
  quantas acima de 50ms, e de qual origem. Motion que trava a thread principal é motion ruim.
