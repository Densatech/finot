import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FadeIn } from "@/components/motion";

/** Onboarding nudge until the backend reports the student profile as complete. */
export default function ProfileCompletionBanner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user?.profile || user.profile.is_complete || pathname.startsWith("/dashboard/profile/edit")) return null;

  return (
    <FadeIn className="flex flex-col gap-3 rounded-2xl border border-accent/60 bg-accent/10 p-4 sm:flex-row sm:items-center">
      <InformationCircleIcon className="h-6 w-6 flex-shrink-0 text-primary" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{t("complete_profile_title", "Complete your profile")}</p>
        <p className="text-sm text-muted-foreground">
          {t(
            "complete_profile_body",
            "Add your batch, department, phone and an emergency contact so the fellowship can reach you and place you in a family.",
          )}
        </p>
      </div>
      <Link to="/dashboard/profile/edit" className="btn-secondary whitespace-nowrap">
        {t("complete_profile_cta", "Complete profile")}
      </Link>
    </FadeIn>
  );
}
