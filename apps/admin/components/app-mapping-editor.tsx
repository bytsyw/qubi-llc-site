"use client";

import { useMemo, useState } from "react";
import { updateAdminAppMapping } from "@/lib/api";

type MappingRecord = {
    id: string;
    providerId: string;
    provider: "APPLE" | "GOOGLE";
    storeAppId: string | null;
    bundleId: string | null;
    packageName: string | null;
    countryCode: string | null;
    discovered: boolean;
    isPrimary: boolean;
    lastDiscoveredAt: string | null;
    lastSyncedAt: string | null;
  };

  function pickMapping(
    mappings: MappingRecord[],
    provider: "APPLE" | "GOOGLE",
  ) {
    return mappings.find((item) => item.provider === provider) ?? null;
  }

export default function AppMappingEditor({
  slug,
  mappings,
}: {
  slug: string;
  mappings: MappingRecord[];
}) {
  const appleInitial = useMemo(() => pickMapping(mappings, "APPLE"), [mappings]);
  const googleInitial = useMemo(() => pickMapping(mappings, "GOOGLE"), [mappings]);

  const [appleState, setAppleState] = useState({
    storeAppId: appleInitial?.storeAppId ?? "",
    bundleId: appleInitial?.bundleId ?? "",
    countryCode: appleInitial?.countryCode ?? "US",
  });

  const [googleState, setGoogleState] = useState({
    storeAppId: googleInitial?.storeAppId ?? "",
    packageName: googleInitial?.packageName ?? "",
    bundleId: googleInitial?.bundleId ?? "",
    countryCode: googleInitial?.countryCode ?? "US",
  });

  const [status, setStatus] = useState<{ apple?: string; google?: string }>({});
  const [saving, setSaving] = useState<{ apple: boolean; google: boolean }>({
    apple: false,
    google: false,
  });

  async function saveApple() {
    try {
      setSaving((prev) => ({ ...prev, apple: true }));
      setStatus((prev) => ({ ...prev, apple: "" }));

      await updateAdminAppMapping(slug, "APPLE", {
        storeAppId: appleState.storeAppId,
        bundleId: appleState.bundleId,
        countryCode: appleState.countryCode,
        isPrimary: true,
      });

      setStatus((prev) => ({ ...prev, apple: "Apple mapping saved." }));
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        apple: error instanceof Error ? error.message : "Save failed.",
      }));
    } finally {
      setSaving((prev) => ({ ...prev, apple: false }));
    }
  }

  async function saveGoogle() {
    try {
      setSaving((prev) => ({ ...prev, google: true }));
      setStatus((prev) => ({ ...prev, google: "" }));

      await updateAdminAppMapping(slug, "GOOGLE", {
        storeAppId: googleState.storeAppId,
        packageName: googleState.packageName,
        bundleId: googleState.bundleId,
        countryCode: googleState.countryCode,
        isPrimary: true,
      });

      setStatus((prev) => ({ ...prev, google: "Google mapping saved." }));
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        google: error instanceof Error ? error.message : "Save failed.",
      }));
    } finally {
      setSaving((prev) => ({ ...prev, google: false }));
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
            Apple mapping
          </div>
          <button
            onClick={saveApple}
            disabled={saving.apple}
            className="rounded-2xl bg-[#111111] px-4 py-2 text-sm font-bold text-yellow-300 disabled:opacity-60"
          >
            {saving.apple ? "Saving..." : "Save"}
          </button>
        </div>

        {status.apple ? (
          <div className="mt-4 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-black/65">
            {status.apple}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <Field
            label="Apple App ID"
            value={appleState.storeAppId}
            onChange={(value) => setAppleState((prev) => ({ ...prev, storeAppId: value }))}
          />
          <Field
            label="Bundle ID"
            value={appleState.bundleId}
            onChange={(value) => setAppleState((prev) => ({ ...prev, bundleId: value }))}
          />
          <Field
            label="Country code"
            value={appleState.countryCode}
            onChange={(value) => setAppleState((prev) => ({ ...prev, countryCode: value }))}
          />
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
            Google mapping
          </div>
          <button
            onClick={saveGoogle}
            disabled={saving.google}
            className="rounded-2xl bg-[#111111] px-4 py-2 text-sm font-bold text-yellow-300 disabled:opacity-60"
          >
            {saving.google ? "Saving..." : "Save"}
          </button>
        </div>

        {status.google ? (
          <div className="mt-4 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-black/65">
            {status.google}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <Field
            label="Google App ID"
            value={googleState.storeAppId}
            onChange={(value) => setGoogleState((prev) => ({ ...prev, storeAppId: value }))}
          />
          <Field
            label="Package name"
            value={googleState.packageName}
            onChange={(value) => setGoogleState((prev) => ({ ...prev, packageName: value }))}
          />
          <Field
            label="Bundle / internal key"
            value={googleState.bundleId}
            onChange={(value) => setGoogleState((prev) => ({ ...prev, bundleId: value }))}
          />
          <Field
            label="Country code"
            value={googleState.countryCode}
            onChange={(value) => setGoogleState((prev) => ({ ...prev, countryCode: value }))}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-black/65">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}