import type { Id } from "@repo/convex/data-model";
import {
	useEntityTypesByCountry,
	useSaveCountryEntityTypes,
} from "@repo/convex/hooks/useCountryEntityTypes";
import { useEntityTypes } from "@repo/convex/hooks/useEntityTypes";
import { useCountryByOriginalId } from "@repo/convex/hooks/useLocations";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute(
	"/admin/countries/$countryOriginalId/entities",
)({ component: CountryEntities });

type EntityRow = { id: number; entityId: string };

const selectClassName =
	"h-[58px] w-full appearance-none rounded-2xl border border-[#dedede] bg-white px-4 pr-10 text-base text-neutral-900 outline-none transition focus:border-[#593cff] focus:ring-2 focus:ring-[#593cff]/10";

function CountryEntities() {
	const { countryOriginalId: rawCountryOriginalId } = Route.useParams();
	const countryOriginalId = Number(rawCountryOriginalId);
	const isValidCountryId = Number.isSafeInteger(countryOriginalId);
	const navigate = useNavigate();
	const country = useCountryByOriginalId(
		isValidCountryId ? countryOriginalId : undefined,
	);
	const mappings = useEntityTypesByCountry(
		isValidCountryId ? countryOriginalId : undefined,
	);
	const entityTypes = useEntityTypes();
	const saveRelations = useSaveCountryEntityTypes();
	const nextRowId = useRef(0);
	const [rows, setRows] = useState<EntityRow[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (mappings === undefined || isInitialized) return;
		const mappedRows = mappings.map((mapping) => ({
			id: nextRowId.current++,
			entityId: mapping.entityId,
		}));
		setRows([...mappedRows, { id: nextRowId.current++, entityId: "" }]);
		setIsInitialized(true);
	}, [isInitialized, mappings]);

	async function handleSave() {
		if (!isValidCountryId) return;
		const entityIds = rows
			.map((row) => row.entityId)
			.filter(Boolean) as Id<"entityTypes">[];
		if (new Set(entityIds).size !== entityIds.length) {
			setError("Each entity type can only be selected once.");
			return;
		}

		setError("");
		setIsSaving(true);
		try {
			await saveRelations({ countryOriginalId, entityIds });
			await navigate({
				to: "/admin/countries/$countryOriginalId",
				params: { countryOriginalId: String(countryOriginalId) },
			});
		} catch (saveError) {
			setError(
				saveError instanceof Error
					? saveError.message
					: "Could not save entity types for this country.",
			);
		} finally {
			setIsSaving(false);
		}
	}

	if (!isValidCountryId) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Country not found.
			</div>
		);
	}
	if (
		country === undefined ||
		mappings === undefined ||
		entityTypes === undefined
	) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Loading country entities…
			</div>
		);
	}
	if (!country) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Country not found.
			</div>
		);
	}

	return (
		<main className="mx-auto flex min-h-full w-full max-w-2xl flex-col bg-white px-5 pb-32 pt-3 text-neutral-800 sm:px-8 sm:pt-6">
			<header className="relative flex h-10 shrink-0 items-center justify-center">
				<button
					type="button"
					onClick={() =>
						void navigate({
							to: "/admin/countries/$countryOriginalId",
							params: { countryOriginalId: String(countryOriginalId) },
						})
					}
					className="absolute left-0 flex size-9 items-center justify-start text-3xl leading-none text-neutral-700"
					aria-label="Back to countries"
				>
					‹
				</button>
				<h1 className="text-base font-semibold text-[#a39add]">
					{country.iso3?.toUpperCase() || country.name} Entities
				</h1>
			</header>

			<section className="mt-8 space-y-3" aria-label="Linked entity types">
				{rows.map((row) => (
					<div key={row.id} className="flex items-center gap-3">
						<div className="relative min-w-0 flex-1">
							<select
								className={selectClassName}
								value={row.entityId}
								onChange={(event) => {
									const entityId = event.target.value;
									setRows((current) =>
										current.map((item) =>
											item.id === row.id ? { ...item, entityId } : item,
										),
									);
								}}
							>
								<option value="">Select entity</option>
								{entityTypes.map((entityType) => (
									<option
										key={entityType._id}
										value={entityType._id}
										disabled={rows.some(
											(item) =>
												item.id !== row.id && item.entityId === entityType._id,
										)}
									>
										{entityType.name} ({entityType.shortName})
									</option>
								))}
							</select>
							<span
								className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-neutral-500"
								aria-hidden="true"
							>
								⌄
							</span>
						</div>
						<button
							type="button"
							onClick={() =>
								setRows((current) =>
									current.filter((item) => item.id !== row.id),
								)
							}
							className="flex size-9 shrink-0 items-center justify-center text-3xl font-light text-neutral-600"
							aria-label="Unlink entity type"
						>
							×
						</button>
					</div>
				))}
				<button
					type="button"
					onClick={() =>
						setRows((current) => [
							...current,
							{ id: nextRowId.current++, entityId: "" },
						])
					}
					className="mx-auto mt-2 flex h-[58px] w-[82%] items-center justify-center gap-3 rounded-full bg-[#e7e7e7] text-base font-semibold text-neutral-800 transition hover:bg-[#dcdcdc]"
				>
					<span className="text-2xl font-light leading-none">+</span>
					Add
				</button>
			</section>

			{error && (
				<p
					className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
					role="alert"
				>
					{error}
				</p>
			)}

			<footer className="fixed inset-x-0 bottom-12 z-20 bg-white/95 px-5 py-4 backdrop-blur sm:static sm:mt-auto sm:px-8 sm:pt-8">
				<button
					type="button"
					disabled={isSaving}
					onClick={() => void handleSave()}
					className="mx-auto flex h-[60px] w-[82%] max-w-[520px] items-center justify-center rounded-full bg-[#553bff] text-lg font-semibold text-white transition hover:bg-[#462cf2] disabled:cursor-wait disabled:opacity-60"
				>
					{isSaving ? "Saving…" : "Save"}
				</button>
			</footer>
		</main>
	);
}
