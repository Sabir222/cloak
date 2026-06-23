import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="relative flex items-center justify-center min-h-[100dvh] overflow-hidden">
      {/* Top-left decorative SVG cluster */}
      <div className="absolute top-0 left-0 -translate-x-[10px] -translate-y-[165px] opacity-90 pointer-events-none select-none z-0">
        <img
          src="/svg-all.svg"
          alt=""
          className="w-[60px] sm:w-[320px] md:w-[250px]"
          aria-hidden="true"
        />
      </div>

      {/* Bottom-right decorative SVG cluster */}
      <div className="absolute bottom-0 right-0 translate-x-[10px] translate-y-[120px] opacity-90 pointer-events-none select-none z-0">
        <img
          src="/svg-all.svg"
          alt=""
          className="w-[70px] sm:w-[320px] md:w-[250px]"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 max-w-md space-y-8 p-4 text-center">
        <div className="flex justify-center">
          <img
            src="/404.svg"
            alt="404"
            className="w-full max-w-[300px]"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          {t('title')}
        </h1>
        <p className="text-base text-gray-500">{t('description')}</p>
        <Link
          href="/"
          className="max-w-48 mx-auto flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          {t('backToHome')}
        </Link>
      </div>
    </div>
  );
}
