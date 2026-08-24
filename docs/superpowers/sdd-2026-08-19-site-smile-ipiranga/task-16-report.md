# Task 16 — SEO local, metadata e dados estruturados

## STATUS: completo

## Arquivos

- `site/lib/site.ts` (novo) — `SITE_URL`, lida de `NEXT_PUBLIC_SITE_URL` com default de
  desenvolvimento (`http://localhost:3000`); nenhum domínio hardcoded.
- `site/lib/jsonld.ts` (novo) — `dentistJsonLd()`, schema.org `Dentist`.
- `site/app/layout.tsx` (modificado) — só ganhou `metadata.metadataBase`.
- `site/app/page.tsx` (modificado) — `metadata` completo (title/description/openGraph/alternates) +
  `<script type="application/ld+json">` injetando `dentistJsonLd()`.
- `site/app/sitemap.ts`, `site/app/robots.ts` (novos).
- `site/app/favicon.ico`, `site/app/icon.png`, `site/app/apple-icon.png` — regerados a partir da
  marca (antes eram o favicon padrão do `create-next-app`, hash MD5 `c30c7d42...`, confirmado batendo
  com o default conhecido do Next.js).
- `site/.env.example` (novo), `site/.gitignore` (modificado — `!.env.example` para não ignorar o
  template), `site/README.md` (modificado — seção sobre domínio e ícones).
- `site/__tests__/jsonld.test.ts` (novo, 10 testes).

## Commits

Um commit cobrindo toda a task (`site/` como cwd).

## Testes

**206/206** (`npx vitest run --no-file-parallelism`, de dentro de `site/`), subindo de 196 no fim da
Task 15 — 10 testes novos em `jsonld.test.ts`. `npx eslint` limpo nos arquivos tocados (tive que
trocar `Record<string, any>`/`(i: any)` do brief por um tipo próprio —
`ReturnType<typeof dentistJsonLd> & CamposProibidos`, com os campos proibidos tipados como
`unknown` opcionais — porque este projeto tem `@typescript-eslint/no-explicit-any` ativo e
`npm run build` roda ESLint por padrão; `any` quebraria o build). `npm run build` limpo (Next
16.3.1/Turbopack, Turbopack compilando em ~5s).

Prova por quebra proposital, como pedido: adicionei `aggregateRating: {...ratingValue: '5.0'...}` de
propósito em `dentistJsonLd()`, rodei `npx vitest run jsonld` e vi os dois testes que dependem da
ausência desse campo falharem de verdade — o teste direto (`expect(ld.aggregateRating).toBeUndefined()`)
e o teste de varredura recursiva (`não contém nenhum dos campos proibidos em nenhum nível do objeto`,
que veio no lugar do exemplo do brief para blindar contra alguém aninhar o campo em vez de colocá-lo
no topo). Restaurei o arquivo original e confirmei 10/10 de novo antes de seguir.

## Onde a metadata mora, e por quê

