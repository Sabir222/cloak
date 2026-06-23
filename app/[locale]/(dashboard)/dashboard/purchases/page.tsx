import { AlertCircle, Download } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShineBorder } from "@/components/ui/shine-border";
import { getPurchasesByUser, getUser } from "@/lib/db/queries";

export default async function PurchasesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: "purchases" });

	const user = await getUser();
	if (!user) {
		redirect(`/${locale}/sign-in`);
	}

	const purchases = await getPurchasesByUser(user.id);

	return (
		<section className="flex-1 p-4 lg:p-8">
			<h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-2">
				{t("title")}
			</h1>
			<p className="text-sm text-gray-500 mb-6">{t("description")}</p>
			<Card className="relative overflow-hidden">
				<ShineBorder shineColor="#f97316" borderWidth={1} duration={20} />
				<CardHeader className="relative z-10">
					<CardTitle>{t("title")}</CardTitle>
				</CardHeader>
				<CardContent className="relative z-10">
					{purchases.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-gray-200 text-left text-gray-500">
										<th className="py-2 pr-4 font-medium">{t("packName")}</th>
										<th className="py-2 pr-4 font-medium">{t("date")}</th>
										<th className="py-2 pr-4 font-medium">{t("amount")}</th>
										<th className="py-2 pr-4 font-medium">{t("status")}</th>
										<th className="py-2 pr-4 font-medium">{t("download")}</th>
									</tr>
								</thead>
								<tbody>
									{purchases.map((purchase) => {
										const isPaid = purchase.status === "paid";
										const name = purchase.packName || t("customPack");
										return (
											<tr
												key={purchase.id}
												className="border-b border-gray-100 last:border-0"
											>
												<td className="py-3 pr-4 font-medium text-gray-900">
													{name}
												</td>
												<td className="py-3 pr-4 text-gray-500">
													{new Date(purchase.createdAt).toLocaleDateString(
														locale,
													)}
												</td>
												<td className="py-3 pr-4 text-gray-900">
													${(purchase.amountCents / 100).toFixed(0)}
												</td>
												<td className="py-3 pr-4">
													<span
														className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
															isPaid
																? "bg-green-100 text-green-700"
																: "bg-yellow-100 text-yellow-700"
														}`}
													>
														{isPaid ? t("paid") : t("pending")}
													</span>
												</td>
												<td className="py-3 pr-4">
													{isPaid ? (
														<a
															href={`/api/download?token=${purchase.downloadToken}`}
															className="inline-flex items-center text-orange-600 hover:text-orange-700"
														>
															<Download className="mr-1 h-4 w-4" />
															{t("download")}
														</a>
													) : (
														<span className="text-gray-400">&mdash;</span>
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center text-center py-12">
							<AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
							<p className="text-sm text-gray-500 max-w-sm">
								{t("noPurchases")}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</section>
	);
}
