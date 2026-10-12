import { useQuery, useMutation } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export function useShareholders(businessId?: Id<"businesses">) {
  return useQuery(
    api.shareholders.getShareholdersByBusiness,
    businessId ? { businessId } : "skip",
  );
}

export function useShareholderById(shareholderId?: Id<"shareholders">) {
  return useQuery(
    api.shareholders.getShareholderById,
    shareholderId ? { shareholderId } : "skip",
  );
}

export function useAddShareholder() {
  return useMutation(api.shareholders.addShareholder);
}

export function useUpdateShareholder() {
  return useMutation(api.shareholders.updateShareholder);
}

export function useRemoveShareholder() {
  return useMutation(api.shareholders.removeShareholder);
}
