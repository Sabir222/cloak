import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Bot,
  Package,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Check,
  Download,
  Mail,
  CreditCard,
  Search,
  Star,
  Users,
  TrendingUp,
  Clock,
  Terminal,
  Cpu,
  MessageSquare,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getAllPacks, getAllAgents } from "@/lib/db/queries";
import { ToolLogos } from "@/components/landing/tool-logos";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "landing" });
  const tPricing = await getTranslations({ locale, namespace: "pricing" });

  const [packs, agents] = await Promise.all([getAllPacks(), getAllAgents()]);

  const featuredPacks = packs.filter((p) => p.isFeatured).slice(0, 3);
  const regularPacks = packs.filter((p) => !p.isFeatured).slice(0, 4);
  const divisionCount = new Set(agents.map((a) => a.division)).size;
  const sampleAgents = agents.slice(0, 8);

  return (
    <main className="overflow-hidden">
      {/* ─── Hero ─── */}
      <section className="relative py-20 sm:py-28 overflow-hidden min-h-[580px] flex items-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-orange-50/50 via-transparent to-transparent" />

        {/* Top-left decorative SVG cluster */}
        <div className="absolute top-0 left-0 -translate-x-[10px] -translate-y-[10px] opacity-90 pointer-events-none select-none z-0">
          <img
            src="/svg-all.svg"
            alt=""
            className="w-[100px] sm:w-[250px]"
            aria-hidden="true"
          />
        </div>

        {/* Bottom-right decorative SVG cluster */}
        <div className="absolute bottom-0 right-0 translate-x-[10px] translate-y-[10px] opacity-90 pointer-events-none select-none z-0">
          <img
            src="/svg-all.svg"
            alt=""
            className="w-[100px] sm:w-[250px]"
            aria-hidden="true"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Sparkles className="size-4" />
            {t("badge")}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t("heroTitle")}{" "}
            <span className="block text-orange-500 mt-2">
              {t("heroTitleHighlight")}
            </span>
          </h1>
          <p className="mt-6 text-base text-gray-500 sm:text-xl max-w-2xl mx-auto">
            {t("heroDescription")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/packs">
              <Button size="lg" className="text-lg rounded-full px-8 h-12">
                {t("browsePacks")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/agents">
              <Button
                size="lg"
                variant="outline"
                className="text-lg rounded-full px-8 h-12"
              >
                {t("buildYourOwn")}
              </Button>
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            {["noSubscription", "instantDownload", "worksEverywhere"].map(
              (key) => (
                <span key={key} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-orange-500" />
                  {t(key)}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ─── Tools bar ─── */}
      <section className="border-y border-gray-100 bg-white py-8">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-gray-400 mb-6 px-4">
          {t("worksWith")}
        </p>
        <ToolLogos />
      </section>

      {/* ─── Stats ─── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: `${agents.length}+`, label: t("statAgents"), icon: Bot },
              {
                value: `${packs.length}`,
                label: t("statPacks"),
                icon: Package,
              },
              {
                value: `${divisionCount}`,
                label: t("statDivisions"),
                icon: Users,
              },
              { value: "10+", label: t("statTools"), icon: Globe },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center size-12 rounded-xl bg-orange-500/10 text-orange-500 mb-3">
                  <Icon className="size-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Packs with Pricing ─── */}
      {featuredPacks.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {t("featuredPacksTitle")}
              </h2>
              <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
                {t("featuredPacksDescription")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPacks.map((pack, i) => (
                <div
                  key={pack.id}
                  className={`relative rounded-2xl p-8 flex flex-col ${
                    i === 1
                      ? "border-2 border-orange-500 shadow-xl bg-gradient-to-b from-orange-50/50 to-white"
                      : "border border-gray-200 bg-white"
                  }`}
                >
                  {i === 1 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold whitespace-nowrap">
                      {tPricing("popular")}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">
                    {pack.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 flex-1">
                    {pack.description}
                  </p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${(pack.priceCents / 100).toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-400 mb-1.5">
                      {tPricing("oneTime")}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {pack.bundleType === "skill-pack"
                      ? t("skillPackContent")
                      : `${pack.agentCount} ${tPricing("agentsIncluded")}`}
                  </div>
                  <Link href={`/packs/${pack.slug}`} className="mt-6 block">
                    <Button
                      className="w-full rounded-full"
                      variant={i === 1 ? "default" : "outline"}
                    >
                      {tPricing("getPack")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/packs"
                className="inline-flex items-center text-orange-500 font-medium hover:text-orange-600"
              >
                {t("viewAllPacks")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── How It Works ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("howTitle")}
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              {t("howDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
            {[
              {
                icon: Search,
                title: t("step1Title"),
                desc: t("step1Description"),
              },
              {
                icon: CreditCard,
                title: t("step2Title"),
                desc: t("step2Description"),
              },
              {
                icon: Mail,
                title: t("step3Title"),
                desc: t("step3Description"),
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 mb-5 relative z-10">
                  <Icon className="size-6" />
                </div>
                <div className="text-sm font-semibold text-orange-500 mb-2">
                  {t("step")} {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("featuresTitle")}
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              {t("featuresDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: t("feature1Title"),
                desc: t("feature1Description"),
              },
              {
                icon: Zap,
                title: t("feature2Title"),
                desc: t("feature2Description"),
              },
              {
                icon: Shield,
                title: t("feature3Title"),
                desc: t("feature3Description"),
              },
              {
                icon: Package,
                title: t("feature4Title"),
                desc: t("feature4Description"),
              },
              {
                icon: Globe,
                title: t("feature5Title"),
                desc: t("feature5Description"),
              },
              {
                icon: Sparkles,
                title: t("feature6Title"),
                desc: t("feature6Description"),
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-gray-200 p-8 hover:border-orange-300 hover:shadow-lg transition-all bg-white"
              >
                <div className="inline-flex items-center justify-center size-12 rounded-xl bg-orange-500/10 text-orange-500 mb-5 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Agent Showcase ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("showcaseTitle")}
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              {t("showcaseDescription")}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sampleAgents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-5 hover:border-orange-300 hover:bg-orange-50/30 transition-colors"
              >
                <div className="text-2xl mb-3">{agent.emoji || "🤖"}</div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {agent.name}
                </h3>
                <p className="mt-1 text-xs text-gray-400 capitalize">
                  {agent.division.replace("-", " ")}
                </p>
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                  {agent.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/agents">
              <Button variant="outline" className="rounded-full">
                {t("browseAllAgents")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── More Packs ─── */}
      {regularPacks.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {t("morePacksTitle")}
              </h2>
              <p className="mt-3 text-gray-500">{t("morePacksDescription")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularPacks.map((pack) => (
                <Link
                  key={pack.id}
                  href={`/packs/${pack.slug}`}
                  className="group rounded-2xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <Package className="h-7 w-7 text-orange-500 mb-4" />
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">
                    {pack.name}
                  </h3>
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                    {pack.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {pack.bundleType === "skill-pack"
                        ? t("skillPackContent")
                        : `${pack.agentCount} ${t("agentsLabel")}`}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${(pack.priceCents / 100).toFixed(0)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Testimonials ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("testimonialsTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: t("testimonial1Name"),
                role: t("testimonial1Role"),
                text: t("testimonial1Text"),
              },
              {
                name: t("testimonial2Name"),
                role: t("testimonial2Role"),
                text: t("testimonial2Text"),
              },
              {
                name: t("testimonial3Name"),
                role: t("testimonial3Role"),
                text: t("testimonial3Text"),
              },
            ].map(({ name, role, text }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-8 border border-gray-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-orange-500 text-orange-500"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {name}
                    </div>
                    <div className="text-xs text-gray-500">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("faqTitle")}
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
              { q: t("faq3Q"), a: t("faq3A") },
              { q: t("faq4Q"), a: t("faq4A") },
              { q: t("faq5Q"), a: t("faq5A") },
            ].map(({ q, a }, i) => (
              <details
                key={i}
                className="group rounded-xl border border-gray-200 p-6 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between font-medium text-gray-900 list-none">
                  {q}
                  <span className="ml-4 text-orange-500 transition-transform group-open:rotate-45 text-xl">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-gray-500 text-sm leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t("ctaTitle")}
          </h2>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            {t("ctaDescription")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/packs">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg rounded-full px-8 h-12"
              >
                {t("browsePacks")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/agents">
              <Button
                size="lg"
                className="text-lg rounded-full px-8 h-12 bg-white text-orange-600 hover:bg-white/90"
              >
                {t("buildYourOwn")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
