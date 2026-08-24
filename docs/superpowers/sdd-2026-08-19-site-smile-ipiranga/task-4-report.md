# Task 4 — Conteúdo centralizado — Relatório

## Adendo — correção pós-review (2 Important)

A review aprovou a conformidade com a spec e não achou nenhum dado inventado no conteúdo atual,
mas apontou dois problemas Important, corrigidos abaixo. **`site/lib/content.ts` não foi
alterado** — só o teste e este relatório.

### 1. Rede de segurança do teste "sem dado inventado" trocada de blacklist para whitelist

O teste antigo (`não contém número inventado de pacientes ou avaliações`) usava duas regex
específicas — `/\d+\s*\+\s*(pacientes|clientes|avalia)/i` e `/\d[,.]\d\s*(estrelas|★)/i` — que
tinham buracos comprovados: não pegavam `"mais de 500 pacientes"` (sem o sinal `+`), `"+500
pacientes"` (ordem invertida) nem `"nota 5.0 de satisfação"`. Como esse é o teste que protege o
requisito mais duro do projeto (nenhum dado inventado sobre um negócio real), uma blacklist de
padrões lembrados na hora não é rede de segurança suficiente.

Troquei a abordagem: `site/__tests__/content.test.ts` agora tem um teste
(`não contém nenhum número fora da whitelist de campos legítimos...`) que:

- Percorre recursivamente **todos** os valores string de `PILARES`, `TRATAMENTOS`, `PASSOS`,
  `FAQ`, `SORRISOS`, `DEPOIMENTOS` e `ANTES_DEPOIS`.
- Só permite dígitos em dois nomes de campo, via whitelist explícita
  (`CAMPOS_COM_NUMERO_PERMITIDO = new Set(['n', 'img'])`): o `n` de numeração de exibição
  (`TRATAMENTOS`, `PASSOS`, `SORRISOS`) e o `img` de caminho de arquivo (`retrato-1.jpg`,
  `antes-depois-3.jpg` etc.).
- Antes de varrer, remove do texto a única exceção legítima hoje — o telefone do WhatsApp dentro
  da resposta do FAQ — importando `WHATSAPP_DISPLAY` de `lib/contact.ts` (não um regex nem uma
  string hardcoded no teste), para que trocar o número por outro inventado não escape da
  varredura.
- Extrai toda sequência de dígitos (`/\d+/g`) que sobrar em qualquer campo fora da whitelist e
  afirma que o array de achados é **vazio**, com mensagem de falha (`expect(achados, mensagem)`)
  que lista caminho, valor e dígitos de cada achado — ex.: `PILARES[0].desc: "atendemos mais de
  500 pacientes" (dígitos: 500)`.

Os dois testes antigos de regex foram **mantidos** (renomeados para "...regex específica"), como
pedido — não custam nada e documentam a intenção original; o comentário no código já deixa
explícito que a rede de segurança real agora é o teste de whitelist.

**Verificação de que o teste novo realmente pega o bug que deveria pegar:** troquei
temporariamente `PILARES[0].desc` de `'Personalizado para cada paciente'` para `'atendemos mais
de 500 pacientes'` — a frase exata que as regex antigas não pegavam, por não ter o sinal `+`.

```
❯ __tests__/content.test.ts (8 tests | 1 failed) 13ms
     × não contém nenhum número fora da whitelist de campos legítimos (numeração e caminho de arquivo) 8ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  __tests__/content.test.ts > content > não contém nenhum número fora da whitelist de campos legítimos (numeração e caminho de arquivo)
AssertionError: Número(s) fora da whitelist encontrado(s):
  - PILARES[0].desc: "atendemos mais de 500 pacientes" (dígitos: 500): expected [ Array(1) ] to deeply equal []

 Test Files  1 failed (1)
      Tests  1 failed | 7 passed (8)
```

