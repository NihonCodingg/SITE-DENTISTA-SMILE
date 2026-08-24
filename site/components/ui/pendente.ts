/**
 * Marcação visual de "dado que o cliente ainda não confirmou": sublinhado
 * tracejado dourado.
 *
 * Uma fonte só, para as marcações nunca divergirem entre as seções que as
 * exibem — hoje o Profissional (Ortodontista, CRO-SP), a Localização
 * (horário) e o rodapé (responsável técnico, CRO-SP). Morava em
 * `sections/Profissional.tsx` e foi movida para cá porque o rodapé é layout,
 * não seção: layout importando de uma seção invertia a dependência (M8 da
 * review final da branch).
 *
 * O que ele marca é uma pendência de verdade, não um placeholder de
 * desenvolvimento — a regra do projeto é nunca inventar dado da clínica, e
 * essas marcações são o que torna a ausência visível em vez de silenciosa.
 * Só saem quando o cliente responder (ver o checklist em `site/README.md`).
 */
export const PENDENTE = 'border-b-[2px] border-dashed border-dourado pb-0.5';
