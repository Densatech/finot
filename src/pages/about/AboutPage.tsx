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

const GALLERY = ["/images/gibi1.webp", "/images/gibi2.webp", "/images/gibi3.webp", "/images/gibi4.webp"];

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
    { label: t("stats_years"), value: "30+", icon: SparklesIcon },
    { label: t("stats_students"), value: "500+", icon: AcademicCapIcon },
    { label: t("stats_groups"), value: "6+", icon: UserGroupIcon },
    { label: t("stats_graduates"), value: "5000+", icon: HeartIcon },
  ];

  const services = [
    t("service_teaching"),
    t("service_liturgy"),
    t("service_counseling"),
    t("service_training"),
    t("service_fellowship"),
  ];

  return (
    <div className="bg-background">
      <section className="bg-primary">
        <div className="container mx-auto px-4 py-16 text-center md:py-20">
          <p className="mb-4 inline-block rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white/85">
            {t("our_story_desc")}
          </p>
          <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {t("about")} <span className="text-accent">{t("astu_gibi_gubae")}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">{t("fellowship_desc")}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card text-center">
              <stat.icon className="mx-auto mb-2 h-7 w-7 text-primary" aria-hidden="true" />
              <p className="text-2xl font-bold text-primary md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary/70">{t("history")}</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{t("years_of_fellowship")}</h2>
          </div>
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <ul className="grid grid-cols-2 gap-4">
              {GALLERY.map((src, i) => (
                <li key={src} className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={src}
                    alt={`${t("astu_gibi_gubae")} ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              ))}
            </ul>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>{t("history_p1")}</p>
              <p>{t("history_p2")}</p>
              <h3 className="pt-2 text-lg font-semibold text-foreground">{t("currently_providing")}</h3>
              <ul className="space-y-2">
                {services.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-14">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary/70">{t("services")}</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{t("service_groups")}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviceGroups.map((group) => (
              <div key={group.name} className="card flex items-start gap-4">
                <span className="flex-shrink-0 rounded-xl bg-primary/10 p-3">
                  <group.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="card mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary/70">{t("the_platform")}</p>
            <h2 className="mb-4 text-2xl font-bold text-foreground">{t("about")} finot</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">{t("platform_desc")}</p>
            <p className="font-semibold text-primary">{t("built_with_love")}</p>
          </div>
        </div>
      </section>

      {!user && (
        <section className="bg-muted py-14">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">{t("ready_to_join")}</h2>
            <p className="mx-auto mb-8 max-w-md text-muted-foreground">{t("join_desc")}</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
                {t("get_started")}
              </Link>
              <Link to="/" className="btn-outline px-8 py-3.5 text-base">
                {t("back_to_home")}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
