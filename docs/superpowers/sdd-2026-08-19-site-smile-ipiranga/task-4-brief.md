### Task 4: Conteúdo centralizado

**Files:**
- Create: `site/lib/content.ts`
- Create: `site/__tests__/content.test.ts`

**Interfaces:**
- Produces:
  - `PILARES: { titulo: string; desc: string }[]` (4 itens)
  - `TRATAMENTOS: { n: string; nome: string; desc: string; img: string; slug: string }[]` (7 itens)
  - `PASSOS: { n: string; titulo: string; desc: string }[]` (4 itens)
  - `FAQ: { p: string; r: string }[]`
  - `SORRISOS: { img: string; n: string }[]` (retratos de pacientes)
  - `DEPOIMENTOS: { slug: string; titulo: string; legenda: string }[]`
  - `ANTES_DEPOIS: { img: string; alt: string }[]`

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/content.test.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- content`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar `lib/content.ts`**

Copiar a copy de `COPY.md`, sem alterar texto. Os 7 tratamentos são os 6 do design mais Clareamento (confirmado pela hashtag da própria clínica).

```ts
export const PILARES = [
  { titulo: 'Atendimento humanizado', desc: 'Personalizado para cada paciente' },
  { titulo: 'Profissionais especializados', desc: 'Com tecnologia de ponta' },
  { titulo: 'Segurança e qualidade', desc: 'Em cada detalhe' },
  { titulo: 'Resultados', desc: 'Que valorizam a sua autoestima' },
] as const;

const TRAT = [
  ['Facetas', 'facetas', 'Correção de forma, cor e alinhamento dos dentes da frente. Um caminho estético para quem quer harmonizar o sorriso.', '/img/trat-facetas.jpg'],
  ['Implantes', 'implantes', 'Substituição do dente perdido de forma segura, fixa e com aparência natural.', '/img/trat-implantes.jpg'],
  ['Protocolo de implante', 'protocolo', 'Solução para quem perdeu todos os dentes de uma arcada. Mais estabilidade, conforto e qualidade na mastigação.', '/img/trat-protocolo.jpg'],
  ['Próteses', 'proteses', 'Reabilitação de dentes ausentes ou comprometidos, devolvendo função e estética.', '/img/trat-proteses.jpg'],
  ['Ortodontia', 'ortodontia', 'Alinhamento dos dentes e correção da mordida, com acompanhamento ao longo do tratamento.', '/img/trat-ortodontia.jpg'],
  ['Limpeza profissional', 'limpeza', 'Vai muito além da estética: previne gengivite e periodontite, evita perdas dentárias e mantém o sorriso saudável.', '/img/trat-limpeza.jpg'],
  ['Clareamento', 'clareamento', 'Clareamento dental para devolver o tom natural do sorriso, com acompanhamento profissional.', '/img/trat-clareamento.jpg'],
] as const;

export const TRATAMENTOS = TRAT.map(([nome, slug, desc, img], i) => ({
  nome, slug, desc, img, n: String(i + 1).padStart(2, '0'),
}));

export const PASSOS = [
  { n: '01', titulo: 'Você chama no WhatsApp', desc: 'Conta o que está sentindo ou o que gostaria de mudar.' },
  { n: '02', titulo: 'Agendamos sua avaliação', desc: 'No horário que couber na sua rotina.' },
  { n: '03', titulo: 'Fazemos o diagnóstico', desc: 'Exame, conversa e explicação do que está acontecendo.' },
  { n: '04', titulo: 'Você recebe o plano', desc: 'Etapas e prazos explicados com calma, antes de qualquer decisão.' },
] as const;

export const FAQ = [
  { p: 'Preciso levar alguma coisa na primeira consulta?', r: 'Um documento com foto. Se você tiver radiografias ou exames recentes, traga também, que ajuda no diagnóstico.' },
  { p: 'Como agendo minha avaliação?', r: 'Pelo WhatsApp (11) 2274-0228. Você manda uma mensagem contando o que quer resolver e a gente responde para combinar o melhor horário.' },
] as const;

export const SORRISOS = [
  '/img/hero-foto.jpg','/img/retrato-1.jpg','/img/retrato-2.jpg','/img/retrato-3.jpg',
  '/img/retrato-4.jpg','/img/retrato-5.jpg','/img/retrato-6.jpg','/img/retrato-7.jpg',
  '/img/retrato-8.jpg',
].map((img, i) => ({ img, n: String(i + 1).padStart(2, '0') }));

export const DEPOIMENTOS = [
  { slug: 'facetas-resina', titulo: 'Facetas em resina', legenda: 'Resultado de facetas em resina, gravado na clínica.' },
  { slug: 'facetas-transformacao', titulo: 'Transformação com facetas', legenda: 'Paciente da Smile após tratamento com facetas.' },
  { slug: 'caso-protese', titulo: 'Caso de prótese', legenda: 'Dr. Vinicius explicando um caso de prótese.' },
] as const;

export const ANTES_DEPOIS = [
  { img: '/img/antes-depois-1.jpg', alt: 'Antes e depois de reabilitação na Smile' },
  { img: '/img/antes-depois-2.jpg', alt: 'Antes e depois de facetas' },
  { img: '/img/antes-depois-3.jpg', alt: 'Antes e depois de paciente da Smile' },
  { img: '/img/antes-depois-4.jpg', alt: 'Antes e depois de paciente da Smile' },
  { img: '/img/antes-depois-5.jpg', alt: 'Antes e depois de paciente da Smile' },
] as const;
```

> **Nota:** as imagens `trat-*.jpg` vêm dos uploads que o Claude Design já organizou (`uploads/FACETAS.webp`, `IMPLANTES.jpg`, etc.). Exportar do projeto do Claude Design junto com os assets de marca da Task 2, Step 5. `trat-clareamento.jpg` ainda não existe — usar `trat-limpeza.jpg` como provisório e marcar no `progress.md`.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd site && npm test -- content`
Expected: PASS (7 testes)

- [ ] **Step 5: Commit**

```bash
cd site && git add -A && git commit -m "feat: conteúdo centralizado em lib/content"
```

---

