# PROMPT — copiar tudo abaixo desta linha e colar no Claude Design

---

Preciso do design de um site de uma página para uma clínica odontológica real, em São Paulo.
Anexei as fotos reais da clínica e as referências visuais. Leia tudo antes de começar.

## O cliente

**SMILE — Saúde & Estética Orofacial** (na fachada: *Smile Odontologia Integrada*).
Consultório odontológico no bairro do Ipiranga, São Paulo. Responsável: Dr. Vinicius Aracena, ortodontista.

Ponto que define tudo: é um **consultório isolado, de uma cadeira**. Não é rede, não é franquia,
não tem 20 unidades. O ativo da marca é atendimento pessoal e especialização em estética —
facetas, implantes e próteses. O site precisa parecer exatamente o que a clínica é: pequena,
caprichada e confiável. Nunca uma rede grande.

**Objetivo:** transformar quem chega do Instagram e do Google em avaliação agendada.
**Conversão:** WhatsApp (11) 2274-0228. O botão de WhatsApp é o elemento mais importante da página.

## Restrição número 1 — MOBILE-FIRST

O público chega do Instagram, ou seja, de celular, no scroll. **Desenhe 375px primeiro**,
depois tablet, depois desktop.

- Headline e botão de WhatsApp acima da dobra em 375px, sem rolar
- Botão de WhatsApp fixo/flutuante na zona do polegar
- Alvos de toque de no mínimo 44×44px
- Nenhuma informação escondida atrás de hover
- Corpo de texto mínimo 16px
- Grids de 3 e 4 colunas viram 1 coluna ou carrossel de swipe

## Paleta — BRANCO E AMARELO

Amostrada dos arquivos reais da marca:

- `#FFFFFF` branco — base dominante
- `#FCF0E4` creme — seções alternadas, para quebrar o branco puro
- `#FCCC24` **amarelo Smile** — cor primária, CTAs e destaques
- `#F0B40C` dourado — sublinhados, ícones, hover
- `#111111` preto — toda a tipografia
- `#5A5A55` grafite — texto de apoio

Proporção: ~70% branco/creme, ~20% preto, ~10% amarelo. O amarelo é acento, nunca fundo de página.

**Verde folhagem:** a clínica tem uma parede de folhagem artificial que aparece em quase toda foto.
É a única cor fora da paleta que entra — e entra pela fotografia, não por elemento gráfico.

## Tipografia — escolha você, mas casando com estas duas vozes

**1. Títulos — grotesca pesada.** O logotipo "Smile" é uma grotesca densa, família Arial Black /
Helvetica Black: contraformas apertadas, terminais retos, hastes grossas.
**Não é arredondada** — nada de Baloo, Fredoka, Comfortaa.

**2. Rótulos — geométrica leve, caixa alta, tracking muito largo.** O letreiro físico da fachada é
`S M I L E   O D O N T O L O G I A   I N T E G R A D A`. Use para sobretítulos, nav e legendas.

**3. Corpo:** sans humanista, boa leitura, mínimo 16px.

**4. Acento manuscrito:** a marca usa script itálico em frases curtas. No máximo 1 ou 2 vezes na página inteira.

Prefira Google Fonts.

## Hero

Siga a estrutura das referências anexadas (as três de layout). O DNA comum delas:

- Container de cantos arredondados, não faixa sangrando de borda a borda
- Nav: logo à esquerda, âncoras ao centro, telefone + CTA em pílula à direita
- CTA primário em pílula com seta
- Um elemento flutuante de credibilidade sobre o hero
- Faixa de tratamentos logo abaixo, em ticker ou chips

Qualquer um dos três miolos serve: split (texto + foto recortada), display (headline gigante
atravessando o topo) ou full-bleed (foto ocupando tudo com overlay).

**Atenção — o elemento de credibilidade NÃO pode copiar o das referências.** Elas põem ali
"4.9★ com 800+ avaliações", "150+ dentistas", "20+ clínicas". A Smile não tem nenhum desses números
e inventar está fora de questão. Use no lugar, tudo verificado:

- Os quatro pilares: atendimento humanizado · profissionais especializados · segurança e qualidade · resultados
- A tríade: **Facetas • Implantes • Próteses**
- **"No coração do Ipiranga, cuidando de toda a região"**
- Melhor opção: um **card flutuante com o vídeo do tour da clínica** — prova real, sem número inventado

Copy do hero:

> Sobretítulo: Odontologia integrada no Ipiranga
>
> **Título: Seu novo sorriso começa aqui**
>
> Subtítulo: Facetas, implantes, próteses e ortodontia com atendimento personalizado para cada paciente. No coração do Ipiranga, cuidando de toda a região.
>
> CTA: Agendar minha avaliação

