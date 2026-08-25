'use client';

/**
 * Botão com um reflexo especular que corre pela borda seguindo o ponteiro —
 * Task 23, o CTA "Agendar minha avaliação". Origem:
 * src/ts-tailwind/Components/SpecularButton/SpecularButton.tsx (ver
 * components/reactbits/README.md para o commit e a lista completa).
 *
 * Modificações sobre o original:
 * 1. `'use client'` no topo (o original não declara).
 * 2. **Escrita de ref movida do render para `useLayoutEffect`.** O original
 *    faz `propsRef.current = {...}` no corpo do componente — a regra
 *    `react-hooks/refs` do eslint deste Next reprova, e é a mesma correção
 *    que `DepthCarousel`, `OptionWheel` e `ScrollExpand` já levaram.
 * 3. **`reducedMotion` virou prop.** O original não tem noção nenhuma de
 *    movimento reduzido: o laço de `requestAnimationFrame` roda para sempre.
 *    Com `reducedMotion`, o laço não é criado — desenha-se UM quadro, com o
 *    reflexo parado numa diagonal. Reduzir, não zerar: o botão continua com o
 *    brilho na borda, ele só não persegue mais nada.
 * 4. **Pausa fora da viewport e com a aba oculta.** O original mantém o laço
 *    vivo mesmo com o botão fora de tela ou a aba em segundo plano —
 *    exatamente o que o `TextLoop`, o `DriftWall` e a `CircularGallery`
 *    daqui já precisaram ganhar. Um botão de CTA no hero passa a maior parte
 *    da visita fora de tela.
 * 5. **`size="livre"`.** O original só oferece `sm`/`md`/`lg`, cada um com
 *    padding e tamanho de fonte próprios, que brigariam com as classes do
 *    botão deste site. Com `livre`, ele não emite classe de tamanho nenhuma.
 * 6. **`...rest` e `forwardRef`.** O original não repassa props extras nem
 *    a ref. Aqui o botão PRECISA carregar `aria-expanded` e `aria-controls`
 *    (ele é o gatilho do cartão de agendamento) — sem isso, quem usa leitor
 *    de tela não sabe que ele abre algo.
 * 7. **`window.pointermove` só quando há para quem seguir.** O original
 *    registra o listener global sempre; se `followMouse` está desligado ele
 *    fica escutando a página inteira para nada.
 *
 * Sobre o custo: é um contexto WebGL e um laço por instância. `ogl` já estava
 * no projeto (a `CircularGallery` usa), então não entra biblioteca nova — mas
 * quem decide se ele monta é quem chama. Ver `ui/CtaAgendamento.tsx`: o
 * reflexo é literalmente guiado pelo ponteiro, então em aparelho de toque ele
 * não monta, e nem teria o que mostrar.
 */

import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

type ButtonSize = 'sm' | 'md' | 'lg' | 'livre';

export interface SpecularButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'style'> {
  children?: ReactNode;
  size?: ButtonSize;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  className?: string;
  /** Vem de `useCapability().podeAnimar` — o componente não consulta matchMedia. */
  reducedMotion?: boolean;
}

interface ShaderProps {
  radius: number;
  lineColor: string;
  baseColor: string;
  intensity: number;
  shineSize: number;
  shineFade: number;
  thickness: number;
  speed: number;
  followMouse: boolean;
  proximity: number;
  autoAnimate: boolean;
}

const PAD = 20;

const SIZES: Record<ButtonSize, string> = {
  sm: 'text-[0.85rem] px-[22px] py-[10px]',
  md: 'text-[1rem] px-[30px] py-[14px]',
  lg: 'text-[1.15rem] px-10 py-[18px]',
  livre: '',
};

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

