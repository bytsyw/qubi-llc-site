function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function formatCompactNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".0", "")}M+`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(".0", "")}K+`;
  return `${value}`;
}

export function formatRatingValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return `${value.toFixed(1)}/5`;
}

export function formatReviewCount(value, lang = "en") {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  return new Intl.NumberFormat(locale).format(value);
}

export function pickPrimaryStoreSnapshot(storeSnapshot) {
  if (!storeSnapshot) return null;

  const candidates = [storeSnapshot.apple, storeSnapshot.google].filter(Boolean);
  return candidates.find((item) => item?.status === "connected") || candidates[0] || null;
}

export function buildDisplayApp({ fallbackApp, liveData, lang = "en" }) {
  const base = fallbackApp ?? {
    id: liveData?.id ?? "",
    slug: liveData?.slug ?? "",
    name: "",
    shortName: "",
    type: "",
    badge: "",
    description: "",
    longDescription: "",
    downloads: "-",
    rating: "-",
    reviews: "-",
    parents: "-",
    dark: false,
    screenGradient: "from-[#fff8de] via-[#ffe58e] to-[#facc15]",
    glowClass: "bg-yellow-300/55",
    highlights: [],
    screenshots: [],
    features: [],
    faqs: [],
    steps: [],
    requirements: [],
    terms: [],
    scores: [],
  };

  if (!liveData) {
    return {
      ...base,
      highlights: ensureArray(base.highlights),
      screenshots: ensureArray(base.screenshots),
      features: ensureArray(base.features),
      faqs: ensureArray(base.faqs),
      steps: ensureArray(base.steps),
      requirements: ensureArray(base.requirements),
      terms: ensureArray(base.terms),
      scores: ensureArray(base.scores),
      latestReviews: [],
      storeSnapshot: null,
      analyticsSnapshot: null,
    };
  }

  const content = liveData.content ?? {};
  const store = pickPrimaryStoreSnapshot(liveData.storeSnapshot);
  const analytics = liveData.analyticsSnapshot ?? null;

  return {
    ...base,
    id: liveData.id ?? base.id,
    slug: liveData.slug ?? base.slug,
    name: content.name ?? base.name,
    shortName: content.shortName ?? base.shortName,
    type: content.type ?? base.type,
    badge: content.badge ?? base.badge,
    description: content.description ?? base.description,
    longDescription: content.longDescription ?? base.longDescription,
    downloads: store?.downloadEstimate ?? base.downloads,
    rating: formatRatingValue(store?.rating) ?? base.rating,
    reviews: formatReviewCount(store?.reviewCount, lang) ?? base.reviews,
    parents:
      analytics?.parentsReached != null
        ? formatCompactNumber(analytics.parentsReached)
        : base.parents,
    dark: typeof content.dark === "boolean" ? content.dark : base.dark,
    screenGradient: content.screenGradient ?? base.screenGradient,
    glowClass: content.glowClass ?? base.glowClass,
    highlights: ensureArray(content.highlights).length
      ? ensureArray(content.highlights)
      : ensureArray(base.highlights),
    screenshots: ensureArray(content.screenshots).length
      ? ensureArray(content.screenshots)
      : ensureArray(base.screenshots),
    features: ensureArray(content.features).length
      ? ensureArray(content.features)
      : ensureArray(base.features),
    faqs: ensureArray(content.faqs).length
      ? ensureArray(content.faqs)
      : ensureArray(base.faqs),
    steps: ensureArray(content.steps).length
      ? ensureArray(content.steps)
      : ensureArray(base.steps),
    requirements: ensureArray(content.requirements).length
      ? ensureArray(content.requirements)
      : ensureArray(base.requirements),
    terms: ensureArray(content.terms).length
      ? ensureArray(content.terms)
      : ensureArray(base.terms),
    scores: ensureArray(content.scores).length
      ? ensureArray(content.scores)
      : ensureArray(base.scores),
    latestReviews: ensureArray(liveData.latestReviews),
    storeSnapshot: liveData.storeSnapshot ?? null,
    analyticsSnapshot: analytics,
  };
}
