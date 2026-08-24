# Guia de craft — leitura obrigatória para tasks de UI

Destilado da skill `emil-design-eng` (filosofia de design engineering do Emil Kowalski) e
calibrado para **esta** marca. Vale para toda task que escreve componente, CSS ou motion.

Os requisitos do brief da sua task continuam mandando. Este guia diz **como** executá-los bem.

---

## A personalidade do motion aqui

A Smile é um consultório de bairro: quente, cuidadoso, pessoal. **Não** é um dashboard de SaaS
nem um site de agência.

Consequência prática: o motion é **calmo e confiante**, não estalado e nervoso. Onde uma
ferramenta de produtividade usaria 150ms secos, aqui cabem 200-260ms com curva suave. A exceção
é o feedback de toque — pressionar um botão tem que responder na hora, sempre.

Combine o movimento com o humor da marca. Nada de bounce exagerado, nada de elástico.

---

## Curvas de easing — use estas, não as nativas

As curvas embutidas do CSS são fracas demais e entregam movimento sem intenção. Defina uma vez
em `globals.css` e use em todo lugar:

```css
@theme {
  --ease-saida: cubic-bezier(0.23, 1, 0.32, 1);      /* entrada e saída de elementos */
  --ease-movimento: cubic-bezier(0.77, 0, 0.175, 1); /* algo se movendo na tela */
  --ease-gaveta: cubic-bezier(0.32, 0.72, 0, 1);     /* drawer do menu mobile */
}
```

**Regra de escolha:**

| Situação | Curva |
|---|---|
| Elemento entrando ou saindo | `--ease-saida` |
| Elemento se movendo ou transformando na tela | `--ease-movimento` |
| Hover, mudança de cor | `ease` |
| Movimento constante (ticker, barra de progresso) | `linear` |

**Nunca use `ease-in` em UI.** Ele começa devagar exatamente no instante em que a pessoa está
olhando, e faz a interface parecer lenta mesmo com a mesma duração.

---

## Durações

| Elemento | Duração |
|---|---|
| Feedback de pressionar botão | 100-160ms |
| Tooltip, popover pequeno | 125-200ms |
| Dropdown, select | 150-250ms |
| Modal, drawer, lightbox | 200-400ms |
| Reveal de seção por scroll | 500-700ms (é decorativo, pode respirar) |

**Teto de 300ms para qualquer coisa que a pessoa aciona.** Reveal por scroll é a exceção, porque
ela não está esperando aquilo terminar.

**Entrada e saída assimétricas:** a saída é sempre mais rápida que a entrada. Quando a pessoa
fecha o lightbox, ela já decidiu — não faça esperar. Entrada 300ms, saída 200ms.

---

## Erros que reprovam a review

| Errado | Certo | Por quê |
|---|---|---|
| `transition: all 300ms` | `transition: transform 200ms var(--ease-saida)` | `all` anima propriedades que você não previu, inclusive as caras |
| `transform: scale(0)` na entrada | `transform: scale(0.95); opacity: 0` | Nada no mundo real aparece do nada |
| `ease-in` em qualquer UI | `--ease-saida` | Parece travado no momento em que a pessoa olha |
| Botão sem `:active` | `transform: scale(0.97)` no `:active` | Sem isso o botão não parece ter ouvido o toque |
| `:hover` sem media query | `@media (hover: hover) and (pointer: fine)` | Touch dispara hover no toque e trava o estado |
| Animar `height`, `width`, `top`, `left` | Só `transform` e `opacity` | Os outros disparam layout e paint |
| `@keyframes` em algo acionável rápido | `transition` | Keyframes reiniciam do zero; transition retargeta suave |
| Tudo entrando junto | Stagger de 30-80ms | Cascata parece natural; simultâneo parece estático |
| `transform: 'translateX()'` literal num elemento com `whileTap` | Atalho `x` da Motion | Transform cru não compõe com o `scale` do tap — ver nota abaixo |

---

### Correção: os atalhos do Motion **são** acelerados

Uma versão anterior deste guia mandava trocar `animate={{ x: 100 }}` por
`animate={{ transform: 'translateX(100px)' }}`. **Isso está errado nesta versão da lib.** Foi
verificado no fonte (`motion-dom/dist/es/render/html/utils/build-transform.mjs`): os atalhos
`x`, `y` e `scale` são compostos numa única string e escritos em `element.style.transform` — o
mesmo caminho de GPU da string literal.

