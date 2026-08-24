import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import GlareHover from '@/components/reactbits/GlareHover';
import { TratamentosSeletor } from '@/components/sections/TratamentosSeletor';

function mockMatchMedia({ reduz = false, ponteiroFino = true }: { reduz?: boolean; ponteiroFino?: boolean }) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce') ? reduz : q.includes('pointer: fine') ? ponteiroFino : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('GlareHover', () => {
  it('anima o overlay (background-position) no mouseenter e reverte no mouseleave', () => {
    const { container } = render(
      <GlareHover>
        <span>conteúdo</span>
      </GlareHover>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    const overlay = wrapper.firstElementChild as HTMLElement;

    // jsdom normaliza "0 0" pra "0px 0px" no CSSOM — comparação por prefixo
    // (a parte que realmente muda com o hover) em vez de string exata.
    expect(overlay.style.backgroundPosition.startsWith('-100% -100%,')).toBe(true);

    fireEvent.mouseEnter(wrapper);
    expect(overlay.style.backgroundPosition.startsWith('100% 100%,')).toBe(true);

    fireEvent.mouseLeave(wrapper);
    expect(overlay.style.backgroundPosition.startsWith('-100% -100%,')).toBe(true);
  });

  it('disabled: nao registra handlers nem renderiza o overlay', () => {
    const { container } = render(
      <GlareHover disabled>
        <span>conteúdo</span>
      </GlareHover>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    // Sem overlay nenhum — só o children.
    expect(wrapper.children.length).toBe(1);
    expect(wrapper.textContent).toBe('conteúdo');
    // mouseenter não lança (não tem handler nenhum) e não cria nada.
    expect(() => fireEvent.mouseEnter(wrapper)).not.toThrow();
    expect(wrapper.children.length).toBe(1);
  });

  it('nao forca layout proprio no container (sem display:grid/border herdados do original)', () => {
    const { container } = render(
      <GlareHover>
        <span>x</span>
      </GlareHover>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).not.toContain('grid');
    expect(wrapper.className).not.toContain('place-items-center');
    expect(wrapper.className).not.toContain('cursor-pointer');
  });
});

// O gate de pointer:fine mudou de casa na Task 20: a linha de tratamento que
// envolvia o GlareHover virou a roda de opções, e o efeito migrou para a foto
// do painel. O que este bloco guarda continua sendo o mesmo — quem decide se
// o hover existe é `useCapability().pontoFino`, nunca o componente.
describe('TratamentosSeletor — gate de pointer:fine (fonte unica useCapability)', () => {
  const itens = [
    { n: '01', nome: 'Facetas', desc: 'Descrição real do tratamento', img: '/img/trat-facetas.webp', temFoto: false },
    { n: '02', nome: 'Implantes', desc: 'Outra descrição real', img: '/img/trat-implantes.jpg', temFoto: false },
  ];

  const foto = (container: HTMLElement) =>
    container.querySelector('[class*="aspect-[4/3]"]') as HTMLElement;

  it('com ponteiro fino (desktop/mouse), o GlareHover fica habilitado', async () => {
    mockMatchMedia({ ponteiroFino: true });
    const { container } = render(<TratamentosSeletor itens={itens} />);
    await waitFor(() => {
      // Com pointer:fine, o overlay do GlareHover entra como filho extra
      // (o overlay é uma <div> só com estilo inline, sem classe própria).
      expect(foto(container).children.length).toBe(2); // overlay + foto
    });
  });

  it('sem ponteiro fino (touch), o GlareHover fica desabilitado — sem handler de mouse sintetico', async () => {
    mockMatchMedia({ ponteiroFino: false });
    const { container } = render(<TratamentosSeletor itens={itens} />);
    await waitFor(() => {
      expect(foto(container).children.length).toBe(1); // só a foto, sem overlay
    });
  });

  it('continua exibindo nome, numero e CTA do tratamento selecionado', () => {
    mockMatchMedia({ ponteiroFino: true });
    render(<TratamentosSeletor itens={itens} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Facetas' })).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /Falar sobre facetas/i });
    expect(cta.getAttribute('href')).toContain('wa.me/551122740228');
    expect(cta.className).toContain('pressable');
  });
});
