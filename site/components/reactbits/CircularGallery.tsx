'use client';

/**
 * `CircularGallery` do React Bits, vendorizado de
 * `src/ts-tailwind/Components/CircularGallery/CircularGallery.tsx`. Ver
 * proveniência completa e TODAS as modificações em
 * `site/components/reactbits/README.md`.
 *
 * Usado pela seção "Sorrisos feitos aqui" (Task 13) — quem decide QUANDO
 * montar isto é `site/components/sections/SorrisosGaleria.tsx`, via
 * `next/dynamic({ ssr: false })` e só quando `useCapability().podePesado`.
 * Este arquivo não lê `matchMedia`/`navigator.connection` por conta própria —
 * mantém a fonte única de verdade sobre reduced-motion em `useCapability()`.
 *
 * Resumo das mudanças em relação ao original (detalhes no README):
 *   1. Removido TODO o sistema de legenda em canvas (classe `Title`, texto
 *      por item, carregamento de fonte) — arrastava uma chamada de rede para
 *      `fonts.googleapis.com` e não temos texto nenhum pra desenhar (nunca
 *      inventamos nome de paciente).
 *   2. O loop de render agora PAUSA fora da viewport e com `document.hidden`
 *      (IntersectionObserver), no mesmo padrão de `components/ui/Silk.tsx`.
 *   3. Redimensionamento trocou de `window.resize` para `ResizeObserver` no
 *      container, mesmo padrão de `Silk.tsx`.
 *   4. `destroy()` agora libera o contexto WebGL (`WEBGL_lose_context`), que
 *      o original não fazia.
 *   5. Gestos de arraste/roda começam apenas no container (não em `window`
 *      inteiro) — o original reagia a mousedown/wheel na página toda, então
 *      rolar ou clicar em qualquer lugar do site empurrava a galeria mesmo
 *      fora da tela. `mousemove`/`mouseup`/`touchmove`/`touchend` continuam
 *      em `window` de propósito, para o arraste não travar se o cursor sair
 *      da caixa no meio do gesto.
 *   6. `new App(...)` entra em try/catch: se o WebGL falhar mesmo num
 *      aparelho "pesado" (GPU bloqueada, política do navegador — coisa que
 *      `useCapability()` não prevê), chama `onError` em vez de derrubar a
 *      árvore de React inteira.
 *   7. Container marcado `aria-hidden="true"`, sem `role`/`tabIndex`/
 *      navegação por teclado — o WebGL não é acessível a leitor de tela, e a
 *      Task 13 decidiu manter um equivalente textual em
 *      `SorrisosGaleria.tsx` em vez de expor este canvas ao foco.
 */

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

type GL = Renderer['gl'];

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius?: number;
}

class Media {
  extra = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius: number;
  program!: Program;
  plane!: Mesh;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed = 0;
  isBefore = false;
  isAfter = false;

  constructor({ geometry, gl, image, index, length, scene, screen, viewport, bend, borderRadius = 0 }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.borderRadius = borderRadius;
    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: /* glsl */ `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: /* glsl */ `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);

          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }

  update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

interface AppConfig {
  items?: { image: string }[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: { ease: number; current: number; target: number; last: number; position?: number };
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: { image: string }[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf = 0;
  // Fora da viewport (scroll da página) OU aba oculta: as duas frentes que
  // um canvas animado precisa cobrir para não desenhar invisível — mesma
  // exigência e mesmo mecanismo do Silk.tsx (Task 8).
  visivel = true;
  resizeObserver!: ResizeObserver;
  intersectionObserver!: IntersectionObserver;

  boundOnWheel!: (e: Event) => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;
  boundUpdate!: (t: number) => void;

  isDown = false;
  start = 0;

  constructor(
    container: HTMLElement,
    { items, bend = 2, borderRadius = 0.04, scrollSpeed = 2, scrollEase = 0.06 }: AppConfig
  ) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.boundUpdate = this.update.bind(this);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, borderRadius);
    this.addEventListeners();
    this.addVisibilityObservers();
    this.raf = window.requestAnimationFrame(this.boundUpdate);
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
  }

