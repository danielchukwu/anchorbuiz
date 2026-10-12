import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/AuthScreen";

export const Route = createFileRoute("/(auth)/signup")({
  validateSearch: (search: Record<string, unknown>): { redirect_to?: string } => ({
    redirect_to: typeof search.redirect_to === "string" ? search.redirect_to : undefined,
  }),
  component: SignUpRoute,
});

function SignUpRoute() {
  const { redirect_to } = Route.useSearch();
  return <AuthScreen mode="signup" redirectTo={redirect_to} />;
}
