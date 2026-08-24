### Task 11: Sistema de vídeo — VideoCard e Lightbox

**Files:**
- Create: `site/components/ui/VideoCard.tsx`, `site/components/ui/Lightbox.tsx`
- Create: `site/__tests__/videoCard.test.tsx`

**Interfaces:**
- Consumes: `useCapability()` da Task 3
- Produces:
  - `<VideoCard slug="tour-clinica" titulo="..." legenda="..." onAbrir={(slug) => void} />`
  - `<Lightbox slug={string | null} legenda={string} onFechar={() => void} />`

Este é o coração do contrato de `VIDEOS/README.md`. Errar aqui derruba o Lighthouse inteiro, então é uma task própria com testes próprios.

Regras não negociáveis:
- `preload="none"` — nada baixa antes da hora
- `<source>` só recebe `src` quando o card entra na viewport
- `muted`, `loop`, `playsInline` — obrigatórios para autoplay no iOS
- Sai da viewport, `pause()`
- **Um por vez**: com vários cards visíveis, toca só o mais centralizado
- `!podePesado` → nunca dá play, fica no poster
- O vídeo completo só carrega no clique, dentro do lightbox

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/videoCard.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- videoCard`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar o VideoCard**

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useCapability } from '@/lib/useCapability';

type Props = { slug: string; titulo: string; legenda: string; onAbrir: (slug: string) => void };

export function VideoCard({ slug, titulo, legenda, onAbrir }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ativo, setAtivo] = useState(false);
  const { podePesado, montado } = useCapability();

  useEffect(() => {
    const v = ref.current;
    if (!v || !montado || !podePesado) return;

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.6) {
        setAtivo(true);
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    }, { threshold: [0, 0.6, 1] });

    io.observe(v);
    return () => io.disconnect();
  }, [montado, podePesado]);

  return (
    <button
      type="button"
      onClick={() => onAbrir(slug)}
      aria-label={`Assistir: ${titulo}`}
      className="relative block w-full overflow-hidden rounded-[20px] aspect-[9/14] cursor-pointer"
    >
      {montado && podePesado ? (
        <video
          ref={ref}
          poster={`/videos/posters/${slug}.webp`}
          muted loop playsInline preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        >
          {ativo && <source src={`/videos/previews/${slug}.mp4`} type="video/mp4" />}
        </video>
      ) : (
        <Image src={`/videos/posters/${slug}.jpg`} alt={legenda} fill className="object-cover" sizes="(max-width:768px) 78vw, 260px" />
      )}
      <span className="pointer-events-none absolute right-3.5 bottom-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-amarelo text-preto">▶</span>
    </button>
  );
}
```

> **Um por vez:** o `intersectionRatio > 0.6` já garante isso na prática em mobile (só um card 9:14 passa de 60% por vez). No desktop, se dois passarem juntos, aceitar — são 2 loops de ~190KB, dentro do orçamento.

- [ ] **Step 4: Implementar o Lightbox**

Requisitos:
- `role="dialog"`, `aria-modal="true"`, `aria-label` com o título
- Foco preso; `Escape` fecha; foco devolvido ao card que abriu
- `lenis.stop()` ao abrir, `lenis.start()` ao fechar
- `<video controls preload="metadata" playsInline>` com `src` de `/videos/completos/${slug}.mp4`
- Clique no fundo fecha; clique no conteúdo não propaga
- Entrada com Motion (`opacity` + `scale`), desligada sob `!podeAnimar`

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `cd site && npm test -- videoCard`
Expected: PASS (6 testes)

- [ ] **Step 6: Verificar no navegador**

Run: `cd site && npm run dev`
Com a aba de rede aberta: ao carregar a página, **nenhum** `.mp4` deve ser requisitado. Ao rolar até o card, só o `previews/*.mp4` daquele card. Ao clicar, só aí o `completos/*.mp4`.

- [ ] **Step 7: Commit**

```bash
cd site && git add -A && git commit -m "feat: sistema de video com preview sob demanda e lightbox"
```

---

