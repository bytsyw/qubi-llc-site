"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { processAdminPendingWebhookEvents } from "@/lib/api";

export default function WebhookProcessor() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");

  async function handleProcess() {
    try {
      setRunning(true);
      setStatus("");

      const result = await processAdminPendingWebhookEvents();
      setStatus(
        `Pending processing finished. ${result.processedCount ?? 0} event(s) processed.`,
      );

      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Webhook processing failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
        Pending processing
      </div>

      <h2 className="mt-3 text-2xl font-black tracking-tight">
        Process unverified Apple events
      </h2>

      <p className="mt-4 text-sm leading-7 text-black/60">
        This retries pending webhook records. Apple events can become verified after
        certificate and environment configuration is completed.
      </p>

      {status ? (
        <div className="mt-4 rounded-2xl border border-black/8 bg-[#f7f5ef] px-4 py-3 text-sm text-black/65">
          {status}
        </div>
      ) : null}

      <div className="mt-6">
        <button
          onClick={handleProcess}
          disabled={running}
          className="rounded-2xl bg-[#111111] px-4 py-2.5 text-sm font-bold text-yellow-300 disabled:opacity-60"
        >
          {running ? "Processing..." : "Process pending events"}
        </button>
      </div>
    </div>
  );
}
