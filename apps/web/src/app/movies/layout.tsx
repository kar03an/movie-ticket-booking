import HeaderBar from "@/components/header-bar";
import type { ReactNode } from "react";

export default function MoviesLayout({ children }: { children: ReactNode }) {
  return <HeaderBar>{children}</HeaderBar>;
}
