import { createFileRoute } from "@tanstack/react-router";
import EntityTypeForm from "../-EntityTypeForm";

export const Route = createFileRoute("/admin/entities/new")({
	component: CreateEntityType,
});

function CreateEntityType() {
	return <EntityTypeForm mode="create" />;
}
