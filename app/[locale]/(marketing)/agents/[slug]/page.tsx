import type { Metadata } from "next";
import { ArrowLeft, Download, Globe, Zap } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShineCard } from "@/components/landing/cards";
import { Link } from "@/i18n/navigation";
import { getAgentProductBySlug } from "@/lib/db/queries";
import { BuyButton } from "./buy-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const agent = await getAgentProductBySlug(slug);
  if (!agent) {
    const t = await getTranslations({ locale, namespace: "seo" });
    return { title: t("notFound.title") };
  }
  return {
    title: agent.name,
    description: agent.description ?? undefined,
  };
}

export default async function AgentProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "agents" });
  const agent = await getAgentProductBySlug(slug);

  if (!agent) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/pricing"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToPricing")}
      </Link>

      <ShineCard className="mb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="sm:max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium mb-3">
              {t("agentProduct")}
            </span>
            <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
            <p className="mt-2 text-gray-500">{agent.description}</p>
            {agent.version && (
              <p className="mt-2 text-xs text-gray-400">
                {t("version")} {agent.version}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-sm text-gray-500">{t("price")}</span>
            <span className="text-3xl font-semibold text-gray-900">
              ${agent.priceCents / 100}
            </span>
            <div className="mt-4">
              <BuyButton
                slug={agent.slug}
                label={t("buyAgent")}
                loadingLabel={t("loading")}
              />
            </div>
          </div>
        </div>
      </ShineCard>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <ShineCard>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-sm font-semibold text-gray-900">{t("sources")}</div>
              <div className="text-xs text-gray-500">15+ {t("sourcesDesc")}</div>
            </div>
          </div>
        </ShineCard>
        <ShineCard>
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-sm font-semibold text-gray-900">{t("speed")}</div>
              <div className="text-xs text-gray-500">{t("speedDesc")}</div>
            </div>
          </div>
        </ShineCard>
        <ShineCard>
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-sm font-semibold text-gray-900">{t("install")}</div>
              <div className="text-xs text-gray-500">{t("installDesc")}</div>
            </div>
          </div>
        </ShineCard>
      </div>
    </main>
  );
}
