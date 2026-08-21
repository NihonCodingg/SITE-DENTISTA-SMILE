import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

/**
 * `--ease-gaveta` (app/globals.css) registrada no GSAP com o id 'gaveta'
 * (Task 18, B). CSS e GSAP passam a usar a MESMA curva — antes o token era
 * órfão: nenhum .tsx/.ts o referenciava, e o drawer (animado por GSAP) usava
 * power4.out na abertura e power3.in no fechamento, que o design-guidance.md
 * proíbe em UI.
 *
 * Os quatro pontos são a fonte única do lado do JS; __tests__/
 * staggeredMenu.test.ts confere que batem com o `cubic-bezier(...)` do
 * globals.css e que a curva registrada no GSAP avalia igual à do CSS.
 */
export const EASE_GAVETA_PONTOS = [0.32, 0.72, 0, 1] as const;
export const EASE_GAVETA_ID = 'gaveta';

let registrada = false;

/**
 * Idempotente. Chamada no MotionProvider (junto do registro do ScrollTrigger,
 * uma vez por app) e, por segurança, por quem consome a curva
 * (StaggeredMenu): o efeito do filho roda ANTES do efeito do provider, e um
 * componente montado fora do provider (testes) não pode cair num ease default
 * silencioso — o GSAP não lança erro para id de ease desconhecido, só usa o
 * default.
 */
export function registrarEaseGaveta(): void {
  if (registrada) return;
  gsap.registerPlugin(CustomEase);
  CustomEase.create(EASE_GAVETA_ID, EASE_GAVETA_PONTOS.join(','));
  registrada = true;
}
