"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSessionPill from "@/components/admin-session-pill";
import type { ReactNode } from "react";
import AdminLogoutButton from "@/components/admin-logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/apps", label: "Apps" },
  { href: "/providers", label: "Providers" },
  { href: "/sync", label: "Sync" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/audit", label: "Audit" },
  { href: "/deployment", label: "Deployment" },
];

export default function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#111111]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-black/8 bg-white/80 px-6 py-6 lg:border-b-0 lg:border-r">
          <Link href="/dashboard" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111111] text-sm font-black text-yellow-300">
              Q
            </div>
            <div>
              <div className="text-sm font-semibold text-black/45">Qubi LLC</div>
              <div className="text-lg font-black tracking-tight">Admin Panel</div>
            </div>
          </Link>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-[#111111] text-yellow-300"
                      : "text-black/65 hover:bg-black/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-[1.5rem] border border-black/8 bg-[#111111] p-4 text-white">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
              Status
            </div>
            <div className="mt-3 text-sm text-white/75">
              Content management, provider connection setup and sync monitoring
              will be handled here.
            </div>
          </div>
        </aside>

        <main className="px-6 py-8 lg:px-10 lg:py-10">
          <div className="mb-8 border-b border-black/8 pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                  Qubi Admin
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-black/58">
                    {description}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <AdminSessionPill />
                <AdminLogoutButton />
              </div>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}