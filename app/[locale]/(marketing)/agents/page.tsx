import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAllAgents } from '@/lib/db/queries';
import {
  AgentBrowser,
  type AgentSummary,
  type AgentsByDivision
} from './agent-browser';

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

const TIERS = [
  { key: "tier1", agents: "1–9", price: 5, discount: 0 },
  { key: "tier2", agents: "10+", price: 4, discount: 20 },
  { key: "tier3", agents: "20+", price: 3.5, discount: 30 },
  { key: "tier4", agents: "30+", price: 3, discount: 40 },
] as const;

export default async function AgentsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'agents' });
  const tPricing = await getTranslations({ locale, namespace: 'pricing' });

  const agents = await getAllAgents();

  const grouped: AgentsByDivision = {};
  for (const agent of agents) {
    if (!grouped[agent.division]) grouped[agent.division] = [];
    grouped[agent.division].push({
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      description: agent.description,
      division: agent.division,
      emoji: agent.emoji
    });
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[110px] pb-32">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          {t('description')}
        </p>
      </section>

      {/* ─── Pricing tiers ─── */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {TIERS.map((tier) => {
            const priceLabel = tier.price % 1 === 0 ? `$${tier.price}` : `$${tier.price.toFixed(2)}`;
            return (
              <div
                key={tier.key}
                className="rounded-xl border border-gray-200 bg-white p-5 text-center"
              >
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {t(`${tier.key}Label`)}
                </div>
                <div className="text-2xl font-bold text-orange-500">
                  {priceLabel}
                  <span className="text-sm font-normal text-gray-500">{tPricing('agentsIncluded').replace('agents', '').trim() ? '/agent' : '/agent'}</span>
                </div>
                {tier.discount > 0 && (
                  <div className="mt-1.5 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    {t(`${tier.key}Discount`)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <AgentBrowser
        agentsByDivision={grouped}
        translations={{
          searchPlaceholder: t('searchPlaceholder'),
          noResults: t('noResults'),
          selected: t('selected'),
          total: t('total'),
          checkout: t('checkout'),
          clear: t('clear'),
          perAgent: t('perAgent'),
          checkingOut: t('checkingOut'),
          agentsCount: t('agentsCount'),
          tier2Discount: t('tier2Discount'),
          tier3Discount: t('tier3Discount'),
          tier4Discount: t('tier4Discount'),
        }}
      />
    </main>
  );
}

export type { AgentSummary, AgentsByDivision };
