import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllAgentProducts } from "@/lib/db/queries";
import { Link } from "@/i18n/navigation";
import { ShineCard } from "@/components/landing/cards";
import { RoughButton } from "@/components/ui/rough-button";
import { Globe, Zap, Download } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("agents.title"),
    description: t("agents.description"),
  };
}

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "agents" });
  const agents = await getAllAgentProducts();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[110px] pb-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </section>

      {agents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">{t("noAgents")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <ShineCard key={agent.id} className="flex flex-col">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium mb-3">
                  {t("agentProduct")}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {agent.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {agent.description}
                </p>
                {agent.version && (
                  <p className="text-xs text-gray-400 mb-4">
                    {t("version")} {agent.version}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Globe className="h-3 w-3" /> {t("sources")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Zap className="h-3 w-3" /> {t("speed")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Download className="h-3 w-3" /> {t("install")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-2xl font-bold text-gray-900">
                  ${agent.priceCents / 100}
                </span>
                <RoughButton
                  href={`/agents/${agent.slug}`}
                  color="#ea580c"
                  fill="#fff7ed"
                  className="text-sm"
                >
                  {t("buyAgent")}
                </RoughButton>
              </div>
            </ShineCard>
          ))}
        </div>
      )}
    </main>
  );
}
