import {
  useQuery as useConvexQuery,
  useMutation as useConvexMutation,
  useAction as useConvexAction,
  useConvexAuth as useConvexAuthOrig,
  useConvex as useConvexOrig,
} from "convex/react";
import type {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
} from "convex/server";

export function useQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: FunctionArgs<Query> | "skip",
): FunctionReturnType<Query> | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return useConvexQuery(query, args as any);
}

export function useMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
): (args: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>> {
  if (typeof window === "undefined") {
    return (() => Promise.resolve()) as any;
  }
  return useConvexMutation(mutation);
}

export function useAction<Action extends FunctionReference<"action">>(
  action: Action,
): (args: FunctionArgs<Action>) => Promise<FunctionReturnType<Action>> {
  if (typeof window === "undefined") {
    return (() => Promise.resolve()) as any;
  }
  return useConvexAction(action);
}

export function useConvexAuth() {
  if (typeof window === "undefined") {
    return { isLoading: true, isAuthenticated: false };
  }
  return useConvexAuthOrig();
}

export function useConvex() {
  if (typeof window === "undefined") {
    return {
      query: () => Promise.resolve(undefined),
      mutation: () => Promise.resolve(undefined),
      action: () => Promise.resolve(undefined),
    };
  }
  return useConvexOrig();
}
