import type { Id } from "@repo/convex/data-model";
import { usePackageById } from "@repo/convex/hooks/usePackages";
import { createFileRoute } from "@tanstack/react-router";
import PackageForm from "../-PackageForm";

export const Route = createFileRoute("/admin/packages/$packageId/edit")({
	component: EditPackage,
});

function EditPackage() {
	const { packageId } = Route.useParams();
	const packageData = usePackageById(packageId as Id<"packages">);

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
	return <PackageForm mode="edit" packageData={packageData} />;
}
