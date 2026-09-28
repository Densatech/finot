import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AcademicCapIcon,
  BookOpenIcon,
  FilmIcon,
  HandRaisedIcon,
  HeartIcon,
  MegaphoneIcon,
  MusicalNoteIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { CountUp, FadeIn, Stagger, StaggerItem, fadeUp, m } from "@/components/motion";

const HISTORY_IMAGES = ["/images/gibi1.webp", "/images/gibi2.webp", "/images/gibi3.webp", "/images/gibi4.webp"];
const GALLERY = ["/images/gibi1.webp", "/images/gibi2.webp", "/images/gibi3.webp", "/images/gibi4.webp", "/images/gibi5.webp"];
const heroStagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

export default function AboutPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const serviceGroups = [
    { name: t("group_choir"), icon: MusicalNoteIcon, desc: t("group_choir_desc") },
    { name: t("group_charity"), icon: HeartIcon, desc: t("group_charity_desc") },
    { name: t("group_media"), icon: FilmIcon, desc: t("group_media_desc") },
    { name: t("group_teaching"), icon: BookOpenIcon, desc: t("group_teaching_desc") },
    { name: t("group_evangelism"), icon: MegaphoneIcon, desc: t("group_evangelism_desc") },
    { name: t("group_prayer"), icon: HandRaisedIcon, desc: t("group_prayer_desc") },
  ];

  const stats = [
    { label: t("stats_years"), value: 30, icon: SparklesIcon },
    { label: t("stats_students"), value: 500, icon: AcademicCapIcon },
    { label: t("stats_groups"), value: 6, icon: UserGroupIcon },
    { label: t("stats_graduates"), value: 5000, icon: HeartIcon },
  ];

  const services = [t("service_teaching"), t("service_liturgy"), t("service_counseling"), t("service_training"), t("service_fellowship")];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-light py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--accent)/0.08),transparent_60%)]" />
        <m.div initial="hidden" animate="visible" variants={heroStagger} className="container relative z-10 mx-auto px-4 text-center">
          <m.span variants={fadeUp} className="mb-4 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
            <SparklesIcon className="mr-2 h-4 w-4 text-accent" aria-hidden="true" />
            {t("our_story_desc")}
          </m.span>
          <m.h1 variants={fadeUp} className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {t("about")} <span className="text-accent">{t("astu_gibi_gubae")}</span>
          </m.h1>
          <m.p variants={fadeUp} className="mx-auto max-w-2xl text-lg text-white/80">
            {t("fellowship_desc")}
          </m.p>
        </m.div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="block w-full" aria-hidden="true">
            <path d="M0 80L60 70C120 60 240 50 360 45C480 40 600 40 720 43C840 46 960 52 1080 55C1200 58 1320 58 1380 58L1440 58V80H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14">
        <Stagger inView className="container mx-auto grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label} className="card card-interactive text-center">
              <stat.icon className="mx-auto mb-2 h-7 w-7 text-accent-foreground/70" aria-hidden="true" />
              <p className="text-2xl font-bold text-primary md:text-3xl">
                <CountUp value={stat.value} suffix="+" />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* History */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn inView className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/80">{t("history")}</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{t("years_of_fellowship")}</h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-accent" />
          </FadeIn>
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <Stagger inView className="grid grid-cols-2 gap-4">
              {HISTORY_IMAGES.map((src, i) => (
                <StaggerItem key={src} className={`overflow-hidden rounded-2xl bg-muted shadow-card ${i === 1 ? "mt-6" : i === 2 ? "-mt-4" : ""}`}>
                  <img
                    src={src}
                    alt={`${t("astu_gibi_gubae")} ${i + 1}`}
                    className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-56"
                    loading="lazy"
                    decoding="async"
                  />
                </StaggerItem>
              ))}
            </Stagger>
            <FadeIn inView className="space-y-5 leading-relaxed text-muted-foreground">
              <p>{t("history_p1")}</p>
              <p>{t("history_p2")}</p>
              <h3 className="pt-2 text-lg font-semibold text-foreground">{t("currently_providing")}</h3>
              <ul className="space-y-2">
                {services.map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Service groups */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <FadeIn inView className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/80">{t("services")}</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{t("service_groups")}</h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-accent" />
          </FadeIn>
          <Stagger inView className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviceGroups.map((group) => (
              <StaggerItem key={group.name} className="card card-interactive flex items-start gap-4">
                <span className="flex-shrink-0 rounded-xl bg-primary/10 p-3">
                  <group.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn inView className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t("our_community")}</h2>
          </FadeIn>
          <Stagger inView className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {GALLERY.map((src, i) => (
              <StaggerItem key={src} className="overflow-hidden rounded-2xl bg-muted shadow-card">
                <img
                  src={src}
                  alt={`${t("our_community")} ${i + 1}`}
                  className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Platform */}
      <section className="bg-muted py-16">
        <FadeIn inView className="container mx-auto px-4">
          <div className="card mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent-foreground">
              <SparklesIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {t("the_platform")}
            </div>
            <h3 className="mb-4 text-2xl font-bold text-foreground">{t("about")} finot</h3>
            <p className="mb-4 leading-relaxed text-muted-foreground">{t("platform_desc")}</p>
            <p className="font-semibold text-primary">{t("built_with_love")}</p>
          </div>
        </FadeIn>
      </section>

      {!user && (
        <section className="py-16">
          <FadeIn inView className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">{t("ready_to_join")}</h2>
            <p className="mx-auto mb-8 max-w-md text-muted-foreground">{t("join_desc")}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/register" className="btn-primary px-8 py-4 text-lg">
                {t("get_started")}
              </Link>
              <Link to="/" className="btn-outline px-8 py-4 text-lg">
                {t("back_to_home")}
              </Link>
            </div>
          </FadeIn>
        </section>
      )}
    </div>
  );
}
