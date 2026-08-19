# BRIEF PARA O CLAUDE DESIGN — Site Smile Ipiranga

> Cole este documento no Claude Design junto com as referências de `IMAGENS DESIGN INSPIRAÇÃO/`
> e as fotos reais de `IMAGENS DO INSTAGRAM/`.

---

## ⚡ Restrição número 1: MOBILE-FIRST

O público chega do Instagram — ou seja, **de celular, com o dedo já no scroll**.
Desenhe a tela de **375px primeiro** e só depois expanda para tablet e desktop.

Consequências práticas:
- O hero tem que funcionar em retrato, com a headline e o botão de WhatsApp **acima da dobra** sem rolar
- Botão de WhatsApp fixo/flutuante, sempre alcançável pelo polegar (zona inferior da tela)
- Alvos de toque com no mínimo 44×44px
- Nada de hover como única forma de revelar informação
- Tipografia: mínimo 16px no corpo; títulos que não quebrem feio em 375px
- Grids de 3 e 4 colunas viram 1 coluna ou carrossel de swipe no celular
- Menu: sem mega-menu; drawer simples ou só âncoras

---

## O cliente

**SMILE — Saúde & Estética Orofacial** (fachada: *Smile Odontologia Integrada*).
Consultório odontológico no Ipiranga, São Paulo. **Uma cadeira, atendimento pessoal.**
Não é rede, não é franquia. O ativo da marca é proximidade e especialização — não escala.

**Objetivo do site:** transformar quem chega do Instagram e do Google em avaliação agendada.
**Canal de conversão:** WhatsApp (11) 2274-0228.

---

## Paleta — BRANCO E AMARELO

Cores amostradas dos arquivos reais da marca:

| Papel | Hex | Uso |
|---|---|---|
| Base | `#FFFFFF` | Fundo dominante. O site é claro e arejado. |
| Creme | `#FCF0E4` | Fundos alternados de seção, para quebrar o branco puro |
| **Amarelo Smile** | `#FCCC24` | Cor primária da marca — CTAs, destaques, o arco do logo |
| Dourado | `#F0B40C` | Sublinhados, ícones, hover, texto de destaque |
| Preto | `#111111` | Toda a tipografia principal |
| Grafite | `#5A5A55` | Texto de apoio |

**Proporção:** ~70% branco/creme, ~20% preto (tipografia), ~10% amarelo.
O amarelo é acento e chamada — nunca fundo de página inteira.

**Verde folhagem:** a clínica tem uma parede de folhagem artificial que aparece em quase toda foto.
É a única cor fora da paleta que deve entrar — e entra pela fotografia, não por elemento gráfico.

---

## Tipografia — escolha é sua, mas o desenho tem que casar com estes dois

Não vou fixar as famílias. Escolha você, com base no material real da marca:

**1. Voz dos títulos — grotesca pesada**
O logotipo "Smile" é uma **grotesca pesada**, na família Arial Black / Helvetica Black:
contraformas apertadas, terminais retos e horizontais, hastes densas, pingo do "i" redondo e grande.
**Não é uma sans arredondada** — nada de Baloo, Fredoka ou Comfortaa.
→ Use para o H1 do hero e títulos de seção.

**2. Voz dos rótulos — geométrica leve, caixa alta, tracking muito largo**
O letreiro físico da fachada é `S M I L E   O D O N T O L O G I A   I N T E G R A D A`:
hastes finas, formas geométricas, letras bem afastadas.
→ Use para sobretítulos, rótulos, navegação e legendas.

**3. Corpo** — sans humanista de boa leitura, regular, mínimo 16px.

**4. Acento manuscrito** — a marca usa script itálico em frases curtas ("de vida!", "e muda vidas!").
No máximo 1 ou 2 vezes no site inteiro.

Prefira Google Fonts, pelo peso de carregamento e pela licença resolvida.

## Fotografia disponível

Acervo completo catalogado em `ASSETS-INVENTARIO.md`. Os três pilares visuais:

- **Hero:** `Gemini_..._j80nk9...jpg` — paciente sorrindo na cadeira suspensa, sob o letreiro SMILE
  na parede verde. Pessoa real, ambiente real, marca no enquadramento. É a foto do site.
- **A Clínica:** `ChatGPT ... 16_27_05.png` — parede verde, cadeira suspensa, letreiro retroiluminado
- **Localização:** `569880150_...jpg` — a fachada preta real, com o número 507

