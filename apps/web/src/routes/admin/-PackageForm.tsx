import type { Id } from "@repo/convex/data-model";
import { useCurrencies } from "@repo/convex/hooks/useCurrencies";
import { useCountries } from "@repo/convex/hooks/useLocations";
import {
	useCreatePackage,
	useUpdatePackage,
} from "@repo/convex/hooks/usePackages";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

type FeatureInput = { id: number; value: string };

type PackageRecord = {
	_id: Id<"packages">;
	countryOriginalId: number;
	name: string;
	displayOrder: number;
	offerings: unknown;
	currency: string;
	price: number;
	priceInNaira?: number;
};

type PackageFormProps = {
	mode: "create" | "edit";
	packageData?: PackageRecord;
};

const fieldClassName =
	"h-[54px] w-full rounded-2xl border border-[#dedede] bg-white px-4 text-base text-neutral-900 outline-none transition focus:border-[#593cff] focus:ring-2 focus:ring-[#593cff]/10 placeholder:text-neutral-400";
const labelClassName = "mb-2 block text-sm font-semibold text-neutral-500";

function formatNumber(value: string) {
	const numeric = value.replace(/[^\d.]/g, "");
	if (!numeric) return "";
	const [integer, ...fraction] = numeric.split(".");
	const formattedInteger = Number(integer || "0").toLocaleString("en-US");
	return fraction.length
		? `${formattedInteger}.${fraction.join("")}`
		: formattedInteger;
}

function flagForCurrency(code: string) {
	if (code === "USD") return "🇺🇸";
	if (code === "NGN") return "🇳🇬";
	return "💱";
}

