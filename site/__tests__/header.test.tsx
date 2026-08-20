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
    // aparece. O painel só existe no DOM enquanto aberto (AnimatePresence —
    // ver nota de scrollWidth em MobileMenu.tsx), então "encontrável pelo
    // role" já prova que não está aria-hidden; falta só provar que a Motion
    // não deixou opacity presa em 0.
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    // getByRole (não queryByRole) dentro do waitFor: se o painel ainda não
    // tiver montado, a asserção relança e o waitFor tenta de novo — e depois
    // que monta, opacity ainda pode estar em 0 por um instante (a Motion
    // escreve via rAF, um passo depois do React commitar o elemento). As
    // duas coisas represento no mesmo waitFor de propósito: checar opacity
    // fora dele corre atrás do estado errado sob carga, e foi exatamente
    // esse timing que fez esse teste ficar instável ao rodar a suíte
    // inteira, mesmo com o componente correto.
    await waitFor(() => {
      const el = screen.getByRole('dialog', { name: 'Menu' });
      expect(el.style.opacity).not.toBe('0');
    });
  });

  it('nao deixa nada no DOM com transform quando o drawer esta fechado', () => {
    // Regressão do bug de overflow horizontal: um elemento fixed com
    // transform:translateX(100%) conta para document.scrollWidth mesmo fora
    // da viewport visível — mesmo estando aria-hidden (dois revisores
    // confirmaram ao vivo: 375px virava 695px). jsdom não faz layout de
    // verdade, então não dá pra medir scrollWidth aqui; a garantia real é
    // sobre a própria existência do nó no DOM.
    //
    // Importante: a consulta usa document.querySelector cru, NÃO
    // screen.queryByRole. queryByRole já filtra elementos aria-hidden por
    // padrão — o padrão antigo (painel sempre montado, só alternando
    // aria-hidden) passaria por queryByRole mesmo com o bug presente, porque
    // teria sumido da árvore de acessibilidade sem sumir do DOM. Só a
    // consulta crua distingue "não está montado" (correto) de "está montado
    // mas escondido de leitor de tela" (o próprio bug).
    render(<Header />);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('reabre acessivel mesmo fechando e reabrindo rapido, antes da saida terminar', async () => {
    // Regressão achada pela review com 3 cliques reais a 60ms de intervalo:
    // fechar() marca aria-hidden/inert direto no nó do painel (necessário
    // porque a AnimatePresence segura o nó fora do ciclo normal de render
    // durante a saída de ~220ms). Se a pessoa reabrir antes disso terminar,
    // a AnimatePresence reaproveita o MESMO nó — sem abrir() limpar
    // simetricamente o que fechar() setou, o painel reabre com
    // aria-expanded="true" no botão mas inert/aria-hidden presos, e
    // .focus() em qualquer item interno vira no-op silencioso.
    //
    // A consulta ao painel é refeita via document.querySelector (não uma
    // referência guardada de antes do fechar/reabrir): cobre tanto o caso
    // de a AnimatePresence reaproveitar o nó quanto o de criar um novo —
    // o que importa é o estado observável depois do ciclo, não qual nó é.
    render(<Header />);
    const hamburguer = screen.getByRole('button', { name: 'Abrir menu' });

    fireEvent.click(hamburguer);
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    });

    fireEvent.click(hamburguer); // fecha
    fireEvent.click(hamburguer); // reabre antes dos ~220ms de saída terminarem

    const painel = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(painel).not.toBeNull();
    expect(painel!.inert).toBe(false);
    expect(painel).not.toHaveAttribute('aria-hidden', 'true');

    // Prova adicional do sintoma relatado: o efeito de foco inicial
    // (dispara em toda transição de "aberto") precisa ter conseguido focar
    // de verdade — um painel preso em inert faria isso ser um no-op e o
    // foco continuaria fora dele (ex.: ainda no próprio hambúrguer, que
    // por sinal também tem aria-label "Fechar menu" nesse estado — por
    // isso a checagem é de CONTAINMENT no painel, não de rótulo).
    await waitFor(() => {
      expect(painel!.contains(document.activeElement)).toBe(true);
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
