"use client";

import Link from "next/link";
import UserMenu from "./user-menu";
import type { ReactNode } from "react";

export default function HeaderBar({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="w-full flex justify-center items-center sm:px-6 px-2 border-b border-white/6">
        <div className="flex max-w-7xl w-full flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-10 py-5">
          <Link
            href="/"
            className="[font-family:var(--display,'Fraunces',serif)] text-2xl font-semibold text-[#fafafa] no-underline tracking-[-0.02em] whitespace-nowrap"
          >
            Mtb<span className="text-[#dc2626]">.</span>
          </Link>
          <nav className="flex gap-0 sm:gap-1">
            {/* <a className="px-2.5 sm:px-3.5 py-[0.4rem] rounded-full text-[0.8125rem] sm:text-sm cursor-pointer transition-colors duration-150 no-underline text-[#fafafa] bg-[#dc2626]/15">
            Now Showing
          </a> */}
            {/* <a className="px-2.5 sm:px-3.5 py-[0.4rem] rounded-full text-[0.8125rem] sm:text-sm text-white/55 cursor-pointer transition-colors duration-150 no-underline hover:text-white/90 hover:bg-white/6">
            Coming Soon
          </a> */}
            {/* <a className="px-2.5 sm:px-3.5 py-[0.4rem] rounded-full text-[0.8125rem] sm:text-sm text-white/55 cursor-pointer transition-colors duration-150 no-underline hover:text-white/90 hover:bg-white/[0.06]">
            Events
          </a> */}
          </nav>
          <div style={{ marginLeft: "auto" }}>
            <UserMenu />
          </div>
        </div>
      </div>
      {children}
    </>
  )
}
