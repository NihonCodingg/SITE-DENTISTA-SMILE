/**
 * Isola o fundo da página enquanto um overlay modal está aberto (Task 18,
 * F3b) — helper ÚNICO, compartilhado pelo drawer do menu mobile
 * (`components/layout/MobileMenu.tsx`) e pelo lightbox de vídeo
 * (`components/ui/Lightbox.tsx`). Antes, os dois só isolavam o PRÓPRIO
 * painel: com o overlay aberto, `<main>`/`<header>`/`<footer>` continuavam
 * sem `inert` e sem `aria-hidden`, e um leitor de tela em cursor virtual
 * alcançava o fundo por trás do diálogo (medido ao vivo na Task 18-B:
 * `main.inert=false`, `mainAriaHidden=null`).
 *
 * Percorre `document.body.children`; para cada filho que NÃO está em
 * `manter` (nem contém um dos elementos de `manter`) e não é
 * script/style/link/template/next-route-announcer, guarda o estado anterior
 * de `inert` e `aria-hidden` e aplica os dois. Devolve a função que restaura
 * EXATAMENTE o estado anterior — um `aria-hidden="true"` que já existia
 * continua existindo; um `inert` que não existia é removido. Idempotente:
 * chamar a restauração duas vezes não quebra nada (o efeito de abertura e o
 * handler de fechar chamam os dois, em ordens diferentes).
 *
 * Atributo, não propriedade (`setAttribute('inert','')` em vez de
 * `el.inert = true`): é o que o jsdom e o `toHaveAttribute('inert')` dos
 * testes enxergam, e no navegador o atributo é a própria fonte da
 * propriedade. Isolamento não é motion — sob `prefers-reduced-motion` é
 * idêntico.
 */
const IGNORAR = new Set(['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE', 'NEXT-ROUTE-ANNOUNCER']);

type EstadoAnterior = { el: Element; inert: string | null; ariaHidden: string | null };

export function isolarFundo(manter: Iterable<Element | null>): () => void {
  const manterLista: Element[] = [];
  for (const el of manter) if (el) manterLista.push(el);

  const anteriores: EstadoAnterior[] = [];
  for (const el of Array.from(document.body.children)) {
    if (IGNORAR.has(el.tagName.toUpperCase())) continue;
    if (manterLista.some((m) => el === m || el.contains(m))) continue;
    anteriores.push({ el, inert: el.getAttribute('inert'), ariaHidden: el.getAttribute('aria-hidden') });
    el.setAttribute('inert', '');
    el.setAttribute('aria-hidden', 'true');
  }

  let restaurado = false;
  return () => {
    if (restaurado) return;
    restaurado = true;
    for (const { el, inert, ariaHidden } of anteriores) {
      if (inert === null) el.removeAttribute('inert');
      else el.setAttribute('inert', inert);
      if (ariaHidden === null) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', ariaHidden);
    }
  };
}
