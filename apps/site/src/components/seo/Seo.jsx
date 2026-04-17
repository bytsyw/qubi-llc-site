import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { siteConfig } from "../../data/siteConfig";
import {
  DEFAULT_LANG,
  SUPPORTED_LANGS,
  getLangFromPath,
} from "../../utils/localeRouting";

const OG_LOCALE_MAP = {
  en: "en_US",
  tr: "tr_TR",
};

export default function Seo({ title, description, noindex = false }) {
  const location = useLocation();

  useEffect(() => {
    const currentLang = getLangFromPath(location.pathname);
    const finalTitle = title
      ? `${title} | ${siteConfig.brandName}`
      : siteConfig.brandName;
    const finalDescription = description || siteConfig.defaultDescription;

    const basePath = stripLocaleFromPath(location.pathname);
    const canonicalUrl = buildAbsoluteUrl(withLocalePath(currentLang, basePath));

    document.title = finalTitle;

    updateMeta("description", finalDescription);
    updateMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    updatePropertyMeta("og:title", finalTitle);
    updatePropertyMeta("og:description", finalDescription);
    updatePropertyMeta("og:type", "website");
    updatePropertyMeta("og:url", canonicalUrl);
    updatePropertyMeta(
      "og:locale",
      OG_LOCALE_MAP[currentLang] || OG_LOCALE_MAP[DEFAULT_LANG],
    );

    setCanonical(canonicalUrl);
    setHreflangs(basePath);
  }, [title, description, noindex, location.pathname]);

  return null;
}

function stripLocaleFromPath(pathname = "/") {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return "/";
  }

  if (SUPPORTED_LANGS.includes(segments[0])) {
    const rest = segments.slice(1);
    return rest.length ? `/${rest.join("/")}` : "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function withLocalePath(lang, basePath = "/") {
  const normalizedBase =
    !basePath || basePath === "/"
      ? ""
      : basePath.startsWith("/")
        ? basePath
        : `/${basePath}`;

  return `/${lang}${normalizedBase}`;
}

function buildAbsoluteUrl(path) {
  const baseUrl = siteConfig.siteUrl.replace(/\/+$/, "");
  return `${baseUrl}${path}`;
}

function updateMeta(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function updatePropertyMeta(property, content) {
  let element = document.querySelector(`meta[property="${property}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setCanonical(href) {
  let element = document.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function setHreflangs(basePath) {
  removeHreflangs();

  SUPPORTED_LANGS.forEach((lang) => {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", lang);
    link.setAttribute("href", buildAbsoluteUrl(withLocalePath(lang, basePath)));
    document.head.appendChild(link);
  });

  const defaultLink = document.createElement("link");
  defaultLink.setAttribute("rel", "alternate");
  defaultLink.setAttribute("hreflang", "x-default");
  defaultLink.setAttribute(
    "href",
    buildAbsoluteUrl(withLocalePath(DEFAULT_LANG, basePath)),
  );
  document.head.appendChild(defaultLink);
}

function removeHreflangs() {
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((element) => element.remove());
}
