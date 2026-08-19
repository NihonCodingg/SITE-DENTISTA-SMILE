import { describe, it, expect } from 'vitest';
import { waLink, TELEFONE, WHATSAPP_DISPLAY, ENDERECO } from '@/lib/contact';

describe('contact', () => {
  it('monta o link do WhatsApp com o número correto', () => {
    expect(waLink()).toContain('https://wa.me/551122740228');
  });

  it('codifica a mensagem no parâmetro text', () => {
    expect(waLink('Olá, tudo bem?')).toContain('text=Ol%C3%A1%2C%20tudo%20bem%3F');
  });

  it('expõe telefone e endereço confirmados', () => {
    expect(TELEFONE).toBe('+5511981691210');
    expect(WHATSAPP_DISPLAY).toBe('(11) 2274-0228');
    expect(ENDERECO.numero).toBe('507');
    expect(ENDERECO.cep).toBe('04216-060');
  });
});
