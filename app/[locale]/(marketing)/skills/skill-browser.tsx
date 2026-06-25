"use client";

import { Check, Loader2, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { buyCustomPersonas } from "@/app/[locale]/(marketing)/actions";
import { PersonaCard } from "@/components/landing/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type SkillSummary = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  division: string;
  emoji: string | null;
};

export type SkillsByDivision = Record<string, SkillSummary[]>;

const CART_KEY = "skill-cart";
const TIERS = [
  { min: 0, max: 9, price: 500, label: "$5/skill" },
  { min: 10, max: 19, price: 400, label: "$4/skill", discount: "20% off" },
  { min: 20, max: 29, price: 350, label: "$3.50/skill", discount: "30% off" },
  { min: 30, max: Infinity, price: 300, label: "$3/skill", discount: "40% off" },
] as const;

function getTier(count: number) {
  for (const tier of TIERS) {
    if (count >= tier.min && count <= tier.max) return tier;
  }
  return TIERS[0];
}

type SkillBrowserProps = {
  skillsByDivision: SkillsByDivision;
  translations: {
    searchPlaceholder: string;
    noResults: string;
    selected: string;
    total: string;
    checkout: string;
    clear: string;
    perSkill: string;
    checkingOut: string;
    skillsCount: string;
    tier2Discount: string;
    tier3Discount: string;
    tier4Discount: string;
  };
};

export function SkillBrowser({
  skillsByDivision,
  translations,
}: SkillBrowserProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        setSelectedIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(selectedIds));
    } catch {
      // ignore
    }
  }, [selectedIds, hydrated]);

  const allSkills = useMemo(
    () => Object.values(skillsByDivision).flat(),
    [skillsByDivision],
  );

  const filtered = useMemo<SkillsByDivision>(() => {
    if (!query.trim()) return skillsByDivision;
    const q = query.toLowerCase();
    const result: SkillsByDivision = {};
    for (const [division, skills] of Object.entries(skillsByDivision)) {
      const matched = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q) ||
          division.toLowerCase().includes(q),
      );
      if (matched.length > 0) result[division] = matched;
    }
    return result;
  }, [query, skillsByDivision]);

  const hasResults = Object.keys(filtered).length > 0;
  const totalCount = allSkills.length;
  const selectedCount = selectedIds.length;
  const tier = getTier(selectedCount);
  const totalCents = selectedCount * tier.price;
  const savings = selectedCount > 0
    ? selectedCount * TIERS[0].price - totalCents
    : 0;

  const discountLabel =
    selectedCount >= 30
      ? translations.tier4Discount
      : selectedCount >= 20
        ? translations.tier3Discount
        : selectedCount >= 10
          ? translations.tier2Discount
          : null;

  function toggleSkill(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  function handleCheckout() {
    startTransition(async () => {
      await buyCustomPersonas(selectedIds);
    });
  }

  return (
    <div>
      <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={translations.searchPlaceholder}
            className="pl-9 rounded-full"
          />
        </div>
      </div>

      {!hasResults ? (
        <div className="text-center py-16">
          <p className="text-gray-500">{translations.noResults}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(filtered).map(([division, skills]) => (
            <div key={division}>
              <div className="flex items-baseline mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {division}
                </h2>
                <span className="ml-2 text-sm text-gray-500">
                  {translations.skillsCount.replace(
                    "{count}",
                    String(skills.length),
                  )}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill) => {
                  const isSelected = selectedIds.includes(skill.id);
                  return (
                    <div key={skill.id} className="relative">
                      <PersonaCard
                        emoji={skill.emoji}
                        name={skill.name}
                        division={skill.division}
                        description={skill.description}
                        isSelected={isSelected}
                        onClick={() => toggleSkill(skill.id)}
                      />
                      {isSelected && (
                        <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 border border-orange-500 text-white z-50">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                {translations.selected}: {selectedCount} / {totalCount}
                {discountLabel && (
                  <span className="ml-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    {discountLabel}
                  </span>
                )}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {translations.total}: ${(totalCents / 100).toFixed(0)}{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({tier.label})
                </span>
              </p>
              {savings > 0 && (
                <p className="text-xs text-green-600">
                  Save ${(savings / 100).toFixed(0)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={clearSelection}
                className="rounded-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {translations.clear}
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={handleCheckout}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translations.checkingOut}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {translations.checkout}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
