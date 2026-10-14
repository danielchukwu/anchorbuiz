import { api } from "../convex/_generated/api";
import { useMutation, useQuery } from "./convex-hooks";

export function useAdminAccess(enabled = true) {
	return useQuery(api.admin.getAccess, enabled ? {} : "skip");
}

export function useAdminDashboard(enabled = true) {
	return useQuery(api.admin.getDashboard, enabled ? {} : "skip");
}

export function useAdminCountries() {
	return useQuery(api.admin.getCountryAdminList);
}

export function useAdminCountryDetails(countryOriginalId?: number) {
	return useQuery(
		api.admin.getCountryAdminDetails,
		countryOriginalId !== undefined ? { countryOriginalId } : "skip",
	);
}

export function useSetCountryRegistrationAvailability() {
	return useMutation(api.admin.setCountryRegistrationAvailability);
}
