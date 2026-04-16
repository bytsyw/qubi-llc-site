const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

class AdminUnauthorizedError extends Error {
  constructor(message = "Oturum süresi doldu.") {
    super(message);
    this.name = "AdminUnauthorizedError";
  }
}

function redirectToLogin() {
  if (typeof window === "undefined") return;

  const next = `${window.location.pathname}${window.location.search}`;
  const loginUrl = `/login?next=${encodeURIComponent(next)}`;
  window.location.replace(loginUrl);
}

async function parseApiError(response: Response, fallbackMessage: string) {
  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    try {
      const text = await response.text();
      if (text) {
        return new Error(text);
      }
    } catch {
      return new Error(fallbackMessage);
    }

    return new Error(fallbackMessage);
  }

  const code = typeof payload?.code === "string" ? payload.code : "";
  const message =
    typeof payload?.message === "string" && payload.message.trim()
      ? payload.message.trim()
      : fallbackMessage;

  if (code === "VALIDATION_ERROR" && Array.isArray(payload?.details)) {
    const detailsText = payload.details
      .map((item: any) => {
        const field = typeof item?.field === "string" ? item.field : "field";
        const constraints = Array.isArray(item?.constraints)
          ? item.constraints.join(", ")
          : "";
        return `${field}: ${constraints}`;
      })
      .join(" | ");

    return new Error(detailsText || message);
  }

  if (response.status === 429 || code === "RATE_LIMITED") {
    return new Error("Çok fazla istek gönderildi. Biraz bekleyip tekrar dene.");
  }

  if (response.status === 401 || code === "UNAUTHORIZED") {
    return new AdminUnauthorizedError();
  }

  if (response.status === 403 || code === "FORBIDDEN") {
    return new Error("Bu işlem için yetkin yok.");
  }

  if (response.status === 404 || code === "NOT_FOUND") {
    return new Error("İstenen kayıt bulunamadı.");
  }

  return new Error(message);
}

async function adminClientFetch(
  path: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    redirectToLogin();
    throw new AdminUnauthorizedError();
  }

  return response;
}

async function ensureOk(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    const error = await parseApiError(response, fallbackMessage);

    if (error instanceof AdminUnauthorizedError) {
      redirectToLogin();
    }

    throw error;
  }
}

export async function updateAdminAppContent(
  slug: string,
  locale: "en" | "tr",
  payload: Record<string, unknown>,
) {
  const response = await adminClientFetch(
    `/admin/apps/${slug}/content/${locale}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  await ensureOk(response, `Failed to update app content (${response.status})`);
  return response.json();
}

export async function updateAdminAppMapping(
  slug: string,
  provider: "APPLE" | "GOOGLE",
  payload: Record<string, unknown>,
) {
  const response = await adminClientFetch(
    `/admin/apps/${slug}/mapping/${provider}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  await ensureOk(response, `Failed to update app mapping (${response.status})`);
  return response.json();
}

export async function saveAdminProviderCredentials(payload: {
  provider: "APPLE" | "GOOGLE";
  accountLabel?: string;
  payload: string;
}) {
  const response = await adminClientFetch(`/admin/providers/credentials`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  await ensureOk(
    response,
    `Failed to save provider credentials (${response.status})`,
  );
  return response.json();
}

export async function discoverAdminAppleApps() {
  const response = await adminClientFetch(`/admin/providers/apple/discover`, {
    method: "POST",
  });

  await ensureOk(response, `Failed to discover Apple apps (${response.status})`);
  return response.json();
}

export async function triggerAdminSyncRun() {
  const response = await adminClientFetch(`/admin/sync/run`, {
    method: "POST",
  });

  await ensureOk(response, `Failed to trigger sync (${response.status})`);
  return response.json();
}

export async function triggerAdminReviewMetricSync() {
  const response = await adminClientFetch(`/admin/sync/reviews-metrics`, {
    method: "POST",
  });

  await ensureOk(
    response,
    `Failed to trigger review/metric sync (${response.status})`,
  );
  return response.json();
}

export async function processAdminPendingWebhookEvents() {
  const response = await adminClientFetch(`/admin/webhooks/process-pending`, {
    method: "POST",
  });

  await ensureOk(
    response,
    `Failed to process pending webhook events (${response.status})`,
  );
  return response.json();
}
export async function updateDeploymentTask(
  key: string,
  payload: {
    status: "healthy" | "warning" | "critical" | "pending";
    note?: string;
  },
) {
  const response = await adminClientFetch(`/admin/deployment/tasks/${key}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  await ensureOk(response, `Failed to update deployment task (${response.status})`);
  return response.json();
}
export async function createSmokeTestRun(payload: {
  key: string;
  title: string;
  result: "passed" | "failed" | "blocked";
  note?: string;
}) {
  const response = await adminClientFetch(`/admin/deployment/smoke-tests`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  await ensureOk(response, `Failed to save smoke test (${response.status})`);
  return response.json();
}