"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateDeploymentTask } from "@/lib/api";

type CheckStatus = "healthy" | "warning" | "critical" | "pending";

type CheckItem = {
  key: string;
  title: string;
  category: string;
  status: CheckStatus;
  description: string;
  note?: string | null;
};

function getStatusClasses(status: CheckStatus) {
  switch (status) {
    case "healthy":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-900";
    case "critical":
      return "border-red-200 bg-red-50 text-red-800";
    case "pending":
      return "border-blue-200 bg-blue-50 text-blue-800";
    default:
      return "border-black/8 bg-white text-black/70";
  }
}

function getStatusLabel(status: CheckStatus) {
  switch (status) {
    case "healthy":
      return "ready";
    case "warning":
      return "warning";
    case "critical":
      return "critical";
    case "pending":
      return "pending";
    default:
      return "unknown";
  }
}

const statusOptions: CheckStatus[] = ["pending", "warning", "critical", "healthy"];

export default function DeploymentReadiness({
  liveChecks,
  manualChecks,
}: {
  liveChecks: CheckItem[];
  manualChecks: CheckItem[];
}) {
  const blockers = [...liveChecks, ...manualChecks].filter(
    (item) => item.status === "critical",
  ).length;

  const warnings = [...liveChecks, ...manualChecks].filter(
    (item) => item.status === "warning" || item.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-3">
        <SummaryCard
          title="Critical blockers"
          value={String(blockers)}
          description="Canlıya çıkmadan önce çözülmesi gereken maddeler"
        />
        <SummaryCard
          title="Warnings / pending"
          value={String(warnings)}
          description="Takip edilmesi gereken ama hemen bloklamayan maddeler"
        />
        <SummaryCard
          title="Go-live status"
          value={blockers === 0 ? "Close" : "Blocked"}
          description={
            blockers === 0
              ? "Canlıya çıkış için büyük engel görünmüyor"
              : "Önce kritik maddeleri kapat"
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChecklistCard title="Live system checks" items={liveChecks} editable={false} />
        <ChecklistCard title="Manual production checks" items={manualChecks} editable />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-yellow-700">
        {title}
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight text-[#111111]">
        {value}
      </div>
      <div className="mt-2 text-sm leading-7 text-black/58">{description}</div>
    </div>
  );
}

function ChecklistCard({
  title,
  items,
  editable,
}: {
  title: string;
  items: CheckItem[];
  editable?: boolean;
}) {
  return (
    <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
      <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
        {title}
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <ChecklistItem key={item.key} item={item} editable={editable} />
        ))}
      </div>
    </div>
  );
}

function ChecklistItem({ item, editable }: { item: CheckItem; editable?: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<CheckStatus>(item.status);
  const [note, setNote] = useState(item.note || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    try {
      setLoading(true);
      setMessage("");

      await updateDeploymentTask(item.key, {
        status,
        note,
      });

      setMessage("Saved");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-[1.2rem] border px-4 py-4 ${getStatusClasses(status)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-bold">{item.title}</div>
        <div className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]">
          {getStatusLabel(status)}
        </div>
      </div>

      <div className="mt-2 text-sm leading-7 opacity-90">{item.description}</div>

      {editable ? (
        <div className="mt-4 space-y-3">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as CheckStatus)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Not ekle..."
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-2xl bg-[#111111] px-4 py-2.5 text-sm font-bold text-yellow-300 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>

            {message ? <div className="text-sm text-black/65">{message}</div> : null}
          </div>
        </div>
      ) : item.note ? (
        <div className="mt-4 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-black/65">
          {item.note}
        </div>
      ) : null}
    </div>
  );
}
