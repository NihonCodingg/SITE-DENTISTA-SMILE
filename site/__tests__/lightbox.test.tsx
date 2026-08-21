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

  // Task 18 (F3b): mesmo helper do drawer (lib/fundoInerte.ts). Com o
  // lightbox aberto, tudo que é filho do body e não é o portal do lightbox
  // fica inert + aria-hidden; ao fechar (pelo pai zerando `slug` OU por
  // Escape), volta ao estado anterior. O <div> que a RTL cria no body faz o
  // papel do <main> da página (é onde o gatilho mora).
  it('com o lightbox aberto, o fundo fica inert + aria-hidden; ao fechar, volta ao estado anterior', async () => {
    const header = document.createElement('header');
    const footer = document.createElement('footer');
    footer.setAttribute('aria-hidden', 'true');
    document.body.append(header, footer);
    try {
      const { container, rerender } = render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
      await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());

      [header, footer, container].forEach((el) => {
        expect(el).toHaveAttribute('inert');
        expect(el).toHaveAttribute('aria-hidden', 'true');
      });
      const portal = document.querySelector('[role="dialog"]')!.closest('body > *')!;
      expect(portal).not.toHaveAttribute('inert');
      expect(portal).not.toHaveAttribute('aria-hidden');

      rerender(<Lightbox slug={null} legenda="Tour" onFechar={() => {}} />);
      await waitFor(() => expect(header).not.toHaveAttribute('inert'));
      [header, container].forEach((el) => {
        expect(el).not.toHaveAttribute('inert');
        expect(el).not.toHaveAttribute('aria-hidden');
      });
      expect(footer).not.toHaveAttribute('inert');
      expect(footer).toHaveAttribute('aria-hidden', 'true'); // pré-existente, preservado
    } finally {
      header.remove();
      footer.remove();
    }
  });

  it('ao fechar por Escape, restaura o fundo ANTES de devolver o foco ao gatilho', async () => {
    function Harness() {
      const [slug, setSlug] = useState<string | null>(null);
      return (
        <>
          <button onClick={() => setSlug('tour-clinica')}>Abrir</button>
          <Lightbox slug={slug} legenda="Tour" onFechar={() => setSlug(null)} />
        </>
      );
    }
    const { container } = render(<Harness />);
    const gatilho = screen.getByRole('button', { name: 'Abrir' });
    gatilho.focus();
    fireEvent.click(gatilho);
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());
    expect(container).toHaveAttribute('inert'); // o "main" onde o gatilho mora

    // Num navegador real, focus() em elemento dentro de subárvore inerte é
    // no-op — a ordem restaurar→focar é o que faz o foco voltar de verdade.
    const registro: boolean[] = [];
    const focusOriginal = HTMLElement.prototype.focus;
    const spy = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement, ...args) {
      if (this === gatilho) registro.push(container.hasAttribute('inert'));
      return focusOriginal.apply(this, args);
    });
    fireEvent.keyDown(document, { key: 'Escape' });
    spy.mockRestore();
    expect(registro).toEqual([false]);
    expect(document.activeElement).toBe(gatilho);
  });

  it('trava o scroll da pagina (position:fixed) ao abrir e destrava ao fechar', async () => {
    const { rerender } = render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.body.style.position).toBe('fixed'));

    rerender(<Lightbox slug={null} legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.body.style.position).toBe(''));
  });

  // Task 18 (D): feedback de carregamento. O .mp4 completo só começa a
  // baixar no clique — até o `canplay`, poster do vídeo como fundo e um
  // indicador discreto; depois do `canplay`, o indicador some.
  it('mostra o poster e "Carregando vídeo…" ate o canplay, e some depois', async () => {
    render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.querySelector('video')).not.toBeNull());
    const video = document.querySelector('video')!;
    expect(video).toHaveAttribute('poster', '/videos/posters/tour-clinica.webp');
    expect(screen.getByRole('status')).toHaveTextContent('Carregando vídeo…');

    fireEvent.canPlay(video);
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
  });

  it('o indicador volta quando outro video abre no mesmo lightbox', async () => {
    const { rerender } = render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.querySelector('video')).not.toBeNull());
    fireEvent.canPlay(document.querySelector('video')!);
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());

    rerender(<Lightbox slug="caso-protese" legenda="Caso" onFechar={() => {}} />);
    await waitFor(() => {
      expect(document.querySelector('video')).toHaveAttribute('src', '/videos/completos/caso-protese.mp4');
      expect(screen.getByRole('status')).toHaveTextContent('Carregando vídeo…');
    });
  });

  it('nao deixa dialog nenhum no DOM depois que a saida termina', async () => {
    const { rerender } = render(<Lightbox slug="tour-clinica" legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());

    rerender(<Lightbox slug={null} legenda="Tour" onFechar={() => {}} />);
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
  });
});
