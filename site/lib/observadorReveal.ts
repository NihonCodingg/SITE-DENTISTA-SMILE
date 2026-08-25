'use client';

/**
 * UM `IntersectionObserver` para todos os `Reveal` da página.
 *
 * Antes, cada `Reveal` criava o seu próprio `ScrollTrigger` do GSAP. São 23
 * na página (contados no DOM montado): 23 instâncias, 23 registros no ticker
 * do GSAP e 23 leituras de posição a cada recálculo. Medido na revisão de
 * entrega, desligar o efeito dos `Reveal` por completo valia ~80 a 140ms de
 * bloqueio — quase tudo custo de instanciar, não de animar.
 *
 * Aqui a conta é outra: um observador só, que o navegador avalia fora da
 * thread principal, e a animação sai por transição de CSS. O resultado visual
 * é o mesmo (mesmo deslocamento, mesma duração, mesma curva); o que muda é
 * quem paga.
 *
 * `88%` da altura da janela é o mesmo ponto de disparo que o `ScrollTrigger`
 * usava (`start: 'top 88%'`), traduzido para `rootMargin`: o elemento
 * "chegou" quando o topo dele cruza 88% da tela, ou seja, faltando 12% para o
 * fim — daí o recorte de -12% embaixo.
 */

const MARGEM = '0px 0px -12% 0px';

type Alvo = { el: Element; aoEntrar: () => void };

let observador: IntersectionObserver | null = null;
const pendentes = new Map<Element, () => void>();

function garantirObservador(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (observador) return observador;
  observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        const aoEntrar = pendentes.get(entrada.target);
        if (!aoEntrar) continue;
        // Uma vez só, como o `once: true` do ScrollTrigger.
        pendentes.delete(entrada.target);
        observador?.unobserve(entrada.target);
        aoEntrar();
      }
    },
    { rootMargin: MARGEM, threshold: 0 }
  );
  return observador;
}

/** Registra um alvo. Devolve a função de cancelamento. */
export function observarReveal({ el, aoEntrar }: Alvo): () => void {
  const io = garantirObservador();
  if (!io) {
    // Ambiente sem IntersectionObserver (jsdom, por exemplo): revela na hora,
    // porque conteúdo escondido para sempre é pior que conteúdo sem animação.
    aoEntrar();
    return () => {};
  }
  pendentes.set(el, aoEntrar);
  io.observe(el);
  return () => {
    pendentes.delete(el);
    io.unobserve(el);
  };
}
