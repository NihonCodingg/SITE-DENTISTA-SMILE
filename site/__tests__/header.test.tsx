import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

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
});

describe('WhatsAppFab', () => {
  it('tem rotulo acessivel', () => {
    render(<WhatsAppFab />);
    expect(screen.getByLabelText('Falar no WhatsApp')).toBeInTheDocument();
  });
});
