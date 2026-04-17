import { AnimatePresence, motion } from "framer-motion";
import { BookOpen } from "lucide-react";

function HeroCenterPhone({ app }) {
  return (
    <div className="relative h-[37rem] w-[18rem] rounded-[3.2rem] border border-black/8 bg-[#111111] p-3 shadow-[0_35px_100px_rgba(0,0,0,0.18)] sm:h-[39rem] sm:w-[19rem] lg:h-[42rem] lg:w-[20rem]">
      <div className="relative h-full w-full overflow-hidden rounded-[2.7rem] bg-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${app.screenGradient}`} />
        <div className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-full bg-black/90" />
        <div className="relative flex h-full flex-col justify-between p-5 pt-9 sm:p-6">
          <div>
            <div
              className={`inline-flex rounded-full ${
                app.dark ? "bg-white/10 text-white/70" : "bg-black/10 text-black/65"
              } px-3 py-1 text-[11px] font-semibold`}
            >
              Featured product experience
            </div>
            <h3
              className={`mt-4 text-[2.1rem] font-black leading-none sm:text-[2.35rem] ${app.dark ? "text-white" : "text-[#111111]"}`}
            >
              {app.name}
            </h3>
            <p
              className={`mt-3 max-w-[13rem] text-sm leading-5 ${app.dark ? "text-white/78" : "text-black/65"}`}
            >
              {app.description}
            </p>
          </div>

          <div className="space-y-3">
            <div
              className={`rounded-[1.8rem] border ${
                app.dark ? "border-white/10 bg-white/10" : "border-black/8 bg-white/55"
              } p-4 backdrop-blur-md`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div
                    className={`text-xs font-medium ${app.dark ? "text-white/55" : "text-black/50"}`}
                  >
                    {app.highlights[0]}
                  </div>
                  <div
                    className={`text-base font-black ${app.dark ? "text-white" : "text-[#111111]"}`}
                  >
                    {app.badge}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300 text-black">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-black/10">
                <motion.div
                  key={app.id + "-hero-progress"}
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ duration: 0.8 }}
                  className="h-2 rounded-full bg-[#111111]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className={`rounded-[1.5rem] border ${
                  app.dark ? "border-white/10 bg-white/10" : "border-black/8 bg-white/45"
                } p-4 backdrop-blur-md`}
              >
                <div
                  className={`text-xs font-medium ${app.dark ? "text-white/55" : "text-black/50"}`}
                >
                  Downloads
                </div>
                <div
                  className={`mt-2 text-2xl font-black ${app.dark ? "text-white" : "text-[#111111]"}`}
                >
                  {app.downloads}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-black/8 bg-[#111111] p-4 text-white">
                <div className="text-xs font-medium text-white/50">Parent score</div>
                <div className="mt-2 text-2xl font-black text-yellow-300">
                  {app.rating}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSidePhone({ app, reverse = false }) {
  return (
    <div className="relative h-[35rem] w-[17rem] rounded-[3.1rem] border border-black/8 bg-[#111111] p-3 shadow-[0_34px_100px_rgba(0,0,0,0.18)]">
      <div className="relative h-full w-full overflow-hidden rounded-[2.55rem] bg-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${app.screenGradient}`} />
        <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-black/90" />
        <div className="relative flex h-full flex-col justify-between p-4 pt-9">
          <div>
            <div
              className={`text-[11px] font-semibold ${app.dark ? "text-white/55" : "text-black/55"}`}
            >
              Preview
            </div>
            <div
              className={`mt-2 text-[2.15rem] font-black leading-none ${app.dark ? "text-white" : "text-[#111111]"}`}
            >
              {app.shortName}
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={`rounded-[1.4rem] border ${
                app.dark ? "border-white/10 bg-white/10" : "border-black/8 bg-white/55"
              } p-3 backdrop-blur-md`}
            >
              <div className={`text-xs ${app.dark ? "text-white/55" : "text-black/55"}`}>
                Motion card
              </div>
              <div
                className={`mt-2 text-sm font-bold ${app.dark ? "text-white" : "text-[#111111]"}`}
              >
                {reverse ? app.highlights[1] : app.highlights[0]}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div
                className={`h-20 rounded-2xl ${app.dark ? "bg-white/10" : "bg-black/8"}`}
              />
              <div
                className={`h-20 rounded-2xl ${app.dark ? "bg-white/10" : "bg-black/8"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroPhones({
  apps,
  activeApp,
  onSelectApp,
  animationMode = "glide",
  direction = 1,
}) {
  const activeIndex = apps.findIndex((app) => app.id === activeApp.id);
  const prevApp = apps[(activeIndex - 1 + apps.length) % apps.length];
  const nextApp = apps[(activeIndex + 1) % apps.length];

  const configMap = {
    fan: {
      leftRotate: -13,
      rightRotate: 13,
      sideScale: 1.05,
      centerScale: 1,
      sideY: 0,
      centerY: 0,
      float: false,
    },
    depth: {
      leftRotate: -18,
      rightRotate: 18,
      sideScale: 1.08,
      centerScale: 1.05,
      sideY: 10,
      centerY: -6,
      float: false,
    },
    float: {
      leftRotate: -15,
      rightRotate: 15,
      sideScale: 1.07,
      centerScale: 1.02,
      sideY: 0,
      centerY: 0,
      float: true,
    },
    glide: {
      leftRotate: -8,
      rightRotate: 8,
      sideScale: 1.03,
      centerScale: 1.01,
      sideY: 4,
      centerY: -2,
      float: false,
    },
    orbit: {
      leftRotate: -22,
      rightRotate: 22,
      sideScale: 1.1,
      centerScale: 1.03,
      sideY: -4,
      centerY: 0,
      float: true,
    },
  };

  const config = configMap[animationMode] || configMap.fan;

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        animate={config.float ? { y: [0, -12, 0], x: [0, 10, 0] } : { y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-4 right-8 h-28 w-28 rounded-full ${activeApp.glowClass} blur-2xl`}
      />
      <motion.div
        animate={config.float ? { y: [0, 14, 0], x: [0, -10, 0] } : { y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-[#111111]/8 blur-3xl"
      />

      <div className="relative flex h-[46rem] w-full items-center justify-center overflow-visible sm:h-[48rem] lg:h-[50rem]">
        <motion.button
          key={prevApp.id + "-left"}
          initial={{ opacity: 0, x: 120, rotate: -4, scale: 0.88 }}
          animate={
            config.float
              ? {
                  opacity: 1,
                  x: 0,
                  rotate: config.leftRotate,
                  scale: config.sideScale,
                  y: [config.sideY, config.sideY - 14, config.sideY],
                }
              : {
                  opacity: 1,
                  x: 0,
                  rotate: config.leftRotate,
                  scale: config.sideScale,
                  y: config.sideY,
                }
          }
          transition={{
            duration: 0.55,
            repeat: config.float ? Infinity : 0,
            ease: "easeInOut",
          }}
          whileHover={{
            y: config.sideY - 10,
            rotate: config.leftRotate * 0.82,
            scale: config.sideScale + 0.04,
          }}
          onClick={() => onSelectApp(prevApp.id)}
          className="absolute left-[-1.8rem] top-12 z-10 hidden cursor-pointer border-0 bg-transparent p-0 sm:block"
          aria-label={`Show ${prevApp.name}`}
        >
          <HeroSidePhone app={prevApp} />
        </motion.button>

        <div className="relative z-20" style={{ perspective: 2200 }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeApp.id + "-center"}
              initial={{
                opacity: 0,
                x: direction > 0 ? 120 : -120,
                scale: 0.95,
                rotate: direction > 0 ? 5 : -5,
              }}
              animate={
                config.float
                  ? {
                      opacity: 1,
                      x: 0,
                      scale: [
                        config.centerScale,
                        config.centerScale + 0.02,
                        config.centerScale,
                      ],
                      y: [config.centerY, config.centerY - 14, config.centerY],
                      rotate: 0,
                    }
                  : {
                      opacity: 1,
                      x: 0,
                      scale: config.centerScale,
                      y: config.centerY,
                      rotate: 0,
                    }
              }
              exit={{
                opacity: 0,
                x: direction > 0 ? -120 : 120,
                scale: 0.95,
                rotate: direction > 0 ? -5 : 5,
              }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              whileHover={{ y: config.centerY - 10, rotateX: 3, rotateY: -3 }}
            >
              <HeroCenterPhone app={activeApp} />
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.button
          key={nextApp.id + "-right"}
          initial={{ opacity: 0, x: -120, rotate: 4, scale: 0.88 }}
          animate={
            config.float
              ? {
                  opacity: 1,
                  x: 0,
                  rotate: config.rightRotate,
                  scale: config.sideScale,
                  y: [config.sideY, config.sideY - 14, config.sideY],
                }
              : {
                  opacity: 1,
                  x: 0,
                  rotate: config.rightRotate,
                  scale: config.sideScale,
                  y: config.sideY,
                }
          }
          transition={{
            duration: 0.55,
            repeat: config.float ? Infinity : 0,
            ease: "easeInOut",
          }}
          whileHover={{
            y: config.sideY - 10,
            rotate: config.rightRotate * 0.82,
            scale: config.sideScale + 0.04,
          }}
          onClick={() => onSelectApp(nextApp.id)}
          className="absolute right-[-1.8rem] top-12 z-10 hidden cursor-pointer border-0 bg-transparent p-0 sm:block"
          aria-label={`Show ${nextApp.name}`}
        >
          <HeroSidePhone app={nextApp} reverse />
        </motion.button>
      </div>

      <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
        {apps.map((app) => {
          const isActive = app.id === activeApp.id;
          return (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className={`h-2.5 rounded-full transition-all ${
                isActive ? "w-8 bg-[#111111]" : "w-2.5 bg-black/20 hover:bg-black/35"
              }`}
              aria-label={`Activate ${app.name}`}
            />
          );
        })}
      </div>
    </div>
  );
}
