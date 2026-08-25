/**
 * URL pública do site, usada em `metadataBase`, `canonical`, `sitemap.xml`,
 * `robots.txt` e no JSON-LD.
 *
 * NÃO HARDCODE UM DOMÍNIO AQUI. O processo do projeto prevê que o cliente
 * compre o domínio no nome dele. Uma URL errada em dado estruturado é pior
 * que ausente: o Google indexa apontando pra lugar nenhum.
 *
 * A cadeia, do mais explícito ao fallback de desenvolvimento:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` (ver `.env.example`) — o domínio real, definido
 *    no ambiente de build da hospedagem. Manda em tudo quando existir.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — a Vercel injeta no build o domínio de
 *    PRODUÇÃO do projeto (o `*.vercel.app` de fábrica; vira o domínio
 *    customizado sozinho quando o cliente comprar um e apontá-lo lá). Não é
 *    chute: é o domínio real em que este build vai morar. Vem sem protocolo,
 *    daí o `https://`. Só existe do lado do servidor — e todos os usos de
 *    `SITE_URL` são server-side (layout, robots, sitemap, JSON-LD); se um
 *    componente client um dia importar isto, o item 1 vira obrigatório.
 * 3. localhost — desenvolvimento, nunca em produção por acidente sem avisar:
 *    o deploy fora da Vercel sem a variável do item 1 continua APONTANDO
 *    PARA LOCALHOST de propósito, para o erro gritar em vez de indexar um
 *    domínio inventado.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'http://localhost:3000'
).replace(/\/$/, '');
