const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
).replace(/\/$/, "");

export async function getPublicApps(locale = "en") {
  const response = await fetch(`${API_BASE_URL}/public/apps?locale=${locale}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch apps (${response.status})`);
  }

  return response.json();
}

export async function getPublicApp(slug, locale = "en") {
  const response = await fetch(`${API_BASE_URL}/public/apps/${slug}?locale=${locale}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch app "${slug}" (${response.status})`);
  }

  return response.json();
}
