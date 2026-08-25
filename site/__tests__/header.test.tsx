import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import gsap from 'gsap';
import { Header, ANCORA_TOPO } from '@/components/layout/Header';
import { IlhaContato } from '@/components/layout/IlhaContato';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

// jsdom não implementa IntersectionObserver. A IlhaContato depende dele para
// decidir quando aparecer, e o MobileMenu depende da Motion escrever o estado
// "aberto" de verdade no DOM — este stub guarda a callback de cada instância
// para que os testes possam disparar entradas de interseção manualmente, do
// jeito que um browser real faria ao rolar a página.
//
// `options` também é guardado: a IlhaContato cria DOIS observadores — o do
// hero (sem opções de margem) e o que descobre a seção em leitura (com
// `rootMargin`). Sem distinguir, um teste dispararia a entrada do hero na
// callback errada.
class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = [];
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
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

  // Task 18 (F1, WCAG 2.5.8): os links do nav desktop eram texto puro com
  // 19,5px de altura. min-h-11 (44px) é a régua do próprio header (CTA e
  // telefone). jsdom não mede — a classe é o que se trava aqui; as alturas
  // medidas ao vivo (768/1024/1280) estão em task-18-fix-report.md.
  it('os quatro links do nav desktop tem alvo de 44px (min-h-11, inline-flex, items-center)', () => {
    render(<Header />);
    ['Tratamentos', 'A Clínica', 'Depoimentos', 'Como Chegar'].forEach((t) => {
      const a = screen.getByRole('link', { name: t });
      expect(a.className).toMatch(/\bmin-h-11\b/);
      expect(a.className).toMatch(/\binline-flex\b/);
      expect(a.className).toMatch(/\bitems-center\b/);
    });
  });

  // Task 18 (F2): overflow horizontal de 8px em 768px, rastreado ao CTA do
  // header. gap-6 em md (-24px), gap-8 só de lg em diante. jsdom não faz
  // layout — a classe é o que se trava aqui; a tabela de larguras (768, 800,
  // 820, 834, 900, 1023, 1024) medida ao vivo está em task-18-fix-report.md.
  it('o nav desktop usa gap-6 em md e gap-8 so de lg em diante', () => {
    const { container } = render(<Header />);
    const nav = container.querySelector('nav')!;
    expect(nav.className).toMatch(/\bgap-6\b/);
    expect(nav.className).toMatch(/\blg:gap-8\b/);
    expect(nav.className).not.toMatch(/(^|\s)gap-8(\s|$)/);
  });

  it('aponta o CTA para o WhatsApp certo', () => {
    render(<Header />);
    const cta = screen.getByRole('link', { name: /Agendar avaliação/i });
    expect(cta).toHaveAttribute('href', expect.stringContaining('wa.me/551122740228'));
  });

  // Task 18 (E2): o logo apontava para "#" — excluído de propósito pelo
  // interceptador de âncoras (lib/motion.tsx), virava jump nativo bruto.
  // "/" numa <a> comum recarregaria a página. "#topo" existe em app/page.tsx
  // e cai no caminho normal do interceptador (Lenis rola suave até o topo).
  it('o logo leva ao topo por ancora interceptavel (#topo), nao "#" nem "/"', () => {
    render(<Header />);
    const logo = screen.getByRole('link', { name: 'Smile Ipiranga' });
    expect(ANCORA_TOPO).toMatch(/^#.+/);
    expect(logo).toHaveAttribute('href', ANCORA_TOPO);
    // ...e o alvo existe na página.
    const page = readFileSync(path.resolve(__dirname, '../app/page.tsx'), 'utf8');
    expect(page).toContain(`<main id="${ANCORA_TOPO.slice(1)}"`);
  });

  it('tem link de telefone acessivel', () => {
    render(<Header />);
    expect(screen.getByLabelText('Ligar para a Smile')).toHaveAttribute('href', 'tel:+5511981691210');
  });

  it('abre o drawer ate a posicao visivel, nao preso fora da tela', async () => {
    // Enquanto fechado, o StaggeredMenu mantém o painel fora da tela com
    // `gsap.set(panel, { xPercent: 100 })`; abrir é a timeline que leva esse
    // xPercent a 0. A regressão que este teste existe para pegar é o painel
    // montar, ficar acessível (aria/inert corretos, provados nos testes
    // abaixo) e mesmo assim continuar invisível porque a timeline não rodou.
    //
    // A versão anterior deste teste checava `el.style.opacity !== '0'`. Desde
    // a Task 19 o painel animado nunca recebe `style.opacity` (só o ramo
    // reduced-motion escreve essa propriedade), então a asserção comparava
    // string vazia com '0' e passava sempre — inclusive com a animação
    // quebrada. Trocada pela propriedade que a abertura de fato move.
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    await waitFor(() => {
      const painel = screen.getByRole('dialog', { name: 'Menu' });
      expect(Number(gsap.getProperty(painel, 'xPercent'))).toBe(0);
    });
  });

  it('fica inacessivel (aria-hidden + inert) quando o drawer esta fechado', () => {
    // Task 19: o painel trocou de motion.div+AnimatePresence (desmontava ao
    // fechar) para StaggeredMenu do React Bits, animado via GSAP — GSAP
    // anima o MESMO nó pra sempre, ele nunca desmonta. A garantia de
    // "invisível pra quem usa teclado/leitor de tela quando fechado" agora
    // vem de aria-hidden + inert amarrados direto à prop `open`, não da
    // ausência do nó no DOM. A proteção contra overflow horizontal
    // (scrollWidth) continua vindo da MESMA estrutura de wrapper
    // .fixed.inset-0.overflow-hidden + painel .absolute (inalterada por
    // esta troca) — verificada ao vivo no navegador, não aqui (jsdom não
    // faz layout de verdade).
    //
    // getByRole já filtra elementos aria-hidden/inert por padrão — por isso
    // a consulta usa document.querySelector cru: precisa achar o nó (ele
    // está montado) e então confirmar que ele está marcado inacessível.
    render(<Header />);
    const painel = document.querySelector('[role="dialog"]');
    expect(painel).not.toBeNull();
    expect(painel).toHaveAttribute('aria-hidden', 'true');
    expect(painel).toHaveAttribute('inert');
    // E continua fora da árvore de acessibilidade por essa via.
    expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull();
  });

  it('reabre acessivel mesmo fechando e reabrindo rapido, antes da saida terminar', async () => {
    // Regressão original (implementação motion.div+AnimatePresence, até a
    // Task 18): fechar() marcava aria-hidden/inert direto no nó do painel
    // porque a AnimatePresence segurava o nó fora do ciclo normal de render
    // durante a saída. Reabrir antes disso terminar podia deixar
    // inert/aria-hidden presos.
    //
    // Task 19 (StaggeredMenu, GSAP): aria-hidden/inert agora são props
    // React diretas amarradas a `aberto` — não existe mais nó "fora do
    // ciclo normal de render" nem estado imperativo pra ficar preso. Este
    // teste continua existindo porque a garantia observável (reabertura
    // rápida tem que deixar o painel focável) é a mesma; só o mecanismo
    // testado mudou de "resíduo imperativo limpo" para "prop sempre em
    // sincronia com o estado".
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
    expect(painel).not.toHaveAttribute('inert');
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

  // Task 18 (F3a): com o drawer aberto, o ✕ do header fica SOB o backdrop
  // (z-65) e o painel (z-70) — invisível e inalcançável por toque. O painel
  // ganhou o próprio botão "Fechar menu", primeiro focável (foco inicial cai
  // nele, como num diálogo); fechar por ele devolve o foco ao hambúrguer.
  it('o painel tem botao "Fechar menu"; clicar nele fecha e devolve o foco ao hamburguer', async () => {
    render(<Header />);
    const hamburguer = screen.getByRole('button', { name: 'Abrir menu' });
    fireEvent.click(hamburguer);

    const painel = await screen.findByRole('dialog', { name: 'Menu' });
    const fecharNoPainel = within(painel).getByRole('button', { name: 'Fechar menu' });
    expect(fecharNoPainel.className).toMatch(/\bpressable\b/);
    // Alvo de toque de pelo menos 44px (WCAG 2.5.8). O que se checa é a
    // MEDIDA, não a classe exata: até a Task 23 isto exigia literalmente
    // `h-11`, e quando o painel virou o BubbleMenu — cujas bolhas são de 48px,
    // ou seja MAIORES que o mínimo — o teste reprovou uma mudança que
    // melhorava o alvo. jsdom não faz layout, então a medida sai da escala do
    // Tailwind (1 unidade = 4px).
    const altura = /\bh-(\d+)\b/.exec(fecharNoPainel.className);
    const largura = /\bw-(\d+)\b/.exec(fecharNoPainel.className);
    expect(altura).not.toBeNull();
    expect(largura).not.toBeNull();
    expect(Number(altura![1]) * 4).toBeGreaterThanOrEqual(44);
    expect(Number(largura![1]) * 4).toBeGreaterThanOrEqual(44);

    // Foco inicial cai no ✕ do painel (primeiro focável).
    await waitFor(() => expect(document.activeElement).toBe(fecharNoPainel));

    fireEvent.click(fecharNoPainel);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull();
    });
    expect(document.activeElement).toBe(hamburguer);
    expect(hamburguer).toHaveAttribute('aria-expanded', 'false');
  });

  it('Escape fecha o drawer e devolve o foco ao hamburguer', async () => {
    render(<Header />);
    const hamburguer = screen.getByRole('button', { name: 'Abrir menu' });
    fireEvent.click(hamburguer);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull();
    });
    expect(document.activeElement).toBe(hamburguer);
  });

  // Task 18 (F3b): com o drawer aberto, o FUNDO (tudo que é filho do body e
  // não é o portal do drawer — na página real: header, main, footer, FAB)
  // fica inert + aria-hidden; ao fechar, volta exatamente ao estado anterior.
  // O jsdom não faz layout nem implementa a semântica de `inert`; o que se
  // trava aqui é o ATRIBUTO (mesma via do teste de "fica inacessivel" acima).
  // `<Header />` é renderizado pela RTL dentro de um <div> filho do body —
  // esse <div> faz o papel do <header> da página; main/footer são criados à
  // mão como irmãos, com um aria-hidden pré-existente no footer para provar
  // que a restauração não o apaga.
  it('com o drawer aberto, header, main e footer ficam inert + aria-hidden; ao fechar, voltam ao estado anterior', async () => {
    const main = document.createElement('main');
    const footer = document.createElement('footer');
    footer.setAttribute('aria-hidden', 'true');
    document.body.append(main, footer);
    try {
      render(<Header />);
      const hamburguer = screen.getByRole('button', { name: 'Abrir menu' });
      const fundoDoHeader = hamburguer.closest('body > *')!;
      expect(fundoDoHeader).not.toHaveAttribute('inert');

      fireEvent.click(hamburguer);
      await waitFor(() => expect(document.querySelector('[role="dialog"]:not([aria-hidden="true"])')).not.toBeNull());

      [fundoDoHeader, main, footer].forEach((el) => {
        expect(el).toHaveAttribute('inert');
        expect(el).toHaveAttribute('aria-hidden', 'true');
      });
      // O portal do drawer (wrapper do backdrop + painel) fica de fora.
      const painel = document.querySelector('[role="dialog"]')!;
      const portal = painel.closest('body > *')!;
      expect(portal).not.toHaveAttribute('inert');
      expect(portal).not.toHaveAttribute('aria-hidden');

      // Ordem de `fechar()`: o fundo é restaurado ANTES de devolver o foco ao
      // hambúrguer — num navegador real, focus() em elemento inerte é no-op.
      const registro: boolean[] = [];
      const focusOriginal = HTMLElement.prototype.focus;
      const spy = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement, ...args) {
        if (this === hamburguer) registro.push(fundoDoHeader.hasAttribute('inert'));
        return focusOriginal.apply(this, args);
      });
      fireEvent.keyDown(document, { key: 'Escape' });
      spy.mockRestore();
      expect(registro).toEqual([false]);

      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull());
      [fundoDoHeader, main].forEach((el) => {
        expect(el).not.toHaveAttribute('inert');
        expect(el).not.toHaveAttribute('aria-hidden');
      });
      expect(footer).not.toHaveAttribute('inert');
      expect(footer).toHaveAttribute('aria-hidden', 'true'); // pré-existente, preservado
      expect(document.activeElement).toBe(hamburguer);
    } finally {
      main.remove();
      footer.remove();
    }
  });

  it('prende o foco dentro do painel nas duas direcoes (Tab e Shift+Tab)', async () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    const painel = await screen.findByRole('dialog', { name: 'Menu' });
    const focaveis = () =>
      Array.from(painel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));

    await waitFor(() => expect(painel.contains(document.activeElement)).toBe(true));

    const primeiro = focaveis()[0];
    const ultimo = focaveis().at(-1)!;
    // Desde a Task 18 (F3a) o primeiro focável é o ✕ do painel, e o último
    // continua sendo o CTA do WhatsApp — o trap cobre primeiro↔último.
    expect(primeiro).toHaveAttribute('aria-label', 'Fechar menu');
    expect(ultimo).toHaveTextContent('Agendar avaliação');

    // Tab a partir do último elemento focável volta pro primeiro.
    ultimo.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(primeiro);

    // Shift+Tab a partir do primeiro vai pro último.
    primeiro.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(ultimo);
  });

  it('sem Lenis na arvore, trava o scroll com position:fixed e desfaz ao fechar', async () => {
    // Sem <MotionProvider> na árvore (Header sozinho, como nos outros
    // testes deste arquivo), useLenis() é sempre null — o próprio hook é
    // testado em useCapability.test.tsx/motion.test.tsx. O que este teste
    // prova é o fallback: sem Lenis, a trava usa position:fixed (não
    // overflow:hidden, que remove a scrollbar e causa salto lateral) e
    // desfaz exatamente isso ao fechar.
    render(<Header />);
    const hamburguer = screen.getByRole('button', { name: 'Abrir menu' });

    fireEvent.click(hamburguer);
    await waitFor(() => expect(document.body.style.position).toBe('fixed'));

    fireEvent.click(hamburguer);
    await waitFor(() => expect(document.body.style.position).toBe(''));
  });

  it('sob prefers-reduced-motion, abre e fecha sem chamar a timeline GSAP (só opacity)', async () => {
    // O GSAP não passa pelo reset global de transition-duration do
    // globals.css (GSAP não usa `transition` do CSS, interpola por conta
    // própria a cada frame) — StaggeredMenu precisa desligar a timeline
    // inteira sob reduced motion, não só encurtar. Este teste troca o stub
    // de matchMedia só aqui (reduce:true) e confirma que abrir/fechar
    // continua funcionando (aria-hidden/inert corretos) sem lançar erro.
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(<Header />);
    const hamburguer = screen.getByRole('button', { name: 'Abrir menu' });

    fireEvent.click(hamburguer);
    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog).not.toHaveAttribute('aria-hidden', 'true');
      expect(dialog).not.toHaveAttribute('inert');
    });

    fireEvent.click(hamburguer);
    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-hidden', 'true');
      expect(dialog).toHaveAttribute('inert');
    });

    // Restaura o stub padrão (reduce:false) pros testes seguintes do arquivo.
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });
});

