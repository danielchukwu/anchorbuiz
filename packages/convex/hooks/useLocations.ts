import { useQuery, useConvex } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import { useCallback } from "react";

export function useCountries() {
  return useQuery(api.locations.getCountries);
}

export function useRegistrationCountries() {
  return useQuery(api.locations.getRegistrationCountries);
}

export function useFetchCountries() {
  const convex = useConvex();
  return useCallback(async () => {
    const countries = await convex.query(api.locations.getCountries);
    return {
      success: true,
      message: "",
      data: {
        countries: (countries ?? []).map((c: any) => ({
          id: c.originalId ?? c._id,
          name: c.name,
          iso2: c.iso2 ?? undefined,
          phone_code: c.phoneCode ?? undefined,
        })),
      },
    };
  }, [convex]);
}

export function useStatesByCountryOriginalId(countryOriginalId?: number) {
  return useQuery(
    api.locations.getStatesByCountry,
    countryOriginalId !== undefined ? { countryOriginalId } : "skip",
  );
}

export function useStatesByName(countryName?: string) {
  return useQuery(
    api.locations.getStatesByCountryName,
    countryName ? { countryName } : "skip",
  );
}
export function useCountryByOriginalId(originalId?: number) {
  return useQuery(
    api.locations.getCountryByOriginalId,
    originalId !== undefined ? { originalId } : "skip",
  );
}

export function useStateByOriginalId(originalId?: number) {
  return useQuery(
    api.locations.getStateByOriginalId,
    originalId !== undefined ? { originalId } : "skip",
  );
}

export function useSearchLocations(query: string) {
  return useQuery(api.locations.searchLocations, { query });
}

export function useFetchStates() {
  const convex = useConvex();
  return useCallback(
    async (args: {
      data: { countryId: number; limit?: number; cursor?: string };
    }) => {
      const states = await convex.query(api.locations.getStatesByCountry, {
        countryOriginalId: args.data.countryId,
      });
      return {
        success: true,
        message: "",
        data: {
          states: (states ?? []).map((s: any) => ({
            id: s.originalId ?? s._id,
            name: s.name,
          })),
        },
        meta: { next_cursor: "", has_more: false },
      };
    },
    [convex],
  );
}
