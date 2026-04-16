"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createSmokeTestRun } from "@/lib/api";

type SmokeTestRun = {
  id: string;
  key: string;
  title: string;
  result: "passed" | "failed" | "blocked";
  note?: string | null;
  testerEmail: string;
  executedAt: string;
  createdAt: string;
};

const defaultTests = [
  { key: "admin-login", title: "Admin login flow" },
  { key: "providers-save", title: "Provider credential save" },
  { key: "manual-sync-run", title: "Manual sync trigger" },
  { key: "review-metric-sync", title: "Review / metric sync" },
  { key: "webhook-process", title: "Pending webhook processing" },
  { key: "deployment-page", title: "Deployment readiness page" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function resultClasses(result: SmokeTestRun["result"]) {
  switch (result) {
    case "passed":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "failed":
      return "bg-red-50 text-red-800 border-red-200";
    case "blocked":
      return "bg-yellow-50 text-yellow-900 border-yellow-200";
    default:
      return "bg-white text-black/70 border-black/8";
  }
}

export default function DeploymentSmokeTests({
  runs,
}: {
  runs: SmokeTestRun[];
}) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState(defaultTests[0].key);
  const [result, setResult] = useState<"passed" | "failed" | "blocked">("passed");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedTest = useMemo(
    () => defaultTests.find((item) => item.key === selectedKey) ?? defaultTests[0],
    [selectedKey],
  );

  async function handleSave() {
    try {
      setLoading(true);
      setStatus("");

      await createSmokeTestRun({
        key: selectedTest.key,
        title: selectedTest.title,
        result,
        note,
      });

      setStatus("Smoke test kaydedildi.");
      setNote("");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
        <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
          Record smoke test
        </div>

        <div className="mt-5 space-y-4">
          <select
            value={selectedKey}
            onChange={(event) => setSelectedKey(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          >
            {defaultTests.map((test) => (
              <option key={test.key} value={test.key}>
                {test.title}
              </option>
            ))}
          </select>

          <select
            value={result}
            onChange={(event) =>
              setResult(event.target.value as "passed" | "failed" | "blocked")
            }
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="passed">passed</option>
            <option value="failed">failed</option>
            <option value="blocked">blocked</option>
          </select>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="Test notu ekle..."
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          />

          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-2xl bg-[#111111] px-4 py-3 text-sm font-bold text-yellow-300 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save smoke test"}
          </button>

          {status ? (
            <div className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-black/65">
              {status}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
        <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
          Recent smoke test runs
        </div>

        {runs.length === 0 ? (
          <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-white px-4 py-4 text-sm text-black/60">
            Henüz smoke test kaydı yok.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {runs.map((run) => (
              <div
                key={run.id}
                className={`rounded-[1.2rem] border p-4 ${resultClasses(run.result)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold">{run.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.12em] opacity-75">
                      {run.result}
                    </div>
                  </div>

                  <div className="text-xs opacity-75">{formatDate(run.executedAt)}</div>
                </div>

                <div className="mt-3 text-sm opacity-90">
                  Tester: {run.testerEmail}
                </div>

                {run.note ? (
                  <div className="mt-3 rounded-2xl border border-black/8 bg-white/70 px-4 py-3 text-sm text-black/70">
                    {run.note}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}