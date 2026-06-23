'use client';

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { RoughButton } from "@/components/ui/rough-button";
import { Link, usePathname } from "@/i18n/navigation";

export function Footer({ showCta = true }: { showCta?: boolean }) {
  const t = useTranslations("landing");
  const pathname = usePathname();
  const isAgentsPage = pathname === "/agents";
  const show = showCta && !isAgentsPage;

  return (
    <footer>
      {show && (
        <section style={{ backgroundColor: '#FF6859' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
              {t("ctaDescription")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <RoughButton href="/packs" color="#fff" fill="#fff" className="text-orange-600">
                {t("browsePacks")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </RoughButton>
              <RoughButton href="/agents" color="#fff" fill="transparent">
                {t("buildYourOwn")}
              </RoughButton>
            </div>
          </div>
        </section>
      )}

      <div className="relative bg-[#54B16C] overflow-hidden min-h-[450px]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-end justify-between text-sm h-full">
          <div className="flex items-center gap-5 font-bold text-black">
            <Link
              href="/pricing"
              className="hover:text-black/60 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/agents"
              className="hover:text-black/60 transition-colors"
            >
              Agents
            </Link>
            <Link
              href="/packs"
              className="hover:text-black/60 transition-colors"
            >
              Packs
            </Link>
          </div>

          <div className="flex items-center gap-4 text-black">
            <a
              href="#"
              className="hover:text-black/60 transition-colors text-black"
              aria-label="X"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              className="hover:text-black/60 transition-colors text-black"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="#"
              className="hover:text-black/60 transition-colors text-black"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <p className="text-black font-extralight">
              &copy; 2026 Sparkles. All rights reserved.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[55%] w-full max-w-[80vw] pointer-events-none select-none">
          <img
            src="/logo.svg"
            alt=""
            className="w-full h-auto"
            aria-hidden="true"
          />
        </div>
      </div>
    </footer>
  );
}
