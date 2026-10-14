import type { Id } from "@repo/convex/data-model";
import {
	useAdminCountryDetails,
	useSetCountryRegistrationAvailability,
} from "@repo/convex/hooks/useAdmin";
import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import CountryFlag from "../../../components/CountryFlag";

export const Route = createFileRoute("/admin/countries/$countryOriginalId")({
	component: CountryRoute,
});

type DetailsTab = "entities" | "packages";

function CountryRoute() {
	const { countryOriginalId: rawCountryOriginalId } = Route.useParams();
	const { pathname } = useLocation();
	const detailPath = `/admin/countries/${rawCountryOriginalId}`;
	return pathname === detailPath || pathname === `${detailPath}/` ? (
		<CountryDetails />
	) : (
		<Outlet />
	);
}

function CountryDetails() {
	const { countryOriginalId: rawCountryOriginalId } = Route.useParams();
	const countryOriginalId = Number(rawCountryOriginalId);
	const isValidCountryId = Number.isSafeInteger(countryOriginalId);
	const navigate = useNavigate();
	const details = useAdminCountryDetails(
		isValidCountryId ? countryOriginalId : undefined,
	);
	const setAvailability = useSetCountryRegistrationAvailability();
	const [activeTab, setActiveTab] = useState<DetailsTab>("entities");
	const [openMenu, setOpenMenu] = useState<string | null>(null);
	const [error, setError] = useState("");
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	async function toggleAvailability() {
		if (!details) return;
		setIsUpdatingStatus(true);
		setError("");
		try {
			await setAvailability({
				countryOriginalId,
				isRegistrationAvailable: !details.country.isRegistrationAvailable,
			});
		} catch (statusError) {
			setError(
				statusError instanceof Error
					? statusError.message
					: "Could not update country status.",
			);
		} finally {
			setIsUpdatingStatus(false);
		}
	}

	function goToEntityType(entityId: string, edit = false) {
		void navigate({
			to: edit
				? "/admin/entities/$entityTypeId/edit"
				: "/admin/entities/$entityTypeId",
			params: { entityTypeId: entityId as Id<"entityTypes"> },
		});
	}

	function goToPackage(packageId: string, edit = false) {
		void navigate({
			to: edit
				? "/admin/packages/$packageId/edit"
				: "/admin/packages/$packageId",
			params: { packageId: packageId as Id<"packages"> },
		});
	}

	if (!isValidCountryId) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Country not found.
			</div>
		);
	}
	if (details === undefined) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Loading country…
			</div>
		);
	}
	if (!details) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Country not found.
			</div>
		);
	}

	const { country } = details;
	const countryCode = country.iso3?.toUpperCase() || country.name;
	const isActive = country.isRegistrationAvailable;

	return (
		<main className="mx-auto min-h-full w-full max-w-2xl bg-white px-5 pb-10 pt-3 text-neutral-800 sm:px-8 sm:pt-6">
			<header className="relative flex h-10 items-center justify-center">
				<button
					type="button"
					onClick={() => void navigate({ to: "/admin/countries" })}
					className="absolute left-0 flex size-9 items-center justify-start text-3xl leading-none text-neutral-700"
					aria-label="Back to countries"
				>
					‹
				</button>
				<h1 className="text-lg font-semibold">{countryCode}</h1>
			</header>

			<section className="mt-2 flex items-start gap-5">
				<CountryFlag
					iso2={country.iso2}
					name={country.name}
					className="size-[84px]"
					imgClassName="size-full rounded-full object-cover"
				/>
				<div className="min-w-0 flex-1 pt-1">
					<h2 className="truncate text-lg font-medium">{country.name}</h2>
					<div className="mt-2 grid grid-cols-3 gap-2">
						<Stat value={details.businessCount} label="Reg. Buzins." />
						<Stat value={details.packages.length} label="Package" />
						<Stat value={details.entities.length} label="Entities types" />
					</div>
					<button
						type="button"
						disabled={isUpdatingStatus}
						onClick={() => void toggleAvailability()}
						className={`mt-3 flex h-[46px] w-full items-center justify-center rounded-2xl text-base font-semibold transition disabled:opacity-60 ${isActive ? "bg-[#d4f2d7] text-[#22c55e]" : "bg-[#fff0f1] text-[#ef4444]"}`}
					>
						{isUpdatingStatus ? "Saving…" : isActive ? "Active" : "Inactive"}
					</button>
				</div>
			</section>

			<nav
				className="-mx-5 mt-4 grid grid-cols-2 border-b border-neutral-100 sm:-mx-8"
				aria-label="Country details"
			>
				{(["entities", "packages"] as const).map((tab) => (
					<button
						key={tab}
						type="button"
						aria-pressed={activeTab === tab}
						onClick={() => {
							setActiveTab(tab);
							setOpenMenu(null);
						}}
						className={`h-11 border-b-2 text-base font-medium capitalize transition-colors ${activeTab === tab ? "border-[#553bff] text-neutral-800" : "border-transparent text-neutral-500"}`}
					>
						{tab === "entities" ? "Entity Types" : "Packages"}
					</button>
				))}
			</nav>

			<div className="flex justify-end pt-3">
				<button
					type="button"
					onClick={() =>
						activeTab === "entities"
							? void navigate({
									to: "/admin/countries/$countryOriginalId/entities",
									params: { countryOriginalId: String(countryOriginalId) },
								})
							: void navigate({ to: "/admin/packages/new" })
					}
					className="flex h-11 items-center gap-2 rounded-full bg-[#553bff] px-4 text-base font-semibold text-white hover:bg-[#462cf2]"
				>
					<span className="text-xl font-light leading-none">+</span>
					{activeTab === "entities" ? "Edit" : "Add"}
				</button>
			</div>

			<section className="mt-3 space-y-2.5" aria-label={activeTab}>
				{activeTab === "entities" ? (
					details.entities.length ? (
						details.entities.map((entity) => (
							<div
								key={entity.id}
								className="relative flex min-h-[66px] items-center rounded-2xl bg-[#f7f7f7] px-3.5"
							>
								<button
									type="button"
									onClick={() => goToEntityType(entity.id)}
									className="min-w-0 flex-1 truncate text-left text-base"
								>
									{entity.name}{" "}
									<span className="text-neutral-400">({entity.shortName})</span>
								</button>
								<MoreButton
									id={entity.id}
									openMenu={openMenu}
									setOpenMenu={setOpenMenu}
								>
									<MenuItem onClick={() => goToEntityType(entity.id)}>
										View details
									</MenuItem>
									<MenuItem onClick={() => goToEntityType(entity.id, true)}>
										Edit entity type
									</MenuItem>
								</MoreButton>
							</div>
						))
					) : (
						<p className="py-6 text-center text-sm text-neutral-500">
							No entity types linked to this country.
						</p>
					)
				) : details.packages.length ? (
					details.packages.map((item) => (
						<div
							key={item._id}
							className="relative flex min-h-[66px] items-center rounded-2xl bg-[#f7f7f7] px-3.5"
						>
							<button
								type="button"
								onClick={() => goToPackage(String(item._id))}
								className="min-w-0 flex-1 truncate text-left text-base font-medium uppercase"
							>
								{item.name}{" "}
								<span className="font-normal normal-case text-neutral-400">
									({item.offerCount} offers)
								</span>
							</button>
							<MoreButton
								id={String(item._id)}
								openMenu={openMenu}
								setOpenMenu={setOpenMenu}
							>
								<MenuItem onClick={() => goToPackage(String(item._id))}>
									View details
								</MenuItem>
								<MenuItem onClick={() => goToPackage(String(item._id), true)}>
									Edit package
								</MenuItem>
							</MoreButton>
						</div>
					))
				) : (
					<p className="py-6 text-center text-sm text-neutral-500">
						No packages for this country.
					</p>
				)}
			</section>

			{error && (
				<p className="mt-4 text-sm text-red-700" role="alert">
					{error}
				</p>
			)}
		</main>
	);
}

function Stat({ value, label }: { value: number; label: string }) {
	return (
		<div className="min-w-0">
			<p className="text-xl font-semibold leading-6">{value}</p>
			<p className="truncate text-sm text-neutral-500">{label}</p>
		</div>
	);
}

function MoreButton({
	id,
	openMenu,
	setOpenMenu,
	children,
}: {
	id: string;
	openMenu: string | null;
	setOpenMenu: (value: string | null) => void;
	children: ReactNode;
}) {
	return (
		<div className="relative ml-2 shrink-0">
			<button
				type="button"
				onClick={() => setOpenMenu(openMenu === id ? null : id)}
				className="flex size-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200"
				aria-label="More actions"
				aria-expanded={openMenu === id}
			>
				<MoreHorizontal className="size-5" />
			</button>
			{openMenu === id && (
				<div className="absolute right-0 top-9 z-30 min-w-36 rounded-xl border border-neutral-100 bg-white p-1 shadow-lg">
					{children}
				</div>
			)}
		</div>
	);
}

function MenuItem({
	onClick,
	children,
}: {
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
		>
			{children}
		</button>
	);
}
