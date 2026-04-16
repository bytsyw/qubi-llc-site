export const SUPPORTED_LANGS = ["en", "tr"];
export const DEFAULT_LANG = "en";

export function isSupportedLang(lang) {
  return SUPPORTED_LANGS.includes(lang);
}

export function normalizeLang(lang) {
  return isSupportedLang(lang) ? lang : DEFAULT_LANG;
}

export function getLangFromPath(pathname = "/") {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return isSupportedLang(firstSegment) ? firstSegment : DEFAULT_LANG;
}

export function createLocalizedPath(lang, path = "/") {
  const safeLang = normalizeLang(lang);

  if (!path || path === "/") {
    return `/${safeLang}`;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${safeLang}${cleanPath}`;
}

export function replaceOrPrefixLocale(pathname = "/", nextLang = DEFAULT_LANG) {
  const targetLang = normalizeLang(nextLang);
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${targetLang}`;
  }

  if (isSupportedLang(segments[0])) {
    segments[0] = targetLang;
  } else {
    segments.unshift(targetLang);
  }

  return `/${segments.join("/")}`;
}