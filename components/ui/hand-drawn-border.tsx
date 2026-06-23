'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HandDrawnBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
  strokeWidth?: number;
  borderRadius?: number;
  padding?: string;
  doubleLine?: boolean;
  tripleLine?: boolean;
  sketchAmount?: number;
}

export function HandDrawnBorder({
  children,
  className,
  color = '#000',
  strokeWidth = 3,
  borderRadius = 16,
  padding = 'p-6 md:p-8',
  doubleLine = true,
  tripleLine = false,
  sketchAmount = 4,
}: HandDrawnBorderProps) {
  const id = useId();

  const sketchFilter = (
    <filter
      id={`sketch-${id}`}
      x="-10%"
      y="-10%"
      width="120%"
      height="120%"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.035"
        numOctaves="4"
        seed={1}
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={sketchAmount}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  );

  return (
    <div className={cn('relative', className)}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <defs>{sketchFilter}</defs>

        {/* Main thick line */}
        <rect
          x="1.5%"
          y="1.5%"
          width="97%"
          height="97%"
          rx={borderRadius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#sketch-${id})`}
        />

        {/* Second sketchy line */}
        {doubleLine && (
          <rect
            x="2%"
            y="2%"
            width="96%"
            height="96%"
            rx={borderRadius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
            strokeDasharray="3 4"
            filter={`url(#sketch-${id})`}
          />
        )}

        {/* Third accent line for extra sketchiness */}
        {tripleLine && (
          <rect
            x="1%"
            y="1%"
            width="98%"
            height="98%"
            rx={borderRadius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 0.35}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            strokeDasharray="2 5"
            filter={`url(#sketch-${id})`}
          />
        )}
      </svg>

      <div className={cn('relative z-10', padding)}>{children}</div>
    </div>
  );
}