describe('IlhaContato', () => {
  // A ilha (DynamicIsland do cult-ui, Task 21) substituiu o WhatsAppFab e
  // herdou o contrato dele: fica inalcancavel enquanto o hero esta em tela e
  // entra quando ele sai por cima. O nome acessivel do link vem do texto
  // visivel, nao de um aria-label — trocar um pelo outro violaria o criterio
  // 2.5.3 (Label in Name), porque o texto na tela e o nome anunciado
  // deixariam de bater.
  const observadorDoHero = () =>
    IntersectionObserverStub.instances.filter((i) => !i.options?.rootMargin).at(-1)!;

  it('mostra o convite de contato', () => {
    render(<IlhaContato />);
    expect(screen.getByRole('link', { name: /Agendar avaliação/i })).toBeInTheDocument();
  });

  it('fica inalcancavel enquanto o hero esta em tela e alcancavel quando ele sai por cima', async () => {
    IntersectionObserverStub.instances.length = 0;
    render(<IlhaContato />);
    const link = screen.getByRole('link', { name: /Agendar avaliação/i });

    // Estado inicial: nada rolou ainda, a ilha não compete com o CTA do hero.
    expect(link).toHaveAttribute('tabindex', '-1');
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/551122740228'));

    const instancia = observadorDoHero();

    // Hero ainda visível (perto do topo): continua escondida.
    act(() => {
      instancia.callback(
        [{ isIntersecting: true, boundingClientRect: { top: 50 } } as IntersectionObserverEntry],
        instancia as unknown as IntersectionObserver
      );
    });
    expect(screen.getByRole('link', { name: /Agendar avaliação/i })).toHaveAttribute('tabindex', '-1');

    // Hero saiu por cima da viewport: a ilha entra.
    act(() => {
      instancia.callback(
        [{ isIntersecting: false, boundingClientRect: { top: -10 } } as IntersectionObserverEntry],
        instancia as unknown as IntersectionObserver
      );
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Agendar avaliação/i })).toHaveAttribute('tabindex', '0');
    });
  });

  it('nao afirma nada que a clinica nao confirmou', () => {
    const { container } = render(<IlhaContato />);
    const texto = container.textContent ?? '';
    expect(texto).not.toMatch(/★|estrelas/i);
    expect(texto).not.toMatch(/aberto agora|fechado agora/i);
    expect(texto).not.toMatch(/convênio|convenio/i);
  });
});