- **`layout.tsx`**: só `metadataBase`. É a única peça que o próprio Next.js recomenda deixar no
  layout raiz ("`metadataBase` is typically set in root `app/layout.js` to apply to URL-based
  `metadata` fields across all routes" — doc local, `generate-metadata.md`), porque se propaga pra
  qualquer rota futura sem precisar ser repetida.
- **`page.tsx`**: title, description, Open Graph e `alternates.canonical`. É onde mora o conteúdo de
  busca local de verdade, e bate com o motivo que o contexto da task cita — `page.tsx` foi
  transformado em Server Component na Task 7 **especificamente** para poder exportar `metadata`.
  Título: `"Smile — Dentista no Ipiranga, São Paulo | Facetas, Implantes e Próteses"` (facetas e
  implantes são os tratamentos de maior intenção de busca, e "dentista Ipiranga" é o termo que o
  briefing pede pra disputar). Como o site é uma página única (sem outras rotas ainda), não usei
  `title.template` — teria sido indireção sem uso real hoje.
- **JSON-LD**: também em `page.tsx`, como `<script type="application/ld+json">` logo no topo do
  JSX retornado — é conteúdo da página (Dentist + catálogo de tratamentos), não configuração
  sitewide, e `page.tsx` continua Server Component (necessário: `dangerouslySetInnerHTML` com JSON
  gerado no servidor).

## O que fiz sobre o domínio

O brief-fonte (`task-16-brief.md`) hardcoda `https://smileipiranga.com.br` — um chute meu de sessão
anterior. **Não usei esse valor em lugar nenhum do código novo.** Em vez disso:

- `site/lib/site.ts` exporta `SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')`,
  usado em `metadataBase` (layout), `alternates.canonical`/`openGraph.url` (page, via caminho
  relativo resolvido pelo `metadataBase`), `dentistJsonLd()` (`url`, `image`, `logo`), `sitemap.ts` e
  `robots.ts`.
- `.env.example` documenta a variável com um aviso ⚠️ de que é **obrigatório** trocar antes de
  publicar, e que — por ser `NEXT_PUBLIC_*` — o valor é embutido em **build time**, não lido do
  ambiente do servidor depois do build (verifiquei isso na prática: rebuildei com
  `NEXT_PUBLIC_SITE_URL=https://exemplo-teste-dominio.com.br` e confirmei via `curl` que
  `sitemap.xml`, `robots.txt` e o `<link rel="canonical">` passaram a usar esse valor; sem a
  variável, voltam a `http://localhost:3000`).
- README.md ganhou uma seção "Domínio de produção (⚠️ obrigatório antes de publicar)" explicando o
  mesmo processo.
- O teste `jsonld.test.ts` trava contra o hardcode: `expect(ld.url).not.toContain('smileipiranga.com.br')`.

## O que fiz sobre o favicon

`site/app/favicon.ico` era o ícone padrão do `create-next-app` (confirmei pelo hash MD5,
`c30c7d42707a47a3f4591831641e50dc`, que é o hash conhecido do favicon default do Next.js — não uma
suposição visual). Gerei os três arquivos de ícone a partir do arco dourado da marca
(`public/img/sorriso-arco.png`), centralizado sobre fundo preto `#111111` (a variante "premium" da
identidade visual do BRIEFING.md — fundo preto + gradiente dourado), usando PIL (script descartável,
não commitado):

- `app/favicon.ico` — multi-resolução (16/32/48/64px), convenção clássica `app/`.
- `app/icon.png` — 512px, vira `<link rel="icon">` moderno.
- `app/apple-icon.png` — 180px, `<link rel="apple-touch-icon">` (tamanho recomendado pela Apple).

Confirmado no HTML servido pelo build de produção: os três `<link>` corretos aparecem no `<head>`,
apontando pros arquivos novos (não mais o ícone genérico do Next).

## O que NÃO entrou no JSON-LD (e por quê)

Só o que o BRIEFING.md marca como ✅ confirmado: `@type: Dentist`, nome/`alternateName`, endereço
(`Rua Clemente Pereira, 507`, CEP `04216-060`), telefone, `image`/`logo` (arquivos reais existentes em
`public/img/`), `sameAs` com o Instagram, e `hasOfferCatalog` com os 7 tratamentos de
`lib/content.ts` (já validados contra dado inventado pelo teste whitelist de `content.test.ts` de
tasks anteriores).

Nunca entraram, e o teste de varredura recursiva trava contra qualquer um deles reaparecer em
qualquer nível do objeto: `aggregateRating`, `review` (sem avaliação pública coletada — inventar nota
é fraude de rich snippet), `openingHoursSpecification`/`openingHours` (horário ⚠️ PENDENTE — errado é
pior que ausente), `priceRange`/`paymentAccepted`/`currenciesAccepted` (sem confirmação), e
`medicalSpecialty` (especialidade do Dr. Vinicius e CRO ⚠️ PENDENTES).

## Verificação ao vivo (build de produção real, não dev server)

`npm run build` seguido de `npm run start -p 4599`, depois `curl` no HTML/rotas geradas:

- `<title>Smile — Dentista no Ipiranga, São Paulo | Facetas, Implantes e Próteses</title>` e
  `<meta name="description" content="Consultório odontológico no Ipiranga...">` presentes e corretos.
- `<html lang="pt-BR" ...>` — confirmado correto, sem mudança necessária (item 4 do brief).
- `<script type="application/ld+json">` parseado de verdade com `json.loads()` em Python (não só
  regex) — JSON válido, e a checagem `[k for k in proibidos if k in raw]` retornou lista vazia.
- Open Graph: `og:title`, `og:description`, `og:image` (`hero-foto.jpg`, `944×1122` — dimensões reais
  do arquivo, não inventadas; medi com PIL antes de escrever a metadata), `og:url`, `og:locale`,
  `og:type` todos presentes.
- `<link rel="canonical">` resolvido pra `SITE_URL` via `metadataBase`.
- `/sitemap.xml` e `/robots.txt` gerados e servidos, com `Sitemap:` apontando pro sitemap.
- Rebuild com `NEXT_PUBLIC_SITE_URL` setado confirmou o mecanismo de override (seção acima) — depois
  rebuildei de novo sem a variável pra deixar o repo no estado default (localhost) antes de commitar.

`.claude/launch.json` não foi tocado.

## Pendências que ficam para quando o cliente confirmar

- Domínio real → trocar `NEXT_PUBLIC_SITE_URL` no ambiente de build da hospedagem, sem tocar em
  código.
- Horário de atendimento, CRO/responsável técnico, especialidade registrada → quando confirmados,
  adicionar `openingHoursSpecification` e `medicalSpecialty` em `lib/jsonld.ts` (a estrutura já está
  isolada num único arquivo pequeno, fácil de estender).
- Nenhuma avaliação real existe ainda — `aggregateRating`/`review` só entram se/quando a clínica
  tiver avaliações públicas de verdade.
