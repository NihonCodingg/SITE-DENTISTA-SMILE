import { describe, it, expect, beforeEach } from 'vitest';
import { isolarFundo } from '@/lib/fundoInerte';

// Task 18 (F3b): helper único de isolamento do fundo para os dois overlays
// (drawer do menu e lightbox). O que se trava aqui é o contrato: aplica
// inert + aria-hidden em todo filho do body que não é o overlay, ignora
// script/style/etc., restaura EXATAMENTE o estado anterior, e a restauração
// é idempotente.

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  document.body.appendChild(e);
  return e;
}

describe('isolarFundo', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('aplica inert + aria-hidden em tudo que nao esta em `manter`, e nao toca no overlay', () => {
    const header = el('header');
    const main = el('main');
    const overlay = el('div', { id: 'overlay' });
    const filhoDoOverlay = document.createElement('div');
    overlay.appendChild(filhoDoOverlay);

    const restaurar = isolarFundo([overlay]);

    expect(header).toHaveAttribute('inert');
    expect(header).toHaveAttribute('aria-hidden', 'true');
    expect(main).toHaveAttribute('inert');
    expect(main).toHaveAttribute('aria-hidden', 'true');
    expect(overlay).not.toHaveAttribute('inert');
    expect(overlay).not.toHaveAttribute('aria-hidden');

    restaurar();
    expect(header).not.toHaveAttribute('inert');
    expect(header).not.toHaveAttribute('aria-hidden');
    expect(main).not.toHaveAttribute('inert');
    expect(main).not.toHaveAttribute('aria-hidden');
  });

  it('mantem um filho do body que CONTEM o elemento de `manter` (portal aninhado)', () => {
    const wrapper = el('div');
    const painel = document.createElement('aside');
    wrapper.appendChild(painel);
    const main = el('main');

    const restaurar = isolarFundo([painel]);
    expect(wrapper).not.toHaveAttribute('inert');
    expect(main).toHaveAttribute('inert');
    restaurar();
  });

  it('restaura um aria-hidden pre-existente em vez de remove-lo', () => {
    const decorativo = el('div', { 'aria-hidden': 'true' });
    const jaInerte = el('div', { inert: '' });
    const overlay = el('div');

    const restaurar = isolarFundo([overlay]);
    expect(decorativo).toHaveAttribute('aria-hidden', 'true');
    expect(decorativo).toHaveAttribute('inert');
    restaurar();
    // O que já existia continua existindo; o que não existia foi embora.
    expect(decorativo).toHaveAttribute('aria-hidden', 'true');
    expect(decorativo).not.toHaveAttribute('inert');
    expect(jaInerte).toHaveAttribute('inert');
    expect(jaInerte).not.toHaveAttribute('aria-hidden');
  });

  it('ignora script, style, link, template e next-route-announcer', () => {
    const script = el('script');
    const style = el('style');
    const link = el('link');
    const template = el('template');
    const announcer = el('next-route-announcer');
    const main = el('main');
    const overlay = el('div');

    const restaurar = isolarFundo([overlay]);
    [script, style, link, template, announcer].forEach((e) => {
      expect(e).not.toHaveAttribute('inert');
      expect(e).not.toHaveAttribute('aria-hidden');
    });
    expect(main).toHaveAttribute('inert');
    restaurar();
  });

  it('a restauracao e idempotente e aceita null em `manter`', () => {
    const main = el('main');
    const overlay = el('div');

    const restaurar = isolarFundo([null, overlay]);
    expect(main).toHaveAttribute('inert');
    restaurar();
    expect(main).not.toHaveAttribute('inert');

    // Segunda chamada: nada muda, nada lança — mesmo que alguém tenha
    // marcado o elemento de novo nesse meio-tempo (outro overlay aberto).
    main.setAttribute('inert', '');
    expect(() => restaurar()).not.toThrow();
    expect(main).toHaveAttribute('inert');
  });
});
