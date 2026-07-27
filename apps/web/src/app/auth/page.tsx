"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Film, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  // Prevent rendering while redirecting
  if (session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-4 py-12 pt-28">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-150 h-100 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="h-1 bg-linear-to-r from-red-700 via-red-500 to-orange-400" />

        <div className="px-8 py-8">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-zinc-800/60 p-1 mb-8">
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
                  mode === m ? "bg-zinc-700 text-zinc-100 shadow" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-100">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {mode === "signin"
                ? "Sign in to book your seats and manage your tickets."
                : "Join Mtb to start booking movie tickets in seconds."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-zinc-500">
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
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-zinc-500">
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
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-zinc-500">
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
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 pr-11 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center hover:cursor-pointer justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/40 hover:bg-red-500 disabled:bg-zinc-700"
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

        <div className="border-t border-zinc-800 px-8 py-4 text-center">
          <p className="text-xs text-zinc-600">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setName("");
                setEmail("");
                setPassword("");
              }}
              className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
