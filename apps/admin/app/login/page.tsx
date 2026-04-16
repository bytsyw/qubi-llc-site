"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setStatus("");

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus(data?.error || "Login başarısız.");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setStatus("Giriş sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f1ea] px-6 py-10">
      <div className="mx-auto max-w-md rounded-[2rem] border border-black/8 bg-white p-8 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
          Admin access
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#111111]">
          Qubi LLC Admin Login
        </h1>
        <p className="mt-3 text-sm leading-7 text-black/60">
          Yönetim paneline erişmek için giriş yap.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-black/65">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black/65">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-[#f7f5ef] px-4 py-3 text-sm outline-none"
            />
          </div>

          {status ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {status}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#111111] px-4 py-3 text-sm font-bold text-yellow-300 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}