import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import GlareHover from '@/components/reactbits/GlareHover';
import { TratamentoLinha } from '@/components/sections/TratamentoLinha';

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

describe('TratamentoLinha — gate de pointer:fine (fonte unica useCapability)', () => {
  const props = {
    href: 'https://wa.me/551122740228?text=teste',
    n: '01',
    nome: 'Facetas',
    desc: 'Descrição real do tratamento',
    img: '/img/trat-facetas.jpg',
    temFoto: false,
  };

  it('com ponteiro fino (desktop/mouse), o GlareHover fica habilitado', async () => {
    mockMatchMedia({ ponteiroFino: true });
    const { container } = render(<TratamentoLinha {...props} />);
    await waitFor(() => {
      // Com pointer:fine, o overlay do GlareHover existe (não-disabled).
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.children.length).toBe(2); // overlay + <a>
    });
  });

  it('sem ponteiro fino (touch), o GlareHover fica desabilitado — sem handler de mouse sintetico', async () => {
    mockMatchMedia({ ponteiroFino: false });
    const { container } = render(<TratamentoLinha {...props} />);
    await waitFor(() => {
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.children.length).toBe(1); // só o <a>, sem overlay
    });
  });

  it('continua exibindo nome, numero e link corretos independente do gate', () => {
    mockMatchMedia({ ponteiroFino: true });
    render(<TratamentoLinha {...props} />);
    const link = screen.getByRole('link', { name: /Facetas/i });
    expect(link.textContent).toContain('01');
    expect(link.textContent).toContain(props.desc);
    expect(link).toHaveAttribute('href', props.href);
    expect(link.className).toContain('pressable');
  });
});
