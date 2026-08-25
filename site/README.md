# Site da Smile Ipiranga

Landing page de conversão da Smile — Saúde & Estética Orofacial, consultório de cadeira única no
Ipiranga, São Paulo. Uma página, quinze seções, e uma ação principal: chamar a clínica no WhatsApp.

Next.js 16 (App Router), React 19, TypeScript e Tailwind v4. O motion usa GSAP com ScrollTrigger,
Lenis para o scroll suave e Motion para os overlays; `three` e `ogl` movem os dois efeitos WebGL
(fundo do hero e galeria de sorrisos) e ficam fora do JS inicial, atrás de `next/dynamic`.

> Os relatórios e guias citados por nome nos comentários do código (`design-guidance.md`,
> `task-17-report.md`, `ux-guidance.md`, …) vivem em
> `docs/superpowers/sdd-2026-08-19-site-smile-ipiranga/`, na raiz do repositório. O histórico
> completo do build está no `progress.md` de lá.

## Como rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:3000.

```bash
npm test          # suíte completa (vitest)
npm run build     # build de produção
npm run start     # serve o build
npm run lint
```

**Um teste fica vermelho de propósito.** `__tests__/orcamento.test.ts` compara o LCP *simulado* do
Lighthouse (3847ms) contra a meta de 2500ms. O mesmo LCP com throttling *real* mede 2211ms, dentro
da meta — o `simulate` superestima este caso. O teste segue vermelho, e não silenciado, porque a
decisão é do dono do projeto; o comentário do próprio teste e o `task-17-report.md` trazem os
números. Todo o resto da suíte passa.

Os testes de orçamento só rodam quando existe um `lh-mobile.json` na pasta `site/` (gerado por
`npx lighthouse`); sem ele viram no-op. Não há Chrome nesta máquina de desenvolvimento — aponte
`CHROME_PATH` para o Edge ao rodar o Lighthouse localmente.

## Domínio de produção (⚠️ obrigatório antes de publicar)

O site lê a URL pública de `NEXT_PUBLIC_SITE_URL` (ver `.env.example`), usada em `metadataBase`,
canonical, `sitemap.xml`, `robots.txt` e no JSON-LD (`schema.org/Dentist`). **Nenhum domínio está
hardcoded no código** — o processo do projeto prevê que o cliente compre o domínio no nome dele, e
isso ainda não aconteceu (ver `BRIEFING.md` na raiz do repositório).

Sem essa variável configurada, o site cai num default de desenvolvimento (`http://localhost:3000`)
em vez de apontar silenciosamente para um domínio chutado — URL errada em dado estruturado e
sitemap é pior que ausente, porque o Google indexa apontando para lugar nenhum.

**Antes de publicar em produção:**

1. Copie `.env.example` para `.env.local` (ou configure a variável direto no ambiente de build da
   hospedagem).
2. Defina `NEXT_PUBLIC_SITE_URL=https://dominio-real-do-cliente.com.br`.
3. Rode `npm run build` — por ser uma variável `NEXT_PUBLIC_*`, o valor é embutido em **build
   time**. Trocar depois do build (ou só antes do `npm run start`) não tem efeito; é preciso
   rebuildar.

Mais dois pontos do deploy:

- **A pasta `public/` precisa ir junto.** `components/sections/Tratamentos.tsx` é Server Component
  e checa no disco (`fs.existsSync`) se a foto de cada tratamento existe, para cair no glifo `✦`
  em vez de mostrar uma imagem quebrada. Num deploy `output: 'standalone'`, `public/` não é
  copiada automaticamente.
- **O cache de `/_next/image` precisa ser persistente na hospedagem.** As imagens são servidas em
  AVIF; o primeiro request de cada tamanho custa cerca de 50% mais para codificar, e os seguintes
  vêm do cache. Um cache que se perde a cada deploy paga esse custo sempre.

## Onde ficam os assets

| O quê | Onde |
|---|---|
| Fotos do site | `public/img/` |
| Pôsteres dos vídeos | `public/videos/posters/<slug>.webp` |
| Ícones e favicon | `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` |

> **O site não hospeda vídeo desde 24/08.** As linhas de `previews/` e `completos/` que esta tabela
> listava saíram junto com o lightbox: cada card mostra o pôster e o clique abre o reel no Instagram
> da clínica (`components/ui/VideoCard.tsx`). As duas pastas não existem mais no repositório.

As fotos saem de `IMAGENS DO INSTAGRAM/` (na raiz) pelo pipeline `scripts/preparar-assets.mjs`,
que redimensiona e comprime com `sharp` seguindo um mapa explícito de origem → destino. Rode-o da
raiz do repositório quando trocar uma foto de origem. O acervo de vídeo, como cada prévia foi
gerada (`ffmpeg`, `scale=480:-2`, `fps=24`, `libx264 -crf 31`) e o contrato de implementação estão
em `VIDEOS/README.md`.

`lib/imgOtimizada.ts` monta as URLs do otimizador do Next para as texturas da galeria WebGL, que
não passam por `next/image`.

### Como trocar um vídeo

1. Escolha o **slug** (sem acento nem espaço).
2. Coloque o pôster em `public/videos/posters/<slug>.webp`. É a primeira imagem do reel; nenhum
   arquivo de vídeo entra no repositório.
3. Registre em `lib/content.ts`: o array `DEPOIMENTOS` leva `{ slug, titulo, legenda, reel }`, onde
   `reel` é a URL do post no Instagram da clínica. A legenda descreve **o que foi tratado, nunca
   quem foi tratado**.
4. Rode `npm test`.

## Regras do projeto que o código assume

