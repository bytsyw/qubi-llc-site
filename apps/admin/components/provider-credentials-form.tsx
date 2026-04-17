"use client";

import { useState } from "react";
import { discoverAdminAppleApps, saveAdminProviderCredentials } from "@/lib/api";

type ProviderCardProps = {
  provider: "APPLE" | "GOOGLE";
  title: string;
  description: string;
  initialLabel?: string | null;
};

const appleExample = `{
  "issuerId": "YOUR_ISSUER_ID",
  "keyId": "YOUR_KEY_ID",
  "privateKey": "-----BEGIN PRIVATE KEY-----\\nYOUR_P8_CONTENT\\n-----END PRIVATE KEY-----"
}`;

export default function ProviderCredentialsForm({
  provider,
  title,
  description,
  initialLabel,
}: ProviderCardProps) {
  const [accountLabel, setAccountLabel] = useState(initialLabel || "");
  const [payload, setPayload] = useState(provider === "APPLE" ? appleExample : "");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [discovering, setDiscovering] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      setStatus("");

      await saveAdminProviderCredentials({
        provider,
        accountLabel,
        payload,
      });

      setStatus("Credentials saved successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDiscover() {
    try {
      setDiscovering(true);
      setStatus("");

      const result = await discoverAdminAppleApps();
      setStatus(`Discovery completed. ${result.discoveredCount} app(s) synced.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Discovery failed.");
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
            Provider
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight">{title}</h2>
        </div>

        <span className="rounded-full bg-[#111111] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-yellow-300">
          {provider}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-black/60">{description}</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-black/65">
            Account label
          </label>
          <input
            value={accountLabel}
            onChange={(event) => setAccountLabel(event.target.value)}
            placeholder={
              provider === "APPLE" ? "Apple App Store Connect" : "Google Play Console"
            }
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-black/65">
            Credential payload
          </label>
          <textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            rows={12}
            placeholder={
              provider === "APPLE"
                ? appleExample
                : "Paste Google service account JSON here."
            }
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      {status ? (
        <div className="mt-4 rounded-2xl border border-black/8 bg-[#f7f5ef] px-4 py-3 text-sm text-black/65">
          {status}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !payload.trim()}
          className="rounded-2xl bg-[#111111] px-4 py-2.5 text-sm font-bold text-yellow-300 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save credentials"}
        </button>

        {provider === "APPLE" ? (
          <button
            onClick={handleDiscover}
            disabled={discovering}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#111111] disabled:opacity-60"
          >
            {discovering ? "Discovering..." : "Discover Apple Apps"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
