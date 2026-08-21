import { ENDERECO, TELEFONE, INSTAGRAM } from './contact';
import { TRATAMENTOS } from './content';
import { SITE_URL } from './site';

/**
 * Dado estruturado schema.org/Dentist da clínica, para injetar como
 * <script type="application/ld+json"> na home.
 *
 * Regra do projeto (ver BRIEFING.md): dado estruturado é lido por máquina e
 * vira resultado de busca — afirmar o que não se sabe aqui é pior que em
 * texto comum. Por isso este objeto NUNCA pode ganhar:
 *
 * - `aggregateRating` / `review` — a clínica não tem avaliação pública
 *   coletada. Inventar nota é fraude de rich snippet.
 * - `openingHoursSpecification` — horário é ⚠️ PENDENTE no BRIEFING.md.
 *   Horário errado no Google faz paciente ir na porta fechada.
 * - `priceRange` — sem confirmação de faixa de preço.
 * - `medicalSpecialty` — a especialidade do profissional (ortodontia) e o
 *   CRO são ⚠️ PENDENTES. Não afirmar especialidade registrada.
 *
 * Adicionar esses campos só quando o cliente confirmar os dados no
 * BRIEFING.md.
 */
export function dentistJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: 'Smile — Saúde & Estética Orofacial',
    alternateName: 'Smile Odontologia Integrada',
    url: SITE_URL,
    telephone: TELEFONE,
    image: `${SITE_URL}/img/fachada.jpg`,
    logo: `${SITE_URL}/img/logo.png`,
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
        itemOffered: {
          '@type': 'Service',
          name: t.nome,
          description: t.desc,
        },
      })),
    },
  };
}
