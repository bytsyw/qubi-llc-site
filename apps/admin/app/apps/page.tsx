import Link from "next/link";
import AdminShell from "@/components/admin-shell";
import { getAdminPublicApps } from "@/lib/server-api";

type PublicApp = {
  id: string;
  slug: string;
  internalName: string;
  isActive: boolean;
  content: {
    locale: string;
    name: string;
    shortName: string | null;
    type: string | null;
    badge: string | null;
  } | null;
  storeSnapshot: {
    apple: {
      status: "pending" | "connected";
      rating: number | null;
      reviewCount: number | null;
      downloadEstimate: string | null;
      versionLabel: string | null;
      releaseStatus: string | null;
      capturedAt: string | null;
    };
    google: {
      status: "pending" | "connected";
      rating: number | null;
      reviewCount: number | null;
      downloadEstimate: string | null;
      versionLabel: string | null;
      releaseStatus: string | null;
      capturedAt: string | null;
    };
    lastSyncedAt: string | null;
  };
};

function getAppStatus(app: PublicApp) {
  const hasApple = app.storeSnapshot.apple.status === "connected";
  const hasGoogle = app.storeSnapshot.google.status === "connected";

  if (hasApple && hasGoogle) return "connected";
  if (hasApple || hasGoogle) return "partial";
  return "pending";
}

function formatStoreLabel(app: PublicApp) {
  const items: string[] = [];

  if (app.storeSnapshot.apple.status === "connected") items.push("Apple");
  if (app.storeSnapshot.google.status === "connected") items.push("Google");

  return items.length ? items.join(" + ") : "Not connected";
}

function formatLastSync(lastSyncedAt: string | null) {
  if (!lastSyncedAt) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(lastSyncedAt));
}

export default async function AppsPage() {
  let apps: PublicApp[] = [];
  let hasError = false;

  try {
    apps = await getAdminPublicApps("en");
  } catch {
    hasError = true;
  }

  return (
    <AdminShell
      title="Apps"
      description="This screen reads the real backend app registry. From here you can open each app and manage its localized content structure."
    >
      <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
              Registry
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight">App list</h2>
          </div>

          <button className="rounded-2xl bg-[#111111] px-4 py-2.5 text-sm font-bold text-yellow-300">
            New app
          </button>
        </div>

        {hasError ? (
          <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            Backend app list could not be loaded. Make sure the API is running on port
            4000 and try again.
          </div>
        ) : apps.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-black/8 bg-[#f7f5ef] px-4 py-4 text-sm text-black/60">
            No apps found in the registry yet.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-black/8">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#f7f5ef] text-sm text-black/55">
                <tr>
                  <th className="px-4 py-3 font-semibold">App</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Locale</th>
                  <th className="px-4 py-3 font-semibold">Stores</th>
                  <th className="px-4 py-3 font-semibold">Last sync</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => {
                  const status = getAppStatus(app);

                  return (
                    <tr key={app.id} className="border-t border-black/8 bg-white">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#111111]">
                          {app.content?.name || app.internalName}
                        </div>
                        <div className="text-sm text-black/50">
                          {app.content?.type || "No type yet"}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-black/60">{app.slug}</td>

                      <td className="px-4 py-4 text-sm text-black/60">
                        {app.content?.locale || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-black/60">
                        {formatStoreLabel(app)}
                      </td>

                      <td className="px-4 py-4 text-sm text-black/60">
                        {formatLastSync(app.storeSnapshot.lastSyncedAt)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                            status === "connected"
                              ? "bg-[#111111] text-yellow-300"
                              : status === "partial"
                                ? "bg-yellow-100 text-black/75"
                                : "bg-black/5 text-black/60"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <Link
                          href={`/apps/${app.slug}`}
                          className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition hover:bg-black/5"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
