import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useMyDonations } from "@/hooks/queries";
import { Card, SectionHeader } from "@/components/ui/Card";
import DonationForm from "@/features/donations/DonationForm";
import { formatEtb, totalGiven } from "@/features/donations/fund";

export default function DonationInside() {
  const { t } = useTranslation();
  const { data: donations = [] } = useMyDonations();

  return (
    <div className="space-y-6">
      <Link to="/dashboard/donations" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {t("back_to_donations", "Back to donations")}
      </Link>
      <SectionHeader title={t("give_donation", "Give a donation")} description={t("complete_redirect_chapa")} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <DonationForm guest={false} />
        </Card>
        <Card>
          <h2 className="section-title mb-3">{t("giving_snapshot", "Your giving")}</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("total_given", "Total given")}</dt>
              <dd className="font-semibold text-foreground">{formatEtb(totalGiven(donations))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("gifts", "Gifts")}</dt>
              <dd className="font-semibold text-foreground">{donations.filter((d) => d.payment.status === "COMPLETED").length}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
