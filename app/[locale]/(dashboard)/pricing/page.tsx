import type { Metadata } from "next";
import { ArrowRight, Package, Sparkles } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PackCard as PackCardComponent } from "@/components/landing/cards";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
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

export default async function PricingPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: "pricing" });

	const packs = await getAllPacks();
	const featured = packs.filter((p) => p.isFeatured);
	const regular = packs.filter((p) => !p.isFeatured);

	return (
		<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[110px] pb-16">
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

			{featured.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{featured.map((pack) => (
						<PackCard key={pack.id} pack={pack} t={t} featured />
					))}
				</div>
			)}

			{regular.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{regular.map((pack) => (
						<PackCard key={pack.id} pack={pack} t={t} />
					))}
				</div>
			)}

			<div className="mt-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 sm:p-12 text-center">
				<Sparkles className="h-10 w-10 text-white mx-auto mb-4" />
				<h2 className="text-2xl font-bold text-white sm:text-3xl">
					{t("customTitle")}
				</h2>
				<p className="mt-3 text-white/90 max-w-xl mx-auto">
					{t("customDescription")}
				</p>
				<Link href="/agents" className="inline-block mt-6">
					<Button size="lg" variant="secondary" className="rounded-full">
						{t("customButton")}
						<ArrowRight className="ml-2 h-5 w-5" />
					</Button>
				</Link>
			</div>
		</main>
	);
}

type TranslationFunc = (
	key: string,
	values?: Record<string, string | number | Date>,
) => string;

function PackCard({
	pack,
	t,
	featured,
}: {
	pack: {
		id: number;
		slug: string;
		name: string;
		description: string | null;
		priceCents: number;
		isFeatured: boolean;
		agentCount: number;
		bundleType: string | null;
	};
	t: TranslationFunc;
	featured?: boolean;
}) {
	return (
		<PackCardComponent
			name={pack.name}
			description={pack.description}
			priceCents={pack.priceCents}
			agentCount={pack.agentCount}
			bundleType={pack.bundleType}
			isFeatured={!!featured}
			badge={featured ? t("popular") : undefined}
			variant="pricing"
			translations={{
				oneTime: t("oneTime"),
				agentsIncluded: t("agentsIncluded"),
				skillPackContent: t("skillPackContent"),
				getPack: t("getPack"),
				popular: t("popular"),
			}}
		/>
	);
}
