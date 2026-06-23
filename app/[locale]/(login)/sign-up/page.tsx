import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { Login } from '../login';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('signUp.title'),
    description: t('signUp.description'),
  };
}

export default function SignUpPage() {
  return (
    <Suspense>
      <Login mode="signup" />
    </Suspense>
  );
}
