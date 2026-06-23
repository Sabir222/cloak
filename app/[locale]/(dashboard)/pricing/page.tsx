import type { Metadata } from "next";
import { Package } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PackCard as PackCardComponent } from "@/components/landing/cards";
import { RoughButton } from "@/components/ui/rough-button";
import { getAllPacks } from "@/lib/db/queries";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("pricing.title"),
    description: t("pricing.description"),
  };
}

const TIERS = [
  { key: "tier1", agents: "1–9", price: 5, discount: 0 },
  { key: "tier2", agents: "10+", price: 4, discount: 20 },
  { key: "tier3", agents: "20+", price: 3.5, discount: 30 },
  { key: "tier4", agents: "30+", price: 3, discount: 40 },
] as const;

export default async function PricingPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: "pricing" });

	const packs = await getAllPacks();

	return (
		<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[110px] pb-16">
			{/* ─── Header ─── */}
			<div className="text-center mb-14">
				<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
					<Package className="size-4" />
					{t("badge")}
				</div>
				<h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
					{t("title")}
				</h1>
				<p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
					{t("description")}
				</p>
			</div>

			{/* ─── Build Your Own pricing tiers ─── */}
			<section className="mb-20">
				<div className="text-center mb-8">
					<h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
						{t("byoTitle")}
					</h2>
					<p className="mt-2 text-gray-500">
						{t("byoDescription")}
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
					{TIERS.map((tier) => {
						const priceLabel = tier.price % 1 === 0 ? `$${tier.price}` : `$${tier.price.toFixed(2)}`;
						return (
							<div
								key={tier.key}
								className="rounded-xl border border-gray-200 bg-white p-5 text-center"
							>
								<div className="text-sm font-semibold text-gray-900 mb-1">
									{t(`${tier.key}Label`)}
								</div>
								<div className="text-2xl font-bold text-orange-500">
									{priceLabel}
									<span className="text-sm font-normal text-gray-500">/agent</span>
								</div>
								{tier.discount > 0 && (
									<div className="mt-1.5 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
										{t(`${tier.key}Discount`)}
									</div>
								)}
							</div>
						);
					})}
				</div>

				<div className="text-center">
					<RoughButton href="/agents" color="#ea580c" fill="#fff7ed">
						{t("byoCta")}
					</RoughButton>
				</div>
			</section>

			{/* ─── Divider ─── */}
			<div className="flex items-center gap-4 mb-10">
				<div className="flex-1 h-px bg-gray-200" />
				<span className="text-sm font-medium text-gray-400 uppercase tracking-wider">— {t("packsTitle")} —</span>
				<div className="flex-1 h-px bg-gray-200" />
			</div>

			{/* ─── Packs ─── */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{packs.map((pack) => (
					<PackCardComponent
						key={pack.id}
						name={pack.name}
						description={pack.description}
						priceCents={pack.priceCents}
						agentCount={pack.agentCount}
						bundleType={pack.bundleType}
						isFeatured={pack.isFeatured}
						badge={pack.isFeatured ? t("popular") : undefined}
						variant="pricing"
						translations={{
							oneTime: t("oneTime"),
							agentsIncluded: t("agentsIncluded"),
							skillPackContent: t("skillPackContent"),
							getPack: t("getPack"),
							popular: t("popular"),
						}}
						cta={
							<RoughButton
								href={`/packs/${pack.slug}`}
								color="#ea580c"
								fill={pack.isFeatured ? "#fff7ed" : "transparent"}
								className="w-full text-center text-sm"
							>
								{t("getPack")}
							</RoughButton>
						}
					/>
				))}
			</div>
		</main>
	);
}
