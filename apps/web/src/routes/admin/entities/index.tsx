import { useAdminEntityTypes } from "@repo/convex/hooks/useEntityTypes";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/entities/")({
	component: AdminEntityTypes,
});

function AdminEntityTypes() {
	const navigate = useNavigate();
	const entityTypes = useAdminEntityTypes();
	const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
	const visibleEntityTypes = (entityTypes ?? []).filter((entityType) =>
		activeTab === "active"
			? entityType.countryCount > 0
			: entityType.countryCount === 0,
	);

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
				<h1 className="text-lg font-semibold">Entities</h1>
				<button
					type="button"
					onClick={() => void navigate({ to: "/admin/entities/new" })}
					className="absolute right-0 flex size-9 items-center justify-center rounded-full text-2xl font-light text-[#553bff] hover:bg-[#f4f2ff]"
					aria-label="Create entity type"
				>
					+
				</button>
			</header>

			<nav
				className="mt-3 flex items-center gap-1"
				aria-label="Entity type status"
			>
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

			<section
				className="mt-8 space-y-5"
				aria-label={`${activeTab} entity types`}
			>
				{entityTypes === undefined ? (
					<div className="py-10 text-center text-sm text-neutral-500">
						Loading entity types…
					</div>
				) : visibleEntityTypes.length ? (
					visibleEntityTypes
						.slice()
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((entityType) => (
							<button
								key={entityType._id}
								type="button"
								onClick={() =>
									void navigate({
										to: "/admin/entities/$entityTypeId",
										params: { entityTypeId: entityType._id },
									})
								}
								className="flex w-full items-center gap-4 text-left transition"
							>
								<span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#ffbf4f] text-lg font-semibold text-neutral-800">
									{entityType.countryCount}
								</span>
								<span className="min-w-0 flex-1">
									<span className="block truncate text-xl font-medium">
										{entityType.name}
									</span>
									<span className="mt-1 block truncate text-lg text-neutral-500">
										{entityType.shortName}
									</span>
								</span>
								<span
									className="shrink-0 text-2xl leading-none text-neutral-400"
									aria-hidden="true"
								>
									›
								</span>
							</button>
						))
				) : (
					<div className="py-8 text-center text-sm text-neutral-500">
						No {activeTab} entity types.
					</div>
				)}
			</section>
		</main>
	);
}
