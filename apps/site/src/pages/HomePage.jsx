import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { buildDisplayApp } from "../lib/appViewModel";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Award,
  BookOpen,
  Globe,
  HeartHandshake,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TimerReset,
} from "lucide-react";
import Seo from "../components/seo/Seo";
import HeroPhones from "../components/phones/HeroPhones";
import { AppShowcasePhone } from "../components/phones/ShowcasePhones";
import { ButtonPrimary, ButtonSecondary } from "../components/common/Buttons";
import { Card, Badge } from "../components/common/Surface";
import { TinyFeature } from "../components/common/ContentBlocks";
import {
  MetricBar,
  MiniMetric,
  PulseRow,
} from "../components/common/Metrics";
import { metrics } from "../data/site";
import PageTeasersSection from "../components/sections/PageTeasersSection";
import { StoreLaunchRow } from "../components/common/LaunchBadges";
import {
  createLocalizedPath,
  getLangFromPath,
} from "../utils/localeRouting";
import { getLocalizedApps } from "../content/getLocalizedApps";
import { getPublicApps } from "../lib/api";

export default function HomePage({ onOpenDetail }) {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);
  const localizedApps = useMemo(() => getLocalizedApps(lang), [lang]);

  const [activeHomeAppId, setActiveHomeAppId] = useState("wonder-tales");
  const [heroDirection, setHeroDirection] = useState(1);
  const [liveApps, setLiveApps] = useState([]);
  const previousIdRef = useRef("wonder-tales");

  const activeFallbackApp = useMemo(
    () => localizedApps.find((app) => app.id === activeHomeAppId) || localizedApps[0],
    [activeHomeAppId, localizedApps]
  );

  const activeHomeApp = useMemo(() => {
    const liveMatch = liveApps.find((item) => item.slug === activeHomeAppId) ?? null;
    return buildDisplayApp({ fallbackApp: activeFallbackApp, liveData: liveMatch, lang });
  }, [activeFallbackApp, activeHomeAppId, liveApps, lang]);

  const getDirection = (fromId, toId) => {
    if (fromId === toId) return 1;
    const fromIndex = localizedApps.findIndex((app) => app.id === fromId);
    const toIndex = localizedApps.findIndex((app) => app.id === toId);

    if ((fromIndex + 1) % localizedApps.length === toIndex) return 1;
    if ((fromIndex - 1 + localizedApps.length) % localizedApps.length === toIndex) return -1;
    return toIndex > fromIndex ? 1 : -1;
  };

  const selectHomeApp = (id) => {
    setHeroDirection(getDirection(previousIdRef.current, id));
    previousIdRef.current = id;
    setActiveHomeAppId(id);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = localizedApps.findIndex(
        (app) => app.id === previousIdRef.current
      );
      const nextId = localizedApps[(currentIndex + 1) % localizedApps.length].id;
      previousIdRef.current = nextId;
      setHeroDirection(1);
      setActiveHomeAppId(nextId);
    }, 5000);

    return () => clearInterval(interval);
  }, [localizedApps]);

  useEffect(() => {
    let active = true;
  
    async function loadApps() {
      try {
        const data = await getPublicApps(lang);
        if (!active) return;
        setLiveApps(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!active) return;
        setLiveApps([]);
      }
    }
  
    loadApps();
  
    return () => {
      active = false;
    };
  }, [lang]);

  const localizedMetrics = [
    {
      ...metrics[0],
      label: t("performance.metrics.totalDownloads.label"),
      subtitle: t("performance.metrics.totalDownloads.subtitle"),
    },
    {
      ...metrics[1],
      label: t("performance.metrics.averageRating.label"),
      subtitle: t("performance.metrics.averageRating.subtitle"),
    },
    {
      ...metrics[2],
      label: t("performance.metrics.parentsChoosing.label"),
      subtitle: t("performance.metrics.parentsChoosing.subtitle"),
    },
  ];

  const reasonCards = t("whyParents.cards", { returnObjects: true });
  const reasonIcons = [ShieldCheck, HeartHandshake, Globe];

  return (
    <>
      <Seo
        title={t("seo.title")}
        description={t("seo.description")}
      />

      <main>
        <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-medium text-black/70 shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-yellow-500" />
                {t("hero.badge")}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-5 max-w-3xl text-5xl font-black leading-[0.94] tracking-tight text-[#111111] sm:text-6xl lg:text-7xl"
              >
                {t("hero.titleStart")}
                <span className="text-yellow-500">{t("hero.titleHighlight1")}</span>
                {t("hero.titleMiddle")}
                <span className="text-yellow-500">{t("hero.titleHighlight2")}</span>
                {t("hero.titleEnd")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 max-w-2xl text-base leading-7 text-black/65 sm:text-lg"
              >
                {t("hero.description")}
              </motion.p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <ButtonPrimary
                  onClick={() =>
                    document.getElementById("featured-apps")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                >
                  {t("hero.ctaPrimary")} <ArrowRight className="h-4 w-4" />
                </ButtonPrimary>

                <ButtonSecondary
                  onClick={() => navigate(createLocalizedPath(lang, "/about"))}
                >
                  <Play className="h-4 w-4 fill-current" /> {t("hero.ctaSecondary")}
                </ButtonSecondary>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <MiniMetric value="1.2M+" label={t("stats.downloads")} />
                <MiniMetric value="4.8/5" label={t("stats.rating")} />
                <MiniMetric value="84K+" label={t("stats.parents")} />
              </div>

              <StoreLaunchRow className="mt-6" />
            </div>

            <HeroPhones
              apps={localizedApps}
              activeApp={activeFallbackApp}
              onSelectApp={selectHomeApp}
              direction={heroDirection}
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-8 lg:pb-14">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-6 lg:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-600">
                    {t("performance.badge")}
                  </div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    {t("performance.title")}
                  </h2>
                </div>
                <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-yellow-300/70 md:flex">
                  <Award className="h-7 w-7 text-black" />
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {localizedMetrics.map((metric, index) => (
                  <MetricBar
                    key={metric.label}
                    metric={metric}
                    delay={index * 0.08}
                  />
                ))}
              </div>
            </Card>

            <div className="rounded-[2rem] border border-black/8 bg-[#111111] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
              <div className="inline-flex rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-black">
                {t("parentConfidence.badge")}
              </div>
              <h3 className="mt-4 text-2xl font-black leading-tight">
                {t("parentConfidence.title")}
              </h3>
              <div className="mt-6 space-y-4">
                <PulseRow
                  label={t("parentConfidence.items.easeOfUse")}
                  value="96%"
                />
                <PulseRow
                  label={t("parentConfidence.items.visualTrust")}
                  value="92%"
                />
                <PulseRow
                  label={t("parentConfidence.items.repeatEngagement")}
                  value="88%"
                />
                <PulseRow
                  label={t("parentConfidence.items.learningValue")}
                  value="94%"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-600">
                {t("whyParents.badge")}
              </div>
              <h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
                {t("whyParents.title")}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-black/62">
                {t("whyParents.description")}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {reasonCards.map((item, index) => {
                const Icon = reasonIcons[index];

                return (
                  <Card key={item.title} className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-black shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-black text-[#111111]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-black/60">
                      {item.text}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <PageTeasersSection />

        <section
          id="featured-apps"
          className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16"
        >
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-600">
                {t("featured.badge")}
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {t("featured.title")}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-black/58 sm:text-base">
              {t("featured.description")}
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {localizedApps.map((app) => {
              const isActive = activeHomeAppId === app.id;
              return (
                <motion.button
                  key={app.id}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectHomeApp(app.id)}
                  className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#111111] text-yellow-300 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                      : "border border-black/8 bg-white/80 text-black/60"
                  }`}
                >
                  {app.name}
                </motion.button>
              );
            })}
          </div>

          <Card className="grid gap-8 p-6 lg:grid-cols-[1fr_1fr] lg:p-8">
            <div className="flex items-center justify-center">
              <motion.div
                key={activeHomeApp.id + "-phone"}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -10, rotateY: 4, rotateX: 2 }}
                style={{ perspective: 2000 }}
              >
                <AppShowcasePhone app={activeHomeApp} />
              </motion.div>
            </div>

            <motion.div
              key={activeHomeApp.id + "-content"}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-center"
            >
              <div className="inline-flex w-fit rounded-full border border-black/8 bg-yellow-100 px-4 py-2 text-xs font-semibold text-black/70">
                {activeHomeApp.type}
              </div>
              <h3 className="mt-5 text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
                {activeHomeApp.name}
              </h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-black/62">
                {activeHomeApp.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Badge text={activeHomeApp.badge} />
                <Badge text={t("featured.badges.childFirst")} />
                <Badge text={t("featured.badges.animatedStory")} />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <TinyFeature
                  icon={BookOpen}
                  label={t("featured.miniFeatures.story")}
                />
                <TinyFeature
                  icon={TimerReset}
                  label={t("featured.miniFeatures.habit")}
                />
                <TinyFeature
                  icon={Smartphone}
                  label={t("featured.miniFeatures.mobileFirst")}
                />
              </div>

              <div className="mt-8 flex gap-3">
                <ButtonPrimary onClick={() => onOpenDetail(activeHomeApp.id)}>
                  {t("featured.ctaPrimary")}
                </ButtonPrimary>
                <ButtonSecondary
                  onClick={() => navigate(createLocalizedPath(lang, "/contact"))}
                >
                  {t("featured.ctaSecondary")}
                </ButtonSecondary>
              </div>

              <div className="mt-8 flex items-center gap-3 text-sm text-black/45">
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                {t("featured.autoRotate")}
              </div>
            </motion.div>
          </Card>
        </section>
      </main>
    </>
  );
}