import type { Id } from "@repo/convex/data-model";
import {
	useAdminEntityType,
	useDeleteEntityType,
} from "@repo/convex/hooks/useEntityTypes";
import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import CountryFlag from "../../../components/CountryFlag";

export const Route = createFileRoute("/admin/entities/$entityTypeId")({
	component: EntityTypeRoute,
});

function EntityTypeRoute() {
	const { entityTypeId } = Route.useParams();
	const { pathname } = useLocation();
	const detailPath = `/admin/entities/${entityTypeId}`;
	return pathname === detailPath || pathname === `${detailPath}/` ? (
		<EntityTypeDetails />
	) : (
		<Outlet />
	);
}

function EntityTypeDetails() {
	const { entityTypeId: rawEntityTypeId } = Route.useParams();
	const entityTypeId = rawEntityTypeId as Id<"entityTypes">;
	const navigate = useNavigate();
	const entityType = useAdminEntityType(entityTypeId);
	const deleteEntityType = useDeleteEntityType();
	const [error, setError] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleDelete() {
		if (!entityType || !window.confirm(`Delete ${entityType.name}?`)) return;
		setError("");
		setIsDeleting(true);
		try {
			await deleteEntityType({ entityTypeId });
			await navigate({ to: "/admin/entities" });
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this entity type. Try again.",
			);
		} finally {
			setIsDeleting(false);
		}
	}

	if (entityType === undefined) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Loading entity type…
			</div>
		);
	}
	if (!entityType) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Entity type not found.
			</div>
		);
	}

	return (
		<main className="mx-auto flex min-h-full w-full max-w-2xl flex-col bg-white px-5 pb-32 pt-3 text-neutral-800 sm:px-8 sm:pt-6">
			<header className="relative flex h-10 shrink-0 items-center justify-center">
				<button
					type="button"
					onClick={() => void navigate({ to: "/admin/entities" })}
					className="absolute left-0 flex size-9 items-center justify-start text-3xl leading-none text-neutral-700"
					aria-label="Back to entities"
				>
					‹
				</button>
				<h1 className="text-lg font-semibold">Entity Type</h1>
			</header>

			<section className="mt-8 text-center">
				<div className="mx-auto flex size-24 items-center justify-center rounded-full bg-[#ffbf4f] text-4xl font-bold text-neutral-800">
					{entityType.countries.length}
				</div>
				<h2 className="mt-4 text-xl font-medium">{entityType.name}</h2>
				<p className="mt-1 text-lg text-neutral-500">{entityType.shortName}</p>
				{entityType.description && (
					<p className="mx-auto mt-4 max-w-md text-base leading-6">
						{entityType.description}
					</p>
				)}
			</section>

			<section className="mt-10" aria-label="Countries using this entity type">
				<h3 className="text-sm font-semibold text-neutral-500">
					Countries using this
				</h3>
				{entityType.countries.length ? (
					<ul className="mt-4 space-y-6">
						{entityType.countries.map((country) => (
							<li
								key={country.originalId}
								className="flex items-center gap-4 text-lg"
							>
								<CountryFlag
									iso2={country.iso2}
									name={country.name}
									className="size-7"
									imgClassName="size-full rounded-full object-cover"
								/>
								<span>{country.name}</span>
							</li>
						))}
					</ul>
				) : (
					<p className="mt-4 text-sm text-neutral-500">
						This entity type is not assigned to any country.
					</p>
				)}
			</section>

			{error && (
				<p
					className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
					role="alert"
				>
					{error}
				</p>
			)}

			<footer className="fixed inset-x-0 bottom-6 z-20 bg-white/95 px-5 py-1 backdrop-blur sm:static sm:mt-auto sm:bg-white sm:px-8 sm:pt-8">
				<div className="mx-auto flex w-full max-w-[368px] items-center gap-3">
					<button
						type="button"
						onClick={() =>
							void navigate({
								to: "/admin/entities/$entityTypeId/edit",
								params: { entityTypeId },
							})
						}
						className="flex h-[60px] flex-1 items-center justify-center gap-3 rounded-full bg-[#e7e7e7] text-lg font-semibold text-neutral-800 transition hover:bg-[#dcdcdc]"
					>
						<Pencil className="size-6 stroke-[1.8]" aria-hidden="true" />
						Edit
					</button>
					<button
						type="button"
						disabled={isDeleting}
						onClick={() => void handleDelete()}
						className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-[#fff0f1] text-[#ff2f3d] transition hover:bg-[#ffe1e3] disabled:opacity-50"
						aria-label="Delete entity type"
					>
						<Trash2 className="size-6 stroke-[1.8]" aria-hidden="true" />
					</button>
				</div>
			</footer>
		</main>
	);
}
