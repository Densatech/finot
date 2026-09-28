import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon, ChatBubbleLeftRightIcon, HeartIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import PhotoGallery from "@/components/home/PhotoGallery";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary">
        <div className="container mx-auto px-4 py-20 text-center sm:py-28">
          <p className="mb-5 inline-block rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white/85">
            {t("community_platform")}
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            {t("welcome")} <span className="text-accent">finot</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">{t("fellowship_desc")}</p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {user ? (
              <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-base">
                {t("go_to_dashboard", "Go to your dashboard")}
                <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
                  {t("get_started")}
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10"
                >
                  {t("sign_in")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-background py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary/70">{t("our_story")}</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              {t("about")} <span className="text-primary">{t("astu_gibi_gubae")}</span>
            </h2>
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <img
                src="/images/gibi1.webp"
                alt={t("astu_gibi_gubae")}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="space-y-4">
              <div className="card">
                <h3 className="mb-2 text-lg font-semibold text-foreground">{t("years_of_fellowship")}</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>{t("founded_desc")}</li>
                  <li>{t("established_desc")}</li>
                  <li>{t("fellowship_desc_2")}</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="mb-2 text-lg font-semibold text-foreground">{t("our_impact")}</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>{t("church_service_desc")}</li>
                  <li>{t("member_contributions")}</li>
                  <li>{t("decades_nurturing")}</li>
                </ul>
              </div>
              <Link to="/about" className="btn-secondary">
                {t("read_more")}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Get involved */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">{t("get_involved")}</h2>
            <p className="text-muted-foreground">{t("support_mission")}</p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            <Link to="/donate" className="card flex items-center gap-4 transition-colors hover:border-primary/30">
              <span className="rounded-xl bg-success/10 p-3">
                <HeartIcon className="h-6 w-6 text-success" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-foreground">{t("donate")}</span>
                <span className="text-sm text-muted-foreground">{t("support_fellowship")}</span>
              </span>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>
            <Link to="/anonymous" className="card flex items-center gap-4 transition-colors hover:border-primary/30">
              <span className="rounded-xl bg-primary/10 p-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-foreground">{t("anonymous_qa")}</span>
                <span className="text-sm text-muted-foreground">{t("ask_safely")}</span>
              </span>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <PhotoGallery />
    </div>
  );
}
