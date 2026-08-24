# Guia de UX — leitura obrigatória para as Tasks 12 a 15

Destilado da skill `ui-ux-pro-max`, filtrado para o que **acrescenta** ao `design-guidance.md`
(o guia de craft do Emil). Onde os dois falarem da mesma coisa, o guia de craft manda — ele é
calibrado para esta marca.

---

## O que a base confirmou que já estamos fazendo certo

Não mude nada disso, só saiba que está validado: mobile-first sem scroll horizontal, contraste
mínimo 4.5:1, alvos de toque de 44px, `prefers-reduced-motion` respeitado, `next/image` em toda
imagem, duração de animação entre 150 e 300ms, e nada de emoji como ícone.

---

## O que acrescenta, por seção

### Depoimentos (Task 12) — a ordem importa para conversão

O padrão de landing "Hero + Testimonials + CTA" da base diz: **prova social vem antes do CTA
final**, com 3 a 5 depoimentos. Nossa ordem já faz isso (Depoimentos na posição 9, CTA final na 14)
— mantenha.

A base recomenda "foto + nome + cargo" em cada depoimento. **Nós não podemos fazer isso**: não
temos nome dos pacientes, e inventar está fora de questão. Os nossos são vídeos gravados na
clínica, o que é uma prova mais forte que um nome escrito. Use a legenda do vídeo para dar contexto
(o que foi tratado), nunca um nome.

### Antes e Depois (Task 14) — galeria

- `max-w-full` em toda imagem; nada de largura fixa em px
- O scroller horizontal precisa de `overflow-x: auto` no **próprio container**, nunca deixando a
  página rolar lateralmente
- Se usar `clip-path` para revelar (o guia de craft sugere), lembre de clipar o wrapper com
  `overflow: hidden`

### Localização (Task 15) — o mapa

- O iframe do Google Maps é o maior peso de terceiro da página. Já está no plano carregar sob
  demanda; a base reforça: reserve o espaço com `aspect-ratio` para **CLS não passar de 0.1**
- Âncoras (`#localizacao` etc.) precisam rolar suavemente. Temos Lenis — **confirme que os links
  do header realmente chegam na seção certa**, porque Lenis intercepta o scroll nativo e
  `scroll-behavior: smooth` do CSS sozinho pode não bastar

### FAQ (Task 15) — acordeão

- Use `<details>`/`<summary>` nativos: acessíveis de graça, funcionam sem JS
- Erro em campo/estado sempre perto do elemento, nunca só no topo

---

## Motion — o que a base acrescenta ao guia de craft

**Parallax (se usar em alguma seção):**
- Só em camada decorativa ou de fundo. **Nunca em texto** — atrapalha a leitura e causa enjoo.
- `yPercent` entre 5 e 15, não mais. Acima disso o fundo e o primeiro plano dessincronizam.
- Clipe o wrapper com `overflow: hidden`; camada com `will-change: transform` **removido depois
  que o scroll assenta**, senão fica segurando memória de GPU.
- Máximo 3-4 camadas, e todas sob um único ScrollTrigger — não um por camada.

**SplitText:**
- Só em headline curta (menos de ~8 palavras). Ele cria um elemento por caractere; usar em
  parágrafo incha o DOM.
- `split.revert()` no cleanup, para devolver os nós de texto às ferramentas de acessibilidade.
  *(Já estamos fazendo — a Task 8 corrigiu isso.)*

**Reveal por scroll:**
- Deslocamento de 8 a 16px, para ler como fade e não como slide. *(Usamos 24px — está no limite
  de cima; se parecer slide demais em alguma seção, baixe.)*
- **Nunca deixe conteúdo relevante para SEO invisível por padrão sem fallback sem-JS.**
  *(Nosso `<Reveal>` já nasce visível — mantenha esse padrão em toda seção nova.)*

---

## Licença do GSAP — verificado, sem problema

A base da skill afirma que `SplitText` é plugin pago do GSAP Club. **Isso está desatualizado.**
Verifiquei: o projeto usa GSAP 3.15.0 com a "Standard 'no charge' license", e desde a aquisição
pela Webflow todos os plugins antes exclusivos de membros — incluindo `SplitText` e `ScrollTrigger` —
são livres para uso comercial. A única restrição é não usar GSAP para construir uma ferramenta de
animação visual sem código que concorra com a Webflow. Site de cliente está coberto.

Não perca tempo procurando alternativa ao SplitText.
