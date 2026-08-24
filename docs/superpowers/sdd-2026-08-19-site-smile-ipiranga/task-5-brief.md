### Task 5: Fundação de motion (Lenis + GSAP ScrollTrigger)

**Files:**
- Create: `site/lib/motion.tsx`, `site/components/ui/Reveal.tsx`
- Create: `site/__tests__/reveal.test.tsx`
- Modify: `site/app/layout.tsx`

**Interfaces:**
- Consumes: `useCapability()` da Task 3
- Produces:
  - `<MotionProvider>` — envolve a árvore, liga Lenis e sincroniza com ScrollTrigger
  - `<Reveal as="div" delay={0} y={24}>` — entrada por scroll, transform/opacity apenas
  - `useLenis(): Lenis | null` — para quem precisar de `scrollTo`

Esta é a espinha do motion da página. Sem Lenis, animação ligada ao scroll treme; com ele, o ScrollTrigger recebe um valor suavizado e as timelines ficam contínuas.

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/reveal.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Reveal } from '@/components/ui/Reveal';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: q.includes('reduce'), media: q,
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Reveal', () => {
  it('renderiza o conteúdo mesmo sem JS de animação', () => {
    render(<Reveal><p>conteúdo visível</p></Reveal>);
    expect(screen.getByText('conteúdo visível')).toBeInTheDocument();
  });

  it('não esconde o conteúdo sob prefers-reduced-motion', () => {
    render(<Reveal><p>sempre legível</p></Reveal>);
    const el = screen.getByText('sempre legível').parentElement!;
    expect(el.style.opacity).not.toBe('0');
  });

  it('aceita a tag do elemento', () => {
    render(<Reveal as="section"><p>x</p></Reveal>);
    expect(document.querySelector('section')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- reveal`
Expected: FAIL — módulo não encontrado

- [ ] **Step 3: Implementar o provider**

Criar `site/lib/motion.tsx`:

```tsx
'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from './useCapability';

const Ctx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(Ctx);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const { podeAnimar, montado } = useCapability();
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!montado || !podeAnimar) return;
    gsap.registerPlugin(ScrollTrigger);

    const l = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.6 });
    setLenis(l);

    l.on('scroll', ScrollTrigger.update);
    const loop = (t: number) => { l.raf(t); raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf.current);
      l.destroy();
      ScrollTrigger.getAll().forEach(s => s.kill());
      setLenis(null);
    };
  }, [montado, podeAnimar]);

  return <Ctx.Provider value={lenis}>{children}</Ctx.Provider>;
}
```

- [ ] **Step 4: Implementar o Reveal**

Criar `site/components/ui/Reveal.tsx`:

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from '@/lib/useCapability';

type Props = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  y?: number;
  className?: string;
};

export function Reveal({ children, as: Tag = 'div', delay = 0, y = 24, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { podeAnimar, montado } = useCapability();

  useEffect(() => {
    const el = ref.current;
    if (!el || !montado || !podeAnimar) return;
    gsap.registerPlugin(ScrollTrigger);

    const anim = gsap.fromTo(el,
      { opacity: 0, y },
      {
        opacity: 1, y: 0, duration: .7, delay, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });

    return () => { anim.scrollTrigger?.kill(); anim.kill(); gsap.set(el, { clearProps: 'all' }); };
  }, [montado, podeAnimar, delay, y]);

  // @ts-expect-error tag dinâmica
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
```

> O conteúdo nasce visível no HTML. A animação só **esconde e revela** depois que o JS confirma que pode animar. Isso garante que quem tem reduced-motion, JS desligado ou falha de rede continua lendo tudo — e evita CLS.

- [ ] **Step 5: Ligar o provider no layout**

Em `site/app/layout.tsx`, envolver `{children}` com `<MotionProvider>`.

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `cd site && npm test -- reveal`
Expected: PASS (3 testes)

- [ ] **Step 7: Commit**

```bash
cd site && git add -A && git commit -m "feat: fundacao de motion com Lenis e ScrollTrigger"
```

---