  createMedias(items: { image: string }[] | undefined, bend: number, borderRadius: number) {
    const galleryItems = items && items.length ? items : [];
    // Duplicado de propósito: é o que faz o loop parecer contínuo em vez de
    // "bater e voltar" nas pontas — o mesmo truque do original. Custo real:
    // dobra as texturas de imagem carregadas na GPU (9 retratos → 18 planos).
    // A rede não dobra (mesma URL, cache do navegador), só a memória de GPU.
    // Registrado no relatório da Task 13 para a Task 17 medir.
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map(
      (data, index) =>
        new Media({
          geometry: this.planeGeometry,
          gl: this.gl,
          image: data.image,
          index,
          length: this.mediasImages.length,
          scene: this.scene,
          screen: this.screen,
          viewport: this.viewport,
          bend,
          borderRadius,
        })
    );
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = (this.scroll.position ?? 0) + distance;
  }

  onTouchUp() {
    this.isDown = false;
  }

  onWheel(e: Event) {
    const wheelEvent = e as WheelEvent;
    const delta = wheelEvent.deltaY || 0;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update(t: number) {
    this.raf = window.requestAnimationFrame(this.boundUpdate);
    // `document.hidden` cobre a aba em segundo plano; `visivel` (o
    // IntersectionObserver abaixo) cobre a seção rolada pra fora da tela
    // com a aba em primeiro plano — as duas frentes do Silk.tsx (Task 8).
    if (!this.visivel || document.hidden) return;
    void t;
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    this.medias.forEach((media) => media.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
  }

  addVisibilityObservers() {
    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.visivel = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    this.intersectionObserver.observe(this.container);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);
  }

  addEventListeners() {
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);

    // Início do gesto só no container (não na página inteira — ver nota de
    // modificação nº5 no topo do arquivo). Continuação do arraste em
    // `window` de propósito: se o cursor sair da caixa no meio do gesto, o
    // arraste não pode travar ali.
    this.container.addEventListener('wheel', this.boundOnWheel, { passive: true });
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    this.intersectionObserver.disconnect();
    this.resizeObserver.disconnect();
    this.container.removeEventListener('wheel', this.boundOnWheel);
    this.container.removeEventListener('mousedown', this.boundOnTouchDown);
    this.container.removeEventListener('touchstart', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    // Sem isto o contexto WebGL nunca é liberado — a task exige cleanup
    // completo, mesmo padrão do Silk.tsx (Task 8).
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (this.renderer?.gl?.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
    }
  }
}

export interface CircularGalleryProps {
  items?: { image: string }[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  /** Chamado se o WebGL falhar ao iniciar mesmo num aparelho "pesado" — quem
   *  chama decide o fallback (ver SorrisosGaleria.tsx). Passe um setState
   *  direto (identidade estável) para não recriar o contexto a cada render. */
  onError?: (falhou: boolean) => void;
}

export default function CircularGallery({
  items,
  bend = 2,
  borderRadius = 0.04,
  scrollSpeed = 2,
  scrollEase = 0.06,
  onError,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let app: App | undefined;
    try {
      app = new App(container, { items, bend, borderRadius, scrollSpeed, scrollEase });
    } catch (err) {
      // WebGL pode falhar mesmo num aparelho "pesado" (GPU na blocklist,
      // política do navegador desligando WebGL) — useCapability() só sabe
      // prever memória/núcleos/rede, não isso. Sem este catch, o erro
      // derrubaria a árvore de React inteira (este componente não tem
      // Error Boundary por perto) e a exigência "ninguém pode ficar sem ver
      // os pacientes" do brief da Task 13 quebraria justo no pior caso.
      console.error('CircularGallery: falha ao iniciar WebGL', err);
      onError?.(true);
      return;
    }

    return () => app?.destroy();
  }, [items, bend, borderRadius, scrollSpeed, scrollEase, onError]);

  // aria-hidden: o WebGL não é acessível a leitor de tela. O equivalente
  // textual dos 9 retratos vive em SorrisosGaleria.tsx (sr-only), fora deste
  // componente — é o que torna correto marcar isto como puramente
  // decorativo em vez de expor um `role`/`tabIndex` que não levaria a nada
  // perceptível para quem usa leitor de tela.
  return (
    <div
      ref={containerRef}
      data-testid="circular-gallery"
      aria-hidden="true"
      className="h-full w-full cursor-grab active:cursor-grabbing"
    />
  );
}
