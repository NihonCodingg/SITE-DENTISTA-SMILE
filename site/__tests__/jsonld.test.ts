import { describe, it, expect } from 'vitest';
import { dentistJsonLd } from '@/lib/jsonld';

// Tipo real de dentistJsonLd() + os campos proibidos como opcionais/unknown,
// só pra podermos checar a AUSÊNCIA deles sem recorrer a `any`. Se algum dia
// alguém adicionar de verdade um desses campos com um tipo concreto (ex.:
// `aggregateRating: {...}` no objeto retornado), a interseção ainda tipa
// certo — quem trava a regressão é o teste de ausência abaixo, não o tipo.
type CamposProibidos = {
  aggregateRating?: unknown;
  review?: unknown;
  openingHoursSpecification?: unknown;
  openingHours?: unknown;
  priceRange?: unknown;
  paymentAccepted?: unknown;
  currenciesAccepted?: unknown;
  medicalSpecialty?: unknown;
};

describe('jsonld', () => {
  const ld: ReturnType<typeof dentistJsonLd> & CamposProibidos = dentistJsonLd();

  it('declara o tipo Dentist', () => {
    expect(ld['@type']).toBe('Dentist');
  });

  it('usa o endereço confirmado', () => {
    expect(ld.address.streetAddress).toContain('507');
    expect(ld.address.postalCode).toBe('04216-060');
  });

  it('referencia o Instagram da marca em sameAs', () => {
    expect(ld.sameAs).toContain('https://www.instagram.com/smileipiranga');
  });

  it('lista os tratamentos confirmados', () => {
    const nomes = ld.hasOfferCatalog.itemListElement.map(i => i.itemOffered.name);
    expect(nomes).toContain('Facetas');
    expect(nomes).toContain('Clareamento');
    expect(nomes).toHaveLength(7);
  });

  it('usa uma URL derivada de configuração, não um domínio chutado', () => {
    // O domínio real do cliente ainda não foi comprado (ver BRIEFING.md).
    // Travar contra 'smileipiranga.com.br' hardcoded impede que alguém
    // volte a chutar o domínio direto no código.
    expect(ld.url).not.toContain('smileipiranga.com.br');
    expect(typeof ld.url).toBe('string');
    expect(ld.url.length).toBeGreaterThan(0);
  });

  // A clínica não tem avaliação pública coletada, e o horário de
  // atendimento ainda é ⚠️ PENDENTE no BRIEFING.md. Dado estruturado é lido
  // por máquina — declarar qualquer um destes campos sem confirmação vira
  // resultado de busca errado (nota inventada, ou paciente indo na porta
  // fechada num horário que ninguém confirmou).
  it('não declara nota agregada nem avaliações, que a clínica não tem', () => {
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.review).toBeUndefined();
  });

  it('não declara horário de atendimento, que ainda é pendente', () => {
    expect(ld.openingHoursSpecification).toBeUndefined();
    expect(ld.openingHours).toBeUndefined();
  });

  it('não declara faixa de preço, convênio ou forma de pagamento', () => {
    expect(ld.priceRange).toBeUndefined();
    expect(ld.paymentAccepted).toBeUndefined();
    expect(ld.currenciesAccepted).toBeUndefined();
  });

  it('não afirma especialidade médica registrada nem CRO, ambos pendentes', () => {
    expect(ld.medicalSpecialty).toBeUndefined();
  });

  it('não contém nenhum dos campos proibidos em nenhum nível do objeto (prova por varredura)', () => {
    const CAMPOS_PROIBIDOS = [
      'aggregateRating',
      'review',
      'openingHoursSpecification',
      'openingHours',
      'priceRange',
    ];

    const encontrados: string[] = [];
    function varrer(valor: unknown): void {
      if (valor == null || typeof valor !== 'object') return;
      for (const [chave, v] of Object.entries(valor as Record<string, unknown>)) {
        if (CAMPOS_PROIBIDOS.includes(chave)) encontrados.push(chave);
        varrer(v);
      }
    }
    varrer(ld);

    expect(encontrados, `Campo(s) proibido(s) encontrado(s) no JSON-LD: ${encontrados.join(', ')}`).toEqual([]);
  });
});