A falha aponta exatamente `PILARES[0].desc` e o dígito `500` — a mensagem diz onde, como pedido.
Restaurei `lib/content.ts` a partir de uma cópia de backup feita antes da injeção
(`cp lib/content.ts lib/content.ts.bak` → editar → `mv lib/content.ts.bak lib/content.ts`) e
confirmei com `diff <(git show HEAD:site/lib/content.ts) site/lib/content.ts` que o arquivo
ficou **byte-a-byte idêntico** ao commit anterior (saída vazia — nenhuma mutação sobrou). Rodei a
suíte completa de novo depois da restauração:

```
> site@0.1.0 test
> vitest run

 Test Files  4 passed (4)
      Tests  45 passed (45)
```

(45 = 44 anteriores + 1 teste novo — o teste antigo de regex foi só renomeado/mantido, não
duplicado; o único item novo na contagem é o teste de whitelist.)

`npx tsc --noEmit` também rodado depois da mudança, sem erros.

### 2. Duas divergências brief × COPY.md não documentadas — corrigido

O relatório original disse "não alterei nenhuma frase da copy" em relação ao **brief**, o que é
verdade, mas escondeu que o **brief em si já diverge de `COPY.md`** em dois campos. Nenhum dos
dois é dado inventado (não introduzem número, nome ou fato nulo) — são reescritas de frase.
Documentando, como pedido, para quem for validar a copy final com o cliente:

**`site/lib/content.ts:26` — `PASSOS[3].desc`**

- `COPY.md` (seção 9, item 4): `"etapas, prazos e valores, sem surpresa depois. ⚠️"` — a própria
  seção já marca esse item com ⚠️ porque "valores" (preço) depende de confirmação do cliente
  (ver seção 11 do `COPY.md`, "Como funciona o pagamento?", também ⚠️).
- Ficou no `content.ts` (vindo do código do brief): `"Etapas e prazos explicados com calma, antes
  de qualquer decisão."`
- Observação: a reescrita **remove** a menção a "valores" e troca "sem surpresa depois" por
  "explicados com calma, antes de qualquer decisão" — o que, na prática, tira do ar exatamente o
  trecho que dependia de confirmação (preço). Coerente com a regra de não publicar dado não
  confirmado, mas é uma reescrita de frase da copy aprovada, não uma cópia literal. Origem: o
  código do Step 3 do brief da Task 4, não uma escolha minha.

**`site/lib/content.ts:30` — `FAQ[0].r`**

- `COPY.md` (seção 11): `"Um documento com foto. Se você tiver radiografias ou exames recentes,
  traga também — ajuda no diagnóstico."`
- Ficou no `content.ts` (vindo do código do brief): `"Um documento com foto. Se você tiver
  radiografias ou exames recentes, traga também, que ajuda no diagnóstico."`
- Observação: troca só a pontuação/conector final — travessão + "ajuda" vira vírgula + "que
  ajuda". Sentido idêntico, nenhuma informação diferente. Origem: o código do Step 3 do brief da
  Task 4, não uma escolha minha.

Por instrução do orquestrador ("se o brief e o COPY.md divergirem, o brief manda"), **não alterei
o conteúdo** de `content.ts` — só documento aqui as duas divergências para o cliente/responsável
de copy revisar se `COPY.md` deveria ser atualizado para bater com o que foi publicado, ou
vice-versa.

### Commit desta correção

- Ver seção "Commits" no fim deste relatório.

---

## O que foi feito

1. **`site/__tests__/content.test.ts`** — teste criado exatamente como no brief (7 casos:
   4 pilares, 7 tratamentos incluindo Clareamento, numeração de dois dígitos, 4 passos, FAQ sem
   copy não confirmada, depoimentos com slug de vídeo existente, nenhum número inventado de
   pacientes/avaliações).
2. Confirmado que o teste **falha** antes da implementação (`Failed to resolve import
   "@/lib/content"`).