E tem um custo real em usar a string literal: a Motion **não consegue compor** um `transform` cru
com o `scale` de um `whileTap`, porque são duas fontes disputando a mesma propriedade. Foi
exatamente esse o bug do menu mobile na Task 6 — o item nunca dava feedback de toque.

**Regra atual:** use os atalhos (`x`, `y`, `scale`) quando o mesmo elemento também tiver
`whileTap`, `whileHover` ou variantes que mexam em transform. Só use string literal quando o
elemento tiver uma fonte única de transform.

## Botões — o detalhe que mais compõe

Todo elemento pressionável do site (CTA do hero, pílula do header, linhas de tratamento,
cards de vídeo, FAB do WhatsApp, botões do FAQ):

```css
.botao {
  transition: transform 160ms var(--ease-saida), background-color 200ms ease;
}
.botao:active {
  transform: scale(0.97);
}
```

`scale()` escala os filhos junto — texto e ícone acompanham. Isso é desejado.

Escala entre 0.95 e 0.98. Menos que isso não se percebe; mais que isso parece defeito.

---

## `prefers-reduced-motion` — reduzir não é zerar

Este é o ponto que o plano simplificou demais e você deve refinar.

Movimento reduzido significa **menos movimento e mais suave**, não ausência de animação.
Transições de opacidade e cor ajudam a compreensão e devem continuar.

| Sob reduced-motion | O que fazer |
|---|---|
| WebGL (`Silk`, `CircularGallery`) | **Desligar por completo** |
| Autoplay de vídeo | **Desligar por completo**, fica no poster |
| Ticker em movimento | **Parar** |
| Parallax, translate, scale | **Remover o movimento** |
| Fade de opacidade em reveal | **Manter**, encurtado para ~200ms |
| Transição de cor no hover | **Manter** |
| `scale(0.97)` no `:active` | **Manter** — é feedback, não decoração |

O global reset em `globals.css` que zera tudo é a rede de segurança. Nos componentes, prefira
o comportamento acima via `useCapability()`.

---

## Stagger

Quando vários elementos entram juntos (os 4 pilares, os 4 passos, as linhas de tratamento):

- 30 a 80ms entre itens. Nunca mais que isso.
- Stagger é decoração: **nunca** bloqueie interação enquanto roda.
- Em listas longas (as 7 linhas de tratamento), limite o stagger aos primeiros 4-5 e deixe o
  resto entrar junto. Cascata longa demais faz a página parecer lenta.

---

## Reveal por scroll

O `<Reveal>` da Task 5 é o veículo padrão. Detalhes que importam:

- Entrada de `opacity: 0, translateY(24px)` para `opacity: 1, translateY(0)`. Nada de scale.
- `once: true` — reanimar quando a pessoa rola de volta é irritante.
- Dispare em `top 88%`, não em `top 100%`: o elemento precisa já estar entrando quando anima.
- **O conteúdo nasce visível no HTML.** A animação só assume depois que o JS confirma que pode.

Alternativa mais bonita para imagens: `clip-path: inset(0 0 100% 0)` → `inset(0 0 0 0)`.
**Correção (achada na Task 14):** uma versão anterior desta linha dizia "revela de baixo para cima".
Está errado — a ordem do `inset` é `top right bottom left`, então `inset(0 0 100% 0)` corta 100%
a partir de **baixo**, e a revelação acontece **de cima para baixo**. Se quiser de baixo para cima,
é `inset(100% 0 0 0)` → `inset(0 0 0 0)`. Siga os valores, não a prosa.
Use na galeria da clínica e nos antes/depois — é acelerado por hardware e parece mais caro do que custa.
Acrescente `round 20px` ao inset para os cantos não ficarem retos durante a animação.

---

## Blur para mascarar transição imperfeita

Se um crossfade entre dois estados parecer errado depois de já ter tentado curva e duração,
adicione `filter: blur(2px)` durante a transição. Sem ele você enxerga dois objetos distintos
sobrepostos; com ele o olho lê uma transformação só.

Mantenha abaixo de 20px — blur pesado é caro, principalmente no Safari.

---

## Lightbox de vídeo — checklist de craft

- `transform-origin: center` (modal é a exceção da regra de origem: não está ancorado a um gatilho)
- Entra com `scale(0.95) + opacity 0` → `scale(1) + opacity 1`, 300ms `--ease-saida`
- Sai em 200ms — mais rápido que a entrada
- Fundo escurece com transição de opacidade própria, sem escala
- `Escape` fecha, foco preso enquanto aberto, foco devolvido ao card que abriu
- `lenis.stop()` ao abrir, `lenis.start()` ao fechar

