"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { Route } from "next";
import GoogleSignInButton from "@/components/auth/google-sign-in-button";
import AmbientGlow from "@/components/layout/ambient-glow";
import { Suspense } from "react";

type Mode = "signin" | "signup";

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionPending) return;

    if (session) {
      router.replace(session.user.isOnboarded ? ("/movies" as Route) : ("/onboarding" as Route));
    }
  }, [session, sessionPending, router]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;
    toast.error(error === "access_denied" ? "Google sign-in was cancelled." : "Google sign-in failed. Please try again.");
    router.replace("/auth" as Route);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (mode === "signup") {
      await authClient.signUp.email(
        {
          email,
          password,
          name,
          image: ""
        },
        {
          onSuccess: () => {
            toast.success("Account created! Let's set up your profile.");
          },
          onError: (error: { error: { message?: string } }) => {
            toast.error(error.error.message || "Sign up failed. Please try again.");
            setIsSubmitting(false);
          },
        },
      );
    } else {
      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            toast.success("Welcome back!");
          },
          onError: (error: { error: { message?: string } }) => {
            toast.error(error.error.message || "Sign in failed. Check your credentials.");
            setIsSubmitting(false);
          },
        },
      );
    }
  };

  if (sessionPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Prevent rendering while redirecting
  if (session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center px-4 py-16">
      <AmbientGlow />

      <div className="surface-card relative z-10 w-full max-w-md">
        <div className="h-1 bg-linear-to-r from-burgundy via-primary to-gold" />

        <div className="px-8 py-8">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-secondary/60 p-1 mb-8">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className={`flex-1 hover:cursor-pointer rounded-lg py-2 text-sm font-semibold transition-all ${
                  mode === m ? "bg-muted text-foreground shadow" : "text-muted-foreground hover:text-foreground/90"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to book your seats and manage your tickets."
                : "Join Mtb to start booking movie tickets in seconds."}
            </p>
          </div>

          <GoogleSignInButton
            label={mode === "signin" ? "Continue with Google" : "Sign up with Google"}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="field-input"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@example.com"
                className="field-input"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="field-input pr-11"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/90"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-cinema mt-2 w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <div className="border-t border-border px-8 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setName("");
                setEmail("");
                setPassword("");
              }}
              className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AuthPageInner />
    </Suspense>
  );
}