3. **`site/lib/content.ts`** — módulo implementado, exportando `PILARES`, `TRATAMENTOS`,
   `PASSOS`, `FAQ`, `SORRISOS`, `DEPOIMENTOS` e `ANTES_DEPOIS`.
4. Confirmado que os 7 testes **passam** depois da implementação. Suíte completa do projeto
   também rodada (44/44 passam) e `npx tsc --noEmit` sem erros, para garantir que nada quebrou.
5. Um commit na raiz do repo, branch `feat/site`.

## Verificação de imagens antes de escrever

Rodei `ls site/public/img/` e `ls site/public/videos/previews/` antes de escrever o módulo,
conforme pedido.

**`site/public/img/`** contém (entre outros) `hero-foto.jpg`, `retrato-1.jpg` a `retrato-8.jpg`
e `antes-depois-1.jpg` a `antes-depois-5.jpg` — exatamente os arquivos que o brief usa em
`SORRISOS` e `ANTES_DEPOIS`. **Nenhuma correção foi necessária**: todos os 9 caminhos de
`SORRISOS` e todos os 5 caminhos de `ANTES_DEPOIS` batem com arquivos reais.

**`site/public/videos/previews/`** contém: `caso-protese.mp4`, `facetas-resina.mp4`,
`facetas-transformacao.mp4`, `recepcao.mp4`, `tour-clinica.mp4`. Os 3 slugs usados em
`DEPOIMENTOS` (`facetas-resina`, `facetas-transformacao`, `caso-protese`) existem todos nessa
lista. Não usei `recepcao` nem `tour-clinica` em `DEPOIMENTOS` porque o brief não os incluía como
depoimento (são vídeos institucionais/de tour, não relato de paciente/caso) — isso é permitido
pelo teste, que só exige que os slugs usados existam, não que todos os vídeos disponíveis sejam
usados.

Os 7 caminhos `trat-*.jpg` (em `TRATAMENTOS`) **não existem** em `site/public/img/` — isso é
esperado e documentado abaixo, conforme decisão já tomada para esta task.

## Decisões e divergências

- **`trat-*.jpg` inexistentes**: os 7 caminhos de imagem em `TRATAMENTOS` foram mantidos
  exatamente como o brief manda, apontando para arquivos que ainda não existem
  (`/img/trat-facetas.jpg`, `/img/trat-implantes.jpg`, etc.). Não criei placeholder, não apontei
  para outra imagem existente, não removi o campo — a Task 10 (que renderiza tratamentos) vai
  usar o fallback com glifo `✦` sobre fundo creme já previsto pelo design quando a imagem não
  carrega.
- **Divergência do brief em relação ao próprio brief — ignorada por instrução explícita**: o
  Step 3 do brief tem uma nota final sugerindo usar `trat-limpeza.jpg` como "provisório" para
  `trat-clareamento.jpg` e "marcar no `progress.md`". **Não segui essa sugestão.** Nenhuma das 7
  imagens `trat-*.jpg` existe ainda (nem `trat-limpeza.jpg`), então apontar clareamento para
  limpeza não resolveria nada — só criaria uma referência que mostraria a imagem errada quando a
  Task 10 for renderizar, e mentiria sobre qual arquivo é qual quando o cliente finalmente enviar
  os assets. `TRATAMENTOS[6].img` ficou como `/img/trat-clareamento.jpg` (caminho próprio,
  igual aos outros 6, apontando para o nome de arquivo correto ainda que o arquivo não exista
  hoje).
