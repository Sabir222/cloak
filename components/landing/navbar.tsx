'use client';

import { ChevronDown, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { AuthLink } from '@/components/shared/auth-link';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/landing/language-switcher';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';

export const Navbar = ({
  children,
  sticky = true
}: {
  children?: React.ReactNode;
  sticky?: boolean;
}) => {
  const t = useTranslations('nav');
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const isAuthenticated = !!user && !isLoading;

  const isHidden =
    pathname === '/dashboard' || pathname?.startsWith('/dashboard/');

  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isHidden) return null;

  const navLinks = [
    { href: '/packs', label: t('packs') },
    { href: '/agents', label: t('agentsNav') },
    { href: '/pricing', label: t('pricing') }
  ];

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className={cn('z-20 w-full px-2 group', sticky && 'fixed')}
      >
        <div
          className={cn(
            'mt-2 mx-auto max-w-[1400px] px-6 transition-all duration-300',
            isScrolled &&
              'bg-background/50 max-w-[1400px] rounded-2xl border backdrop-blur-lg lg:px-5'
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 nav:flex-nowrap nav:gap-0 nav:py-4">
            {/* Logo */}
            <div className="flex w-full justify-between nav:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
                prefetch={true}
              >
                <Image src="/logo.svg" alt="Cloak logo" width={48} height={48} className="h-12 w-auto dark:brightness-0 dark:invert" />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 nav:hidden"
              >
                <Menu className="group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 size-6 duration-200" />
                <X className="absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 duration-200" />
              </button>
            </div>

            {/* Desktop center nav */}
            <div className="m-auto hidden items-center gap-2 nav:flex min-w-0">
              <NavigationMenu viewport={false} delayDuration={300}>
                <NavigationMenuList className="flex gap-1 text-sm">
                  {navLinks.map((link) => (
                    <NavigationMenuItem key={link.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.href}
                          prefetch={true}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150 px-4 py-2"
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right side */}
            <div className="bg-background group-data-[state=active]:block nav:group-data-[state=active]:flex mb-6 hidden max-h-[calc(100dvh-7rem)] w-full flex-wrap items-center justify-end space-y-6 overflow-y-auto overscroll-contain rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap nav:m-0 nav:flex nav:max-h-none nav:w-fit nav:shrink-0 nav:gap-3 nav:space-y-0 nav:overflow-visible nav:border-transparent nav:bg-transparent nav:p-0 nav:shadow-none dark:shadow-none dark:nav:bg-transparent">
              {/* Mobile nav */}
              <div className="nav:hidden w-full">
                <ul className="text-base space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-accent-foreground block py-2.5 duration-150"
                        prefetch={true}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li className="flex items-center gap-3 pt-3 mt-2 border-t border-border">
                    <LanguageSwitcher />
                  </li>
                  <li className="pt-2">
                    {isAuthenticated ? (
                      <Button
                        asChild
                        className="bg-foreground text-background hover:bg-foreground/90 font-medium w-full"
                      >
                        <Link href="/dashboard" prefetch={true}>
                          {t('dashboard')}
                        </Link>
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/sign-in"
                          prefetch={true}
                          className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                        >
                          {t('logIn')}
                        </Link>
                        <Button
                          asChild
                          className="bg-foreground text-background hover:bg-foreground/90 font-medium w-full"
                        >
                          <AuthLink href="/sign-up">{t('getStarted')}</AuthLink>
                        </Button>
                      </div>
                    )}
                  </li>
                </ul>
              </div>

              {/* Desktop right actions */}
              <div className="hidden nav:flex items-center gap-2">
                {children}
                <LanguageSwitcher />
                {isAuthenticated ? (
                  <Button
                    asChild
                    className="bg-foreground text-background hover:bg-foreground/90 font-medium"
                  >
                    <Link href="/dashboard" prefetch={true}>
                      {t('dashboard')}
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      prefetch={true}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                    >
                      {t('logIn')}
                    </Link>
                    <Button
                      asChild
                      className="bg-foreground text-background hover:bg-foreground/90 font-medium"
                    >
                      <AuthLink href="/sign-up">{t('getStarted')}</AuthLink>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
