"use client"

import { useEffect, useRef, forwardRef, type ReactNode } from "react"
import rough from "roughjs"
import { cn } from "@/lib/utils"

interface RoughCircleProps {
  children: ReactNode
  className?: string
  color?: string
  fill?: string
}

export const RoughCircle = forwardRef<HTMLDivElement, RoughCircleProps>(({ children, className, color = "#ea580c", fill }, ref) => {
  const innerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const container = innerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    const rc = rough.svg(svg)

    function draw() {
      if (!container || !svg) return
      const rect = container.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (w === 0 || h === 0) return

      svg.innerHTML = ""
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`)

      const cx = w / 2
      const cy = h / 2
      const rx = w / 2 - 3
      const ry = h / 2 - 3

      const node = rc.ellipse(cx, cy, rx * 2, ry * 2, {
        stroke: color,
        strokeWidth: 2,
        roughness: 0.5,
        bowing: 1,
        fill: fill || undefined,
        fillStyle: fill ? "solid" : undefined,
      })
      svg.appendChild(node)
    }

    draw()

    const observer = new ResizeObserver(draw)
    observer.observe(container)
    return () => observer.disconnect()
  }, [color, fill])

  return (
    <div
      ref={(node) => {
        ;(innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      }}
      className={cn("relative", className)}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ overflow: "visible" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
})
