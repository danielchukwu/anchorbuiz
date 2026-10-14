import { useCountries } from "@repo/convex/hooks/useLocations";
import { usePackages } from "@repo/convex/hooks/usePackages";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import CountryFlag from "../../../components/CountryFlag";

export const Route = createFileRoute("/admin/packages/")({
	component: AdminPackages,
});

function AdminPackages() {
	const navigate = useNavigate();
	const packages = usePackages();
	const countries = useCountries();
	const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
	const countryNames = new Map(
		(countries ?? []).map((country) => [country.originalId, country.name]),
	);
	const visiblePackages = (packages ?? []).filter((item) =>
		activeTab === "active" ? item.isActive !== false : item.isActive === false,
	);

	function priceLabel(value?: number) {
		if (value === undefined) return "—";
		if (value >= 1_000_000) {
			return `₦${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M`;
		}
		if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
		return `₦${value.toLocaleString("en-NG")}`;
	}

	return (
		<main className="mx-auto min-h-full w-full max-w-2xl bg-white px-5 pb-10 pt-3 text-neutral-800 sm:px-8 sm:pt-6">
			<header className="relative flex h-10 items-center justify-center">
				<button
					type="button"
					onClick={() => void navigate({ to: "/admin" })}
					className="absolute left-0 flex size-9 items-center justify-start text-3xl leading-none text-neutral-700"
					aria-label="Back to admin home"
				>
					‹
				</button>
				<h1 className="text-lg font-semibold">Packages</h1>
				<button
					type="button"
					onClick={() => void navigate({ to: "/admin/packages/new" })}
					className="absolute right-0 flex size-9 items-center justify-center rounded-full text-2xl font-light text-[#553bff] hover:bg-[#f4f2ff]"
					aria-label="Create package"
				>
					+
				</button>
			</header>

			<nav className="mt-3 flex items-center gap-1" aria-label="Package status">
				{(["active", "inactive"] as const).map((tab) => (
					<button
						key={tab}
						type="button"
						aria-pressed={activeTab === tab}
						onClick={() => setActiveTab(tab)}
						className={`rounded-full px-5 py-2.5 text-base font-medium capitalize transition-colors ${
							activeTab === tab
								? "bg-[#d1c7ff] text-neutral-900"
								: "text-neutral-800 hover:bg-neutral-100"
						}`}
					>
						{tab}
					</button>
				))}
			</nav>

			<section className="mt-8 space-y-5" aria-label={`${activeTab} packages`}>
				{packages === undefined ? (
					<div className="py-10 text-center text-sm text-neutral-500">
						Loading packages…
					</div>
				) : visiblePackages.length ? (
					visiblePackages
						.slice()
						.sort(
							(a, b) =>
								a.countryOriginalId - b.countryOriginalId ||
								a.displayOrder - b.displayOrder,
						)
						.map((item) => (
							<button
								key={item._id}
								type="button"
								onClick={() =>
									void navigate({
										to: "/admin/packages/$packageId",
										params: { packageId: item._id },
									})
								}
								className="flex w-full items-center gap-5 text-left transition"
							>
								<CountryFlag
									iso2={
										countries?.find(
											(country) =>
												country.originalId === item.countryOriginalId,
										)?.iso2
									}
									name={countryNames.get(item.countryOriginalId) || "Country"}
									className="size-12"
									imgClassName="size-full rounded-full object-cover"
								/>
								<span className="min-w-0 flex-1">
									<span className="block truncate text-xl font-medium">
										{item.name}
									</span>
									<span className="mt-1 block truncate text-lg text-neutral-500">
										{countryNames.get(item.countryOriginalId) ||
											"Unknown country"}{" "}
										· Order {item.displayOrder}
									</span>
								</span>
								<span className="shrink-0 text-right">
									<span className="block text-lg font-semibold">
										{priceLabel(item.priceInNaira)}
									</span>
								</span>
							</button>
						))
				) : (
					<div className="py-8 text-center text-sm text-neutral-500">
						No {activeTab} packages.
					</div>
				)}
			</section>
		</main>
	);
}
