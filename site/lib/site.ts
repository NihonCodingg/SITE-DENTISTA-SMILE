/**
 * URL pública do site, usada em `metadataBase`, `canonical`, `sitemap.xml`,
 * `robots.txt` e no JSON-LD.
 *
 * NÃO HARDCODE UM DOMÍNIO AQUI. O processo do projeto prevê que o cliente
 * compre o domínio no nome dele — nada foi confirmado até a Task 16. Uma URL
 * errada em dado estruturado é pior que ausente: o Google indexa apontando
 * pra lugar nenhum.
 *
 * Configure `NEXT_PUBLIC_SITE_URL` (ver `.env.example`) com o domínio real
 * antes de publicar. Sem essa variável, cai num default de desenvolvimento
 * óbvio — nunca em um domínio chutado.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