## Seções (13)

1. Header sticky — logo, âncoras, botão amarelo `Agendar avaliação`
2. Hero
3. Barra de pilares — humanizado · especializado · segurança · resultados
4. Tratamentos — cards: facetas, implantes, protocolo de implante, próteses, ortodontia, limpeza, clareamento
5. A Clínica — galeria do ambiente real
6. O Profissional — retrato + nome + especialidade + CRO
7. Depoimentos — cards de vídeo
8. Antes e Depois — com aviso legal
9. Como funciona — 4 passos, da mensagem ao plano
10. Localização — mapa + endereço + horário
11. FAQ
12. CTA final — bloco amarelo, WhatsApp
13. Rodapé — dados legais, CNPJ, CRO

A copy completa de cada seção está no arquivo `COPY.md` anexo.

## Vídeos de depoimento

A seção de depoimentos usa vídeos reais de pacientes. O padrão já definido: cada card mostra um
loop mudo de ~5s (arquivos já otimizados, ~190 KB) que só toca quando entra na viewport; o clique
abre o vídeo completo em lightbox. **Cada card precisa de um frame estático bonito**, porque parte
dos visitantes vai ver só ele.

## Fotografia — use as anexadas, são todas reais

- **Hero:** paciente sorrindo na cadeira suspensa, sob o letreiro SMILE na parede verde
- **A Clínica:** parede verde de folhagem, cadeira suspensa, letreiro retroiluminado
- **Localização:** a fachada preta real, com o número 507
- Mais ~11 retratos de pacientes sorrindo e 5 antes/depois

A parede verde com o letreiro SMILE é o cenário de marca mais forte que existe — aparece nos
retratos, nos vídeos e no interior. Use como fio condutor visual.

## Referências premiadas — mire neste nível

Quatro sites de odontologia premiados no Awwwards. **Nenhum é azul**, e três usam base neutra clara
com um único acento saturado — a mesma arquitetura de branco + amarelo.

- **https://lavadental.lv/en** — Honorable Mention 2026. Uma página só, contenção, movimento
  estruturado, "confiança por clareza em vez de marketing". É o nosso caso exato.
- **https://aventuradentalarts.com/** — Site of the Day 2026. Veja o slider de serviços com vídeo integrado.
- **https://minemal.dental/** — Honorable Mention 2024. Base creme `#F6F4EF`, conduzido por tipografia.
- **https://halodental.com/** — Site of the Day 2024. Preto + coral. Prova que um acento saturado
  usado com confiança funciona; nosso amarelo ocupa o mesmo papel.

O padrão que se repete nos quatro: base neutra + um acento · tipografia como estrutura ·
movimento contido · nenhuma estatística inflada · fotografia real e consistente.

## Como usar as três referências de layout anexadas

Use **estrutura, composição, espaçamento, hierarquia e acabamento**.
**Ignore a cor delas** — são azuis, e a Smile é branca e amarela.

Ignore também: blocos de estatística de escala, blocos de desconto e promoção,
ilustrações 3D de dentes em plástico brilhante.

## O que NÃO fazer

- Nada de azul
- Nenhuma foto de banco de imagem — a clínica tem 20 fotos de gente de verdade
- Nenhum número, prêmio, certificação ou tecnologia que não esteja neste documento
- Nenhuma promessa de resultado, "o melhor", "o único", "garantido"
  (publicidade odontológica no Brasil é regulada pela Resolução CFO-196/2019)
- Nada de blocos de desconto ou promoção — é vedado por mercantilização
- Estética de hospital: azul clínico, branco frio, ícone de cruz médica
- Layout pensado no desktop e depois espremido no celular

## O que buscar

Sensação de consultório boutique de bairro: quente, cuidado, com plantas e luz.
Amarelo usado com confiança, como cor de marca — não como alerta.
Muito respiro, tipografia grande e segura, WhatsApp a um toque em qualquer ponto da página.

## Entregável

Telas de **mobile (375px) e desktop** para as 13 seções, prontas para handoff de código.
Se for gerar só uma composição primeiro, comece pelo hero mobile.

## Dados reais para usar nas telas

- WhatsApp: **(11) 2274-0228**
- Telefone: **(11) 98169-1210**
- Endereço: **Rua Clemente Pereira, 507 — Ipiranga, São Paulo/SP · 04216-060**
- Instagram: **@smileipiranga**
- Assinatura da marca: **"Sorriso com propósito"**