Mais: ~11 retratos de pacientes sorrindo (com marca d'água SMILE), 5 antes/depois e 2 macros de faceta.

A **parede verde com o letreiro SMILE** é o cenário de marca mais forte que existe — aparece nos
retratos, nos depoimentos em vídeo e no interior. Usar como fio condutor visual.

---

## Vídeos de depoimento — prévia viva, sem peso

A seção de depoimentos usa vídeos reais de pacientes. O padrão definido:

- Cada card mostra um **loop mudo de ~5s** (MP4 otimizado, ~150KB, 9:16)
- O loop só carrega e toca **quando o card entra na viewport** (IntersectionObserver), e pausa ao sair
- Clique abre **lightbox** com o vídeo completo, áudio e legendas
- Em celular com economia de dados ou `prefers-reduced-motion`: só o frame estático
- Nunca embed de iframe do Instagram — pesa ~1MB de script de terceiros por vídeo

No design, isso significa: cada card precisa de um **frame estático bonito** (poster) que funcione
sozinho, porque em parte dos casos é só ele que o visitante vai ver.

---

## Hero — seguir a estrutura das referências

O hero deve seguir a construção dos três layouts de `IMAGENS DESIGN INSPIRAÇÃO/`.
Ignorando a cor deles, o DNA estrutural comum é:

- **Container de cantos arredondados** — o hero é um bloco com border-radius generoso,
  não uma faixa sangrando de borda a borda
- **Nav** — logo à esquerda, âncoras ao centro, ícone de telefone + CTA em pílula à direita
- **CTA primário em pílula, com seta** — é o botão de WhatsApp
- **Um elemento flutuante de credibilidade** sobre o hero
- **Faixa de tratamentos logo abaixo** — em ticker/marquee ou em chips

As três resolvem o miolo de formas diferentes; qualquer uma serve:
1. *Split* — texto à esquerda, foto recortada sobre forma orgânica à direita
2. *Display* — headline gigante em caixa alta atravessando o topo, elemento central, colunas laterais
3. *Full-bleed* — foto ocupando tudo, overlay escuro, texto sobreposto no canto superior esquerdo

### ⚠️ O elemento de credibilidade não pode copiar o das referências

As referências colocam ali "4.9★ com 800+ avaliações", "150+ dentistas", "20+ clínicas".
**A Smile não tem nenhum desses números** e inventar está fora de questão.

Use no lugar, tudo verificado:
- Os **quatro pilares**: atendimento humanizado · profissionais especializados · segurança e qualidade · resultados
- A tríade de especialidade: **Facetas • Implantes • Próteses** (é a própria bio do Instagram)
- **"No coração do Ipiranga, cuidando de toda a região"** (frase da própria clínica)
- Um **card flutuante com o vídeo do tour** — como o card do canto inferior esquerdo da referência 3.
  Esse é o mais forte: prova real, sem número inventado.

---

## Estrutura de seções

1. **Header** — logo, âncoras, botão amarelo `Agendar avaliação` (sticky)
2. **Hero** — "Seu novo sorriso começa aqui" + CTA WhatsApp + foto real
3. **Barra de pilares** — 4 itens: humanizado · especializado · segurança · resultados
4. **Tratamentos** — 6 cards: facetas, implantes, protocolo, próteses, ortodontia, limpeza
5. **A Clínica** — galeria do ambiente real
6. **O Profissional** — retrato + nome + especialidade + CRO
7. **Depoimentos** — cards de vídeo com prévia viva
8. **Antes e Depois** — condicional, com aviso legal
9. **Como funciona** — 4 passos, da mensagem ao plano
10. **Localização** — mapa + endereço + horário
11. **FAQ**
12. **CTA final** — bloco amarelo, WhatsApp
13. **Rodapé** — dados legais, CNPJ, CRO, responsável técnico

Toda a copy pronta está em `COPY.md`.

---

## Como usar as referências da pasta

Use **estrutura, composição, espaçamento, hierarquia e nível de acabamento**.
**Ignore completamente a cor delas** — as três são azuis e a Smile é branca e amarela.

Também ignore:
- Blocos de estatística de escala ("150+ dentistas", "20+ clínicas", "10.000+ pacientes") — a Smile
  tem uma cadeira; qualquer número desses seria inventado
- Blocos de desconto e promoção — vedados pela Resolução CFO-196/2019 (mercantilização)
- Ilustrações 3D de dentes em plástico brilhante (referência GlowDent) — não combina com o ambiente real

---

## O que NÃO fazer

- ❌ Nenhuma foto de banco de imagem. A clínica tem 20 fotos de gente de verdade.
- ❌ Nada de azul.
- ❌ Nenhum número, certificação, prêmio ou tecnologia que não esteja neste brief.
- ❌ Promessa de resultado, "o melhor", "o único", "garantido".
- ❌ Estética de hospital: azul clínico, branco frio, ícones de cruz médica.
- ❌ Layout pensado no desktop e depois espremido no celular.

## O que buscar

- Sensação de **consultório boutique de bairro**: quente, cuidado, com plantas e luz.
- Amarelo usado com confiança, como cor de marca — não como alerta.
- Muito respiro. Tipografia grande e segura.
- WhatsApp a um toque de distância em qualquer ponto da página.

---

## Dados de contato (confirmados)

- WhatsApp: **(11) 2274-0228**
- Telefone: **(11) 98169-1210**
- Endereço: **Rua Clemente Pereira, 507** — Ipiranga, São Paulo/SP · 04216-060
  *(confirmado pelo número na fachada; o CNES registra 503, que é o cadastro do imóvel)*
- Instagram: **@smileipiranga**
