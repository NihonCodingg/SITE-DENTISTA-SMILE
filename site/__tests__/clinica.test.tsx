import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Clinica } from '@/components/sections/Clinica';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', class {
  observe() {} unobserve() {} disconnect() {}
});

describe('Clinica', () => {
  it('mantem o texto do ambiente', () => {
    render(<Clinica onAbrirVideo={() => {}} />);
    expect(screen.getByRole('heading', { level: 2 }))
      .toHaveTextContent(/Um lugar onde dá vontade de sentar e conversar/i);
  });

  it('nao manda o usuario para fora do site', () => {
    const { container } = render(<Clinica onAbrirVideo={() => {}} />);
    const externos = Array.from(container.querySelectorAll('a[target="_blank"]'));
    expect(externos).toHaveLength(0);
  });

  it('abre o video da recepcao no lightbox', () => {
    const abrir = vi.fn();
    render(<Clinica onAbrirVideo={abrir} />);
    screen.getByRole('button', { name: /recepção/i }).click();
    expect(abrir).toHaveBeenCalledWith('recepcao');
  });
});
