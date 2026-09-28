import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import PublicHero from "@/components/navigation/PublicHero";
import { Stagger, StaggerItem } from "@/components/motion";

export default function AnonymousIntro() {
  const { t } = useTranslation();

  const features = [
    { title: t("ask_anonymously"), description: t("ask_anonymously_desc"), icon: ChatBubbleLeftRightIcon },
    { title: t("verified_responses"), description: t("verified_responses_desc"), icon: ShieldCheckIcon },
    { title: t("community_support"), description: t("community_support_desc"), icon: UserGroupIcon },
  ];

  const steps = [
    { title: t("ask_anonymously"), description: t("no_reg_needed"), icon: ChatBubbleLeftRightIcon },
    { title: t("choose_category"), description: t("choose_category_desc"), icon: ArrowRightOnRectangleIcon },
    { title: t("receive_responses"), description: t("receive_responses_desc"), icon: ShieldCheckIcon },
    { title: t("community_support"), description: t("peer_support_desc"), icon: UserGroupIcon },
  ];

  return (
    <div className="bg-background">
      <PublicHero title={t("emahoy_title")} subtitle={t("emahoy_subtitle")}>
        <Link to="/anonymous/questions" className="btn-primary px-6 py-3 text-base">
          {t("join_conversation")}
          <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
        <Link
          to="/anonymous/ask"
          className="btn-outline px-6 py-3 text-base"
        >
          <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
          {t("ask_question", "Ask a question")}
        </Link>
      </PublicHero>
      <div className="mx-auto max-w-5xl px-4 py-14 text-center">

        <Stagger inView className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {features.map((card) => (
            <StaggerItem key={card.title} className="card card-interactive flex flex-col items-center text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/30">
                <card.icon className="h-7 w-7 text-primary" aria-hidden="true" />
              </span>
              <h2 className="mb-2 text-lg font-semibold text-primary">{card.title}</h2>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <h2 className="mb-8 text-2xl font-semibold text-primary md:text-3xl">{t("how_it_works")}</h2>
        <Stagger as="ol" inView className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((step, index) => (
            <StaggerItem as="li" key={step.title} className="card text-left">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mb-1 font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}
