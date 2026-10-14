import type { Id } from "@repo/convex/data-model";
import { useCurrencyByCode } from "@repo/convex/hooks/useCurrencies";
import { useCountryByOriginalId } from "@repo/convex/hooks/useLocations";
import {
	useDeletePackage,
	usePackageById,
} from "@repo/convex/hooks/usePackages";
import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import CountryFlag from "../../../components/CountryFlag";

export const Route = createFileRoute("/admin/packages/$packageId")({
	component: PackageRoute,
});

function PackageRoute() {
	const { packageId } = Route.useParams();
	const { pathname } = useLocation();
	const detailPath = `/admin/packages/${packageId}`;
	return pathname === detailPath || pathname === `${detailPath}/` ? (
		<PackageDetails />
	) : (
		<Outlet />
	);
}

function PackageDetails() {
	const { packageId: rawPackageId } = Route.useParams();
	const packageId = rawPackageId as Id<"packages">;
	const navigate = useNavigate();
	const packageData = usePackageById(packageId);
	const country = useCountryByOriginalId(packageData?.countryOriginalId);
	const currency = useCurrencyByCode(packageData?.currency);
	const deletePackage = useDeletePackage();
	const [error, setError] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleDelete() {
		if (!packageData || !window.confirm(`Delete ${packageData.name}?`)) return;
		setError("");
		setIsDeleting(true);
		try {
			await deletePackage({ packageId });
			await navigate({ to: "/admin/packages" });
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this package. Try again.",
			);
		} finally {
			setIsDeleting(false);
		}
	}

	if (packageData === undefined) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Loading package…
			</div>
		);
	}
	if (!packageData) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Package not found.
			</div>
		);
	}

	const features = Array.isArray(packageData.offerings)
		? packageData.offerings.map((feature) => String(feature))
		: [];
	const foreignPrice = `${currency?.symbol ?? packageData.currency}${packageData.price.toLocaleString("en-US")}`;
	const nairaPrice =
		packageData.priceInNaira === undefined
			? ""
			: `₦${packageData.priceInNaira.toLocaleString("en-NG")}`;

	return (
		<main className="mx-auto flex min-h-full w-full max-w-2xl flex-col bg-white px-5 pb-32 pt-3 text-neutral-800 sm:px-8 sm:pt-6">
			<header className="relative flex h-10 shrink-0 items-center justify-center">
				<button
					type="button"
					onClick={() => void navigate({ to: "/admin/packages" })}
					className="absolute left-0 flex size-9 items-center justify-start text-3xl leading-none text-neutral-700"
					aria-label="Back to packages"
				>
					‹
				</button>
				<h1 className="text-lg font-semibold">Packages</h1>
			</header>

			<section className="mt-8 flex flex-col items-center text-center">
				<div className="relative size-[104px]">
					<CountryFlag
						iso2={country?.iso2}
						name={country?.name ?? "Country"}
						className="size-full"
						imgClassName="size-full rounded-full object-cover"
					/>
					<span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-[#dedede] text-lg font-semibold text-neutral-700">
						{packageData.displayOrder}
					</span>
				</div>
				<h2 className="mt-6 text-xl font-medium">{packageData.name}</h2>
				<p className="mt-1 text-lg text-neutral-500">{country?.name ?? ""}</p>
				<div className="mt-5 flex items-baseline justify-center gap-3">
					<p className="text-[38px] font-bold leading-tight tracking-tight">
						{nairaPrice || foreignPrice}
					</p>
					{nairaPrice && foreignPrice !== nairaPrice && (
						<p className="text-lg font-medium text-neutral-400">
							({foreignPrice})
						</p>
					)}
				</div>
			</section>

			<section
				className="mt-8 rounded-3xl bg-[#f7f5ff] px-5 py-5 sm:px-6"
				aria-label="Package features"
			>
				{features.length ? (
					<ul className="space-y-4">
						{features.map((feature) => (
							<li
								key={feature}
								className="flex items-start gap-4 text-lg leading-6"
							>
								<Check
									className="mt-0.5 size-5 shrink-0 stroke-[2.5] text-[#553bff]"
									aria-hidden="true"
								/>
								<span>{feature}</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-neutral-500">No features added.</p>
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
								to: "/admin/packages/$packageId/edit",
								params: { packageId },
							})
						}
						className="flex h-[66px] flex-1 items-center justify-center gap-3 rounded-full bg-[#e7e7e7] text-xl font-semibold text-neutral-800 transition hover:bg-[#dcdcdc]"
					>
						<Pencil className="size-6 stroke-[1.8]" aria-hidden="true" />
						Edit
					</button>
					<button
						type="button"
						disabled={isDeleting}
						onClick={() => void handleDelete()}
						className="flex size-[66px] shrink-0 items-center justify-center rounded-full bg-[#fff0f1] text-[#ff2f3d] transition hover:bg-[#ffe1e3] disabled:opacity-50"
						aria-label="Delete package"
					>
						<Trash2 className="size-6 stroke-[1.8]" aria-hidden="true" />
					</button>
				</div>
			</footer>
		</main>
	);
}
