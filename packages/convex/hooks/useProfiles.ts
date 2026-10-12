import { useQuery, useMutation } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export function useMyProfile() {
  return useQuery(api.profiles.getMyProfile);
}

export function useProfileByUserId(userId?: string) {
  return useQuery(
    api.profiles.getProfileByUserId,
    userId ? { userId } : "skip",
  );
}

export function useProfileById(id?: Id<"profile">) {
  return useQuery(api.profiles.getProfileById, id ? { id } : "skip");
}

export function useUpsertProfile() {
  return useMutation(api.profiles.upsertProfile);
}

export function useUpdateGovernmentIds() {
  return useMutation(api.profiles.updateGovernmentIds);
}

export function useEnsureProfile() {
  return useMutation(api.profiles.ensureProfile);
}
