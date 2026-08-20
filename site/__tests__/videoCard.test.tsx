import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { VideoCard } from '@/components/ui/VideoCard';

function cap(reduz: boolean, economia: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce') ? reduz : false, media: q,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: economia } });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() {} unobserve() {} disconnect() {}
  });
}

describe('VideoCard', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('nunca usa preload diferente de none', () => {
    cap(false, false);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    expect(container.querySelector('video')).toHaveAttribute('preload', 'none');
  });

  it('nao coloca src antes de entrar na viewport', () => {
    cap(false, false);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    expect(container.querySelector('video source')).toBeNull();
  });

  it('tem os atributos que o iOS exige para autoplay', () => {
    cap(false, false);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    const v = container.querySelector('video')!;
    expect(v).toHaveAttribute('muted');
    expect(v).toHaveAttribute('playsinline');
    expect(v).toHaveAttribute('loop');
  });

  it('mostra o poster como imagem de fundo do card', () => {
    cap(false, false);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    expect(container.querySelector('video')).toHaveAttribute('poster', '/videos/posters/tour-clinica.webp');
  });

  it('nao renderiza video nenhum com economia de dados ligada', () => {
    cap(false, true);
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('chama onAbrir com o slug ao clicar', () => {
    cap(false, false);
    const abrir = vi.fn();
    render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={abrir} />);
    screen.getByRole('button', { name: /Tour/i }).click();
    expect(abrir).toHaveBeenCalledWith('tour-clinica');
  });
});

/**
 * O grupo acima usa o stub mínimo de IntersectionObserver do brief (nunca invoca a
 * callback), então não exercita nada do que acontece depois que o card entra na
 * viewport. Esse segundo grupo usa um stub que GUARDA a callback de cada instância
 * — no mesmo espírito do stub de IntersectionObserver em __tests__/header.test.tsx
 * — para poder disparar entradas de interseção manualmente, do jeito que um browser
 * real faria ao rolar a página, e provar as regras não negociáveis do contrato de
 * vídeo: fonte só depois de entrar na viewport, play/pause conforme visibilidade, e
 * "um por vez" entre cards.
 */
class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = [];
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    IntersectionObserverStub.instances.push(this);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

function capComObservador() {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: false } });
  IntersectionObserverStub.instances.length = 0;
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
}

function dispara(instancia: IntersectionObserverStub, isIntersecting: boolean, intersectionRatio: number) {
  act(() => {
    instancia.callback(
      [{ isIntersecting, intersectionRatio } as IntersectionObserverEntry],
      instancia as unknown as IntersectionObserver
    );
  });
}

describe('VideoCard — reprodução coordenada por viewport', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('so anexa a fonte da previa depois que o card entra na viewport', () => {
    capComObservador();
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    expect(container.querySelector('video source')).toBeNull();

    const instancia = IntersectionObserverStub.instances.at(-1)!;
    dispara(instancia, true, 0.8);

    const fonte = container.querySelector('video source');
    expect(fonte).toHaveAttribute('src', '/videos/previews/tour-clinica.mp4');
  });

  it('da play so quando passa do limiar de centralizado e da pause ao sair da viewport', () => {
    capComObservador();
    const { container } = render(<VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />);
    const video = container.querySelector('video')!;
    const play = vi.spyOn(video, 'play');
    const pause = vi.spyOn(video, 'pause');

    const instancia = IntersectionObserverStub.instances.at(-1)!;

    dispara(instancia, true, 0.3); // visivel mas nao centralizado o bastante
    expect(play).not.toHaveBeenCalled();

    dispara(instancia, true, 0.8); // passa do limiar
    expect(play).toHaveBeenCalled();

    dispara(instancia, false, 0); // sai da viewport
    expect(pause).toHaveBeenCalled();
  });

  it('toca so o card mais centralizado quando dois estao acima do limiar ao mesmo tempo', () => {
    capComObservador();
    const { container } = render(
      <>
        <VideoCard slug="tour-clinica" titulo="Tour" legenda="x" onAbrir={() => {}} />
        <VideoCard slug="caso-protese" titulo="Caso" legenda="y" onAbrir={() => {}} />
      </>
    );
    const videos = container.querySelectorAll('video');
    const playA = vi.spyOn(videos[0], 'play');
    const pauseA = vi.spyOn(videos[0], 'pause');
    const playB = vi.spyOn(videos[1], 'play');

    const [instanciaA, instanciaB] = IntersectionObserverStub.instances;

    // A cruza o limiar primeiro (sozinho, é o "mais centralizado" naquele
    // instante) e recebe play() — correto, é a mesma ordem de chegada que um
    // scroll real produziria. O que o coordenador garante é o estado FINAL: assim
    // que B se registra com proporção maior, A é reavaliado e pausado. Por isso a
    // asserção compara a ORDEM das chamadas, não a ausência de play() em A.
    dispara(instanciaA, true, 0.7);
    dispara(instanciaB, true, 0.95); // mais centralizado que A

    expect(playB).toHaveBeenCalled();
    expect(pauseA).toHaveBeenCalled();
    const ultimoPlayA = playA.mock.invocationCallOrder.at(-1) ?? -1;
    const ultimoPauseA = pauseA.mock.invocationCallOrder.at(-1) ?? -1;
    expect(ultimoPauseA).toBeGreaterThan(ultimoPlayA);
  });
});
