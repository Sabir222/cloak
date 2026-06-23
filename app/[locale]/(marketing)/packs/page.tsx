import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Sparkles, Users } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getAllPacks } from '@/lib/db/queries';

export default async function PacksPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'packs' });
  const packs = await getAllPacks();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          {t('description')}
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className={`flex flex-col rounded-xl border bg-white p-6 shadow-sm ${
              pack.isFeatured
                ? 'border-orange-500 ring-1 ring-orange-500'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {pack.name}
              </h2>
              {pack.isFeatured && (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {t('featured')}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4 flex-1">
              {pack.description}
            </p>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Users className="mr-1.5 h-4 w-4" />
              {t('agentsCount', { count: pack.agentCount })}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">{t('from')}</span>
                <span className="ml-1 text-2xl font-semibold text-gray-900">
                  ${pack.priceCents / 100}
                </span>
              </div>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={`/packs/${pack.slug}`}>{t('viewPack')}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
