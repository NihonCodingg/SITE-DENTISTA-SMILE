import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';
import { Localizacao } from '@/components/sections/Localizacao';
import { Faq } from '@/components/sections/Faq';
import { CtaFinal } from '@/components/sections/CtaFinal';
import { FAQ } from '@/lib/content';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Footer', () => {
  it('traz os dados legais obrigatorios', () => {
    render(<Footer />);
    expect(screen.getByText(/CNPJ 48\.000\.577\/0001-20/)).toBeInTheDocument();
    expect(screen.getByText(/Responsável técnico/i)).toBeInTheDocument();
    expect(screen.getByText(/não substitui a consulta odontológica/i)).toBeInTheDocument();
  });

  it('nao inventa nome nem numero de CRO do responsavel tecnico', () => {
    render(<Footer />);
    expect(screen.queryByText(/CRO-SP\s*\d/)).toBeNull();
  });

  it('marca a pendencia do responsavel tecnico com o mesmo tracejado dourado da Task 14', () => {
    render(<Footer />);
    const cro = screen.getByText('CRO-SP a confirmar');
    expect(cro.className).toMatch(/border-dashed/);
    expect(cro.className).toMatch(/border-dourado/);
  });

  it('mostra o whatsapp em amarelo', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /whatsapp/i });
    expect(link.className).toMatch(/text-amarelo/);
  });
});

describe('Localizacao', () => {
  it('usa o numero 507, confirmado pela fachada', () => {
    render(<Localizacao />);
    expect(screen.getByText(/Rua Clemente Pereira, 507/)).toBeInTheDocument();
  });

  it('carrega o mapa de forma preguicosa', () => {
    const { container } = render(<Localizacao />);
    expect(container.querySelector('iframe')).toHaveAttribute('loading', 'lazy');
  });

  it('nao afirma horario de atendimento como fato', () => {
    const { container } = render(<Localizacao />);
    expect(container.textContent).not.toMatch(/8h.{0,4}17h|seg(unda)?[\s.-]*a[\s.-]*sex/i);
  });

  it('traz os dois botoes de contato', () => {
    render(<Localizacao />);
    expect(screen.getByRole('link', { name: /google maps/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument();
  });
});

describe('Faq', () => {
  it('mostra so as duas perguntas confirmadas em lib/content.ts', () => {
    render(<Faq />);
    expect(document.querySelectorAll('details')).toHaveLength(FAQ.length);
    FAQ.forEach((item) => {
      expect(screen.getByText(item.p)).toBeInTheDocument();
    });
  });

  it('usa details/summary nativos', () => {
    const { container } = render(<Faq />);
    expect(container.querySelectorAll('details > summary').length).toBe(FAQ.length);
  });

  // Regressão: a abertura anima com Motion (AnimatePresence + onExitComplete),
  // e o atributo `open` do <details> nativo só é aplicado/removido de forma
  // imperativa por ref (ver Faq.tsx) — não via prop React direta. Este teste
  // prova as duas pontas do ciclo: abrir marca `open=true` de imediato, e
  // fechar só remove `open` depois que a animação de saída termina
  // (`onExitComplete`), nunca antes.
  it('abre e fecha o details de verdade, via ref imperativo pos-animacao', async () => {
    const { container } = render(<Faq />);
    const details = container.querySelectorAll('details')[0];
    const summary = details.querySelector('summary')!;

    expect(details.open).toBe(false);

    fireEvent.click(summary);
    expect(details.open).toBe(true);
    await waitFor(() => expect(screen.getByText(FAQ[0].r)).toBeInTheDocument());

    fireEvent.click(summary);
    // Imediatamente após o clique de fechar, o <details> continua "open" —
    // é isso que segura a animação de saída visível (ver comentário no
    // componente). Só depois que a Motion conclui a saída é que vira false.
    expect(details.open).toBe(true);
    await waitFor(() => expect(details.open).toBe(false));
  });
});

describe('CtaFinal', () => {
  it('usa Caveat (font-script) so na palavra "sorriso"', () => {
    const { container } = render(<CtaFinal />);
    const script = container.querySelectorAll('.font-script');
    expect(script).toHaveLength(1);
    expect(script[0].textContent).toMatch(/sorriso/i);
  });

  it('o botao leva ao whatsapp', () => {
    render(<CtaFinal />);
    const link = screen.getByRole('link', { name: /falar no whatsapp/i });
    expect(link.getAttribute('href')).toContain('wa.me');
  });
});
