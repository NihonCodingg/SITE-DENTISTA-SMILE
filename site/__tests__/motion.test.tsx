import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MotionProvider, useLenis } from '@/lib/motion';

function mockMatchMedia(reduz: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: reduz,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

function mockNavigatorCapaz() {
  vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: false } });
}

function Probe() {
  const lenis = useLenis();
  return <div data-testid="probe">{lenis ? 'tem-lenis' : 'sem-lenis'}</div>;
}

describe('MotionProvider / useLenis', () => {
  it('useLenis() fora do provider devolve null sem quebrar', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('sem-lenis');
  });

  it('não cria o Lenis quando prefers-reduced-motion está ativo', () => {
    mockMatchMedia(true);
    mockNavigatorCapaz();
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('sem-lenis');
  });

  it('cria o Lenis e propaga via useLenis() quando pode animar', () => {
    mockMatchMedia(false);
    mockNavigatorCapaz();
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('tem-lenis');
  });

  it('desmonta sem lançar erro (Lenis destruído, ScrollTriggers mortos)', () => {
    mockMatchMedia(false);
    mockNavigatorCapaz();
    const { unmount } = render(
      <MotionProvider>
        <Probe />
      </MotionProvider>
    );
    expect(() => unmount()).not.toThrow();
  });
});
