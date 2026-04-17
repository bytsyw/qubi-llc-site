"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { triggerAdminReviewMetricSync, triggerAdminSyncRun } from "@/lib/api";

export default function SyncRunner() {
  const router = useRouter();
  const [registryRunning, setRegistryRunning] = useState(false);
  const [reviewRunning, setReviewRunning] = useState(false);
  const [status, setStatus] = useState("");

  async function handleRegistryRun() {
    try {
      setRegistryRunning(true);
      setStatus("");

      const result = await triggerAdminSyncRun();
      setStatus(
        `Registry sync completed. ${Array.isArray(result.results) ? result.results.length : 0} provider task(s) processed.`,
      );

      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Registry sync failed.");
    } finally {
      setRegistryRunning(false);
    }
  }

  async function handleReviewRun() {
    try {
      setReviewRunning(true);
      setStatus("");

      const result = await triggerAdminReviewMetricSync();
      setStatus(
        `Review/metric sync completed. ${Array.isArray(result.results) ? result.results.length : 0} app task(s) processed.`,
      );

      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Review/metric sync failed.");
    } finally {
      setReviewRunning(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
        Manual sync
      </div>

      <h2 className="mt-3 text-2xl font-black tracking-tight">Run sync jobs now</h2>

      <p className="mt-4 text-sm leading-7 text-black/60">
        Run registry discovery or review/metric synchronization manually.
      </p>

      {status ? (
        <div className="mt-4 rounded-2xl border border-black/8 bg-[#f7f5ef] px-4 py-3 text-sm text-black/65">
          {status}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleRegistryRun}
          disabled={registryRunning}
          className="rounded-2xl bg-[#111111] px-4 py-2.5 text-sm font-bold text-yellow-300 disabled:opacity-60"
        >
          {registryRunning ? "Running..." : "Run registry sync"}
        </button>

        <button
          onClick={handleReviewRun}
          disabled={reviewRunning}
          className="rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#111111] disabled:opacity-60"
        >
          {reviewRunning ? "Running..." : "Run reviews / metrics sync"}
        </button>
      </div>
    </div>
  );
}
