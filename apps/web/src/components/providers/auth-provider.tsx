"use client";

import { authClient } from "@/lib/auth-client";
import { createContext, useContext, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ClientSession = typeof authClient.$Infer.Session;
export type ClientSessionUser = ClientSession["user"]

export const AuthContext = createContext<ClientSession | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen w-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
