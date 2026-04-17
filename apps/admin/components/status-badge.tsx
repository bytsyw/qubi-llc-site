type StatusVariant = "success" | "failed" | "running" | "pending" | "skipped" | "neutral";

function normalizeStatus(status?: string | null): StatusVariant {
  const value = (status || "").toUpperCase();

  if (value === "SUCCESS") return "success";
  if (value === "FAILED") return "failed";
  if (value === "RUNNING") return "running";
  if (value === "PENDING") return "pending";
  if (value === "SKIPPED") return "skipped";

  return "neutral";
}

function getClasses(variant: StatusVariant) {
  switch (variant) {
    case "success":
      return "bg-[#111111] text-yellow-300";
    case "failed":
      return "bg-red-100 text-red-700";
    case "running":
      return "bg-yellow-100 text-black/75";
    case "pending":
      return "bg-black/5 text-black/60";
    case "skipped":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-black/5 text-black/60";
  }
}

export default function StatusBadge({
  status,
  label,
}: {
  status?: string | null;
  label?: string;
}) {
  const variant = normalizeStatus(status);
  const text = label || status || "UNKNOWN";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${getClasses(
        variant,
      )}`}
    >
      {text}
    </span>
  );
}
