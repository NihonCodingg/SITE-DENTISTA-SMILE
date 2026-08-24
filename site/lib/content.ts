export const PILARES = [
  { titulo: 'Atendimento humanizado', desc: 'Personalizado para cada paciente' },
  { titulo: 'Profissionais especializados', desc: 'Com tecnologia de ponta' },
  { titulo: 'Segurança e qualidade', desc: 'Em cada detalhe' },
  { titulo: 'Resultados', desc: 'Que valorizam a sua autoestima' },
] as const;

const TRAT = [
  ['Facetas', 'facetas', 'Correção de forma, cor e alinhamento dos dentes da frente. Um caminho estético para quem quer harmonizar o sorriso.', '/img/trat-facetas.webp'],
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
  '/img/retrato-1.jpg', '/img/retrato-2.jpg', '/img/retrato-3.jpg', '/img/retrato-4.jpg',
  '/img/retrato-5.jpg', '/img/retrato-6.jpg', '/img/retrato-7.jpg', '/img/retrato-8.jpg',
  '/img/retrato-9.jpg',
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
