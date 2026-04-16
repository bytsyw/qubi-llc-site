import { motion } from "framer-motion";

export function AppShowcasePhone({ app }) {
  return (
    <div className="relative h-[35rem] w-[17rem] rounded-[3rem] border border-black/8 bg-[#111111] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.16)]">
      <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${app.screenGradient}`} />
        <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-black/90" />
        <div className="relative flex h-full flex-col justify-between p-5 pt-9">
          <div>
            <div
              className={`inline-flex rounded-full ${
                app.dark ? "bg-white/10 text-white/65" : "bg-black/10 text-black/60"
              } px-3 py-1 text-[11px] font-semibold`}
            >
              {app.type}
            </div>
            <div className={`mt-4 text-3xl font-black leading-none ${app.dark ? "text-white" : "text-[#111111]"}`}>
              {app.name}
            </div>
            <p className={`mt-3 max-w-[13rem] text-sm leading-5 ${app.dark ? "text-white/75" : "text-black/65"}`}>
              Large device mockups help the site feel product-led, not text-led.
            </p>
          </div>

          <div className="space-y-3">
            <div
              className={`rounded-[1.6rem] border ${
                app.dark ? "border-white/10 bg-white/10" : "border-black/8 bg-white/55"
              } p-4 backdrop-blur-md`}
            >
              <div className={`text-sm font-bold ${app.dark ? "text-white" : "text-[#111111]"}`}>Screen preview</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className={`h-20 rounded-2xl ${app.dark ? "bg-white/10" : "bg-black/10"}`} />
                <div className={`h-20 rounded-2xl ${app.dark ? "bg-white/10" : "bg-black/10"}`} />
                <div className={`h-20 rounded-2xl ${app.dark ? "bg-white/10" : "bg-black/10"}`} />
              </div>
            </div>

            <div
              className={`rounded-[1.6rem] border ${
                app.dark ? "border-white/10 bg-black/35" : "border-black/8 bg-[#111111]"
              } p-4 text-white`}
            >
              <div className="text-sm font-bold">Separate detail page available</div>
              <div className="mt-2 text-xs leading-5 text-white/75">
                The homepage introduces the product, but the full story lives on its own page.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { BookOpen } from "lucide-react";

export function DetailHeroPhone({ app }) {
  const primaryHighlight = app?.highlights?.[0] || "Highlighted feature";
  const displayBadge = app?.badge || "Ages 4–8";
  const displayDownloads = app?.downloads || "0";
  const displayRating = app?.rating || "0/5";
  const description =
    app?.description ||
    "Story-led experiences with warm visuals, intuitive touch interactions and calm product rhythm.";

  return (
    <div className="relative h-[37rem] w-[18rem] rounded-[3.2rem] border border-black/8 bg-[#111111] p-3 shadow-[0_35px_100px_rgba(0,0,0,0.18)] sm:h-[39rem] sm:w-[19rem] lg:h-[42rem] lg:w-[20rem]">
      <div className="relative h-full w-full overflow-hidden rounded-[2.7rem] bg-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${app.screenGradient}`} />
        <div className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-full bg-black/90" />

        <div className="relative flex h-full flex-col justify-between p-5 pt-9 sm:p-6">
          <div>
            <div
              className={`inline-flex max-w-[13rem] truncate rounded-full px-3 py-1 text-[11px] font-semibold ${
                app.dark ? "bg-white/10 text-white/70" : "bg-black/10 text-black/65"
              }`}
            >
              {app.type}
            </div>

            <h3
              className={`mt-4 text-[2.1rem] font-black leading-none sm:text-[2.35rem] ${
                app.dark ? "text-white" : "text-[#111111]"
              }`}
            >
              {app.name}
            </h3>

            <p
              className={`mt-3 max-w-[13rem] text-sm leading-5 ${
                app.dark ? "text-white/78" : "text-black/65"
              }`}
            >
              {description}
            </p>
          </div>

          <div className="space-y-3">
            <div
              className={`rounded-[1.8rem] border p-4 backdrop-blur-md ${
                app.dark ? "border-white/10 bg-white/10" : "border-black/8 bg-white/55"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className={`text-xs font-medium ${app.dark ? "text-white/55" : "text-black/50"}`}>
                    {primaryHighlight}
                  </div>
                  <div className={`text-base font-black ${app.dark ? "text-white" : "text-[#111111]"}`}>
                    {displayBadge}
                  </div>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300 text-black">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-black/10">
                <div className="h-2 w-[72%] rounded-full bg-[#111111]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className={`rounded-[1.5rem] border p-4 backdrop-blur-md ${
                  app.dark ? "border-white/10 bg-white/10" : "border-black/8 bg-white/45"
                }`}
              >
                <div className={`text-xs font-medium ${app.dark ? "text-white/55" : "text-black/50"}`}>
                  Downloads
                </div>
                <div className={`mt-2 text-2xl font-black ${app.dark ? "text-white" : "text-[#111111]"}`}>
                  {displayDownloads}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-black/8 bg-[#111111] p-4 text-white">
                <div className="text-xs font-medium text-white/50">Parent score</div>
                <div className="mt-2 text-2xl font-black text-yellow-300">{displayRating}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryPhone({ tone = "light", label, reverse = false }) {
  const dark = tone === "dark";

  return (
    <div className="relative h-[27rem] w-[13rem] rounded-[2.7rem] border border-black/8 bg-[#111111] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.14)]">
      <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-white">
        <div
          className={`absolute inset-0 ${
            dark
              ? "bg-[linear-gradient(180deg,#111111_0%,#202020_40%,#facc15_100%)]"
              : reverse
              ? "bg-[linear-gradient(180deg,#fff9e4_0%,#ffe38a_55%,#facc15_100%)]"
              : "bg-[linear-gradient(180deg,#fff8de_0%,#f6ffd7_55%,#facc15_100%)]"
          }`}
        />
        <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-black/90" />
        <div className="relative flex h-full flex-col justify-between p-4 pt-9">
          <div>
            <div className={`text-[11px] font-semibold ${dark ? "text-white/55" : "text-black/55"}`}>Screen preview</div>
            <div className={`mt-2 text-xl font-black ${dark ? "text-white" : "text-[#111111]"}`}>{label}</div>
          </div>

          <div className="space-y-2">
            <div className={`h-24 rounded-[1.4rem] ${dark ? "bg-white/10" : "bg-black/10"}`} />
            <div className="grid grid-cols-2 gap-2">
              <div className={`h-14 rounded-2xl ${dark ? "bg-white/10" : "bg-black/10"}`} />
              <div className={`h-14 rounded-2xl ${dark ? "bg-white/10" : "bg-black/10"}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}