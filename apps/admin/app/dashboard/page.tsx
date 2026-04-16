import AdminShell from "@/components/admin-shell";

export default function DashboardPage() {
  return (
    <AdminShell
      title="Dashboard"
      description="This screen will become the main control center for provider connection status, sync jobs, content readiness and app publication visibility."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Apps in registry" value="3" subtitle="Seeded and active" />
        <Card title="Providers" value="2" subtitle="Apple + Google" />
        <Card title="Last sync" value="Mock" subtitle="Real jobs next" />
        <Card title="Panel status" value="Ready" subtitle="Skeleton complete" />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-black/8 bg-white/80 p-6">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
            Roadmap
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            Next backend-connected admin steps
          </h2>
          <div className="mt-5 space-y-3">
            {[
              "App content edit forms",
              "Provider credential upload",
              "Store mapping screens",
              "Sync run monitor",
              "Review preview and metric snapshots",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-black/8 bg-[#f7f5ef] px-4 py-3 text-sm font-medium text-black/70"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/8 bg-[#111111] p-6 text-white">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
            Note
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            This panel is intentionally lightweight for now.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            The goal of this step is to lock the application structure before
            adding real forms, auth, credential encryption and sync actions.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[2rem] border border-black/8 bg-white/80 p-5">
      <div className="text-sm font-medium text-black/48">{title}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-[#111111]">
        {value}
      </div>
      <div className="mt-2 text-sm text-black/55">{subtitle}</div>
    </div>
  );
}