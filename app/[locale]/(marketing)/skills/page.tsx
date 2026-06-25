import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getAllPersonas } from "@/lib/db/queries";
import {
  SkillBrowser,
  type SkillSummary,
  type SkillsByDivision,
} from "./skill-browser";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("skills.title"),
    description: t("skills.description"),
  };
}

export default async function SkillsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "skills" });

  const personas = await getAllPersonas();

  const grouped: SkillsByDivision = {};
  for (const persona of personas) {
    if (!grouped[persona.division]) grouped[persona.division] = [];
    grouped[persona.division].push({
      id: persona.id,
      slug: persona.slug,
      name: persona.name,
      description: persona.description,
      division: persona.division,
      emoji: persona.emoji,
    });
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[110px] pb-32">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </section>

      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { label: t("tier1Label"), price: 5, discount: 0 },
            { label: t("tier2Label"), price: 4, discount: 20, discountKey: "tier2Discount" },
            { label: t("tier3Label"), price: 3.5, discount: 30, discountKey: "tier3Discount" },
            { label: t("tier4Label"), price: 3, discount: 40, discountKey: "tier4Discount" },
          ].map((tier) => (
            <div
              key={tier.label}
              className="rounded-xl border border-gray-200 bg-white p-5 text-center"
            >
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {tier.label}
              </div>
              <div className="text-2xl font-bold text-orange-500">
                ${tier.price.toFixed(tier.price % 1 === 0 ? 0 : 2)}
                <span className="text-sm font-normal text-gray-500">/skill</span>
              </div>
              {tier.discount > 0 && (
                <div className="mt-1.5 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  {t(tier.discountKey!)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <SkillBrowser
        skillsByDivision={grouped}
        translations={{
          searchPlaceholder: t("searchPlaceholder"),
          noResults: t("noResults"),
          selected: t("selected"),
          total: t("total"),
          checkout: t("checkout"),
          clear: t("clear"),
          perSkill: t("perSkill"),
          checkingOut: t("checkingOut"),
          skillsCount: t("skillsCount"),
          tier2Discount: t("tier2Discount"),
          tier3Discount: t("tier3Discount"),
          tier4Discount: t("tier4Discount"),
        }}
      />
    </main>
  );
}

export type { SkillSummary, SkillsByDivision };
