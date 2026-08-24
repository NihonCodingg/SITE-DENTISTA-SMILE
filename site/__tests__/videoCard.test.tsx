import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoCard } from '@/components/ui/VideoCard';

const REEL = 'https://www.instagram.com/reel/DQUVleFju0U/';

function montar() {
  return render(
    <VideoCard slug="tour-clinica" titulo="Tour pela clínica" legenda="Tour em vídeo pela Smile." reel={REEL} />
  );
}

/**
 * Até 24/08 este componente carregava uma prévia `.mp4` por
 * IntersectionObserver, coordenava "um vídeo por vez" entre instâncias e abria
 * o vídeo completo num lightbox. Tudo isso saiu: o site não hospeda vídeo, o
 * card é um link para o reel no Instagram da clínica. Os testes daquela
 * maquinaria foram removidos junto com ela — o que sobra é o que o componente
 * promete hoje.
 */
describe('VideoCard', () => {
  it('e um link para o reel no Instagram, em aba nova e com rel seguro', () => {
    montar();
    const link = screen.getByRole('link', { name: /Assistir no Instagram: Tour pela clínica/i });
    expect(link).toHaveAttribute('href', REEL);
    expect(link).toHaveAttribute('target', '_blank');
    // noopener protege a aba de origem de window.opener; noreferrer completa.
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('mostra o poster do slug, com a legenda como texto alternativo', () => {
    const { container } = montar();
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('alt', 'Tour em vídeo pela Smile.');
    // next/image reescreve o src para /_next/image?url=...; o que importa é
    // que a origem seja o poster deste slug.
    expect(decodeURIComponent(img!.getAttribute('src') ?? '')).toContain('/videos/posters/tour-clinica.webp');
  });

  it('nao hospeda video: sem <video> e sem .mp4 no markup', () => {
    const { container } = montar();
    expect(container.querySelectorAll('video')).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/\.mp4/);
  });

  it('tem feedback de toque (pressable) e alvo de 44px no selo de play', () => {
    const { container } = montar();
    const link = container.querySelector('a');
    expect(link?.className).toMatch(/\bpressable\b/);
    const selo = container.querySelector('span.rounded-full');
    expect(selo?.className).toMatch(/\bh-11\b/);
    expect(selo?.className).toMatch(/\bw-11\b/);
  });
});