- **Divergência entre o brief e `COPY.md` no FAQ**: `COPY.md` (seção 11) tem só **1** pergunta
  sem `⚠️` — "Preciso levar alguma coisa na primeira consulta?" — as outras 4 (convênio,
  pagamento, duração da avaliação, emergência) estão marcadas como pendentes de confirmação do
  cliente. O código do brief (Step 3), porém, inclui uma **segunda** pergunta confirmada, "Como
  agendo minha avaliação?", que **não aparece em lugar nenhum do `COPY.md`** — nem na seção 11
  (FAQ) nem em outra seção como pergunta de FAQ. O texto da resposta ("Pelo WhatsApp (11)
  2274-0228...") é consistente com dados reais do projeto (o número de WhatsApp confirmado em
  `site/lib/contact.ts` e na seção 10 de `COPY.md`), então não é dado inventado — é uma pergunta
  de FAQ adicional montada a partir de informação real, só não está redigida em `COPY.md` como
  item de FAQ. Segui a instrução do orquestrador ("se o brief e o COPY.md divergirem, o brief
  manda") e mantive as 2 perguntas exatamente como no código do Step 3. Registro aqui a
  divergência conforme pedido, para o cliente/responsável de copy poder revisar se quiser que
  essa segunda pergunta entre no `COPY.md` oficialmente.
- Não alterei nenhuma frase da copy vinda do brief/`COPY.md` — texto de `PILARES`, `TRATAMENTOS`,
  `PASSOS` e `FAQ` copiado literalmente.
- Não criei nenhum outro arquivo além dos dois pedidos (`site/lib/content.ts` e
  `site/__tests__/content.test.ts`).

## Saída real dos testes

### Antes da implementação (confirmação de falha)

```
> site@0.1.0 test
> vitest run content

 RUN  v4.1.11 D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA/site

 ❯ __tests__/content.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  __tests__/content.test.ts [ __tests__/content.test.ts ]
Error: Failed to resolve import "@/lib/content" from "__tests__/content.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA/site/__tests__/content.test.ts:2:73
  1  |  import { describe, it, expect } from "vitest";
  2  |  import { PILARES, TRATAMENTOS, PASSOS, FAQ, SORRISOS, DEPOIMENTOS } from "@/lib/content";
     |                                                                            ^

 Test Files  1 failed (1)
      Tests  no tests
```

### Depois da implementação

```
> site@0.1.0 test
> vitest run content

 RUN  v4.1.11 D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA/site

 Test Files  1 passed (1)
      Tests  7 passed (7)
```

### Suíte completa (regressão)

```
> site@0.1.0 test
> vitest run

 Test Files  4 passed (4)
      Tests  44 passed (44)
```

### Typecheck

```
npx tsc --noEmit
```
Sem saída (sem erros).

## Commits

- `76b2713` — `feat: conteudo centralizado em lib/content`
  (`site/lib/content.ts`, `site/__tests__/content.test.ts`)
- `505dd97` — `fix: troca blacklist por whitelist no teste anti-dado-inventado de content`
  (`site/__tests__/content.test.ts` — só teste; `site/lib/content.ts` intocado)

## Concerns / observações para as próximas tasks

- `TRATAMENTOS[i].img` para todos os 7 itens aponta para arquivos que não existem em
  `site/public/img/` (`trat-facetas.jpg`, `trat-implantes.jpg`, `trat-protocolo.jpg`,
  `trat-proteses.jpg`, `trat-ortodontia.jpg`, `trat-limpeza.jpg`, `trat-clareamento.jpg`). A
  Task 10 precisa implementar o fallback com glifo `✦` sobre fundo creme para esses 7 casos até
  o cliente entregar as imagens.
- A segunda pergunta do FAQ ("Como agendo minha avaliação?") não está em `COPY.md` — ver seção
  "Decisões e divergências" acima. Vale alinhar com quem mantém `COPY.md` se essa pergunta deve
  ser formalizada lá.
- `.claude/` continua aparecendo como untracked no `git status` da raiz (mesmo comportamento já
  registrado no relatório da Task 3) — não mexi nele, não faz parte desta task.
- `TRATAMENTOS` é tipado via `.map()` sobre uma tupla `as const`, então o tipo inferido não é
  literal string para `n`/`nome`/etc., mas isso não diverge da interface pedida pelo brief
  (`{ n: string; nome: string; desc: string; img: string; slug: string }[]`) — só confirma que
  bate.
