import AdminShell from "@/components/admin-shell";
import ProviderCredentialsForm from "@/components/provider-credentials-form";
import { getAdminProviders } from "@/lib/server-api";

type ProviderRecord = {
  id: string;
  provider: "APPLE" | "GOOGLE";
  status: "PENDING" | "CONNECTED" | "ERROR" | "DISABLED";
  accountLabel: string | null;
  lastCheckedAt: string | null;
  lastError: string | null;
  credentialCount: number;
  hasCredentials: boolean;
  updatedAt: string;
};

function findProvider(items: ProviderRecord[], provider: "APPLE" | "GOOGLE") {
  return items.find((item) => item.provider === provider) ?? null;
}

export default async function ProvidersPage() {
  let providers: ProviderRecord[] = [];
  let hasError = false;

  try {
    providers = await getAdminProviders();
  } catch {
    hasError = true;
  }

  const apple = findProvider(providers, "APPLE");
  const google = findProvider(providers, "GOOGLE");

  return (
    <AdminShell
      title="Providers"
      description="This screen now stores provider credentials in encrypted form. Apple discovery is wired to App Store Connect and will create registry/mapping records automatically."
    >
      {hasError ? (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Provider data could not be loaded from the backend.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <ProviderCredentialsForm
          provider="APPLE"
          title="Apple App Store Connect"
          description="Paste a structured JSON payload with issuerId, keyId and privateKey. After saving, use discovery to pull apps from App Store Connect."
          initialLabel={apple?.accountLabel}
        />

        <ProviderCredentialsForm
          provider="GOOGLE"
          title="Google Play Console"
          description="Save Google Play credentials here. Package mapping and sync flows come next."
          initialLabel={google?.accountLabel}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <StatusCard title="Apple status" provider={apple} />
        <StatusCard title="Google status" provider={google} />
      </div>
    </AdminShell>
  );
}

function StatusCard({
  title,
  provider,
}: {
  title: string;
  provider: ProviderRecord | null;
}) {
  return (
    <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
        {title}
      </div>

      <div className="mt-4 space-y-3">
        <InfoRow label="Status" value={provider?.status ?? "—"} />
        <InfoRow label="Account label" value={provider?.accountLabel ?? "—"} />
        <InfoRow
          label="Has credentials"
          value={provider?.hasCredentials ? "Yes" : "No"}
        />
        <InfoRow
          label="Credential count"
          value={String(provider?.credentialCount ?? 0)}
        />
        <InfoRow
          label="Last checked"
          value={provider?.lastCheckedAt ?? "—"}
        />
        <InfoRow label="Last error" value={provider?.lastError ?? "—"} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-black/8 bg-[#f7f5ef] px-4 py-3 text-sm text-black/70">
      <span className="font-semibold text-[#111111]">{label}:</span> {value}
    </div>
  );
}