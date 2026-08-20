import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Lightbox } from '@/components/ui/Lightbox';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

// Não há <MotionProvider> nestes testes (mesma escolha de __tests__/header.test.tsx
// para MobileMenu): useLenis() sem Provider devolve null, então o Lightbox usa o
// caminho sem Lenis — trava de scroll por position:fixed. É esse caminho que os
// testes de trava/destrava de scroll abaixo verificam.

describe('Lightbox', () => {
  beforeEach(() => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
  });

  it('nao renderiza dialog nenhum quando slug e null', () => {
    render(<Lightbox slug={null} legenda="x" onFechar={() => {}} />);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('abre com role dialog, aria-modal e aria-label da legenda', async () => {
    render(<Lightbox slug="tour-clinica" legenda="Prévia do tour pela clínica" onFechar={() => {}} />);
    await waitFor(() => {
      const dialog = screen.getByRole('dialog', { name: 'Prévia do tour pela clínica' });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  it('o video completo aponta pro slug certo e tem os atributos exigidos', async () => {
    render(<Lightbox slug="caso-protese" legenda="Caso de prótese" onFechar={() => {}} />);
    await waitFor(() => {
      const video = document.querySelector('video')!;
      expect(video).toHaveAttribute('src', '/videos/completos/caso-protese.mp4');
      expect(video).toHaveAttribute('controls');
      expect(video).toHaveAttribute('preload', 'metadata');
      expect(video).toHaveAttribute('playsinline');
    });
  });

  it('so carrega o video completo quando slug deixa de ser null (no clique)', () => {
    const { rerender } = render(<Lightbox slug={null} legenda="x" onFechar={() => {}} />);
    expect(document.querySelector('video')).toBeNull();

    rerender(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    expect(document.querySelector('video')).toHaveAttribute('src', '/videos/completos/tour-clinica.mp4');
  });

  it('Escape chama onFechar', async () => {
    const fechar = vi.fn();
    render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={fechar} />);
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(fechar).toHaveBeenCalledTimes(1);
  });

  it('clique no fundo chama onFechar', async () => {
    const fechar = vi.fn();
    render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={fechar} />);
    let fundo: Element | null = null;
    await waitFor(() => {
      fundo = document.querySelector('.bg-preto\\/78');
      expect(fundo).not.toBeNull();
    });
    fireEvent.click(fundo!);
    expect(fechar).toHaveBeenCalledTimes(1);
  });

  it('clique no conteudo (video, botao fechar) nao propaga pro fundo', async () => {
    const fechar = vi.fn();
    render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={fechar} />);
    await waitFor(() => expect(document.querySelector('video')).not.toBeNull());

    fireEvent.click(document.querySelector('video')!);
    expect(fechar).not.toHaveBeenCalled();
  });

  it('botao fechar explicito chama onFechar', async () => {
    const fechar = vi.fn();
    render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={fechar} />);
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());

    fireEvent.click(screen.getByRole('button', { name: 'Fechar vídeo' }));
    expect(fechar).toHaveBeenCalledTimes(1);
  });

  it('foco inicial vai para dentro do painel ao abrir', async () => {
    render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => {
      const painel = document.querySelector('[role="dialog"]') as HTMLElement;
      expect(painel).not.toBeNull();
      expect(painel.contains(document.activeElement)).toBe(true);
    });
  });

  it('prende o foco: Tab no ultimo elemento focavel volta pro primeiro', async () => {
    render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());

    const painel = document.querySelector('[role="dialog"]') as HTMLElement;
    const focaveis = Array.from(painel.querySelectorAll('a[href], button:not([disabled]), video[controls]'));
    expect(focaveis.length).toBeGreaterThanOrEqual(2); // botão fechar + vídeo com controls

    const ultimo = focaveis[focaveis.length - 1] as HTMLElement;
    ultimo.focus();
    expect(document.activeElement).toBe(ultimo);

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(focaveis[0]);
  });

  it('prende o foco: Shift+Tab no primeiro elemento focavel vai pro ultimo', async () => {
    render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());

    const painel = document.querySelector('[role="dialog"]') as HTMLElement;
    const focaveis = Array.from(painel.querySelectorAll('a[href], button:not([disabled]), video[controls]'));
    const primeiro = focaveis[0] as HTMLElement;
    primeiro.focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(focaveis[focaveis.length - 1]);
  });

  it('devolve o foco ao elemento que abriu o lightbox, ao fechar', async () => {
    function Harness() {
      const [slug, setSlug] = useState<string | null>(null);
      return (
        <>
          <button onClick={() => setSlug('tour-clinica')}>Abrir</button>
          <Lightbox slug={slug} legenda="Tour" onFechar={() => setSlug(null)} />
        </>
      );
    }
    render(<Harness />);
    const gatilho = screen.getByRole('button', { name: 'Abrir' });
    gatilho.focus();
    fireEvent.click(gatilho);

    await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());
    expect(document.activeElement).not.toBe(gatilho);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(gatilho);
  });

  it('trava o scroll da pagina (position:fixed) ao abrir e destrava ao fechar', async () => {
    const { rerender } = render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.body.style.position).toBe('fixed'));

    rerender(<Lightbox slug={null} legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.body.style.position).toBe(''));
  });

  it('nao deixa dialog nenhum no DOM depois que a saida termina', async () => {
    const { rerender } = render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());

    rerender(<Lightbox slug={null} legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
  });
});
