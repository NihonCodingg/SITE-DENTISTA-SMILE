# magicui — componentes vendorizados

> Os relatórios e guias citados por nome aqui vivem em
> `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/`, na raiz do repositório.

Pedido do dono do projeto na Task 22: a fileira de rostos circulares do
[magicui](https://magicui.design/docs/components/avatar-circles), ao lado das estrelas e da frase
"mais de mil sorrisos transformados", abaixo do CTA do hero.

Baixado direto do repositório oficial e adaptado. Fica nesta pasta com a licença ao lado por
exigência dela (MIT: o aviso de copyright acompanha o código — ver `LICENSE.md`).

Repositório: https://github.com/magicuidesign/magicui
Caminho no repositório: `apps/www/registry/magicui/`
Baixado em: 2026-08-25 (branch `main`)

## Arquivos e modificações

### `AvatarCircles.tsx`

- **Origem:** `apps/www/registry/magicui/avatar-circles.tsx`
- **Usado em:** Task 22 — `components/ui/ProvaSocial.tsx`, no hero.
- **Dependências que arrasta:** nenhuma além de React e `next/image`. O original importa `cn` de
  `@/lib/utils` (clsx + tailwind-merge, base do shadcn), que não veio.
- **Rede:** nenhuma chamada.
- **`matchMedia`/reduced-motion:** o componente não anima nada e não consulta nada.
- **Só `transform`/`opacity`:** não anima.
- **Modificações:**
  1. **`cn()` trocado por interpolação de string** — o helper é do shadcn e este projeto não o tem.
  2. **`<img>` → `next/image`**, como em todo componente vendorizado aqui.
  3. **Os retratos deixaram de ser links.** O original envolve cada um num
     `<a href={profileUrl} target="_blank">`, o que faz sentido para os avatares de GitHub do
     exemplo dele. Aqui são pacientes: não existe perfil para onde ir, e um link que não leva a
     lugar nenhum é pior que nenhum link.
  4. **A fileira inteira é `aria-hidden`.** Consequência da 3: sem links, o que sobra é ornamento.
     O original dá `alt="Avatar 1"`, `"Avatar 2"` — um leitor de tela ouviria a contagem e não
     ganharia nada. Quem carrega o sentido é o texto ao lado, fora do componente.
  5. **O círculo "+N" deixou de ser `<a href="">`.** Href vazio recarrega a página inteira ao
     clicar e aparece na navegação por teclado como um link que não faz nada. Virou `<span>`.
  6. **`dark:` do shadcn fora**, cor da borda por prop (`corBorda`): ela precisa ser a cor do FUNDO
     onde a fileira está, para os retratos parecerem recortados dele.

**⚠️ O conteúdo que este componente ilustra é dado NÃO CONFIRMADO.** "Mais de mil sorrisos
transformados" e as cinco estrelas são afirmações sobre o negócio que ninguém no material do
cliente confirmou — a clínica nunca disse quantos pacientes atendeu, e não existe fonte de
avaliação coletada. Por isso o bloco inteiro nasce com a marcação de pendência do projeto
(`components/ui/pendente.ts`), com teste de regressão em `__tests__/provaSocial.test.tsx`. Ver o
checklist em `site/README.md`.
