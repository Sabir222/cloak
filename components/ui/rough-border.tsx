'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import rough from 'roughjs';
import { cn } from '@/lib/utils';

interface RoughBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
  strokeWidth?: number;
  roughness?: number;
  borderRadius?: number;
  padding?: string;
  fill?: string;
  fillStyle?: 'hachure' | 'solid' | 'zigzag' | 'cross-hatch' | 'dots' | 'dashed' | 'zigzag-line';
  bowing?: number;
}

export function RoughBorder({
  children,
  className,
  color = '#9ca3af',
  strokeWidth = 2,
  roughness = 2,
  borderRadius = 12,
  padding = 'p-5',
  fill,
  fillStyle = 'hachure',
  bowing = 1,
}: RoughBorderProps) {
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

      const half = strokeWidth;
      const node = rc.rectangle(half, half, w - half * 2, h - half * 2, {
        stroke: color,
        strokeWidth,
        roughness,
        bowing,
        fill: fill || undefined,
        fillStyle: fill ? fillStyle : undefined,
      });
      svg.appendChild(node);
    }

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [color, strokeWidth, roughness, bowing, borderRadius, fill, fillStyle]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      />
      <div className={cn('relative z-10', padding)}>{children}</div>
    </div>
  );
}
