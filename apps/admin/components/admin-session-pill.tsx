"use client";

import { useEffect, useState } from "react";

type SessionState = {
  authenticated: boolean;
  session?: {
    email: string;
  };
};

function redirectToLogin() {
  if (typeof window === "undefined") return;

  const next = `${window.location.pathname}${window.location.search}`;
  const loginUrl = `/login?next=${encodeURIComponent(next)}`;
  window.location.replace(loginUrl);
}

export default function AdminSessionPill() {
  const [state, setState] = useState<SessionState | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401) {
          if (mounted) {
            setState({ authenticated: false });
          }
          redirectToLogin();
          return;
        }

        if (!response.ok) {
          if (mounted) {
            setState({ authenticated: false });
          }
          return;
        }

        const data = await response.json();

        if (mounted) {
          setState(data);
        }
      } catch {
        if (mounted) {
          setState({ authenticated: false });
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (!state?.authenticated) {
    return (
      <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/45">
        Session
      </div>
    );
  }

  return (
    <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/65">
      {state.session?.email || "admin"}
    </div>
  );
}