- **Nenhum dado inventado.** Sem avaliação, estrela, contagem de pacientes, horário ou convênio que
  a clínica não tenha confirmado. O que depende do cliente aparece marcado como pendência, com
  sublinhado tracejado. `__tests__/content.test.ts` trava isso com uma whitelist de dígitos.
- **Mobile-first**, alvos de toque de 44px, corpo a partir de 16px.
- **Só `transform`, `opacity` e `clip-path` animam** (as exceções são documentadas onde estão).
- **`lib/useCapability.ts` é a única fonte** de `matchMedia` e `navigator.connection`. Nenhum
  componente, nem os vendorizados do React Bits, consulta essas APIs por conta própria.
- **`prefers-reduced-motion` reduz, não zera**: desliga WebGL e autoplay, mantém o feedback de
  toque e um fade curto. **`saveData`** desliga vídeo e WebGL.
- Os componentes em `components/reactbits/` foram baixados do React Bits e modificados; origem,
  licença (MIT + Commons Clause) e cada modificação estão no `README.md` e no `LICENSE.md` daquela
  pasta.

## Ícones e favicon

`app/favicon.ico`, `app/icon.png` e `app/apple-icon.png` foram gerados a partir do arco dourado da
marca (`public/img/sorriso-arco.png`) sobre fundo preto (#111111) — a variante "premium" da
identidade visual descrita no `BRIEFING.md`.

## Checklist antes de publicar

Nada aqui bloqueia o merge; tudo aqui bloqueia a publicação. O site já mostra cada pendência como
pendência — o risco é publicar sem resolvê-las, não deixá-las visíveis.

- [ ] **Número de pacientes e origem da nota** — o hero exibe "Mais de mil sorrisos transformados"
      com cinco estrelas, hoje marcado com o tracejado. Faltam DUAS coisas diferentes: o número, que
      ninguém no material do cliente disse, e a fonte da avaliação (não há Google Reviews coletado
      nem pesquisa). Ou as estrelas passam a refletir a nota real com o número de avaliações ao
      lado, ou saem. Ver `components/ui/ProvaSocial.tsx`
- [ ] **CRO do responsável técnico** — o site mostra "CRO-SP a confirmar" em dois lugares
- [ ] **"Ortodontista"** confirmada como especialidade registrada (hoje marcada com tracejado)
- [ ] **Autorização de uso de imagem** dos pacientes (retratos, antes e depois, vídeos).
      ⚠️ A seção Antes e Depois **já afirma** "publicadas com autorização dos pacientes":
      publicar antes de a autorização existir torna a frase falsa
- [ ] **Horário de atendimento** — hoje "a confirmar"; o JSON-LD fica sem `openingHours` de propósito
- [ ] **Trechos de procedimento** cortados de `caso-protese` (~16s) e `facetas-transformacao` (~3s)
      nos vídeos completos — Resolução CFO-196/2019, detalhes em `VIDEOS/README.md`
- [ ] **Marca d'água do CapCut** removida do vídeo da recepção
- [ ] **Logo em vetor**
- [ ] **`NEXT_PUBLIC_SITE_URL`** definida e build refeito — com uma rede a menos desde 25/08/2026:
      na Vercel, sem a variável, o `SITE_URL` cai no domínio de produção real que a própria Vercel
      injeta no build (`VERCEL_PROJECT_PRODUCTION_URL`), que vira o domínio customizado sozinho
      quando o cliente comprar um. Fora da Vercel o fallback continua sendo localhost de propósito,
      para o erro gritar. Ver `lib/site.ts`
- [ ] **Cache de `/_next/image`** persistente na hospedagem; **`public/`** presente no deploy
- [ ] **Teste manual** de `prefers-reduced-motion` e `saveData` em aparelho real — o ambiente de
      desenvolvimento não conseguiu compositar frames para verificar isso ao vivo
- [x] ~~**Arquivos órfãos em `public/`**~~ — RESOLVIDO. Os quatro `videos/posters/*.jpg` estavam
      versionados e iam ao ar sem serem usados por nada (271 KB; as versões `.webp` são as que o
      código pede) e foram removidos. Os outros quatro (`*.frame-video`,
      `*.claude-design-artefatos.*`, `*.local-fallback`) já eram ignorados pelo git, então nunca
      chegavam ao deploy — só sujavam a cópia local, e foram apagados de lá também. `public/` tem
      33 arquivos e todos são usados

As perguntas ainda abertas com o cliente estão em `PERGUNTAS-CLIENTE.md`, na raiz.

## Deploy na Vercel

O repositório NÃO é o app: o Next.js mora em `site/`, subpasta da raiz. Na criação do projeto na
Vercel, configurar:

1. **Root Directory = `site`** (Settings → General). Sem isso o build falha na raiz, onde não há
   `package.json` de app. O framework (Next.js) e os comandos são detectados sozinhos a partir daí.
2. **Branch de produção**: hoje o trabalho vive em `feat/site`; produção na Vercel segue `main` por
   padrão. Ou faz-se o merge para `main`, ou muda-se a branch de produção em Settings → Git.
3. **Variáveis de ambiente**: nenhuma é obrigatória para o primeiro deploy (ver item da checklist
   acima). Quando o domínio do cliente existir, `NEXT_PUBLIC_SITE_URL=https://dominio.com.br` em
   Production e um redeploy.
4. **Cache de imagens**: o item da checklist sobre `/_next/image` é atendido de fábrica — o
   otimizador da Vercel guarda as variantes em cache persistente por conteúdo, e `public/` faz
   parte do deploy padrão do Next (o alerta do checklist era para hospedagens `standalone`).
5. O modo diagnóstico (`?teste=semsilk,semgaleria,comblur,semlenis` — ver
   `components/layout/ModoDiagnostico.tsx`) continua existindo em produção, desligado por padrão e
   inofensivo: só marca classes no `<html>` de quem abrir a URL com a query.
