'use client';

/**
 * Fundo "silk": textura de ruído fluido em movimento lento, usada atrás do
 * hero. NÃO é o componente `Silk` do React Bits — ver
 * `site/components/reactbits/README.md` para o porquê (toda variante do
 * React Bits usa `@react-three/fiber` + `three` para esse componente, e a
 * política de vendorização deste projeto veta `three` para uma textura
 * decorativa). O shader abaixo (vertex/fragment GLSL) é adaptado do shader
 * original do React Bits — mesma matemática de ruído e rotação de UV, MIT +
 * Commons Clause — só o motor de render trocou de three.js para `ogl`, ~10x
 * mais leve e a dependência que o orçamento de performance da Task 8 previa.
 *
 * Importado só via `next/dynamic({ ssr: false })` a partir de
 * `HeroBackdrop.tsx`, montado apenas quando `useCapability().podePesado` —
 * isso é o que garante `ogl` fora do first-load JS da rota.
 */

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uRotation;
  uniform float uNoiseIntensity;

  const float e = 2.71828182845904523536;

  float noise(vec2 texCoord) {
    float G = e;
    vec2 r = (G * sin(G * texCoord));
    return fract(r.x * r.y * (1.0 + texCoord.x));
  }

  vec2 rotateUvs(vec2 uv, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    return rot * uv;
  }

  void main() {
    float rnd = noise(gl_FragCoord.xy);
    vec2 uv = rotateUvs(vUv * uScale, uRotation);
    vec2 tex = uv * uScale;
    float tOffset = uSpeed * uTime;

    tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

    float pattern = 0.6 +
      0.4 * sin(5.0 * (tex.x + tex.y +
        cos(3.0 * tex.x + 5.0 * tex.y) +
        0.02 * tOffset) +
        sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

    vec3 col = uColor * pattern - rnd / 15.0 * uNoiseIntensity;
    gl_FragColor = vec4(col, 1.0);
  }
`;

type Props = {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
};

export default function Silk({ speed = 5, scale = 1, color = '#7B7481', noiseIntensity = 1.5, rotation = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);

  // Cria o contexto WebGL uma única vez. Props dinâmicas atualizam via o
  // efeito de baixo, sem recriar o renderer/programa a cada render.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: true });
    const gl = renderer.gl;
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uNoiseIntensity: { value: noiseIntensity },
        uRotation: { value: rotation },
        uColor: { value: new Color(color) },
      },
    });
    programRef.current = program;
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => renderer.setSize(container.clientWidth, container.clientHeight);
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // O canvas roda em rAF constante (é a natureza de um shader animado).
    // Sem pausar fora da viewport, ele continua desenhando invisível e
    // queimando bateria/GPU — a task exige explicitamente esse corte.
    let visivel = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    let raf = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      // document.hidden cobre a aba em segundo plano; o IntersectionObserver
      // cobre o hero fora da viewport (aba em primeiro plano, mas rolado).
      if (!visivel || document.hidden) return;
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      programRef.current = null;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      container.removeChild(gl.canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const program = programRef.current;
    if (!program) return;
    program.uniforms.uSpeed.value = speed;
    program.uniforms.uScale.value = scale;
    program.uniforms.uNoiseIntensity.value = noiseIntensity;
    program.uniforms.uRotation.value = rotation;
    (program.uniforms.uColor.value as Color).set(color);
  }, [speed, scale, noiseIntensity, rotation, color]);

  return <div ref={containerRef} className="h-full w-full" />;
}
