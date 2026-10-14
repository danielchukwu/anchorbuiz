import { authClient } from "@repo/convex/auth-client";
import { useAdminDashboard } from "@repo/convex/hooks/useAdmin";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import CountryFlag from "../../../components/CountryFlag";
import UserHeader from "../../../components/UserHeader";

export const Route = createFileRoute("/admin/(home)/")({
	component: AdminHome,
});

type SubmissionTab = "ongoing" | "pending" | "completed";

const tabs: { id: SubmissionTab; label: string }[] = [
	{ id: "ongoing", label: "Ongoing" },
	{ id: "pending", label: "Pending" },
	{ id: "completed", label: "Completed" },
];

function AdminHome() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const dashboard = useAdminDashboard(Boolean(session?.user));
	const [activeTab, setActiveTab] = useState<SubmissionTab>("ongoing");

	useEffect(() => {
		if (!isPending && !session?.user) {
			void navigate({ to: "/signup", search: { redirect_to: "/admin" } });
		}
	}, [isPending, navigate, session]);

	if (isPending || !session?.user || dashboard === undefined) {
		return (
			<div className="flex min-h-dvh items-center justify-center bg-white">
				<div className="size-7 animate-spin rounded-full border-b-2 border-[#5037ff]" />
			</div>
		);
	}

	if (!dashboard.isAdmin || !dashboard.summary) {
		return (
			<main className="mx-auto flex min-h-dvh max-w-xl flex-col bg-white px-5 pb-12 pt-3 text-neutral-800 sm:px-8 sm:pt-10">
				<UserHeader />
				<section className="mt-12 rounded-2xl bg-neutral-50 p-6 text-center">
					<h1 className="text-lg font-semibold">Admin access required</h1>
					<p className="mt-2 text-sm text-neutral-500">
						Your account does not have permission to view submissions.
					</p>
				</section>
			</main>
		);
	}

	const counts = dashboard.summary;
	const submissions = dashboard.businesses.filter((business) => {
		const status = business.status.toLowerCase();
		if (activeTab === "completed") {
			return ["active", "registered", "completed"].includes(status);
		}
		if (activeTab === "pending") {
			return ["pending", "draft", "awaiting", "awaiting_review"].includes(
				status,
			);
		}
		return [
			"draft",
			"pending",
			"awaiting",
			"awaiting_review",
			"processing",
			"in_review",
		].includes(status);
	});

	return (
		<main className="mx-auto flex min-h-dvh max-w-3xl flex-col bg-white pb-12 pt-3 text-neutral-800 sm:px-8 sm:pt-10">
			<UserHeader />

			<section
				className="mt-7 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				aria-label="Registration overview"
			>
				<SummaryCard
					label="Ongoing Reg"
					value={counts.ongoingRegistrations}
					highlight
				/>
				<SummaryCard
					label="Completed Reg"
					value={counts.completedRegistrations}
				/>
				<SummaryCard label="Active Countries" value={counts.activeCountries} />
				<SummaryCard label="Entity Types" value={counts.entityTypes} />
			</section>

			<nav
				className="mt-7 flex items-center gap-1 px-5"
				aria-label="Submission status"
			>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						aria-pressed={activeTab === tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
							activeTab === tab.id
								? "bg-[#d1c7ff] text-neutral-900"
								: "text-neutral-800 hover:bg-neutral-100"
						}`}
					>
						{tab.label}
					</button>
				))}
			</nav>

			<section
				className="mt-10 space-y-5 px-5"
				aria-label={`${activeTab} submissions`}
			>
				{submissions.length > 0 ? (
					submissions.map((submission) => (
						<SubmissionRow key={submission._id} submission={submission} />
					))
				) : (
					<p className="py-6 text-center text-sm text-neutral-400">
						No {activeTab} registrations yet.
					</p>
				)}
			</section>
		</main>
	);
}

function SummaryCard({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: number;
	highlight?: boolean;
}) {
	return (
		<div
			className={`h-[81px] min-w-[148px] snap-start rounded-2xl px-3.5 py-3 ${
				highlight ? "bg-[#ffbf4f]" : "bg-[#f7f7fa]"
			}`}
		>
			<p className="truncate text-sm text-neutral-500">{label}</p>
			<p className="mt-1 text-xl font-semibold leading-6 text-black">{value}</p>
		</div>
	);
}

function SubmissionRow({
	submission,
}: {
	submission: {
		_id: string;
		name: string;
		logo: string | null;
		status: string;
		country: { name: string; iso2: string | null } | null;
		entityType: string | null;
	};
}) {
	const status = submission.status.toLowerCase();
	const statusLabel = [
		"pending",
		"draft",
		"awaiting",
		"awaiting_review",
	].includes(status)
		? "Awaiting..."
		: status === "in_review"
			? "Processing"
			: status.charAt(0).toUpperCase() + status.slice(1);
	const statusColor = [
		"pending",
		"draft",
		"awaiting",
		"awaiting_review",
	].includes(status)
		? "text-[#db8500]"
		: "text-emerald-600";

	return (
		<article className="flex items-center gap-3">
			<div className="relative size-12 shrink-0">
				{submission.logo ? (
					<img
						className="size-11 rounded-full object-cover"
						src={submission.logo}
						alt=""
					/>
				) : (
					<span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#eac18c] to-[#9c5b42] text-base font-bold text-white">
						{submission.name.slice(0, 1).toUpperCase()}
					</span>
				)}
				<span className="absolute -bottom-0.5 right-0.5 flex size-5 items-center justify-center overflow-hidden rounded-full border border-white bg-white">
					<CountryFlag
						iso2={submission.country?.iso2}
						name={submission.country?.name || "Country"}
						className="size-full"
						imgClassName="size-full rounded-full object-cover"
					/>
				</span>
			</div>
			<div className="min-w-0 flex-1">
				<h2 className="truncate text-base font-medium text-neutral-800">
					{submission.name}
				</h2>
				<p className="truncate text-sm text-neutral-500">
					{submission.entityType || "Business registration"}
				</p>
			</div>
			<span className={`shrink-0 text-sm font-medium ${statusColor}`}>
				{statusLabel}
			</span>
		</article>
	);
}
