'use client';

/**
 * Reflexo diagonal de luz que varre o elemento no hover — recuperado na
 * Task 19 ("maximizar React Bits"). Origem:
 * src/ts-tailwind/Animations/GlareHover/GlareHover.tsx (ver
 * components/reactbits/README.md para o commit de referência).
 *
 * Até a Task 19, `.linha-tratamento`/`.linha-tratamento::after` em
 * `app/globals.css` implementavam este efeito à mão em CSS puro — decisão
 * registrada no README, revertida pela decisão do parceiro ("forçar o
 * máximo possível"). O parceiro decidiu explicitamente aceitar que este
 * componente anima `background-position` (fora da regra "só transform e
 * opacity" do resto do projeto) — o custo está medido em
 * `task-19-report.md`.
 *
 * Modificações sobre o original:
 * 1. **Container deixou de forçar o próprio layout.** O original renderiza
 *    `className="relative grid place-items-center overflow-hidden border
 *    cursor-pointer ${className}"` — um box de `display:grid` centralizado,
 *    com borda e cursor sempre presentes, pensado pra envolver um único
 *    filho decorativo isolado. Isso é incompatível com qualquer elemento
 *    que já tenha seu próprio layout interno (a linha de tratamento é um
 *    grid de 4 colunas — número, miniatura, texto, seta). Removidas `grid
 *    place-items-center`, `border` e `cursor-pointer` do container; ficou
 *    só `relative overflow-hidden` — o mínimo que o efeito precisa
 *    (`position:relative` pro overlay absoluto, `overflow:hidden` pra não
 *    vazar o brilho pra fora da caixa). O layout do conteúdo (`children`)
 *    passa a ser 100% responsabilidade de quem usa o componente.
 * 2. **Defaults deixaram de ser um box de demonstração.** O original
 *    default `width:'500px' height:'500px' background:'#000'
 *    borderRadius:'10px' borderColor:'#333'` — um quadrado preto opaco de
 *    500px, que quebraria visualmente qualquer uso real esquecido de
 *    sobrescrever todas as cinco props. Trocado para `width:'100%'
 *    height:'100%' background:'transparent' borderRadius:'0'
 *    borderColor:'transparent'` — um wrapper transparente que preenche o
 *    pai e não desenha nada por conta própria, mais seguro como default.
 * 3. **Prop `disabled` nova** — mesmo padrão de `Magnet.tsx` (Task 8): não
 *    registra `onMouseEnter`/`onMouseLeave` nem renderiza o `<div>` de
 *    overlay quando `disabled`. Necessário porque este componente usa
 *    handlers de MOUSE (`onMouseEnter`/`onMouseLeave`), não `:hover` de
 *    CSS — em `pointer:coarse` (touch), navegadores mobile podem disparar
 *    um `mouseenter`/`mouseleave` sintético no toque, sem um jeito
 *    confiável de "sair" do hover depois. `design-guidance.md` exige todo
 *    efeito de hover atrás de `pointer:fine` — como este componente não
 *    pode consultar `matchMedia` por conta própria (política deste
 *    projeto: fonte única é `useCapability()`), quem chama decide via essa
 *    prop (ver `components/sections/TratamentoLinha.tsx`).
 * 4. `React.FC`/`interface` trocados por `function` + `type` (consistência
 *    de estilo com os outros arquivos deste diretório) — comportamento
 *    idêntico.
 * 5. Nenhuma chamada de rede, nenhum `matchMedia` próprio, nenhum
 *    `requestAnimationFrame`/observer pra limpar — o componente só reage a
 *    dois eventos de mouse e escreve `style.transition`/`style.
 *    backgroundPosition` diretamente, exatamente como o original.
 */

import { useRef } from 'react';

export type GlareHoverProps = {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function GlareHover({
  width = '100%',
  height = '100%',
  background = 'transparent',
  borderRadius = '0',
  borderColor = 'transparent',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  disabled = false,
  className = '',
  style = {},
}: GlareHoverProps) {
  const hex = glareColor.replace('#', '');
  let rgba = glareColor;
  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[\dA-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const overlayRef = useRef<HTMLDivElement | null>(null);

  const animateIn = () => {
    const el = overlayRef.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.backgroundPosition = '-100% -100%, 0 0';
    el.style.transition = `${transitionDuration}ms ease`;
    el.style.backgroundPosition = '100% 100%, 0 0';
  };

  const animateOut = () => {
    const el = overlayRef.current;
    if (!el) return;
    if (playOnce) {
      el.style.transition = 'none';
      el.style.backgroundPosition = '-100% -100%, 0 0';
    } else {
      el.style.transition = `${transitionDuration}ms ease`;
      el.style.backgroundPosition = '-100% -100%, 0 0';
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(${glareAngle}deg,
        hsla(0,0%,0%,0) 60%,
        ${rgba} 70%,
        hsla(0,0%,0%,0) 100%)`,
    backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '-100% -100%, 0 0',
    pointerEvents: 'none',
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height, background, borderRadius, borderColor, ...style }}
      onMouseEnter={disabled ? undefined : animateIn}
      onMouseLeave={disabled ? undefined : animateOut}
    >
      {!disabled && <div ref={overlayRef} style={overlayStyle} />}
      {children}
    </div>
  );
}
