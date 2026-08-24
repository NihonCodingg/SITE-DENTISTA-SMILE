import { describe, it, expect } from 'vitest';
import { PILARES, TRATAMENTOS, PASSOS, FAQ, SORRISOS, DEPOIMENTOS, ANTES_DEPOIS } from '@/lib/content';
import { WHATSAPP_DISPLAY } from '@/lib/contact';

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

  // Testes antigos de regex: mantidos porque documentam a intenção original
  // (bloquear "N+ pacientes" e "N,N estrelas"), mas são uma blacklist com
  // buracos conhecidos — não pegam "mais de 500 pacientes", "+500 pacientes"
  // (ordem invertida) nem "nota 5.0 de satisfação". A rede de segurança real
  // é o teste de whitelist logo abaixo.
  it('não contém número inventado de pacientes ou avaliações (regex específica)', () => {
    const tudo = JSON.stringify({ PILARES, TRATAMENTOS, PASSOS, FAQ, SORRISOS, DEPOIMENTOS, ANTES_DEPOIS });
    expect(tudo).not.toMatch(/\d+\s*\+\s*(pacientes|clientes|avalia)/i);
    expect(tudo).not.toMatch(/\d[,.]\d\s*(estrelas|★)/i);
  });

  it('não contém nenhum número fora da whitelist de campos legítimos (numeração e caminho de arquivo)', () => {
    // Whitelist: só estes nomes de campo podem conter dígitos. `n` é a
    // numeração de exibição (01, 02...) e `img` é caminho de arquivo
    // (retrato-1.jpg, antes-depois-3.jpg...). Qualquer outro campo string
    // que contenha um dígito é, por definição, um dado sobre o negócio real
    // (contagem de pacientes, anos de atuação, nota, avaliação etc.) que
    // ninguém confirmou — e portanto não pode existir aqui.
    // `reel` entrou junto com `img`: é a URL do post no Instagram, um
    // localizador, não uma afirmação sobre a clínica.
    const CAMPOS_COM_NUMERO_PERMITIDO = new Set(['n', 'img', 'reel']);

    type Achado = { caminho: string; valor: string; digitos: string[] };
    const achados: Achado[] = [];

    function varrer(valor: unknown, caminho: string, nomeDoCampo?: string): void {
      if (valor == null) return;

      if (typeof valor === 'string') {
        if (nomeDoCampo && CAMPOS_COM_NUMERO_PERMITIDO.has(nomeDoCampo)) return;

        // Única exceção legítima: o telefone do WhatsApp dentro da resposta
        // do FAQ. Removemos a substring exata (importada de lib/contact,
        // não hardcoded aqui) antes de varrer — se alguém trocar por um
        // número diferente e inventado, ele deixa de ser removido e o
        // teste pega.
        const texto = valor.split(WHATSAPP_DISPLAY).join('');

        const digitos = texto.match(/\d+/g);
        if (digitos) {
          achados.push({ caminho, valor, digitos });
        }
        return;
      }

      if (Array.isArray(valor)) {
        valor.forEach((item, i) => varrer(item, `${caminho}[${i}]`));
        return;
      }

      if (typeof valor === 'object') {
        for (const [chave, v] of Object.entries(valor as Record<string, unknown>)) {
          varrer(v, caminho ? `${caminho}.${chave}` : chave, chave);
        }
      }
    }

    const TUDO = { PILARES, TRATAMENTOS, PASSOS, FAQ, SORRISOS, DEPOIMENTOS, ANTES_DEPOIS };
    varrer(TUDO, '');

    expect(
      achados,
      `Número(s) fora da whitelist encontrado(s):\n${achados
        .map(a => `  - ${a.caminho}: "${a.valor}" (dígitos: ${a.digitos.join(', ')})`)
        .join('\n')}`
    ).toEqual([]);
  });
});
