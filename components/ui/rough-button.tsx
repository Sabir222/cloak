'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import rough from 'roughjs';
import { cn } from '@/lib/utils';

interface RoughButtonProps {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
  color?: string;
  fill?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function RoughButton({
  children,
  href,
  className,
  onClick,
  color = '#ea580c',
  fill = 'transparent',
  disabled,
  type = 'button',
}: RoughButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const rc = rough.svg(svg);

    function draw() {
      if (!container || !svg) return;
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w === 0 || h === 0) return;

      svg.innerHTML = '';
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      const node = rc.rectangle(4, 4, w - 8, h - 8, {
        stroke: disabled ? '#d1d5db' : color,
        strokeWidth: 2,
        roughness: 2.8,
        fill: fill === 'transparent' ? undefined : fill,
        fillStyle: 'solid',
        bowing: 2,
      });
      svg.appendChild(node);
    }

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [color, fill, disabled]);

  if (href) {
    return (
      <div ref={containerRef} className={cn('relative inline-block', className)}>
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        />
        <a href={href} onClick={onClick} className="relative z-10 inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium no-underline">
          {children}
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      />
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'relative z-10 inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium no-underline',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {children}
      </button>
    </div>
  );
}
