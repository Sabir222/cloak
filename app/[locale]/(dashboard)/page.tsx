import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimatedStats } from "@/components/landing/animated-stats";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { AgentCard, PackCard } from "@/components/landing/cards";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { ToolLogos } from "@/components/landing/tool-logos";
import { MorphingText } from "@/components/ui/morphing-text";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getAllAgents, getAllPacks } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("home.title"),
    description: t("home.description"),
  };
}

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

        {/* Top-left decorative SVG cluster — desktop only */}
        <div className="hidden md:block absolute top-0 left-0 -translate-x-[10px] -translate-y-[165px] opacity-90 pointer-events-none select-none z-0">
          <img
            src="/svg-all.svg"
            alt=""
            className="w-[60px] sm:w-[320px] md:w-[250px]"
            aria-hidden="true"
          />
        </div>

        {/* Bottom-right decorative SVG cluster — desktop only */}
        <div className="hidden md:block absolute bottom-0 right-0 translate-x-[10px] translate-y-[120px] opacity-90 pointer-events-none select-none z-0">
          <img
            src="/svg-all.svg"
            alt=""
            className="w-[70px] sm:w-[320px] md:w-[250px]"
            aria-hidden="true"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="block md:hidden mb-6">
            <img
              src="/svg-all-2.svg"
              alt=""
              className="mx-auto w-[300px] h-auto"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t("heroTitle")}
          </h1>
          <div className="h-20 mt-2">
            <MorphingText
              texts={["an Engineer", "a Designer", "an Analyst", "a Strategist"]}
              className="!text-3xl sm:!text-4xl md:!text-5xl lg:!text-6xl !text-orange-500 !h-full"
            />
          </div>
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
        <ToolLogos />
      </section>

      {/* ─── Stats ─── */}
      <section className="relative py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedStats
            agentCount={agents.length}
            packCount={packs.length}
            divisionCount={divisionCount}
          />
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
                <div key={pack.id} className="relative">
                  <PackCard
                    name={pack.name}
                    description={pack.description}
                    priceCents={pack.priceCents}
                    agentCount={pack.agentCount}
                    bundleType={pack.bundleType}
                    isFeatured={i === 1}
                    badge={i === 1 ? tPricing("popular") : undefined}
                    variant="pricing"
                    translations={{
                      oneTime: tPricing("oneTime"),
                      agentsIncluded: tPricing("agentsIncluded"),
                      skillPackContent: t("skillPackContent"),
                      getPack: tPricing("getPack"),
                      popular: tPricing("popular"),
                    }}
                    className={
                      i === 1
                        ? "bg-gradient-to-b from-orange-50/50 to-white"
                        : ""
                    }
                    cta={
                      <Link href={`/packs/${pack.slug}`} className="block">
                        <Button
                          className="w-full rounded-full"
                          variant={i === 1 ? "default" : "outline"}
                        >
                          {tPricing("getPack")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    }
                  />
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

      <HowItWorksSection />

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
              <AgentCard
                key={agent.id}
                emoji={agent.emoji}
                name={agent.name}
                division={agent.division}
                description={agent.description}
                size="small"
              />
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

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-8">
          <div className="hidden md:block flex-shrink-0 self-stretch pointer-events-none select-none">
            <img
              src="/svg-all.svg"
              alt=""
              className="h-full w-auto"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 max-w-3xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {t("faqTitle")}
              </h2>
            </div>
            <div>
              <FaqAccordion
                items={[
                  { q: t("faq1Q"), a: t("faq1A") },
                  { q: t("faq2Q"), a: t("faq2A") },
                  { q: t("faq3Q"), a: t("faq3A") },
                  { q: t("faq4Q"), a: t("faq4A") },
                  { q: t("faq5Q"), a: t("faq5A") },
                ]}
              />
            </div>
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
