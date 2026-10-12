import { useQuery, useMutation } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export function useEntityTypesByCountry(countryOriginalId?: number) {
  return useQuery(
    api.countryEntityTypes.getEntityTypesByCountry,
    countryOriginalId !== undefined ? { countryOriginalId } : "skip",
  );
}

export function useAddCountryEntityType() {
  return useMutation(api.countryEntityTypes.addCountryEntityType);
}

export function useUpdateCountryEntityTypeOrder() {
  return useMutation(api.countryEntityTypes.updateCountryEntityTypeOrder);
}

export function useRemoveCountryEntityType() {
  return useMutation(api.countryEntityTypes.removeCountryEntityType);
}
