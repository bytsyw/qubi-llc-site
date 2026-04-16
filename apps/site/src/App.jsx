import { Routes, Route, useNavigate, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SoftBackground from "./components/layout/SoftBackground";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import DocumentLanguageSync from "./components/layout/DocumentLanguageSync";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import TrustSafetyPage from "./pages/TrustSafetyPage";
import ContactPage from "./pages/ContactPage";
import AppDetailPage from "./pages/AppDetailPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import ParentSafetyPage from "./pages/ParentSafetyPage";
import NotFoundPage from "./pages/NotFoundPage";
import {
  SUPPORTED_LANGS,
  createLocalizedPath,
  normalizeLang,
} from "./utils/localeRouting";

function RedirectToLocalizedApp({ defaultLang }) {
  const { id } = useParams();
  return <Navigate to={createLocalizedPath(defaultLang, `/apps/${id}`)} replace />;
}

export default function App() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const defaultLang = normalizeLang(i18n.resolvedLanguage);

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#101010] selection:bg-yellow-300 selection:text-black">
      <SoftBackground />
      <ScrollToTop />
      <DocumentLanguageSync />
      <Header />

      <Routes>
        <Route path="/" element={<Navigate to={createLocalizedPath(defaultLang, "/")} replace />} />
        <Route path="/about" element={<Navigate to={createLocalizedPath(defaultLang, "/about")} replace />} />
        <Route
          path="/trust-safety"
          element={<Navigate to={createLocalizedPath(defaultLang, "/trust-safety")} replace />}
        />
        <Route path="/contact" element={<Navigate to={createLocalizedPath(defaultLang, "/contact")} replace />} />
        <Route
          path="/privacy-policy"
          element={<Navigate to={createLocalizedPath(defaultLang, "/privacy-policy")} replace />}
        />
        <Route
          path="/terms-of-use"
          element={<Navigate to={createLocalizedPath(defaultLang, "/terms-of-use")} replace />}
        />
        <Route
          path="/parent-safety-guide"
          element={<Navigate to={createLocalizedPath(defaultLang, "/parent-safety-guide")} replace />}
        />
        <Route path="/apps/:id" element={<RedirectToLocalizedApp defaultLang={defaultLang} />} />

        {SUPPORTED_LANGS.map((lang) => (
          <Route
            key={`home-${lang}`}
            path={`/${lang}`}
            element={
              <HomePage
                onOpenDetail={(id) => {
                  navigate(`/${lang}/apps/${id}`);
                }}
              />
            }
          />
        ))}

        {SUPPORTED_LANGS.map((lang) => (
          <Route key={`about-${lang}`} path={`/${lang}/about`} element={<AboutPage />} />
        ))}

        {SUPPORTED_LANGS.map((lang) => (
          <Route
            key={`trust-${lang}`}
            path={`/${lang}/trust-safety`}
            element={<TrustSafetyPage />}
          />
        ))}

        {SUPPORTED_LANGS.map((lang) => (
          <Route key={`contact-${lang}`} path={`/${lang}/contact`} element={<ContactPage />} />
        ))}

        {SUPPORTED_LANGS.map((lang) => (
          <Route
            key={`privacy-${lang}`}
            path={`/${lang}/privacy-policy`}
            element={<PrivacyPolicyPage />}
          />
        ))}

        {SUPPORTED_LANGS.map((lang) => (
          <Route
            key={`terms-${lang}`}
            path={`/${lang}/terms-of-use`}
            element={<TermsPage />}
          />
        ))}

        {SUPPORTED_LANGS.map((lang) => (
          <Route
            key={`parent-safety-${lang}`}
            path={`/${lang}/parent-safety-guide`}
            element={<ParentSafetyPage />}
          />
        ))}

        {SUPPORTED_LANGS.map((lang) => (
          <Route
            key={`app-${lang}`}
            path={`/${lang}/apps/:id`}
            element={<AppDetailPage />}
          />
        ))}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </div>
  );
}