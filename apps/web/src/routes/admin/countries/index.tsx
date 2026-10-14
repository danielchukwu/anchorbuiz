import { useAdminCountries } from "@repo/convex/hooks/useAdmin";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import CountryFlag from "../../../components/CountryFlag";

export const Route = createFileRoute("/admin/countries/")({
	component: AdminCountries,
});

function AdminCountries() {
	const navigate = useNavigate();
	const countries = useAdminCountries();
	const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
	const visibleCountries = (countries ?? []).filter((country) =>
		activeTab === "active"
			? country.isRegistrationAvailable
			: !country.isRegistrationAvailable,
	);

	function openCountry(countryOriginalId: number) {
		void navigate({
			to: "/admin/countries/$countryOriginalId",
			params: { countryOriginalId: String(countryOriginalId) },
		});
	}

	function continueToCountry() {
		const firstCountry = visibleCountries
			.slice()
			.sort((a, b) => a.name.localeCompare(b.name))[0];
		if (firstCountry) openCountry(firstCountry.originalId);
	}

	return (
		<main className="mx-auto min-h-full w-full max-w-2xl bg-white px-5 pb-32 pt-3 text-neutral-800 sm:px-8 sm:pt-6">
			<header className="relative flex h-10 items-center justify-center">
				<button
					type="button"
					onClick={() => void navigate({ to: "/admin" })}
					className="absolute left-0 flex size-9 items-center justify-start text-3xl leading-none text-neutral-700"
					aria-label="Back to admin home"
				>
					‹
				</button>
				<h1 className="text-lg font-semibold">Countries</h1>
			</header>

			<nav className="mt-3 flex items-center gap-1" aria-label="Country status">
				{(["active", "inactive"] as const).map((tab) => (
					<button
						key={tab}
						type="button"
						aria-pressed={activeTab === tab}
						onClick={() => {
							setActiveTab(tab);
						}}
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

			<section className="mt-8 space-y-5" aria-label={`${activeTab} countries`}>
				{countries === undefined ? (
					<div className="py-10 text-center text-sm text-neutral-500">
						Loading countries…
					</div>
				) : visibleCountries.length ? (
					visibleCountries
						.slice()
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((country) => (
							<button
								key={country._id}
								type="button"
								onClick={() => openCountry(country.originalId)}
								className="flex w-full items-center gap-5 rounded-xl bg-white text-left transition hover:bg-[#faf9ff]"
							>
								<CountryFlag
									iso2={country.iso2}
									name={country.name}
									className="size-11"
									imgClassName="size-full rounded-full object-cover"
								/>
								<span className="min-w-0 flex-1 py-1">
									<span className="block truncate text-xl font-medium">
										{country.name}
									</span>
									<span className="mt-1 block truncate text-lg text-neutral-500">
										{country.entityTypes
											.map((entity) => entity.shortName)
											.join(", ") || "No entity types"}
									</span>
								</span>
								<span
									className="text-2xl leading-none text-neutral-400"
									aria-hidden="true"
								>
									›
								</span>
							</button>
						))
				) : (
					<p className="py-8 text-center text-sm text-neutral-500">
						No {activeTab} countries.
					</p>
				)}
			</section>

			<footer className="fixed inset-x-0 bottom-12 z-20 bg-white/95 px-5 py-4 backdrop-blur sm:static sm:mt-auto sm:bg-white sm:px-8 sm:pt-8">
				<button
					type="button"
					disabled={!visibleCountries.length}
					onClick={continueToCountry}
					className="mx-auto flex h-[62px] w-[82%] max-w-[520px] items-center justify-center rounded-full bg-[#553bff] text-lg font-semibold text-white transition hover:bg-[#462cf2] disabled:cursor-not-allowed disabled:bg-neutral-300"
				>
					Continue
				</button>
			</footer>
		</main>
	);
}
