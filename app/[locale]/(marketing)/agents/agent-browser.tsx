"use client";

import { Check, Loader2, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { buyCustomAgents } from "@/app/[locale]/(marketing)/actions";
import { AgentCard } from "@/components/landing/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AgentSummary = {
	id: number;
	slug: string;
	name: string;
	description: string | null;
	division: string;
	emoji: string | null;
};

export type AgentsByDivision = Record<string, AgentSummary[]>;

const CART_KEY = "agent-cart";
const PRICE_PER_AGENT_CENTS = 500;

type AgentBrowserProps = {
	agentsByDivision: AgentsByDivision;
	translations: {
		searchPlaceholder: string;
		noResults: string;
		selected: string;
		total: string;
		checkout: string;
		clear: string;
		perAgent: string;
		checkingOut: string;
		agentsCount: string;
	};
};

export function AgentBrowser({
	agentsByDivision,
	translations,
}: AgentBrowserProps) {
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

	const allAgents = useMemo(
		() => Object.values(agentsByDivision).flat(),
		[agentsByDivision],
	);

	const filtered = useMemo<AgentsByDivision>(() => {
		if (!query.trim()) return agentsByDivision;
		const q = query.toLowerCase();
		const result: AgentsByDivision = {};
		for (const [division, agents] of Object.entries(agentsByDivision)) {
			const matched = agents.filter(
				(a) =>
					a.name.toLowerCase().includes(q) ||
					(a.description ?? "").toLowerCase().includes(q) ||
					division.toLowerCase().includes(q),
			);
			if (matched.length > 0) result[division] = matched;
		}
		return result;
	}, [query, agentsByDivision]);

	const hasResults = Object.keys(filtered).length > 0;
	const totalCount = allAgents.length;
	const selectedCount = selectedIds.length;
	const totalCents = selectedCount * PRICE_PER_AGENT_CENTS;

	function toggleAgent(id: number) {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	}

	function clearSelection() {
		setSelectedIds([]);
	}

	function handleCheckout() {
		startTransition(async () => {
			await buyCustomAgents(selectedIds);
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
					{Object.entries(filtered).map(([division, agents]) => (
						<div key={division}>
							<div className="flex items-baseline mb-4">
								<h2 className="text-xl font-semibold text-gray-900">
									{division}
								</h2>
								<span className="ml-2 text-sm text-gray-500">
									{translations.agentsCount.replace(
										"{count}",
										String(agents.length),
									)}
								</span>
							</div>
							<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{agents.map((agent) => {
									const isSelected = selectedIds.includes(agent.id);
									return (
										<div key={agent.id} className="relative">
											<AgentCard
												emoji={agent.emoji}
												name={agent.name}
												division={agent.division}
												description={agent.description}
												isSelected={isSelected}
												onClick={() => toggleAgent(agent.id)}
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
							</p>
							<p className="text-lg font-semibold text-gray-900">
								{translations.total}: ${(totalCents / 100).toFixed(0)}{" "}
								<span className="text-sm font-normal text-gray-500">
									({translations.perAgent})
								</span>
							</p>
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
