import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PackCard } from "@/components/landing/cards";
import { RoughButton } from "@/components/ui/rough-button";
import { getAllPacks } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("packs.title"),
    description: t("packs.description"),
  };
}

export default async function PacksPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: "packs" });
	const packs = await getAllPacks();

	return (
		<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[110px] pb-12">
			<section className="text-center mb-12">
				<h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
					{t("title")}
				</h1>
				<p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
					{t("description")}
				</p>
			</section>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{packs.map((pack) => (
					<PackCard
						key={pack.id}
						name={pack.name}
						description={pack.description}
						priceCents={pack.priceCents}
						personaCount={pack.personaCount}
						skillCount={pack.skillCount}
						bundleType={pack.bundleType}
						isFeatured={pack.isFeatured}
						badge={pack.isFeatured ? t("popular") : undefined}
						variant="pricing"
						translations={{
							oneTime: t("oneTime"),
							personasIncluded: t("personasIncluded"),
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
