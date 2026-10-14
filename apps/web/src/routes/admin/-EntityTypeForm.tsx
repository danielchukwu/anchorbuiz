import type { Id } from "@repo/convex/data-model";
import {
	useCreateEntityType,
	useUpdateEntityType,
} from "@repo/convex/hooks/useEntityTypes";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";

type EntityTypeRecord = {
	_id: Id<"entityTypes">;
	name: string;
	shortName: string;
	description?: string;
};

type EntityTypeFormProps = {
	mode: "create" | "edit";
	entityType?: EntityTypeRecord;
};

const inputClassName =
	"h-16 w-full rounded-2xl border border-[#dedede] bg-white px-5 text-xl text-neutral-900 outline-none transition focus:border-[#593cff] focus:ring-2 focus:ring-[#593cff]/10 placeholder:text-neutral-400";
const labelClassName = "mb-2 block text-base font-semibold text-neutral-500";

export default function EntityTypeForm({
	mode,
	entityType,
}: EntityTypeFormProps) {
	const navigate = useNavigate();
	const createEntityType = useCreateEntityType();
	const updateEntityType = useUpdateEntityType();
	const [name, setName] = useState("");
	const [shortName, setShortName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!entityType) return;
		setName(entityType.name);
		setShortName(entityType.shortName);
		setDescription(entityType.description ?? "");
	}, [entityType]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		const values = {
			name: name.trim(),
			shortName: shortName.trim(),
			description: description.trim(),
		};
		if (!values.name || !values.shortName) {
			setError("Enter an entity type name and short name.");
			return;
		}

		setIsSaving(true);
		try {
			if (mode === "edit" && entityType) {
				await updateEntityType({
					entityTypeId: entityType._id,
					...values,
				});
			} else {
				await createEntityType(values);
			}
			await navigate({ to: "/admin/entities" });
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Could not save this entity type. Try again.",
			);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-full w-full max-w-2xl flex-col bg-white pb-32 text-neutral-900">
			<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-center bg-white px-5">
				<button
					type="button"
					onClick={() => void navigate({ to: "/admin/entities" })}
					className="absolute left-5 flex size-9 items-center justify-start text-2xl leading-none text-neutral-700"
					aria-label="Back to entity types"
				>
					‹
				</button>
				<h1 className="text-base font-semibold text-[#a39add]">
					{mode === "create" ? "Create Entity Type" : "Edit Entity Type"}
				</h1>
			</header>

			<form onSubmit={handleSubmit} className="flex flex-1 flex-col">
				<div className="flex-1 space-y-6 px-5 pb-8 pt-2 sm:px-8">
					<label className="block">
						<span className={labelClassName}>Name</span>
						<input
							className={inputClassName}
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Name of entity type"
							maxLength={100}
							required
						/>
					</label>

					<label className="block">
						<span className={labelClassName}>Short name</span>
						<input
							className={inputClassName}
							value={shortName}
							onChange={(event) => setShortName(event.target.value)}
							placeholder="Ex: LTD, ..."
							maxLength={30}
							required
						/>
					</label>

					<label className="block">
						<span className={labelClassName}>Short description</span>
						<input
							className={inputClassName}
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Write something short..."
							maxLength={180}
						/>
					</label>

					{error && (
						<p
							className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
							role="alert"
						>
							{error}
						</p>
					)}
				</div>

				<div className="fixed inset-x-0 bottom-12 z-20 bg-white/95 px-5 py-4 backdrop-blur sm:static sm:px-8 sm:pt-2">
					<button
						type="submit"
						disabled={isSaving}
						className="mx-auto flex h-16 w-[80%] max-w-[520px] items-center justify-center rounded-full bg-[#553bff] px-6 text-lg font-semibold text-white transition hover:bg-[#462cf2] disabled:cursor-wait disabled:opacity-60"
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
