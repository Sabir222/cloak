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

export default async function AgentsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'agents' });

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
          agentsCount: t('agentsCount')
        }}
      />
    </main>
  );
}

export type { AgentSummary, AgentsByDivision };
