import { useQuery, useMutation } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export function useEntityTypes() {
  return useQuery(api.entityTypes.getEntityTypes);
}

export function useEntityTypeById(entityTypeId?: Id<"entityTypes">) {
  return useQuery(
    api.entityTypes.getEntityTypeById,
    entityTypeId ? { entityTypeId } : "skip",
  );
}

export function useAdminEntityTypes() {
  return useQuery(api.entityTypes.getAdminEntityTypes);
}

export function useAdminEntityType(entityTypeId?: Id<"entityTypes">) {
  return useQuery(
    api.entityTypes.getAdminEntityType,
    entityTypeId ? { entityTypeId } : "skip",
  );
}

export function useEntityTypeByShortName(shortName?: string) {
  return useQuery(
    api.entityTypes.getEntityTypeByShortName,
    shortName ? { shortName } : "skip",
  );
}

export function useCreateEntityType() {
  return useMutation(api.entityTypes.createEntityType);
}

export function useUpdateEntityType() {
  return useMutation(api.entityTypes.updateEntityType);
}

export function useDeleteEntityType() {
  return useMutation(api.entityTypes.deleteEntityType);
}
