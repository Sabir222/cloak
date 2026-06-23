"use client"

import { useRef } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Package, CreditCard } from "lucide-react"
import { RoughBeam } from "@/components/ui/rough-beam"
import { RoughCircle } from "@/components/ui/rough-circle"

const TOOLS = [
  { name: "Claude Code", domain: "anthropic.com" },
  { name: "Cursor", domain: "cursor.com" },
  { name: "Windsurf", domain: "codeium.com" },
  { name: "Hermes", domain: "hermes-agent.nousresearch.com" },
  { name: "GitHub Copilot", domain: "github.com" },
  { name: "OpenCode", domain: "opencode.ai" },
  { name: "OpenClaw", domain: "openclaw.ai" },
]

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
    useRef<HTMLDivElement>(null),
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("howTitle")}
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            {t("howDescription")}
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div
            className="relative flex h-[360px] items-center justify-center p-6"
            ref={containerRef}
          >
            <div className="absolute left-0 md:left-10 top-1/2 -translate-y-1/2 z-10">
              <RoughCircle ref={leftRef} className="size-10" fill="#F9FAFB">
                <Package className="text-orange-500 size-4" />
              </RoughCircle>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <RoughCircle ref={centerRef} className="size-12" fill="#F9FAFB">
                <CreditCard className="size-5 text-orange-500" />
              </RoughCircle>
            </div>

            <div className="absolute right-0 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10">
              {TOOLS.map((tool, i) => (
                <RoughCircle key={tool.name} ref={rightRefs[i]} className="size-10">
                  <Image
                    src={`https://img.logo.dev/${tool.domain}?token=pk_euSmmEzBSfCQ-Ji0YuzmaQ`}
                    alt={tool.name}
                    width={16}
                    height={16}
                    className="size-4 object-contain"
                  />
                </RoughCircle>
              ))}
            </div>

            <RoughBeam
              containerRef={containerRef}
              fromRef={leftRef}
              toRef={centerRef}
              gradientStartColor="#f97316"
              gradientStopColor="#f97316"
              pathColor="#f97316"
              pathWidth={2}
            />

            {rightRefs.map((ref, i) => (
              <RoughBeam
                key={i}
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={ref}
                curvature={(i - 2.5) * 20}
                gradientStartColor="#f97316"
                gradientStopColor="#f97316"
                pathColor="#f97316"
                pathWidth={2}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { step: 1, title: t("step1Title"), desc: t("step1Description") },
            { step: 2, title: t("step2Title"), desc: t("step2Description") },
            { step: 3, title: t("step3Title"), desc: t("step3Description") },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="text-xs font-semibold text-orange-500 mb-1">
                {t("step")} {step}
              </div>
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
