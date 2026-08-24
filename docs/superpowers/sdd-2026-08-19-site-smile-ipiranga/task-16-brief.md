### Task 16: SEO local e dados estruturados

**Files:**
- Modify: `site/app/layout.tsx`
- Create: `site/lib/jsonld.ts`, `site/app/sitemap.ts`, `site/app/robots.ts`
- Create: `site/__tests__/jsonld.test.ts`

**Interfaces:**
- Produces: `dentistJsonLd(): object` — schema.org `Dentist`

O briefing lista o Google como canal de entrada. Sem isso, o site não compete por "dentista Ipiranga".

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/jsonld.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { dentistJsonLd } from '@/lib/jsonld';

describe('jsonld', () => {
  const ld = dentistJsonLd() as Record<string, any>;

  it('declara o tipo Dentist', () => {
    expect(ld['@type']).toBe('Dentist');
  });

  it('usa o endereco confirmado', () => {
    expect(ld.address.streetAddress).toContain('507');
    expect(ld.address.postalCode).toBe('04216-060');
  });

  it('nao declara nota agregada, que a clinica nao tem', () => {
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.review).toBeUndefined();
  });

  it('lista os tratamentos confirmados', () => {
    const nomes = ld.hasOfferCatalog.itemListElement.map((i: any) => i.itemOffered.name);
    expect(nomes).toContain('Facetas');
    expect(nomes).toContain('Clareamento');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- jsonld`
Expected: FAIL

- [ ] **Step 3: Implementar o JSON-LD**

```ts
import { ENDERECO, TELEFONE, INSTAGRAM } from './contact';
import { TRATAMENTOS } from './content';

export function dentistJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: 'Smile — Saúde & Estética Orofacial',
    alternateName: 'Smile Odontologia Integrada',
    url: 'https://smileipiranga.com.br',
    telephone: TELEFONE,
    image: 'https://smileipiranga.com.br/img/fachada.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${ENDERECO.rua}, ${ENDERECO.numero}`,
      addressLocality: ENDERECO.cidade,
      addressRegion: ENDERECO.uf,
      postalCode: ENDERECO.cep,
      addressCountry: 'BR',
    },
    sameAs: [INSTAGRAM],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tratamentos',
      itemListElement: TRATAMENTOS.map(t => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: t.nome },
      })),
    },
  };
}
```

> **Sem `aggregateRating`, sem `review`, sem `openingHoursSpecification`** — a clínica não tem avaliações públicas e o horário ainda é pendente. Marcar horário errado no schema é pior que não marcar. Adicionar quando o cliente confirmar.

- [ ] **Step 4: Adicionar metadata e o script**

Em `layout.tsx`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://smileipiranga.com.br'),
  title: 'Smile Ipiranga — Dentista no Ipiranga | Facetas, Implantes e Próteses',
  description: 'Consultório odontológico no Ipiranga, São Paulo. Facetas, implantes, próteses, ortodontia e limpeza com atendimento personalizado. Agende sua avaliação pelo WhatsApp.',
  openGraph: {
    type: 'website', locale: 'pt_BR',
    title: 'Smile — Seu novo sorriso começa aqui',
    description: 'Odontologia integrada no Ipiranga, São Paulo.',
    images: [{ url: '/img/hero-foto.jpg', width: 1200, height: 1400 }],
  },
  alternates: { canonical: '/' },
};
```

Injetar o JSON-LD com `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistJsonLd()) }} />`.

- [ ] **Step 5: Criar sitemap e robots**

`app/sitemap.ts` retornando a raiz; `app/robots.ts` liberando tudo e apontando o sitemap.

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `cd site && npm test -- jsonld && npm run build`
Expected: PASS e build sem erro

- [ ] **Step 7: Commit**

```bash
cd site && git add -A && git commit -m "feat: SEO local, metadata e dados estruturados"
```

---