const SpecularButton = forwardRef<HTMLButtonElement, SpecularButtonProps>(function SpecularButton(
  {
    children = 'Get Started',
    size = 'lg',
    radius = 18,
    tint = '#ffffff',
    tintOpacity = 0,
    blur = 0,
    textColor = '#f5f5f5',
    lineColor = '#ffffff',
    baseColor = '#525252',
    intensity = 1,
    shineSize = 10,
    shineFade = 40,
    thickness = 1,
    speed = 0.35,
    followMouse = true,
    proximity = 250,
    autoAnimate = false,
    className = '',
    reducedMotion = false,
    ...rest
  },
  refExterna
) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const propsRef = useRef<ShaderProps>({} as ShaderProps);

  // Modificação 2: fora do render.
  useLayoutEffect(() => {
    propsRef.current = {
      radius,
      lineColor,
      baseColor,
      intensity,
      shineSize,
      shineFade,
      thickness,
      speed,
      followMouse,
      proximity,
      autoAnimate,
    };
  });

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx) return;

    const dpr = window.devicePixelRatio || 1;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [0.32, 0.32, 0.32] },
        uIntensity: { value: 1 },
        uShineSize: { value: 0.17 },
        uShineFade: { value: 0.7 },
        uThickness: { value: 1 },
        uBaseWidth: { value: dpr },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    fx.appendChild(gl.canvas);

    const sizeRef = { w: 1, h: 1 };
    const resize = () => {
      const rect = btn.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      sizeRef.w = w;
      sizeRef.h = h;
      renderer.setSize(w + PAD * 2, h + PAD * 2);
      program.uniforms.uCenter.value = [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr];
      program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(btn);
    resize();

    let pointerAngle: number | null = null;
    let proximityT = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.hypot(dx, dy);
      if (dist === 0) {
        const nx = (e.clientX - cx) / (rect.width / 2);
        const ny = (cy - e.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }
      const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
      proximityT = t * t * (3 - 2 * t);
    };
    // Modificação 7: só escuta a página se houver para quem seguir.
    if (followMouse) window.addEventListener('pointermove', onPointerMove);

    let angle = 2.4;
    let idleAngle = 2.4;
    let bright = reducedMotion ? 1 : 0;
    let last = performance.now();
    let raf = 0;

    const lineC = new Color();
    const baseC = new Color();

    const desenhar = (dt: number) => {
      const p = propsRef.current;

      idleAngle += p.speed * dt;
      // `pointerAngle` só é lido depois de confirmado não-nulo; o original
      // dependia do estreitamento implícito de `steer`, que o TypeScript
      // estrito deste projeto não aceita.
      const steer = p.followMouse && pointerAngle !== null && (!p.autoAnimate || proximityT > 0);
      const target = steer && pointerAngle !== null ? pointerAngle : idleAngle;
      const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += diff * (1 - Math.exp(-dt * 7));

      const brightTarget = p.autoAnimate ? 1 : proximityT;
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

      lineC.set(p.lineColor);
      baseC.set(p.baseColor);
      program.uniforms.uAngle.value = angle;
      program.uniforms.uRadius.value = Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
      program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
      program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
      program.uniforms.uIntensity.value = p.intensity * bright;
      program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
      program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
      program.uniforms.uThickness.value = p.thickness * dpr;
      renderer.render({ scene: mesh });
    };

    // Modificação 3: sob movimento reduzido, um quadro só. O reflexo fica
    // parado na diagonal em que o componente já nasce (`angle = 2.4`).
    if (reducedMotion) {
      desenhar(0);
      return () => {
        ro.disconnect();
        if (followMouse) window.removeEventListener('pointermove', onPointerMove);
        if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    }

    // Modificação 4: o laço só existe enquanto o botão está em tela E a aba
    // está visível.
    let emTela = true;
    let rodando = false;

    const update = (now: number) => {
      raf = requestAnimationFrame(update);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      desenhar(dt);
    };

    const parar = () => {
      if (!rodando) return;
      rodando = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const rodar = () => {
      if (rodando || !emTela || document.hidden) return;
      rodando = true;
      last = performance.now();
      raf = requestAnimationFrame(update);
    };

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entrada]) => {
            emTela = entrada.isIntersecting;
            if (emTela) rodar();
            else parar();
          });
    observer?.observe(btn);
    if (!observer) rodar();

    const aoTrocarVisibilidade = () => (document.hidden ? parar() : rodar());
    document.addEventListener('visibilitychange', aoTrocarVisibilidade);

    return () => {
      parar();
      observer?.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', aoTrocarVisibilidade);
      if (followMouse) window.removeEventListener('pointermove', onPointerMove);
      if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [reducedMotion, followMouse]);

  return (
    <button
      ref={(no) => {
        btnRef.current = no;
        if (typeof refExterna === 'function') refExterna(no);
        else if (refExterna) refExterna.current = no;
      }}
      className={`relative m-0 inline-flex cursor-pointer items-center justify-center border-none leading-none outline-none transition-transform duration-150 active:scale-[0.97] disabled:cursor-default disabled:opacity-55 disabled:active:scale-100 [color:var(--sb-text-color)] [border-radius:var(--sb-radius)] [background:color-mix(in_srgb,var(--sb-tint)_calc(var(--sb-tint-opacity)*100%),transparent)] [backdrop-filter:blur(var(--sb-blur))] focus-visible:outline-2 focus-visible:outline-offset-[3px] ${SIZES[size] || SIZES.md}${className ? ` ${className}` : ''}`}
      style={
        {
          '--sb-radius': `${radius}px`,
          '--sb-tint': tint,
          '--sb-tint-opacity': tintOpacity,
          '--sb-blur': `${blur}px`,
          '--sb-text-color': textColor,
        } as CSSProperties
      }
      {...rest}
    >
      <span
        ref={fxRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-5 z-[1] [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
      />
      <span className="relative z-[2] inline-flex items-center gap-2">{children}</span>
    </button>
  );
});

export default SpecularButton;
