import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/sections/Hero';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Hero', () => {
  it('usa a headline da marca como h1 unico', () => {
    render(<Hero onAbrirVideo={() => {}} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Seu novo sorriso começa aqui/i);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leva o CTA principal ao WhatsApp', () => {
    render(<Hero onAbrirVideo={() => {}} />);
    expect(screen.getByRole('link', { name: /Agendar minha avaliação/i }))
      .toHaveAttribute('href', expect.stringContaining('wa.me/551122740228'));
  });

  it('dispara o tour ao clicar no card de video', () => {
    const abrir = vi.fn();
    render(<Hero onAbrirVideo={abrir} />);
    screen.getByRole('button', { name: /Tour pela clínica/i }).click();
    expect(abrir).toHaveBeenCalledOnce();
  });

  it('descreve a foto do hero para leitor de tela', () => {
    render(<Hero onAbrirVideo={() => {}} />);
    expect(screen.getByAltText(/Paciente sorrindo na Smile/i)).toBeInTheDocument();
  });

  it('nao afirma numero que a clinica nao tem', () => {
    const { container } = render(<Hero onAbrirVideo={() => {}} />);
    expect(container.textContent).not.toMatch(/\d+\s*\+/);
    expect(container.textContent).not.toMatch(/★|estrelas/);
  });
});
