import { authClient } from "@repo/convex/auth-client";
import { Button } from "@repo/ui/components/button";
import LogoIcon from "@repo/ui/icons/logo-icon";
import LogoIconIcon from "@repo/ui/icons/logo-icon-icon";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

type AuthScreenProps = {
  mode: "login" | "signup";
  redirectTo?: string;
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-6 shrink-0" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}

export function AuthScreen({ mode, redirectTo }: AuthScreenProps) {
  const isSignup = mode === "signup";
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sanitize the redirect destination to prevent INVALID_CALLBACK_URL errors.
  // Better Auth requires a simple trusted URL — strip nested /signup or /login
  // paths that accumulate from redirect loops.
  const safeDestination = (() => {
    const authPaths = ["/signup", "/login"];
    let dest = redirectTo || "/";
    // Decode if it's been encoded multiple times
    try {
      let prev = dest;
      // biome-ignore lint/suspicious/noAssignInExpressions: intentional decode loop
      while (prev !== (prev = decodeURIComponent(prev))) { /* decode */ }
      dest = prev;
    } catch {
      dest = "/";
    }
    // If it resolved to an auth page, fall back to home
    if (!dest || authPaths.some((p) => dest.startsWith(p))) {
      dest = "/";
    }
    // Strip query params so Better Auth gets a clean path
    return dest.split("?")[0] || "/";
  })();

  async function continueWithGoogle() {
    setError("");
    setIsLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: safeDestination,
      });
      if (result && "error" in result && result.error) {
        setError(
          result.error.message ??
            "Google sign-in is unavailable. Please try again.",
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(
        err?.message || "Google sign-in is unavailable. Please try again.",
      );
      setIsLoading(false);
    }
  }


  return (
    <main className="relative flex min-h-dvh flex-col bg-white px-6 text-neutral-800">
      {/* Top Header with Anchor Logo */}
      <header className="flex justify-center md:justify-start pt-8 sm:px-20 sm:pt-12">
        <LogoIcon />
      </header>

      {/* Main Center Content */}
      <section
        className="flex-1 pt-40 flex flex-col gap-8 items-center text-center"
        aria-labelledby="auth-heading"
      >
        <LogoIconIcon className="text-c-40 size-12" />
        <div className="flex flex-col items-center gap-1">
          <h1
            id="auth-heading"
            className="text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl"
          >
            {isSignup ? "Create an Account" : "Log in"}
          </h1>
          <p className="mt-3 text-base text-neutral-500 sm:text-lg">
            {isSignup
              ? "Register Your Businesses Globally"
              : "Manage Your Global Businesses"}
          </p>
        </div>

        {/* Continue with Google button */}
        <Button
          variant="black"
          className="w-[300px]"
          // className="mt-8 flex h-14 w-full max-w-[364px] items-center justify-center gap-3 rounded-full bg-black px-6 text-base font-medium text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-wait disabled:opacity-75 sm:h-16 sm:text-lg"
          onClick={() => void continueWithGoogle()}
          disabled={isLoading}
        >
          <GoogleMark />
          <span>Continue with Google</span>
        </Button>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </section>

      {/* Bottom Switcher */}
      <footer className="pb-20 text-center text-sm text-neutral-400 sm:text-base">
        <p>
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <Link
            to={isSignup ? "/login" : "/signup"}
            search={redirectTo ? { redirect_to: redirectTo } : {}}
            className="font-semibold text-[#533AFD] transition-underline hover:underline"
          >
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </footer>
    </main>
  );
}
