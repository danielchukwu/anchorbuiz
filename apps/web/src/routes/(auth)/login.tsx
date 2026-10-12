import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/AuthScreen";

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: (search: Record<string, unknown>): { redirect_to?: string } => ({
    redirect_to: typeof search.redirect_to === "string" ? search.redirect_to : undefined,
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const { redirect_to } = Route.useSearch();
  return <AuthScreen mode="login" redirectTo={redirect_to} />;
}
