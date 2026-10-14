import { createFileRoute } from "@tanstack/react-router";
import PackageForm from "../-PackageForm";

export const Route = createFileRoute("/admin/packages/new")({
	component: CreatePackage,
});

function CreatePackage() {
	return <PackageForm mode="create" />;
}
