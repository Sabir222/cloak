"use client"

import { useRef } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Package, Sparkles } from "lucide-react"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { cn } from "@/lib/utils"

const TOOLS = [
  { name: "Claude Code", domain: "anthropic.com" },
  { name: "Cursor", domain: "cursor.com" },
  { name: "Windsurf", domain: "codeium.com" },
  { name: "VS Code", domain: "code.visualstudio.com" },
  { name: "GitHub Copilot", domain: "github.com" },
  { name: "OpenCode", domain: "opencode.ai" },
]

function Circle({
  ref,
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
  ref?: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={ref}
      className={cn(
        "group relative z-10 flex size-14 items-center justify-center rounded-full border-2 bg-white p-3 shadow-lg shadow-black/5 backdrop-blur-sm dark:bg-black dark:border-neutral-800",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function HowItWorksSection() {
  const t = useTranslations("landing")
  const containerRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const rightRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t("howTitle")}
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            {t("howDescription")}
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div
            className="relative flex h-[500px] items-center justify-center p-10"
            ref={containerRef}
          >
            <div className="absolute left-0 md:left-10 top-1/2 -translate-y-1/2 z-10">
              <Circle ref={leftRef}>
                <Package className="text-orange-500" />
              </Circle>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <Circle ref={centerRef} className="size-16 border-orange-300 bg-orange-50">
                <Sparkles className="size-6 text-orange-500" />
              </Circle>
            </div>

            <div className="absolute right-0 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-10">
              {TOOLS.map((tool, i) => (
                <Circle key={tool.name} ref={rightRefs[i]}>
                  <Image
                    src={`https://img.logo.dev/${tool.domain}?token=pk_euSmmEzBSfCQ-Ji0YuzmaQ`}
                    alt={tool.name}
                    width={24}
                    height={24}
                    className="size-6 object-contain"
                  />
                </Circle>
              ))}
            </div>

            <AnimatedBeam
              containerRef={containerRef}
              fromRef={leftRef}
              toRef={centerRef}
              gradientStartColor="#f97316"
              gradientStopColor="#f97316"
              pathColor="#f97316"
              pathOpacity={0.15}
            />

            {rightRefs.map((ref, i) => (
              <AnimatedBeam
                key={i}
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={ref}
                curvature={(i - 2.5) * 20}
                gradientStartColor="#f97316"
                gradientStopColor="#f97316"
                pathColor="#f97316"
                pathOpacity={0.15}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: 1, title: t("step1Title"), desc: t("step1Description") },
            { step: 2, title: t("step2Title"), desc: t("step2Description") },
            { step: 3, title: t("step3Title"), desc: t("step3Description") },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="text-sm font-semibold text-orange-500 mb-1">
                {t("step")} {step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-500 text-sm mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
