"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@movie-ticket-booking/ui/components/sonner";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import AuthProvider from "./auth-provider";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          scriptProps={{ type: "application/json" }}
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
