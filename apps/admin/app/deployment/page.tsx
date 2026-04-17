import AdminShell from "@/components/admin-shell";
import DeploymentReadiness from "@/components/deployment-readiness";
import DeploymentSmokeTests from "@/components/deployment-smoke-tests";
import {
  getAdminProviders,
  getAdminSyncRuns,
  getApiLiveness,
  getApiReadiness,
  getDeploymentTasks,
  getSmokeTestRuns,
} from "@/lib/server-api";

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

type SyncRunRecord = {
  id: string;
  provider: "APPLE" | "GOOGLE";
  jobType: string;
  status: "SUCCESS" | "FAILED" | "RUNNING" | "PARTIAL" | "SKIPPED";
  startedAt: string;
  finishedAt: string | null;
  message: string | null;
};

type DeploymentTask = {
  id: string;
  key: string;
  title: string;
  category: string;
  status: "healthy" | "warning" | "critical" | "pending";
  description: string;
  note?: string | null;
  updatedAt: string;
  createdAt: string;
};

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

type CheckItem = {
  key: string;
  title: string;
  category: string;
  status: "healthy" | "warning" | "critical" | "pending";
  description: string;
  note?: string | null;
};

export default async function DeploymentPage() {
  let providers: ProviderRecord[] = [];
  let syncRuns: SyncRunRecord[] = [];
  let manualTasks: DeploymentTask[] = [];
  let smokeTestRuns: SmokeTestRun[] = [];
  let livenessOk = false;
  let readinessOk = false;

  try {
    await getApiLiveness();
    livenessOk = true;
  } catch {}

  try {
    await getApiReadiness();
    readinessOk = true;
  } catch {}

  try {
    providers = await getAdminProviders();
  } catch {}

  try {
    syncRuns = await getAdminSyncRuns();
  } catch {}

  try {
    manualTasks = await getDeploymentTasks();
  } catch {}

  try {
    smokeTestRuns = await getSmokeTestRuns();
  } catch {}

  const googleProvider = providers.find((item) => item.provider === "GOOGLE") ?? null;
  const appleProvider = providers.find((item) => item.provider === "APPLE") ?? null;

  const lastSuccessfulSync = syncRuns.find((item) => item.status === "SUCCESS") ?? null;

  const liveChecks: CheckItem[] = [
    {
      key: "api-liveness",
      title: "API liveness",
      category: "live",
      status: livenessOk ? "healthy" : "critical",
      description: livenessOk
        ? "API ayakta ve liveness endpoint cevap veriyor."
        : "API liveness endpoint cevap vermiyor.",
      note: null,
    },
    {
      key: "api-readiness",
      title: "API readiness",
      category: "live",
      status: readinessOk ? "healthy" : "critical",
      description: readinessOk
        ? "API readiness endpoint ve DB erişimi çalışıyor."
        : "Readiness başarısız. DB veya servis hazırlığı kontrol edilmeli.",
      note: null,
    },
    {
      key: "google-provider",
      title: "Google provider credentials",
      category: "live",
      status: googleProvider?.hasCredentials ? "healthy" : "critical",
      description: googleProvider?.hasCredentials
        ? "Google Play credentials kayıtlı görünüyor."
        : "Google Play credentials eksik.",
      note: null,
    },
    {
      key: "apple-provider",
      title: "Apple provider credentials",
      category: "live",
      status: appleProvider?.hasCredentials ? "healthy" : "warning",
      description: appleProvider?.hasCredentials
        ? "Apple credentials kayıtlı görünüyor."
        : "Apple credentials henüz eksik. Apple tarafı canlıda tamamlanmalı.",
      note: null,
    },
    {
      key: "recent-successful-sync",
      title: "Recent successful sync",
      category: "live",
      status: lastSuccessfulSync ? "healthy" : "warning",
      description: lastSuccessfulSync
        ? `${lastSuccessfulSync.provider} tarafında son başarılı sync mevcut.`
        : "Henüz başarılı sync görünmüyor.",
      note: null,
    },
  ];

  return (
    <AdminShell
      title="Deployment"
      description="Bu ekran canlıya çıkış öncesi teknik hazırlık durumunu özetler."
    >
      <DeploymentReadiness liveChecks={liveChecks} manualChecks={manualTasks} />

      <div className="mt-8">
        <DeploymentSmokeTests runs={smokeTestRuns} />
      </div>
    </AdminShell>
  );
}
