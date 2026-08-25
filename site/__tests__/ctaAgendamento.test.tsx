import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CtaAgendamento } from '@/components/ui/CtaAgendamento';
import { ENDERECO, INSTAGRAM } from '@/lib/contact';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', class {
  observe() {} unobserve() {} disconnect() {}
});

describe('CtaAgendamento', () => {
  it('o gatilho é um botão de verdade, e diz que abre algo', () => {
    render(<CtaAgendamento />);
    // <button> nativo, não <div role="button">: o original do cult-ui usa um
    // div e reimplementa Enter/Espaco a mao. Ver a modificacao 3 em
    // components/cultui/Expandable.tsx.
    const gatilho = screen.getByRole('button', { name: /Agendar minha avaliação/i });
    expect(gatilho.tagName).toBe('BUTTON');
    expect(gatilho).toHaveAttribute('aria-expanded', 'false');
    expect(gatilho).toHaveAttribute('aria-controls');
  });

  it('fechado, não há link do WhatsApp na página', () => {
    render(<CtaAgendamento />);
    expect(screen.queryByRole('link', { name: /WhatsApp/i })).toBeNull();
  });

  it('aberto, mostra as informações da clínica e o link do WhatsApp', () => {
    render(<CtaAgendamento />);

    fireEvent.click(screen.getByRole('button', { name: /Agendar minha avaliação/i }));

    expect(screen.getByRole('button', { name: /Agendar minha avaliação/i }))
      .toHaveAttribute('aria-expanded', 'true');

    const whats = screen.getByRole('link', { name: /Falar no WhatsApp/i });
    expect(whats).toHaveAttribute('href', expect.stringContaining('wa.me/551122740228'));
    expect(whats).toHaveAttribute('target', '_blank');
    expect(whats).toHaveAttribute('rel', expect.stringContaining('noopener'));

    // As informacoes que o dono do projeto pediu no cartao (a faixa logo
    // abaixo do hero): especialidades, a frase da cadeira unica, endereco e
    // Instagram.
    expect(screen.getByText(/Facetas • Implantes • Próteses/i)).toBeInTheDocument();
    expect(screen.getByText(/cadeira única/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${ENDERECO.rua}, ${ENDERECO.numero}`, 'i'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '@smileipiranga' })).toHaveAttribute('href', INSTAGRAM);
  });

  it('o cartão não inventa horário, nota nem convênio', () => {
    const { container } = render(<CtaAgendamento />);
    fireEvent.click(screen.getByRole('button', { name: /Agendar minha avaliação/i }));

    const texto = container.textContent ?? '';
    expect(texto).not.toMatch(/★|estrelas/i);
    expect(texto).not.toMatch(/convênio|convenio/i);
    expect(texto).not.toMatch(/\bseg(unda)?\b.*\bsex(ta)?\b/i); // faixa de horário
    expect(texto).not.toMatch(/\d+h(\d+)?\s*(às|as|-)\s*\d+h/i);
  });
});
