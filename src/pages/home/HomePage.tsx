import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon, ChatBubbleLeftRightIcon, HeartIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { fadeUp, m } from "@/components/motion";
import BackToTop from "@/components/ui/BackToTop";
import PhotoCarousel from "@/components/home/PhotoCarousel";
import AboutImageCarousel from "./AboutImageCarousel";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex min-h-[82vh] items-center bg-gradient-to-br from-primary to-primary-light">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_45%,hsl(var(--accent)/0.10),transparent_60%)]" />
        <div className="container relative z-10 mx-auto px-4 py-20 text-center">
          <m.div initial="hidden" animate="visible" variants={stagger}>
            <m.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
                <SparklesIcon className="mr-2 h-4 w-4 text-accent" aria-hidden="true" />
                {t("community_platform")}
              </span>
            </m.div>

            <m.h1 variants={fadeUp} className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl">
              {t("welcome")}{" "}
              <span className="relative inline-block text-accent">
                finot
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" aria-hidden="true">
                  <m.path
                    d="M2 8C50 2 150 2 198 8"
                    stroke="hsl(var(--accent))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 0.6, ease: "easeInOut" }}
                  />
                </svg>
              </span>
            </m.h1>

            <m.p variants={fadeUp} className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl md:text-2xl">
              {t("fellowship_desc")}
            </m.p>

            <m.div variants={fadeUp} className="mb-6 flex flex-col justify-center gap-4 sm:flex-row">
              {user ? (
                <Link to="/dashboard" className="btn-primary group px-8 py-4 text-lg">
                  {t("go_to_dashboard", "Go to your dashboard")}
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary group px-8 py-4 text-lg">
                    {t("get_started")}
                    <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-white/40 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    {t("sign_in")}
                  </Link>
                </>
              )}
            </m.div>

            <m.div variants={fadeUp}>
              <Link to="/anonymous" className="group inline-flex items-center text-base font-medium text-white/75 transition hover:text-accent">
                <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                {t("anonymous_qa_forum")}
                <ArrowRightIcon className="ml-1 h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
              </Link>
            </m.div>
          </m.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="block w-full" aria-hidden="true">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-background py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <m.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/80">{t("our_story")}</span>
            <h2 className="mb-4 mt-2 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              {t("about")} <span className="text-primary">{t("astu_gibi_gubae")}</span>
            </h2>
            <div className="mx-auto h-1 w-16 rounded-full bg-accent" />
          </m.div>

          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto flex max-w-6xl flex-col items-stretch gap-10 md:flex-row"
          >
            <m.div variants={fadeUp} className="flex-1">
              <AboutImageCarousel />
            </m.div>
            <div className="flex flex-1 flex-col justify-center gap-5">
              <m.div variants={fadeUp} className="card card-interactive">
                <h3 className="mb-2 text-lg font-bold text-foreground">{t("years_of_fellowship")}</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>{t("founded_desc")}</li>
                  <li>{t("established_desc")}</li>
                  <li>{t("fellowship_desc_2")}</li>
                </ul>
              </m.div>
              <m.div variants={fadeUp} className="card card-interactive">
                <h3 className="mb-2 font-semibold text-foreground">{t("our_impact")}</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>{t("church_service_desc")}</li>
                  <li>{t("member_contributions")}</li>
                  <li>{t("decades_nurturing")}</li>
                </ul>
              </m.div>
              <m.div variants={fadeUp}>
                <Link to="/about" className="btn-primary group mt-2 px-7 py-3 text-base">
                  {t("read_more")}
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </m.div>
            </div>
          </m.div>
        </div>
      </section>

      {/* Get involved */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <m.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">{t("get_involved")}</h2>
            <p className="text-muted-foreground">{t("support_mission")}</p>
          </m.div>

          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <m.div variants={fadeUp}>
              <Link to="/donate" className="card card-interactive group flex items-center gap-3 px-8 py-5">
                <span className="rounded-xl bg-success/10 p-2.5">
                  <HeartIcon className="h-6 w-6 text-success" aria-hidden="true" />
                </span>
                <span className="text-left">
                  <span className="block font-semibold text-foreground">{t("donate")}</span>
                  <span className="text-sm text-muted-foreground">{t("support_fellowship")}</span>
                </span>
                <ArrowRightIcon className="ml-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </m.div>
            <m.div variants={fadeUp}>
              <Link to="/anonymous" className="card card-interactive group flex items-center gap-3 px-8 py-5">
                <span className="rounded-xl bg-primary/10 p-2.5">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <span className="text-left">
                  <span className="block font-semibold text-foreground">{t("anonymous_qa")}</span>
                  <span className="text-sm text-muted-foreground">{t("ask_safely")}</span>
                </span>
                <ArrowRightIcon className="ml-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </m.div>
          </m.div>
        </div>
      </section>

      <PhotoCarousel />
      <BackToTop />
    </div>
  );
}
