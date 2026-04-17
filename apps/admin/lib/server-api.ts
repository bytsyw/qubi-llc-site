import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
).replace(/\/$/, "");

async function adminServerFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return response;
}

export async function getAdminPublicApps(locale = "en") {
  const response = await adminServerFetch(`/public/apps?locale=${locale}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch apps (${response.status})`);
  }

  return response.json();
}

export async function getAdminPublicApp(slug: string, locale = "en") {
  const response = await adminServerFetch(`/public/apps/${slug}?locale=${locale}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch app "${slug}" (${response.status})`);
  }

  return response.json();
}

export async function getAdminProviders() {
  const response = await adminServerFetch(`/admin/providers`);

  if (!response.ok) {
    throw new Error(`Failed to fetch providers (${response.status})`);
  }

  return response.json();
}

export async function getAdminSyncRuns() {
  const response = await adminServerFetch(`/admin/sync/runs`);

  if (!response.ok) {
    throw new Error(`Failed to fetch sync runs (${response.status})`);
  }

  return response.json();
}

export async function getAdminWebhookEvents() {
  const response = await adminServerFetch(`/admin/webhooks/events`);

  if (!response.ok) {
    throw new Error(`Failed to fetch webhook events (${response.status})`);
  }

  return response.json();
}

export async function getAdminAppMetrics(slug: string) {
  const response = await adminServerFetch(`/admin/apps/${slug}/metrics`);

  if (!response.ok) {
    throw new Error(`Failed to fetch app metrics (${response.status})`);
  }

  return response.json();
}
export async function getAdminAuditLogs() {
  const response = await adminServerFetch(`/admin/audit/logs`);

  if (!response.ok) {
    throw new Error(`Failed to fetch audit logs (${response.status})`);
  }

  return response.json();
}
export async function getApiLiveness() {
  const response = await fetch(`${API_BASE_URL}/health/liveness`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch liveness (${response.status})`);
  }

  return response.json();
}

export async function getApiReadiness() {
  const response = await fetch(`${API_BASE_URL}/health/readiness`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch readiness (${response.status})`);
  }

  return response.json();
}
export async function getDeploymentTasks() {
  const response = await adminServerFetch(`/admin/deployment/tasks`);

  if (!response.ok) {
    throw new Error(`Failed to fetch deployment tasks (${response.status})`);
  }

  return response.json();
}
export async function getSmokeTestRuns() {
  const response = await adminServerFetch(`/admin/deployment/smoke-tests`);

  if (!response.ok) {
    throw new Error(`Failed to fetch smoke test runs (${response.status})`);
  }

  return response.json();
}
