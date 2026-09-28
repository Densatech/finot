import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CurrencyDollarIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import DonationForm from "@/features/donations/DonationForm";
import PublicHero from "@/components/navigation/PublicHero";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";

export default function DonationOutside() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const cards = [
    { title: t("student_donations"), description: t("student_donations_desc"), icon: UsersIcon },
    { title: t("one_time_donations"), description: t("one_time_donations_desc"), icon: CurrencyDollarIcon },
    { title: t("transparent_trackable"), description: t("transparent_trackable_desc"), icon: ShieldCheckIcon },
  ];

  return (
    <div className="bg-background">
      <PublicHero title={t("support_students_community")} subtitle={t("donation_intro_desc")} />
      <div className="mx-auto max-w-4xl px-4 py-12">

        <Stagger inView className="mb-10 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <StaggerItem key={card.title} className="card card-interactive p-5">
              <span className="mb-3 inline-flex rounded-xl bg-accent/25 p-2.5">
                <card.icon className="h-6 w-6 text-accent-foreground" aria-hidden="true" />
              </span>
              <h2 className="mb-1 font-semibold text-foreground">{card.title}</h2>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn inView className="card mx-auto max-w-xl shadow-card">
          <h2 className="mb-1 text-lg font-semibold text-foreground">{t("donate_now", "Donate now")}</h2>
          {user ? (
            <p className="mb-5 text-sm text-muted-foreground">
              {t("member_donation_hint", "You're signed in — donations made from your dashboard appear in your history.")}{" "}
              <Link to="/dashboard/donations/give" className="font-semibold text-primary hover:underline">
                {t("give_donation", "Give from dashboard")}
              </Link>
            </p>
          ) : (
            <p className="mb-5 text-sm text-muted-foreground">{t("guest_donation_hint", "No account needed.")}</p>
          )}
          <DonationForm guest={!user} />
        </FadeIn>
      </div>
    </div>
  );
}
