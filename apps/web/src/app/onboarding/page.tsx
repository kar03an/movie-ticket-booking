"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { env } from "@movie-ticket-booking/env/web";
import { toast } from "sonner";
import {
  Film,
  Loader2,
  User,
  Building2,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Tag,
} from "lucide-react";
import type { Route } from "next";

type Role = "CUSTOMER" | "OWNER";

function RolePicker({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center mb-6">
        How are you planning to use Mtb?
      </p>

      <button
        type="button"
        onClick={() => onSelect("CUSTOMER")}
        className="group hover:cursor-pointer w-full flex items-start gap-4 rounded-2xl border border-border bg-secondary/50 p-5 text-left transition-all hover:border-primary/50 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:bg-primary/25 transition-colors">
          <User className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Browse Movies</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-muted-foreground transition-colors" />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse movies, book seats, and manage your tickets.
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelect("OWNER")}
        className="group hover:cursor-pointer w-full flex items-start gap-4 rounded-2xl border border-border bg-secondary/50 p-5 text-left transition-all hover:border-primary/50 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-600/15 text-orange-400 group-hover:bg-orange-600/25 transition-colors">
          <Building2 className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Owner</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-muted-foreground transition-colors" />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            List your theatre, manage shows, and sell tickets to your audience.
          </p>
        </div>
      </button>
    </div>
  );
}

function CustomerForm({
  onSubmit,
  onBack,
  isSubmitting,
}: {
  onSubmit: (data: { name: string }) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-muted-foreground text-center">
        Just your name to get started — you can update it any time.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="customer-name"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Display Name
        </label>
        <div className="relative">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="customer-name"
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="field-input pl-10"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-border bg-transparent px-5 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="btn-cinema flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up…
            </>
          ) : (
            "Finish Setup"
          )}
        </button>
      </div>
    </form>
  );
}

function BusinessForm({
  onSubmit,
  onBack,
  isSubmitting,
}: {
  onSubmit: (data: {
    title: string;
    address: string;
    city: string;
    country: string;
  }) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim() || !city.trim() || !country.trim())
      return;
    onSubmit({
      title: title.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        Tell us about your theatre so customers can find you.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="theatre-title"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Theatre Name
        </label>
        <input
          id="theatre-title"
          type="text"
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Cineplex Downtown"
          className="field-input"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="theatre-address"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Street Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="theatre-address"
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="12 Cinema Lane"
            className="field-input pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="theatre-city"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            City
          </label>
          <input
            id="theatre-city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Mumbai"
            className="field-input"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="theatre-country"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Country
          </label>
          <input
            id="theatre-country"
            type="text"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="India"
            className="field-input"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-border bg-transparent px-5 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !title.trim() ||
            !address.trim() ||
            !city.trim() ||
            !country.trim()
          }
          className="btn-cinema flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up…
            </>
          ) : (
            "Finish Setup"
          )}
        </button>
      </div>
    </form>
  );
}

function OnboardingSuccess({ role }: { role: Role }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">You're all set!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === "CUSTOMER"
            ? "Your account is ready. Start exploring movies near you."
            : "Your theatre profile is live. Start adding movies and showtimes."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => router.push("/movies" as Route)}
        className="btn-cinema mt-2"
      >
        <Film className="h-4 w-4" />
        {role === "CUSTOMER" ? "Browse Movies" : "Go to Dashboard"}
      </button>
    </div>
  );
}

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < step
              ? "w-6 bg-primary"
              : i === step
                ? "w-4 bg-gold"
                : "w-1.5 bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [step, setStep] = useState<"role" | "details" | "done">("role");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (sessionPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not logged in — send to auth
  if (!session) {
    router.replace("/auth" as Route);
    return null;
  }

  // Already onboarded — no reason to be here
  if (session.user.isOnboarded) {
    router.replace("/movies" as Route);
    return null;
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep("details");
  };

  const handleOnboardSubmit = async (data: Record<string, string>) => {
    if (!selectedRole) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: selectedRole, ...data }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Onboarding failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setStep("done");
      toast.success("Profile set up successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const stepIndex = step === "role" ? 0 : step === "details" ? 1 : 2;
  const titles = {
    role: "Choose your role",
    details: selectedRole === "CUSTOMER" ? "Your profile" : "Your theatre",
    done: "Welcome aboard",
  };

  return (
    <div className="relative flex flex-col items-center justify-center px-4 py-12">

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-linear-to-r from-burgundy via-primary to-gold" />

        <div className="px-8 py-8">
          {/* Progress */}
          <ProgressDots step={stepIndex} total={3} />

          {/* Heading */}
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
              Step {stepIndex + 1} of 3
            </p>
            <h1 className="text-2xl font-bold text-foreground">{titles[step]}</h1>
          </div>

          {/* Step content */}
          {step === "role" && <RolePicker onSelect={handleRoleSelect} />}

          {step === "details" && selectedRole === "CUSTOMER" && (
            <CustomerForm
              onSubmit={handleOnboardSubmit}
              onBack={() => setStep("role")}
              isSubmitting={isSubmitting}
            />
          )}

          {step === "details" && selectedRole === "OWNER" && (
            <BusinessForm
              onSubmit={handleOnboardSubmit}
              onBack={() => setStep("role")}
              isSubmitting={isSubmitting}
            />
          )}

          {step === "done" && selectedRole && (
            <OnboardingSuccess role={selectedRole} />
          )}
        </div>
      </div>
    </div>
  );
}
