"use client";

import { useState, useEffect } from "react";
import { Building2, Mail, MapPin, Tag, Loader2, Save, ArrowLeft, Film } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import {
  useProfileMtn,
  type CustomerProfile,
  type ProfileData,
  type TheatreProfile,
} from "@/hooks/mutation/useProfileMtn";
import { useProfile } from "@/hooks/query/useProfile";
import ErrorComponent from "@/components/error";
import { useAuth } from "@/components/providers/auth-provider";
import { redirect } from "next/navigation";

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  icon: Icon,
  disabled,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15 disabled:opacity-50 disabled:cursor-not-allowed ${Icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

function CustomerProfileForm({
  profile,
  email,
  onSave,
  isSaving,
}: {
  profile: CustomerProfile;
  email: string;
  onSave: (data: { name: string; email: string }) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(profile.name);
  const [emailVal, setEmailVal] = useState(email);

  const isDirty = name !== profile.name || emailVal !== email;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, email: emailVal });
      }}
      className="space-y-4"
    >
      <Field
        label="Display Name"
        id="customer-name"
        value={name}
        onChange={setName}
        placeholder="Ada Lovelace"
        icon={Tag}
      />
      <Field
        label="Email"
        id="customer-email"
        type="email"
        value={emailVal}
        onChange={setEmailVal}
        placeholder="ada@example.com"
        icon={Mail}
      />
      <button
        type="submit"
        disabled={isSaving || !isDirty || !name.trim() || !emailVal.trim()}
        className="flex items-center hover:cursor-pointer mt-4 gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isSaving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}

function BusinessProfileForm({
  profile,
  email,
  onSave,
  isSaving,
}: {
  profile: TheatreProfile;
  email: string;
  onSave: (data: { email: string; title: string; address: string; city: string; country: string }) => void;
  isSaving: boolean;
}) {
  const [emailVal, setEmailVal] = useState(email);
  const [title, setTitle] = useState(profile.title);
  const [address, setAddress] = useState(profile.address);
  const [city, setCity] = useState(profile.city);
  const [country, setCountry] = useState(profile.country);

  const isDirty =
    emailVal !== email ||
    title !== profile.title ||
    address !== profile.address ||
    city !== profile.city ||
    country !== profile.country;

  const isValid = emailVal.trim() && title.trim() && address.trim() && city.trim() && country.trim();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ email: emailVal, title, address, city, country });
      }}
      className="space-y-4"
    >
      <Field
        label="Theatre Name"
        id="theatre-title"
        value={title}
        onChange={setTitle}
        placeholder="Cineplex Downtown"
        icon={Building2}
      />
      <Field
        label="Email"
        id="business-email"
        type="email"
        value={emailVal}
        onChange={setEmailVal}
        placeholder="theatre@example.com"
        icon={Mail}
      />
      <Field
        label="Street Address"
        id="theatre-address"
        value={address}
        onChange={setAddress}
        placeholder="12 Cinema Lane"
        icon={MapPin}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" id="theatre-city" value={city} onChange={setCity} placeholder="Mumbai" />
        <Field label="Country" id="theatre-country" value={country} onChange={setCountry} placeholder="India" />
      </div>
      <button
        type="submit"
        disabled={isSaving || !isDirty || !isValid}
        className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isSaving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}

export default function ProfilePage() {
  const session = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const userProfile = useProfile(session);
  const updateProfileMutation = useProfileMtn(() => {
    setIsSaving(false);
  });

  const handleSave = async (data: Record<string, string>) => {
    setIsSaving(true);
    updateProfileMutation.mutate(data);
  };

  useEffect(() => {
    console.log(userProfile.data);
    setProfile(userProfile.data);
  }, [userProfile.data]);

  if (session === null) {
    redirect("/auth")
  }

  if (!profile || userProfile.isPending) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (userProfile.isError || !userProfile.data) {
    return <ErrorComponent message={userProfile.error?.message ?? "Failed to load user profile"} />;
  }

  const user = profile;
  const isCustomer = user && user.role === "CUSTOMER";
  const initials =
    user &&
    (user.name ?? user.email)
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-150 h-100 rounded-full bg-red-600/8 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Film className="h-5 w-5 text-red-500" />
            <span className="font-semibold tracking-tight text-zinc-100">
              Mtb<span className="text-red-500">.</span>
            </span>
          </Link>
          <Link
            href={"/movies" as Route}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to movies
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Avatar + identity */}
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-600/15 text-red-400 text-xl font-bold select-none">
            {initials}
          </div>
          <div className="flex">
            <h1 className="text-2xl font-bold text-zinc-100">{isCustomer ? user.customer?.name : ""}</h1>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="h-1 bg-linear-to-r from-red-700 via-red-500 to-orange-400" />
          <div className="px-6 py-6">
            <h2 className="text-sm font-semibold text-zinc-300 mb-5">
              {isCustomer ? "Account Details" : "Theatre Details"}
            </h2>

            {isCustomer && user.customer && (
              <CustomerProfileForm profile={user.customer} email={user.email} onSave={handleSave} isSaving={isSaving} />
            )}

            {!isCustomer && user.theatre && (
              <BusinessProfileForm profile={user.theatre} email={user.email} onSave={handleSave} isSaving={isSaving} />
            )}

            {isCustomer && !user.customer && (
              <p className="text-sm text-zinc-500">No customer profile found. Please complete onboarding.</p>
            )}
            {!isCustomer && !user.theatre && (
              <p className="text-sm text-zinc-500">No theatre profile found. Please complete onboarding.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
