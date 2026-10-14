import { api } from "../convex/_generated/api";
import { useMutation, useQuery } from "./convex-hooks";

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

export function useSaveCountryEntityTypes() {
	return useMutation(api.countryEntityTypes.saveCountryEntityTypes);
}
