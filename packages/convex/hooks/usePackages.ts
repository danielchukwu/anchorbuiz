import { useQuery, useMutation } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export function usePackages(countryOriginalId?: number) {
  return useQuery(api.packages.getPackages, { countryOriginalId });
}

export function usePackageById(packageId?: Id<"packages">) {
  return useQuery(
    api.packages.getPackageById,
    packageId ? { packageId } : "skip",
  );
}

export function useCreatePackage() {
  return useMutation(api.packages.createPackage);
}

export function useUpdatePackage() {
  return useMutation(api.packages.updatePackage);
}

export function useDeletePackage() {
  return useMutation(api.packages.deletePackage);
}
