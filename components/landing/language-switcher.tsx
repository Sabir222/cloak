'use client';

import { useLocale } from 'next-intl';
import { useTransition, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LOCALE_META: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇬🇧' },
  fr: { label: 'Français', flag: '🇫🇷' }
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  function switchTo(newLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      setOpen(false);
    });
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none"
        aria-label="Language"
      >
        <span className="text-base leading-none">{LOCALE_META[locale]?.flag}</span>
        <span className="uppercase">{locale}</span>
        <ChevronDown
          className={cn(
            'size-3 text-muted-foreground/40 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 min-w-[100px] overflow-hidden rounded-md border bg-popover text-popover-foreground p-1 shadow-md">
          {routing.locales.map((l) => (
            <button
              key={l}
              onClick={() => switchTo(l)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground',
                l === locale && 'font-medium text-orange-500'
              )}
            >
              <span className="text-base leading-none">{LOCALE_META[l]?.flag}</span>
              <span>{LOCALE_META[l]?.label ?? l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
