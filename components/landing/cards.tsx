"use client";

import type { ReactNode } from "react";
import { RoughBorder } from "@/components/ui/rough-border";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/* ─── Pack Card ─── */
type PackCardProps = {
	name: string;
	description: string | null;
	priceCents: number;
	personaCount?: number;
	skillCount?: number;
	bundleType?: string | null;
	isFeatured?: boolean;
	badge?: string;
	className?: string;
	variant?: "default" | "pricing" | "compact";
	cta?: ReactNode;
	translations: {
		oneTime: string;
		personasIncluded: string;
		skillPackContent: string;
		getPack: string;
		popular?: string;
		from?: string;
		viewPack?: string;
	};
};

export function PackCard({
	name,
	description,
	priceCents,
	personaCount = 0,
	skillCount = 0,
	bundleType,
	isFeatured,
	badge,
	className,
	variant = "default",
	cta,
	translations,
}: PackCardProps) {
	const t = translations;
	const isSkill = bundleType === "skill-pack";
	const isCompact = variant === "compact";

	const subtitle = isSkill
		? t.skillPackContent
		: `${personaCount} ${t.personasIncluded}`;

	return (
		<RoughBorder
			color={isFeatured ? "#f97316" : "#9ca3af"}
			strokeWidth={isFeatured ? 2.5 : 2}
			borderRadius={12}
			padding="p-0"
			roughness={2}
			bowing={1}
			className={cn("h-full", className)}
		>
			<div className="flex flex-col h-full">
				{badge && (
					<span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold whitespace-nowrap z-20">
						{badge}
					</span>
				)}
				<div className="flex flex-col flex-1 p-5">
					{isFeatured && !badge && (
						<span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 w-fit mb-2">
							{t.popular}
						</span>
					)}

					{isCompact ? (
						<>
							<h3 className="font-lora text-base font-semibold text-gray-900">
								{name}
							</h3>
							<p className="mt-2 text-xs text-gray-500 line-clamp-2">
								{description}
							</p>
							<div className="mt-4 flex items-center justify-between">
								<span className="text-xs text-gray-400">{subtitle}</span>
								<span className="font-lora text-lg font-bold text-gray-900">
									${(priceCents / 100).toFixed(0)}
								</span>
							</div>
						</>
					) : (
						<>
							<h3 className="font-lora text-xl font-bold text-gray-900">{name}</h3>
							<p className="mt-2 text-sm text-gray-500 line-clamp-3 flex-1">{description}</p>
							<div className="mt-6 flex items-end gap-1">
								<span className="font-lora text-4xl font-bold text-gray-900">
									${(priceCents / 100).toFixed(0)}
								</span>
								<span className="text-sm text-gray-400 mb-1.5">{t.oneTime}</span>
							</div>
							<div className="mt-2 text-sm text-gray-500">{subtitle}</div>
							{cta && <div className="mt-auto pt-6">{cta}</div>}
						</>
					)}
				</div>
			</div>
		</RoughBorder>
	);
}

/* ─── Pack Link Card ─── */
type PackLinkCardProps = {
	name: string;
	description: string | null;
	priceCents: number;
	personaCount?: number;
	bundleType?: string | null;
	slug: string;
	className?: string;
	translations: {
		personasIncluded: string;
		skillPackContent: string;
	};
};

export function PackLinkCard({
	name,
	description,
	priceCents,
	personaCount = 0,
	bundleType,
	slug,
	className,
	translations,
}: PackLinkCardProps) {
	const t = translations;
	const isSkill = bundleType === "skill-pack";

	return (
		<Link href={`/packs/${slug}`} className={cn("block h-full", className)}>
			<RoughBorder
				color="#9ca3af"
				strokeWidth={2}
				borderRadius={12}
				padding="p-0"
				roughness={2}
				bowing={1}
				className="h-full"
			>
				<div className="p-5">
					<h3 className="font-lora text-base font-semibold text-gray-900">
						{name}
					</h3>
					<p className="mt-2 text-xs text-gray-500 line-clamp-2">
						{description}
					</p>
					<div className="mt-4 flex items-center justify-between">
						<span className="text-xs text-gray-400">
							{isSkill
								? t.skillPackContent
								: `${personaCount} ${t.personasIncluded}`}
						</span>
						<span className="font-lora text-lg font-bold text-gray-900">
							${(priceCents / 100).toFixed(0)}
						</span>
					</div>
				</div>
			</RoughBorder>
		</Link>
	);
}

/* ─── Feature Card ─── */
type FeatureCardProps = {
	icon: ReactNode;
	title: string;
	description: string;
	className?: string;
};

