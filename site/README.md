This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Domínio de produção (⚠️ obrigatório antes de publicar)

O site lê a URL pública de `NEXT_PUBLIC_SITE_URL` (ver `.env.example`), usada em
`metadataBase`, `canonical`, `sitemap.xml`, `robots.txt` e no JSON-LD
(`schema.org/Dentist`). **Nenhum domínio está hardcoded no código** — o
processo do projeto prevê que o cliente compre o domínio no nome dele, e isso
ainda não aconteceu (ver `BRIEFING.md` na raiz do repositório).

Sem essa variável configurada, o site cai num default de desenvolvimento
(`http://localhost:3000`) em vez de apontar silenciosamente para um domínio
chutado — URL errada em dado estruturado e sitemap é pior que ausente, porque
o Google indexa apontando para lugar nenhum.

**Antes de publicar em produção:**

1. Copie `.env.example` para `.env.local` (ou configure a variável direto no
   ambiente de build da hospedagem).
2. Defina `NEXT_PUBLIC_SITE_URL=https://dominio-real-do-cliente.com.br`.
3. Rode `npm run build` — por ser uma variável `NEXT_PUBLIC_*`, o valor é
   embutido em **build time**. Trocar depois do build (ou só antes do
   `npm run start`) não tem efeito; é preciso rebuildar.

## Ícones e favicon

`app/favicon.ico`, `app/icon.png` e `app/apple-icon.png` foram gerados a
partir do arco dourado da marca (`public/img/sorriso-arco.png`) sobre fundo
preto (#111111) — a variante "premium" da identidade visual descrita no
`BRIEFING.md`. Antes da Task 16 esses arquivos eram o favicon padrão do
`create-next-app`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
