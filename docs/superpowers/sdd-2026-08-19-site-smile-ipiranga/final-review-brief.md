# Review final da branch `feat/site` — brief (HEAD a preencher no despacho)

Você é um **Senior Code Reviewer**. Revisa a branch inteira do site da clínica odontológica
Smile Ipiranga antes do merge em `main`. Esta é a última linha de defesa: 19 tasks passaram por
review individual, mas ninguém olhou o **conjunto**.

**Diretório:** `D:/PROGRAMAÇÃO/CLAUDE/PROJETOS/PROJETO SMILE IPIRANGA DENTISTA`
**Range:** base `7e6b144` (merge-base com `main`) → head `b51783d`
**Pacote de diff:** `.superpowers/sdd/2026-08-19-site-smile-ipiranga/review-7e6b144..b51783d.diff` — commits, stat e diff `-U10`. É grande (~94 arquivos de código,
~10k linhas); leia por arquivo, não tente segurar tudo de uma vez. Ignore `package-lock.json`
e binários em `public/`.

## Leia antes

1. Plano: `docs/superpowers/plans/2026-08-19-site-smile-ipiranga.md` — em especial a seção
   **Global Constraints**, que vincula tudo.
2. Ledger: `.superpowers/sdd/2026-08-19-site-smile-ipiranga/progress.md` — o histórico de cada
   task, cada review, cada desvio aprovado, cada erro meu corrigido. Longo; leia as entradas
   `complete`, `DESVIO APROVADO`, `ERRO NO MEU` e `EMENDA`.
3. **`deferred-minors.md`** na mesma pasta — todos os minors adiados ao longo do projeto, e os
   bloqueios de publicação conhecidos. **Você tria: quais bloqueiam merge, quais viram follow-up.**
4. `emenda-reactbits-e-skills.md` — a decisão do parceiro de forçar o React Bits mesmo com custo,
   e os critérios de aceitação. Não relitigue a decisão; verifique o custo registrado.
5. Relatórios das tasks 17, 18 e 19 na mesma pasta — os números finais de performance e QA.

## Somente leitura

Não mute working tree, índice, HEAD ou branch. `git show`, `git diff`, `git log`. Se precisar de
outra revisão, `git worktree add` num diretório temporário.

## O que verificar — além do template padrão

**Alinhamento com o plano e as Global Constraints**, verbatim:
- Mobile-first; headline e CTA de WhatsApp acima da dobra em 375px
- Alvos de toque ≥ 44px; nada só por `:hover`; corpo ≥ 16px
- Paleta fixa — nenhum hex fora da lista em componente
- Só `transform`/`opacity`/`clip-path` animam
- `prefers-reduced-motion` desliga WebGL e autoplay e **reduz** (não zera) o resto
- `navigator.connection.saveData` desliga vídeo e WebGL
- **Nenhum dado inventado** — o requisito mais duro; há teste de whitelist de dígitos em
  `content.test.ts`, confira que continua forte
- `useCapability()` é a **única** fonte de `matchMedia`/`navigator.connection` — grep no projeto
  inteiro, inclusive nos componentes vendorizados
- `app/page.tsx` continua Server Component; a fronteira client é `PaginaComVideo.tsx`
- Orçamento: `three` e `ogl` fora do first-load; previews de vídeo < 260KB cada

**Coerência do conjunto** (o que review por task não vê):
- Padrões duplicados entre seções que deveriam compartilhar componente (`SectionHeading`,
  `.pressable`, `Reveal`) — há seção que reinventou?
- Constantes repetidas (z-index, easing, stagger) que deveriam vir de um lugar só
- Testes: algum que passa por construção? Algum mock que esvazia o que testa? Algum `\s*` ou
  `toContain` onde deveria ser igualdade?
- `components/reactbits/README.md` e `LICENSE.md`: todo componente vendorizado documentado
  com origem e modificações? A licença MIT + Commons Clause exige o aviso junto do código.
- Segurança: nenhum componente de terceiro faz chamada de rede (o `CircularGallery` fazia
  `fetch` ao Google Fonts antes de ser limpo — confira que nenhum outro faz)
- `next.config.ts`, `.env.example`, `README.md` do site: o que alguém precisa saber para
  publicar está escrito? (domínio via `NEXT_PUBLIC_SITE_URL` é build-time)

**Prontidão para produção:**
- O que bloqueia **merge** vs. o que bloqueia **publicação** (as pendências do cliente não
  bloqueiam merge — estão marcadas de propósito no site; confira que continuam marcadas e que
  nenhum placeholder virou afirmação)
- `orcamento.test.ts`: se estiver vermelho, é vermelho **honesto** (LCP mobile) — avalie se o
  vermelho está bem documentado, não se é aceitável (isso é decisão do parceiro)

## Formato

Forças · Issues (Critical / Important / Minor, cada um com arquivo:linha, o quê, por quê, como)
· Recomendações · **Triagem do `deferred-minors.md`** (bloqueia merge / follow-up / descartar,
um por um) · Assessment: **Ready to merge? Yes | No | With fixes**, com 1-2 frases.

Categorize por severidade real. Reconheça o que está bom — há muita coisa boa aqui e elogio
preciso faz o resto da crítica ser levado a sério. Se achar problema no **plano** em vez da
implementação, diga que é do plano. Não diga "parece bom" sem ter lido.
