import { describe, it, expect } from 'vitest';
import { PILARES, TRATAMENTOS, PASSOS, FAQ, SORRISOS, DEPOIMENTOS } from '@/lib/content';

describe('content', () => {
  it('tem os 4 pilares da marca', () => {
    expect(PILARES).toHaveLength(4);
    expect(PILARES[0].titulo).toBe('Atendimento humanizado');
  });

  it('tem 7 tratamentos, incluindo clareamento', () => {
    expect(TRATAMENTOS).toHaveLength(7);
    expect(TRATAMENTOS.map(t => t.nome)).toContain('Clareamento');
  });

  it('numera os tratamentos com dois dígitos', () => {
    expect(TRATAMENTOS[0].n).toBe('01');
    expect(TRATAMENTOS[6].n).toBe('07');
  });

  it('tem 4 passos do processo', () => {
    expect(PASSOS).toHaveLength(4);
  });

  it('não expõe copy não confirmada no FAQ', () => {
    const texto = FAQ.map(f => f.p + f.r).join(' ');
    expect(texto).not.toMatch(/convênio|parcelament|urgência/i);
  });

  it('lista os depoimentos com slug de vídeo existente', () => {
    const slugs = ['tour-clinica','caso-protese','facetas-resina','facetas-transformacao','recepcao'];
    DEPOIMENTOS.forEach(d => expect(slugs).toContain(d.slug));
  });

  it('não contém número inventado de pacientes ou avaliações', () => {
    const tudo = JSON.stringify({ PILARES, TRATAMENTOS, PASSOS, FAQ, SORRISOS, DEPOIMENTOS });
    expect(tudo).not.toMatch(/\d+\s*\+\s*(pacientes|clientes|avalia)/i);
    expect(tudo).not.toMatch(/\d[,.]\d\s*(estrelas|★)/i);
  });
});
