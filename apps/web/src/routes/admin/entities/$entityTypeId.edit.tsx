import type { Id } from "@repo/convex/data-model";
import { useEntityTypeById } from "@repo/convex/hooks/useEntityTypes";
import { createFileRoute } from "@tanstack/react-router";
import EntityTypeForm from "../-EntityTypeForm";

export const Route = createFileRoute("/admin/entities/$entityTypeId/edit")({
	component: EditEntityType,
});

function EditEntityType() {
	const { entityTypeId } = Route.useParams();
	const entityType = useEntityTypeById(entityTypeId as Id<"entityTypes">);

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
	return <EntityTypeForm mode="edit" entityType={entityType} />;
}
