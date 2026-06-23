import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { SWRProvider } from '@/components/swr-provider';
import { Navbar } from '@/components/landing/navbar';
import { getUser, getTeamForUser } from '@/lib/db/queries';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description')
  };
}

export const viewport: Viewport = {
  maximumScale: 1
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className="bg-white dark:bg-gray-950 text-black dark:text-white"
    >
      <body className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950">
        <NextIntlClientProvider messages={messages}>
          <SWRProvider
            fallback={{
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }}
          >
            <Navbar />
            {children}
          </SWRProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
