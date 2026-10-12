import { useQuery } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export function useCurrencies() {
  return useQuery(api.currencies.getCurrencies);
}

export function useCurrencyByCode(code?: string) {
  return useQuery(api.currencies.getCurrencyByCode, code ? { code } : "skip");
}

export function useCurrencyById(id?: Id<"currencies">) {
  return useQuery(api.currencies.getCurrencyById, id ? { id } : "skip");
}
