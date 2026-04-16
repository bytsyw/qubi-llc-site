import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { buildDisplayApp } from "../lib/appViewModel";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Layers3,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Seo from "../components/seo/Seo";
import { ButtonPrimary, ButtonSecondary } from "../components/common/Buttons";
import {
  InfoPanel,
  ScreenshotCard,
  UsageStep,
} from "../components/common/ContentBlocks";
import {
  BottomMetric,
  MiniMetric,
  ProgressLine,
  RatingCard,
} from "../components/common/Metrics";
import { Badge, Card } from "../components/common/Surface";
import {
  DetailHeroPhone,
  GalleryPhone,
} from "../components/phones/ShowcasePhones";
import { StoreLaunchRow } from "../components/common/LaunchBadges";
import {
  createLocalizedPath,
  getLangFromPath,
} from "../utils/localeRouting";
import { getLocalizedApps } from "../content/getLocalizedApps";
import { getPublicApp } from "../lib/api";


function AppDetailPhoneShowcase({ app }) {
  return (
    <div className="relative flex min-h-[34rem] items-center justify-center lg:min-h-[40rem]">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-4 right-8 h-28 w-28 rounded-full ${app.glowClass} blur-2xl`}
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-[#111111]/8 blur-3xl"
      />

      <div className="relative flex h-[46rem] w-full items-center justify-center overflow-visible sm:h-[48rem] lg:h-[50rem]">
        <motion.div
          initial={{ opacity: 0, x: 120, rotate: -4, scale: 0.88 }}
          animate={{ opacity: 1, x: 0, rotate: -13, scale: 1.05, y: 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="absolute left-[-1.8rem] top-12 z-10 hidden sm:block"
        >
          <GalleryPhone
            tone={app.dark ? "dark" : "light"}
            label={app.screenshots[0] || app.name}
          />
        </motion.div>

        <div className="relative z-20" style={{ perspective: 2200 }}>
          <motion.div
            key={app.id + "-detail-center"}
            initial={{ opacity: 0, x: 120, scale: 0.92, rotate: 8 }}
            animate={{ opacity: 1, x: 0, scale: 1, y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            whileHover={{ y: -10, rotateX: 3, rotateY: -3 }}
          >
            <DetailHeroPhone app={app} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -120, rotate: 4, scale: 0.88 }}
          animate={{ opacity: 1, x: 0, rotate: 13, scale: 1.05, y: 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="absolute right-[-1.8rem] top-12 z-10 hidden sm:block"
        >
          <GalleryPhone
            tone={app.dark ? "dark" : "light"}
            label={app.screenshots[1] || app.name}
            reverse
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function AppDetailPage() {
  const { t } = useTranslation("appDetail");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);

  const localizedApps = useMemo(() => getLocalizedApps(lang), [lang]);
  const fallbackApp = useMemo(
    () => localizedApps.find((item) => item.id === id) ?? null,
    [localizedApps, id]
  );

  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadApp() {
      try {
        setIsLoading(true);
        const data = await getPublicApp(id, lang);
        if (!active) return;
        setLiveData(data);
      } catch (error) {
        if (!active) return;
        console.error("Failed to load public app:", error);
        setLiveData(null);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadApp();

    return () => {
      active = false;
    };
  }, [id, lang]);

  const app = useMemo(
    () => buildDisplayApp({ fallbackApp, liveData, lang }),
    [fallbackApp, liveData, lang]
  );
  if (!fallbackApp && !liveData && !isLoading) {
    return (
      <>
        <Seo
          title={t("seo.notFoundTitle")}
          description={t("seo.notFoundDescription")}
        />
        <main>
          <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pt-16">
            <div className="max-w-2xl rounded-[2rem] border border-black/8 bg-white/80 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-600">
                {t("notFound.badge")}
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#111111]">
                {t("notFound.title")}
              </h1>
              <p className="mt-4 text-base leading-7 text-black/62">
                {t("notFound.description")}
              </p>
              <div className="mt-8">
                <Link
                  to={createLocalizedPath(lang, "/")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3.5 text-sm font-bold text-yellow-300 shadow-[0_16px_45px_rgba(0,0,0,0.14)]"
                >
                  {t("notFound.cta")}
                </Link>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Seo title={app.name} description={app.longDescription} />
      <main>
        <section className="mx-auto max-w-7xl px-6 pb-6 pt-8 lg:px-8 lg:pt-10">
          <Card className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-black/45">
                <button
                  onClick={() => navigate(createLocalizedPath(lang, "/"))}
                  className="font-medium transition hover:text-black"
                >
                  {t("top.home")}
                </button>
                <ChevronRight className="h-4 w-4" />
                <span>{t("top.crumb")}</span>
              </div>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
                {t("top.title")}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/58 sm:text-base">
                {t("top.description")}
              </p>
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-10">
          <div className="grid items-center gap-10 lg:grid-cols-[0.94fr_1.06fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-yellow-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/70"
              >
                <Layers3 className="h-4 w-4" />
                {t("hero.badge")}
              </motion.div>

              <motion.h2
                key={app.id + "title"}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 text-5xl font-black leading-[0.96] tracking-tight text-[#111111] sm:text-6xl"
              >
                {app.name}
              </motion.h2>

              <motion.p
                key={app.id + "desc"}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 max-w-2xl text-base leading-7 text-black/62 sm:text-lg"
              >
                {app.longDescription}
              </motion.p>

              <div className="mt-6 flex flex-wrap gap-3">
                {app.badge ? <Badge text={app.badge} /> : null}
                {app.type ? <Badge text={app.type} /> : null}
                {app.highlights.map((item) => (
                  <Badge key={item} text={item} />
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MiniMetric value={app.downloads || "-"} label={t("hero.downloads")} />
                <MiniMetric value={app.rating || "-"} label={t("hero.averageRating")} />
                <MiniMetric value={app.parents || "-"} label={t("hero.parentsReached")} />
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <ButtonPrimary
                  onClick={() => navigate(createLocalizedPath(lang, "/contact"))}
                >
                  {t("hero.ctaPrimary")} <ArrowRight className="h-4 w-4" />
                </ButtonPrimary>
                <ButtonSecondary
                  onClick={() => navigate(createLocalizedPath(lang, "/"))}
                >
                  {t("hero.ctaSecondary")}
                </ButtonSecondary>
              </div>

              <StoreLaunchRow className="mt-6" />
            </div>

            <AppDetailPhoneShowcase app={app} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-2 lg:px-8 lg:py-4">
          <Card className="p-6 lg:p-8">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-700">
              {t("launch.badge")}
            </div>
            <h3 className="mt-2 text-2xl font-black text-[#111111]">
              {t("launch.title")}
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/60">
              {t("launch.description")}
            </p>

            <StoreLaunchRow className="mt-6" />
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-10">
          <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-700">
                    {t("ratings.badge")}
                  </div>
                  <h3 className="mt-2 text-2xl font-black text-[#111111]">
                    {t("ratings.title")}
                  </h3>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-300/70 text-black">
                  <Award className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <RatingCard
                  title={t("ratings.cards.appRating")}
                  value={app.rating || "-"}
                  subtitle={app.reviews || "-"}
                />
                <RatingCard
                  title={t("ratings.cards.parentTrust")}
                  value={
                    app.analyticsSnapshot?.trustScore != null
                      ? `${app.analyticsSnapshot.trustScore}%`
                      : "96%"
                  }
                  subtitle={t("ratings.cards.parentTrustSubtitle")}
                />
                <RatingCard
                  title={t("ratings.cards.repeatUsage")}
                  value={
                    app.analyticsSnapshot?.repeatUsage != null
                      ? `${app.analyticsSnapshot.repeatUsage}%`
                      : "89%"
                  }
                  subtitle={t("ratings.cards.repeatUsageSubtitle")}
                />
              </div>

              <div className="mt-8 space-y-5">
                {app.scores.map((item, index) => (
                  <ProgressLine
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    delay={index * 0.08}
                  />
                ))}
              </div>
            </Card>

            <div className="rounded-[2rem] border border-black/8 bg-[#111111] p-6 text-white shadow-[0_16px_45px_rgba(0,0,0,0.1)]">
              <div className="inline-flex rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-black">
                {t("usageFlow.badge")}
              </div>
              <h3 className="mt-4 text-2xl font-black">
                {t("usageFlow.title")}
              </h3>
              <div className="mt-6 space-y-4">
                {app.steps.map((step, index) => (
                  <UsageStep key={step} index={index + 1} text={step} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-2 lg:px-8 lg:py-4">
          <Card className="p-6 lg:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-700">
                  {t("features.badge")}
                </div>
                <h3 className="mt-2 text-2xl font-black text-[#111111]">
                  {t("features.title")}
                </h3>
              </div>
              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-[#111111] text-yellow-300 md:flex">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {app.features.map((feature) => (
                <FeatureCard key={feature} text={feature} />
              ))}
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-10">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-700">
                    {t("screenshots.badge")}
                  </div>
                  <h3 className="mt-2 text-2xl font-black text-[#111111]">
                    {t("screenshots.title")}
                  </h3>
                </div>
                <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 md:flex">
                  <Layers3 className="h-6 w-6 text-black" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {app.screenshots.map((screen, index) => (
                  <ScreenshotCard
                    key={screen}
                    title={screen}
                    dark={app.dark}
                    delay={index * 0.06}
                  />
                ))}
              </div>
            </Card>

            <div className="space-y-5">
              <InfoPanel
                icon={CheckCircle2}
                title={t("panels.requirements")}
                items={app.requirements}
                light
              />
              <InfoPanel
                icon={FileText}
                title={t("panels.terms")}
                items={app.terms}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-2 lg:px-8 lg:py-4">
          <Card className="p-6 lg:p-8">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-700">
              {t("faq.badge")}
            </div>
            <h3 className="mt-2 text-2xl font-black text-[#111111]">
              {t("faq.title")}
            </h3>

            <div className="mt-6 space-y-4">
              {app.faqs.map((item) => (
                <FaqItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-8 lg:pb-24 lg:pt-8">
          <div className="grid gap-5 rounded-[2.2rem] border border-black/8 bg-gradient-to-br from-[#fff7cf] via-white to-[#f4f1e8] p-6 shadow-[0_16px_45px_rgba(0,0,0,0.05)] lg:grid-cols-3 lg:p-8">
            <BottomMetric
              icon={Clock3}
              title={t("bottomMetrics.averageSession")}
              value={app.analyticsSnapshot?.averageSessionText || "14 min"}
            />
            <BottomMetric
              icon={MessageCircleMore}
              title={t("bottomMetrics.parentFeedback")}
              value={t("bottomMetrics.parentFeedbackValue")}
            />
            <BottomMetric
              icon={ShieldCheck}
              title={t("bottomMetrics.usagePolicy")}
              value={t("bottomMetrics.usagePolicyValue")}
            />
          </div>
        </section>
      </main>
    </>
  );
}

function FeatureCard({ text }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-[1.6rem] border border-black/8 bg-[#f8f7f2] p-5"
    >
      <div className="text-sm font-semibold leading-7 text-[#111111]">
        {text}
      </div>
    </motion.div>
  );
}

function FaqItem({ question, answer }) {
  return (
    <div className="rounded-[1.6rem] border border-black/8 bg-[#f8f7f2] p-5">
      <div className="text-base font-black text-[#111111]">{question}</div>
      <div className="mt-3 text-sm leading-7 text-black/60">{answer}</div>
    </div>
  );
}