---

## Menu mobile — checklist de craft

- Curva `--ease-gaveta`, 300ms na abertura, 220ms no fechamento
- Itens entram com stagger de 40ms
- `translateX(100%)` em vez de pixel fixo — porcentagem é relativa ao próprio tamanho e não
  quebra quando a largura muda
- Trava o scroll com `lenis.stop()`, não com `overflow:hidden` no body (que causa salto)

---

## Performance — as duas armadilhas específicas deste projeto

**1. Variável CSS em elemento pai é herdada.** Mudar `--algo` no container recalcula estilo de
todos os filhos. No scroller de sorrisos e no de depoimentos, escreva `element.style.transform`
direto, nunca uma custom property no pai.

**2. Animação CSS ganha de JS sob carga.** CSS roda fora da main thread; `requestAnimationFrame`
do Motion, não. Enquanto a página carrega imagem e hidrata, animação em JS perde frame e a CSS
não. Para o que é predeterminado (reveal, hover, ticker), prefira CSS. Guarde o Motion para o
que é dinâmico e interrompível (lightbox, drawer).

---

## Antes de dar a task por pronta

- [ ] Rodei a animação em câmera lenta (duração 3x) e olhei se a curva e o transform-origin estão certos
- [ ] Nenhum `transition: all` no diff
- [ ] Nenhum `scale(0)` na entrada
- [ ] Nenhum `ease-in`
- [ ] Todo pressionável tem `:active`
- [ ] Todo `:hover` está atrás de `@media (hover: hover) and (pointer: fine)`
- [ ] Testei com reduced-motion ligado e o conteúdo continua legível e compreensível
- [ ] Só `transform` e `opacity` animam

---

# Adendo — skill `animate` (carregada antes da Task 13)

Sobreposição grande com o que já está acima. Só o que acrescenta:

## O portão que vem antes de tudo

Antes de escrever qualquer animação, responda duas coisas **nesta ordem**:

1. **Com que frequência a pessoa vê isso?**
   - 100+ vezes/dia (atalho de teclado, comando) → **não anima. Ponto.**
   - Dezenas de vezes/dia (hover, navegação em lista) → quase imperceptível, ou nada
   - Ocasional (modal, drawer, toast) → animação padrão
   - Raro / primeira vez (onboarding, celebração) → **é aqui que mora o orçamento de encanto**
2. **Qual o propósito?** Nomeie em uma palavra: *feedback · consistência espacial · indicação de
   estado · evitar mudança brusca · explicação · encanto*. Não conseguiu nomear? Não construa.

**Uma landing institucional é vista uma vez por visitante.** Ela cai no tier "raro" — é o único
lugar do projeto onde encanto se justifica por si. Não use isso como licença para animar tudo:
use como permissão para **um** momento forte.

## Dado que a pessoa está lendo não se move por estilo

Texto que a pessoa precisa ler, número, endereço, horário — não anima por decoração. Efeito
decorativo que segue o mouse cabe em página de marketing, não sobre informação que ela veio buscar.

## `clip-path` é a quarta propriedade sancionada

Além de `transform` e `opacity`. Roda no compositor. `height` é tolerado **só** em acordeão, onde
não existe equivalente em transform.

## Saída espelha a entrada

O que entra por baixo, sai por baixo. Caminho simétrico é o que faz arrastar-para-dispensar parecer
óbvio sem ninguém explicar.

---

## Conflito entre skills — resolvido

A skill `animate` repete a afirmação de que os atalhos `x`/`y`/`scale` do Motion **não** são
acelerados por hardware, e manda usar a string `transform` completa.

**Isso continua errado para a versão instalada aqui**, pelo mesmo motivo já registrado acima: um
revisor verificou no fonte de `motion-dom` que os atalhos compõem numa única escrita de
`element.style.transform` — mesmo caminho de GPU.

**Decisão, que vale para o projeto inteiro:** usar os atalhos (`x`, `y`, `scale`) quando o elemento
também tiver `whileTap`, `whileHover` ou variantes que mexam em transform, porque string literal
**não compõe** com eles — foi o bug do menu mobile na Task 6. Fora desse caso, tanto faz; prefira
o que ficar mais legível.
