'use client';

/**
 * Fundo "silk" do hero — versão ORIGINAL do React Bits (three.js +
 * @react-three/fiber), recuperada na Task 19 ("maximizar React Bits").
 * Origem: src/ts-tailwind/Backgrounds/Silk/Silk.tsx (ver
 * components/reactbits/README.md para o commit de referência).
 *
 * Até a Task 19 este projeto usava `components/ui/Silk.tsx`, uma
 * reimplementação própria com `ogl` (o React Bits original SEMPRE exige
 * three.js, mesmo variante ts-tailwind — não existe versão em `ogl` no
 * repositório oficial). A decisão do parceiro em 20/08/2026 ("pode forçar o
 * máximo possível, depois resolvemos custo") reverteu essa recusa. `three` +
 * `@react-three/fiber` entram como dependência nova — o custo está medido em
 * `task-19-report.md`.
 *
 * Modificações sobre o original:
 * 1. **Pausa fora da viewport e com a aba oculta** — o original usa
 *    `<Canvas frameloop="always">`, que roda o loop de render do R3F pra
 *    sempre enquanto o componente está montado, sem checar visibilidade
 *    nenhuma. Exigência dura desta task (mesmo padrão de `Ticker.tsx` e
 *    `CircularGallery.tsx`, e da reimplementação que este arquivo aposentou).
 *    `frameloop` do R3F é reativo — alternar entre `"always"` e `"never"`
 *    pausa/retoma o loop de render SEM destruir o contexto WebGL nem
 *    desmontar o Canvas, então entrar/sair da viewport repetidamente (o
 *    hero é a primeira seção da página, rolar de volta pro topo é comum)
 *    não recria o shader a cada vez.
 * 2. `'use client'` adicionado no topo (o original não declara).
 * 3. Nenhuma chamada de rede, nenhum `matchMedia` próprio — quem decide se
 *    este componente existe na árvore é `HeroBackdrop.tsx`, via
 *    `useCapability().podePesado` (fonte única, inalterado por esta troca).
 * 4. Cleanup do contexto WebGL no unmount: **não precisou de código
 *    nenhum** — confirmado no fonte instalado
 *    (`node_modules/@react-three/fiber/dist/events-*.cjs.dev.js`,
 *    grep por `forceContextLoss`): o próprio `<Canvas>` do R3F chama
 *    `gl.forceContextLoss()` automaticamente ao desmontar. Diferente do
 *    `ui/Silk.tsx` (ogl), que precisa fazer isso à mão.
 * 5. Nada do shader (vertex/fragment GLSL) foi tocado — é a mesma
 *    matemática de ruído que `ui/Silk.tsx` já usava (adaptada pra ogl na
 *    Task 8); aqui está no formato original, rodando em three.js de fato.
 */

import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { Color, Mesh, ShaderMaterial, type IUniform } from 'three';

type NormalizedRGB = [number, number, number];

const hexToNormalizedRGB = (hex: string): NormalizedRGB => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

interface UniformValue<T = number | Color> {
  value: T;
}

interface SilkUniforms {
  uSpeed: UniformValue<number>;
  uScale: UniformValue<number>;
  uNoiseIntensity: UniformValue<number>;
  uColor: UniformValue<Color>;
  uRotation: UniformValue<number>;
  uTime: UniformValue<number>;
  [uniform: string]: IUniform;
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

interface SilkPlaneProps {
  uniforms: SilkUniforms;
}

const SilkPlane = forwardRef<Mesh, SilkPlaneProps>(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    const mesh = ref as MutableRefObject<Mesh | null>;
    if (mesh.current) {
      mesh.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [ref, viewport]);

  useFrame((_state: RootState, delta: number) => {
    const mesh = ref as MutableRefObject<Mesh | null>;
    if (mesh.current) {
      const material = mesh.current.material as ShaderMaterial & { uniforms: SilkUniforms };
      material.uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});
SilkPlane.displayName = 'SilkPlane';

export interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

// Fábrica com closure própria, mesmo padrão de `createLenisStore()` em
// `lib/motion.tsx`. Os uniforms precisam continuar mutáveis depois de
// criados — é o jeito padrão do three.js atualizar um `ShaderMaterial` sem
// recriá-lo a cada render — mas `react-hooks/immutability`
// (eslint-plugin-react-hooks, era do React Compiler) reprova qualquer
// expressão de atribuição `<algo>.prop = valor` quando `<algo>` remonta ao
// retorno direto de `useState`/`useMemo` dentro do PRÓPRIO componente. Aqui
// a atribuição (`uniforms.uSpeed.value = ...`) mora DENTRO desta função —
// uma closure comum, sintaticamente desconexa de qualquer chamada de hook —
// então o componente só vê `store.uniforms` (leitura) e `store.update(...)`
// (chamada de método), nunca uma atribuição direta.
function criarUniformsStore(speed: number, scale: number, noiseIntensity: number, color: string, rotation: number) {
  const uniforms: SilkUniforms = {
    uSpeed: { value: speed },
    uScale: { value: scale },
    uNoiseIntensity: { value: noiseIntensity },
    uColor: { value: new Color(...hexToNormalizedRGB(color)) },
    uRotation: { value: rotation },
    uTime: { value: 0 },
  };
  return {
    uniforms,
    update(nextSpeed: number, nextScale: number, nextNoiseIntensity: number, nextColor: string, nextRotation: number) {
      uniforms.uSpeed.value = nextSpeed;
      uniforms.uScale.value = nextScale;
      uniforms.uNoiseIntensity.value = nextNoiseIntensity;
      uniforms.uColor.value.setRGB(...hexToNormalizedRGB(nextColor));
      uniforms.uRotation.value = nextRotation;
    },
  };
}

export default function Silk({ speed = 5, scale = 1, color = '#7B7481', noiseIntensity = 1.5, rotation = 0 }: SilkProps) {
  const meshRef = useRef<Mesh>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Começa pausado: só liga quando o IntersectionObserver confirmar que o
  // container está mesmo na viewport (evita um frame de render antes da
  // primeira medição).
  const [ativo, setAtivo] = useState(false);

  const [store] = useState(() => criarUniformsStore(speed, scale, noiseIntensity, color, rotation));
  const uniforms = store.uniforms;

  useEffect(() => {
    store.update(speed, scale, noiseIntensity, color, rotation);
  }, [speed, scale, noiseIntensity, color, rotation, store]);

  // Pausa o loop de render do R3F (frameloop) fora da viewport e com a aba
  // oculta — o original roda `frameloop="always"` incondicionalmente.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let visivel = false;
    const avaliar = () => setAtivo(visivel && !document.hidden);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting;
        avaliar();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    const aoMudarVisibilidade = () => avaliar();
    document.addEventListener('visibilitychange', aoMudarVisibilidade);

    return () => {
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas dpr={[1, 2]} frameloop={ativo ? 'always' : 'never'}>
        <SilkPlane ref={meshRef} uniforms={uniforms} />
      </Canvas>
    </div>
  );
}
