import { Link } from "react-router-dom";
import { ArrowRight, Compass, SearchX } from "lucide-react";
import Seo from "../components/seo/Seo";

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you are looking for could not be found on Qubi LLC."
        noindex
      />

      <main>
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-black/8 bg-white/80 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.06)] lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-yellow-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/70">
                <SearchX className="h-4 w-4" />
                404 page
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
                The page you requested could not be found.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-black/62 sm:text-lg">
                The link may be outdated, the address may be incorrect, or the page may
                not exist in the current Qubi site structure.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111111] px-6 py-3.5 text-sm font-bold text-yellow-300 shadow-[0_16px_45px_rgba(0,0,0,0.14)]"
                >
                  Back to homepage
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/75 px-6 py-3.5 text-sm font-semibold text-black shadow-sm"
                >
                  Explore Qubi
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/8 bg-[#111111] p-8 text-white shadow-[0_18px_60px_rgba(0,0,0,0.12)] lg:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-300 text-black">
                <Compass className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-2xl font-black">
                Where would you like to go next?
              </h2>

              <div className="mt-6 grid gap-4">
                <NotFoundLink to="/" label="Homepage" />
                <NotFoundLink to="/about" label="About Qubi" />
                <NotFoundLink to="/trust-safety" label="Trust & Safety" />
                <NotFoundLink to="/contact" label="Contact" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function NotFoundLink({ to, label }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/78 transition hover:bg-white/8"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 opacity-75" />
    </Link>
  );
}
