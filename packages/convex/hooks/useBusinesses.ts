import { useQuery, useMutation } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export function useMyBusinesses(status?: string) {
  return useQuery(api.businesses.getMyBusinesses, { status });
}

export function useBusinessById(businessId?: Id<"businesses">) {
  return useQuery(
    api.businesses.getBusinessById,
    businessId ? { businessId } : "skip",
  );
}

export function useBusinessesByCountry(countryOriginalId?: number) {
  return useQuery(
    api.businesses.getBusinessesByCountry,
    countryOriginalId !== undefined ? { countryOriginalId } : "skip",
  );
}

export function useSearchBusinesses(query: string) {
  return useQuery(
    api.businesses.searchBusinesses,
    query.trim() ? { query } : "skip",
  );
}

export function useCreateBusiness() {
  return useMutation(api.businesses.createBusiness);
}

export function useUpdateBusiness() {
  return useMutation(api.businesses.updateBusiness);
}

export function useDeleteBusiness() {
  return useMutation(api.businesses.deleteBusiness);
}