export function FeatureCard({
	icon,
	title,
	description,
	className,
}: FeatureCardProps) {
	return (
		<RoughBorder
			color="#9ca3af"
			strokeWidth={2}
			borderRadius={12}
			padding="p-0"
			roughness={2}
			bowing={1}
			className={cn("h-full", className)}
		>
			<div className="p-6">
				<div className="inline-flex items-center justify-center size-10 rounded-lg bg-orange-500/10 text-orange-500 mb-4">
					{icon}
				</div>
				<h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
				<p className="text-gray-500 text-sm leading-relaxed">{description}</p>
			</div>
		</RoughBorder>
	);
}

/* ─── Persona Card ─── */
type PersonaCardProps = {
	emoji?: string | null;
	name: string;
	division: string;
	description: string | null;
	isSelected?: boolean;
	onClick?: () => void;
	className?: string;
	size?: "default" | "small";
};

export function PersonaCard({
	emoji,
	name,
	division,
	description,
	isSelected,
	onClick,
	className,
	size = "default",
}: PersonaCardProps) {
	const isSmall = size === "small";

	const content = (
		<RoughBorder
			color={isSelected ? "#f97316" : "#d1d5db"}
			strokeWidth={isSelected ? 2.5 : 2}
			borderRadius={10}
			padding="p-0"
			roughness={2}
			bowing={1}
			className={cn(
				"h-full transition-all",
				className,
			)}
		>
			<div className={cn(isSmall ? "p-4" : "p-4")}>
				<div className={cn("mb-2")}>
					<span className="text-2xl">{emoji || "🤖"}</span>
				</div>
				<h3
					className={cn(
						"font-semibold text-gray-900",
						isSmall ? "text-sm" : "font-medium",
					)}
				>
					{name}
				</h3>
				<p className="mt-1 text-xs text-gray-400 capitalize">
					{division.replace("-", " ")}
				</p>
				<p
					className={cn(
						"text-gray-500 line-clamp-2",
						isSmall ? "mt-2 text-xs" : "mt-1 text-sm",
					)}
				>
					{description}
				</p>
			</div>
		</RoughBorder>
	);

	if (onClick) {
		return (
			<button type="button" onClick={onClick} className="text-left w-full h-full">
				{content}
			</button>
		);
	}

	return content;
}

/* ─── Testimonial Card ─── */
type TestimonialCardProps = {
	name: string;
	role: string;
	text: string;
	className?: string;
};

export function TestimonialCard({
	name,
	role,
	text,
	className,
}: TestimonialCardProps) {
	return (
		<RoughBorder
			color="#9ca3af"
			strokeWidth={2}
			borderRadius={12}
			padding="p-0"
			roughness={2}
			bowing={1}
			className={cn("h-full", className)}
		>
			<div className="p-6">
				<div className="flex gap-1 mb-4">
					{[...Array(5)].map((_, i) => (
						<svg
							key={i}
							className="size-4 fill-orange-500 text-orange-500"
							viewBox="0 0 16 16"
						>
							<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
						</svg>
					))}
				</div>
				<p className="text-gray-700 text-sm leading-relaxed mb-6">
					&ldquo;{text}&rdquo;
				</p>
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
						{name.charAt(0)}
					</div>
					<div>
						<div className="text-sm font-semibold text-gray-900">{name}</div>
						<div className="text-xs text-gray-500">{role}</div>
					</div>
				</div>
			</div>
		</RoughBorder>
	);
}

/* ─── Step Card ─── */
type StepCardProps = {
	step: number;
	icon: ReactNode;
	title: string;
	description: string;
	stepLabel: string;
};

export function StepCard({
	step,
	icon,
	title,
	description,
	stepLabel,
}: StepCardProps) {
	return (
		<div className="relative text-center">
			<div className="inline-flex items-center justify-center size-12 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 mb-5 relative z-10">
				{icon}
			</div>
			<div className="text-sm font-semibold text-orange-500 mb-2">
				{stepLabel} {step}
			</div>
			<h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
			<p className="text-gray-500 text-sm max-w-xs mx-auto">{description}</p>
		</div>
	);
}

/* ─── Shine Card ─── */
type ShineCardProps = {
	children: ReactNode;
	className?: string;
};

export const AgentCard = PersonaCard;

export function ShineCard({
	children,
	className,
}: ShineCardProps) {
	return (
		<RoughBorder
			color="#9ca3af"
			strokeWidth={2}
			borderRadius={12}
			padding="p-0"
			roughness={2}
			bowing={1}
			className={cn("h-full", className)}
		>
			<div className="p-6">{children}</div>
		</RoughBorder>
	);
}
