import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

// jsdom não implementa IntersectionObserver. O WhatsAppFab depende dele para
// decidir quando aparecer, e o MobileMenu depende da Motion escrever o estado
// "aberto" de verdade no DOM — este stub guarda a callback de cada instância
// para que os testes possam disparar entradas de interseção manualmente, do
// jeito que um browser real faria ao rolar a página.
class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = [];
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    IntersectionObserverStub.instances.push(this);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

describe('Header', () => {
  it('mostra as quatro ancoras de navegacao', () => {
    render(<Header />);
    ['Tratamentos','A Clínica','Depoimentos','Como Chegar'].forEach(t =>
      expect(screen.getByRole('link', { name: t })).toBeInTheDocument());
  });

  it('aponta o CTA para o WhatsApp certo', () => {
    render(<Header />);
    const cta = screen.getByRole('link', { name: /Agendar avaliação/i });
    expect(cta).toHaveAttribute('href', expect.stringContaining('wa.me/551122740228'));
  });

  it('tem link de telefone acessivel', () => {
    render(<Header />);
    expect(screen.getByLabelText('Ligar para a Smile')).toHaveAttribute('href', 'tel:+5511981691210');
  });

  it('abre o drawer do menu mobile com opacidade visivel, nao presa em 0', async () => {
    // Regressão do bug achado só no navegador: useCapability() começa com
    // podeAnimar:false até o efeito resolver, então o primeiríssimo commit do
    // MobileMenu usava o ramo reduced-motion dos variants (opacity:0 em
    // "fechado"). Se o ramo animado voltar a esquecer de fixar opacity:1 nos
    // dois estados, esse 0 herdado fica preso para sempre e o painel nunca
    // aparece — mesmo com aria-hidden e inert corretamente removidos.
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    // As duas condições ficam dentro do MESMO waitFor de propósito:
    // aria-hidden é um atributo React comum, muda em sincronia com o clique;
    // opacity é escrito pela Motion via rAF, um passo depois. Checar opacity
    // fora do waitFor corre atrás do estado errado sob carga (o "aria-hidden
    // já virou false" pode resolver antes do rAF da Motion rodar) — foi
    // exatamente esse timing que fez esse teste ficar instável ao rodar a
    // suíte inteira, mesmo com o componente correto.
    await waitFor(() => {
      const el = screen.getByRole('dialog', { name: 'Menu' });
      expect(el).toHaveAttribute('aria-hidden', 'false');
      expect(el.style.opacity).not.toBe('0');
    });
  });
});

describe('WhatsAppFab', () => {
  it('tem rotulo acessivel', () => {
    render(<WhatsAppFab />);
    expect(screen.getByLabelText('Falar no WhatsApp')).toBeInTheDocument();
  });

  it('fica inalcancavel enquanto o sentinel esta em tela e alcancavel quando ele sai por cima', async () => {
    IntersectionObserverStub.instances.length = 0;
    render(<WhatsAppFab />);
    const link = screen.getByLabelText('Falar no WhatsApp');

    // Estado inicial: nada rolou ainda, o FAB não compete com o CTA do hero.
    expect(link).toHaveAttribute('tabindex', '-1');

    const instancia = IntersectionObserverStub.instances.at(-1)!;

    // Sentinel ainda visível (perto do topo): continua escondido.
    act(() => {
      instancia.callback(
        [{ isIntersecting: true, boundingClientRect: { top: 50 } } as IntersectionObserverEntry],
        instancia as unknown as IntersectionObserver
      );
    });
    expect(screen.getByLabelText('Falar no WhatsApp')).toHaveAttribute('tabindex', '-1');

    // Sentinel saiu por cima da viewport: rolou além do primeiro viewport, FAB entra.
    act(() => {
      instancia.callback(
        [{ isIntersecting: false, boundingClientRect: { top: -10 } } as IntersectionObserverEntry],
        instancia as unknown as IntersectionObserver
      );
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Falar no WhatsApp')).toHaveAttribute('tabindex', '0');
    });
  });
});
