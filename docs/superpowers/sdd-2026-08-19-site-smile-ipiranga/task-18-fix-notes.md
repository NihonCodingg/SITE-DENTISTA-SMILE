# Task 18 — receitas dos dois P1 de acessibilidade já confirmados

Os dois vieram do axe-core embutido no Lighthouse, idênticos em mobile e desktop. Fatos
levantados no código antes do despacho, para a correção não redescobrir.

---

## P1-a · `aria-prohibited-attr` — `aria-label` num `<span>` sem role

**Onde:** `h1.font-titulo > span.split-parent`, escrito pelo GSAP SplitText com o texto
original da headline.

**Por que acontece:** `components/reactbits/SplitText.tsx` instancia o `GSAPSplitText` sem passar
a opção `aria`, e o default do GSAP é `aria: "auto"` — que põe `aria-label` no **elemento
fatiado** (o span) e `aria-hidden` nos filhos. `aria-label` só é válido em elemento com role que
aceite nome de autor; em `<span>` cru é proibido (axe: `aria-prohibited-attr`).

**Correção certa** (não afrouxar — mover o nome para onde ele é válido):
1. No `SplitText.tsx` vendorizado, passe `aria: "hidden"` ao `new GSAPSplitText(...)`: os
   filhos fatiados ficam `aria-hidden`, e **nenhum** `aria-label` é escrito no span.
2. No `Hero.tsx`, ponha `aria-label={HEADLINE}` no próprio `<h1>` — heading aceita nome de
   autor, é válido, e o leitor de tela lê a frase inteira uma vez em vez de palavra por palavra.
   **Só no ramo em que o SplitText monta** (`podeAnimar`); no ramo de `<h1>` puro o texto já é o
   nome e o atributo seria redundante.
3. Registre a modificação no `components/reactbits/README.md`, seção do `SplitText`.

**O teste que depende disso:** `site/__tests__/hero.test.tsx:26-28` afirma igualdade exata do
`aria-label` no `.split-parent` (decisão da Task 8 para driblar um artefato do jsdom que
corrompe o `textContent` fatiado). Reescreva para afirmar **no `<h1>`**, mantendo igualdade
exata: `expect(h1).toHaveAttribute('aria-label', 'Seu novo sorriso começa aqui')` **e**
`expect(splitParent).not.toHaveAttribute('aria-label')`. O teste fica **mais forte**, não mais
fraco: agora trava que o atributo está no lugar certo e não no errado.

**Prova por quebra proposital:** volte `aria` para `"auto"`, veja o teste novo falhar na segunda
asserção; restaure.

**Verifique no navegador:** `getByRole('heading', {level:1, name:'Seu novo sorriso começa aqui'})`
resolve; e o Lighthouse final não reporta mais `aria-prohibited-attr`.

---

## P1-b · `heading-order` — `h1` → `h3` sem `h2`

**Onde:** `components/sections/Pilares.tsx:25` — os 4 pilares são `<h3>` e a seção não tem
`<h2>`; o heading anterior na página é o `<h1>` do hero. Salto de nível.

**Duas saídas, e a escolha é semântica, não visual:**

- **(b) Rebaixar os pilares para `<p>` com `<strong>`** — recomendada. "Atendimento humanizado",
  "Segurança e qualidade" são rótulos de 2-3 palavras, não subtítulos de subseções. Heading é
  para o que organiza conteúdo abaixo dele; aqui não há conteúdo abaixo além de uma linha de
  descrição. Mantém as mesmas classes (`font-titulo text-[17px] text-preto`), o visual não muda.
- **(a) Acrescentar um `<h2>` `sr-only` à seção** — só se houver texto **aprovado** para ele. O
  `COPY.md` §3 ("Barra de pilares") **não tem título**. Inventar "Nossos pilares" viola a regra
  do projeto de não criar copy. Evite.

**Os testes que dependem disso:** `site/__tests__/tratamentos.test.tsx:14` e `:20` afirmam
4 headings de nível 3 com os títulos dos pilares. (`profissional.test.tsx:118/120` é **outra**
seção — Como Funciona — que tem `<h2>` acima e `<h3>` é correto lá. **Não toque.**)
Reescreva o teste dos Pilares para afirmar os 4 rótulos por texto (`getByText`) e **afirmar a
ausência** de heading de nível 3 na seção. Quebra proposital: volte para `<h3>`, veja falhar.

**Verifique:** o Lighthouse final não reporta mais `heading-order`; a ordem de headings da página
fica `h1` (hero) → `h2` (Tratamentos) → `h2` (Clínica) → … sem salto.

---

## Regra para as duas

Nenhuma das correções muda o que a pessoa vê. Se o diff tocar em estilo, tamanho ou texto
visível, algo saiu do trilho — pare e confira.
