'use client';

// Vendorizado de DavidHDev/react-bits — ver README.md deste diretório para
// origem, commit e todas as modificações feitas neste arquivo.

import { useState, useEffect, useRef, type ReactNode, type HTMLAttributes } from 'react';

interface MagnetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  wrapperClassName?: string;
  innerClassName?: string;
}

export default function Magnet({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  // Curvas nativas trocadas pelos tokens da marca (design-guidance.md: "as
  // curvas embutidas do CSS são fracas demais"). --ease-movimento enquanto o
  // cursor puxa o elemento (200ms), --ease-saida quando ele solta e o
  // elemento volta (150ms) — a saída tem que ser mais rápida que a entrada
  // (design-guidance.md: "a saída é sempre mais rápida que a entrada"), as
  // duas dentro do teto de 300ms para qualquer coisa que a pessoa aciona.
  activeTransition = 'transform 0.2s var(--ease-movimento)',
  inactiveTransition = 'transform 0.15s var(--ease-saida)',
  wrapperClassName = '',
  innerClassName = '',
  ...props
}: MagnetProps) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const magnetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Nada de setState aqui dentro: quando disabled=true o efeito só sai sem
    // registrar listener — o valor renderizado (abaixo) é forçado a {0,0}/
    // false diretamente, sem depender de resetar `isActive`/`position` de
    // dentro do efeito (isso violaria a regra `set-state-in-effect` do
    // eslint-plugin-react-hooks do Next 16 — mesma razão de lib/motion.tsx).
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!magnetRef.current) return;

      const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const distX = Math.abs(centerX - e.clientX);
      const distY = Math.abs(centerY - e.clientY);

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        setIsActive(true);
        const offsetX = (e.clientX - centerX) / magnetStrength;
        const offsetY = (e.clientY - centerY) / magnetStrength;
        setPosition({ x: offsetX, y: offsetY });
      } else {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [padding, disabled, magnetStrength]);

  const activeAgora = !disabled && isActive;
  const posAgora = disabled ? { x: 0, y: 0 } : position;
  const transitionStyle = activeAgora ? activeTransition : inactiveTransition;

  return (
    <div ref={magnetRef} className={wrapperClassName} style={{ position: 'relative', display: 'inline-block' }} {...props}>
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${posAgora.x}px, ${posAgora.y}px, 0)`,
          transition: transitionStyle,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}