export default function PackageForm({ mode, packageData }: PackageFormProps) {
	const navigate = useNavigate();
	const countries = useCountries();
	const currencies = useCurrencies();
	const createPackage = useCreatePackage();
	const updatePackage = useUpdatePackage();
	const [countryOriginalId, setCountryOriginalId] = useState("");
	const [name, setName] = useState("");
	const [displayOrder, setDisplayOrder] = useState("");
	const [currency, setCurrency] = useState("USD");
	const [price, setPrice] = useState("");
	const [priceInNaira, setPriceInNaira] = useState("");
	const nextFeatureId = useRef(3);
	const [features, setFeatures] = useState<FeatureInput[]>([
		{ id: 0, value: "" },
		{ id: 1, value: "" },
		{ id: 2, value: "" },
	]);
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!packageData) return;
		setCountryOriginalId(String(packageData.countryOriginalId));
		setName(packageData.name);
		setDisplayOrder(String(packageData.displayOrder));
		setCurrency(packageData.currency);
		setPrice(String(packageData.price));
		setPriceInNaira(
			packageData.priceInNaira === undefined
				? ""
				: String(packageData.priceInNaira),
		);
		const offerings = Array.isArray(packageData.offerings)
			? packageData.offerings.map((feature) => String(feature))
			: [];
		const initialFeatures = offerings.length ? offerings : ["", "", ""];
		setFeatures(initialFeatures.map((value, id) => ({ id, value })));
		nextFeatureId.current = initialFeatures.length;
	}, [packageData]);

	const selectedCurrency = useMemo(
		() => currencies?.find((item) => item.code === currency),
		[currencies, currency],
	);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		const cleanName = name.trim();
		const featureList = features
			.map((feature) => feature.value.trim())
			.filter(Boolean);
		const numericPrice = Number(price.replace(/,/g, ""));
		const numericNairaPrice = Number(priceInNaira.replace(/,/g, ""));

		if (!countryOriginalId) {
			setError("Select a country for this package.");
			return;
		}
		if (!cleanName) {
			setError("Enter a package name.");
			return;
		}
		if (!Number.isInteger(Number(displayOrder)) || Number(displayOrder) < 1) {
			setError("Display order must be a whole number greater than zero.");
			return;
		}
		if (!Number.isFinite(numericPrice) || numericPrice < 0) {
			setError("Enter a valid package price.");
			return;
		}
		if (
			!priceInNaira ||
			!Number.isFinite(numericNairaPrice) ||
			numericNairaPrice < 0
		) {
			setError("Enter a valid price in Naira.");
			return;
		}

		setIsSaving(true);
		try {
			const values = {
				countryOriginalId: Number(countryOriginalId),
				name: cleanName,
				displayOrder: Number(displayOrder),
				offerings: featureList,
				currency,
				price: numericPrice,
				priceInNaira: numericNairaPrice,
			};

			if (mode === "edit" && packageData) {
				await updatePackage({ packageId: packageData._id, ...values });
			} else {
				await createPackage(values);
			}
			await navigate({ to: "/admin/packages" });
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Could not save this package. Try again.",
			);
		} finally {
			setIsSaving(false);
		}
	}

	if (!countries || !currencies) {
		return (
			<div className="p-8 text-center text-sm text-neutral-500">
				Loading form…
			</div>
		);
	}

	return (
		<div className="mx-auto flex min-h-full w-full max-w-2xl flex-col bg-white pb-32 text-neutral-900">
			<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-center bg-white px-5">
				<button
					type="button"
					onClick={() => void navigate({ to: "/admin/packages" })}
					className="absolute left-5 flex size-9 items-center justify-start text-2xl leading-none text-neutral-700"
					aria-label="Back to packages"
				>
					‹
				</button>
				<h1 className="text-base font-semibold text-[#a39add]">
					{mode === "create" ? "Create Package" : "Edit Package"}
				</h1>
			</header>

			<form onSubmit={handleSubmit} className="flex flex-1 flex-col">
				<div className="space-y-5 px-5 pb-8 pt-2 sm:space-y-6 sm:px-8">
					<label className="block">
						<span className={labelClassName}>Country</span>
						<div className="relative">
							<select
								className={`${fieldClassName} appearance-none pr-11`}
								value={countryOriginalId}
								onChange={(event) => setCountryOriginalId(event.target.value)}
								required
							>
								<option value="" disabled>
									Select country
								</option>
								{countries
									.filter((country) => country.originalId !== undefined)
									.map((country) => (
										<option key={country._id} value={country.originalId}>
											{country.name}
										</option>
									))}
							</select>
							<span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-neutral-500">
								⌄
							</span>
						</div>
					</label>

					<label className="block">
						<span className={labelClassName}>Name</span>
						<input
							className={fieldClassName}
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Name of package"
							maxLength={100}
							required
						/>
					</label>

					<label className="block">
						<span className={labelClassName}>Display Order</span>
						<input
							className={fieldClassName}
							type="number"
							min="1"
							step="1"
							value={displayOrder}
							onChange={(event) => setDisplayOrder(event.target.value)}
							placeholder="Ex: 1"
							required
						/>
					</label>

					<div>
						<label className={labelClassName} htmlFor="package-price">
							Price
						</label>
						<div className="flex gap-2">
							<div className="relative w-[130px] shrink-0">
								<select
									className="h-[54px] w-full appearance-none rounded-2xl bg-[#f7f5ff] pl-12 pr-8 text-base text-neutral-800 outline-none focus:ring-2 focus:ring-[#593cff]/20"
									value={currency}
									onChange={(event) => setCurrency(event.target.value)}
								>
									{currencies.map((item) => (
										<option key={item._id} value={item.code}>
											{item.code}
										</option>
									))}
								</select>
								<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl">
									{flagForCurrency(currency)}
								</span>
								<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-neutral-500">
									⌄
								</span>
							</div>
							<input
								id="package-price"
								className={fieldClassName}
								inputMode="decimal"
								value={
									price
										? `${selectedCurrency?.symbol ?? ""}${formatNumber(price)}`
										: ""
								}
								onChange={(event) =>
									setPrice(event.target.value.replace(/[^\d.]/g, ""))
								}
								placeholder={`${selectedCurrency?.symbol ?? ""}300`}
								aria-label="Price"
								required
							/>
						</div>
					</div>

					<div>
						<label className={labelClassName} htmlFor="naira-price">
							Price in Naira
						</label>
						<div className="flex gap-2">
							<div className="relative w-[130px] shrink-0">
								<div className="flex h-[54px] items-center rounded-2xl bg-[#f7f5ff] pl-12 text-base text-neutral-800">
									NGN
								</div>
								<span
									className="absolute left-3 top-1/2 -translate-y-1/2 text-xl"
									aria-hidden="true"
								>
									🇳🇬
								</span>
							</div>
							<input
								id="naira-price"
								className={fieldClassName}
								inputMode="decimal"
								value={priceInNaira ? `₦${formatNumber(priceInNaira)}` : ""}
								onChange={(event) =>
									setPriceInNaira(event.target.value.replace(/[^\d.]/g, ""))
								}
								placeholder="₦100,000"
								aria-label="Price in Naira"
							/>
						</div>
					</div>

					<fieldset>
						<legend className={`${labelClassName} mb-3`}>Features</legend>
						<div className="space-y-3">
							{features.map((feature, index) => (
								<div key={feature.id} className="flex items-center gap-2">
									<input
										className={fieldClassName}
										value={feature.value}
										onChange={(event) =>
											setFeatures((items) =>
												items.map((item, itemIndex) =>
													itemIndex === index
														? { ...item, value: event.target.value }
														: item,
												),
											)
										}
										placeholder="Feature"
										maxLength={180}
										aria-label={`Feature ${index + 1}`}
									/>
									<button
										type="button"
										onClick={() =>
											setFeatures((items) =>
												items.filter((item) => item.id !== feature.id),
											)
										}
										className="flex size-10 shrink-0 items-center justify-center text-3xl font-light text-neutral-600"
										aria-label={`Remove feature ${index + 1}`}
									>
										×
									</button>
								</div>
							))}
						</div>
						<button
							type="button"
							onClick={() =>
								setFeatures((items) => [
									...items,
									{ id: nextFeatureId.current++, value: "" },
								])
							}
							className="mt-3 flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#e7e7e7] text-sm font-semibold text-neutral-800 transition hover:bg-[#dcdcdc]"
						>
							<span className="text-2xl font-light leading-none">+</span>
							Add
						</button>
					</fieldset>

					{error && (
						<p
							className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
							role="alert"
						>
							{error}
						</p>
					)}
				</div>

				<div className="fixed inset-x-0 bottom-12 z-20 border-t border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur sm:static sm:border-0 sm:bg-white sm:px-8 sm:pt-2">
					<button
						type="submit"
						disabled={isSaving}
						className="mx-auto flex h-[54px] w-[80%] max-w-[520px] items-center justify-center rounded-full bg-[#553bff] px-6 text-base font-semibold text-white transition hover:bg-[#462cf2] disabled:cursor-wait disabled:opacity-60"
					>
						{isSaving
							? "Saving…"
							: mode === "create"
								? "Create"
								: "Save changes"}
					</button>
				</div>
			</form>
		</div>
	);
}
