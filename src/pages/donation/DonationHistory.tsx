import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import { useMyDonations } from "@/hooks/queries";
import { Card, SectionHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import QueryState from "@/components/ui/QueryState";
import DonationList from "@/features/donations/DonationList";

export default function DonationHistory() {
  const { t } = useTranslation();
  const { data: donations = [], isLoading, error, refetch } = useMyDonations();

  return (
    <div className="space-y-6">
      <Link to="/dashboard/donations" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {t("back_to_donations", "Back to donations")}
      </Link>
      <SectionHeader title={t("donation_history", "Donation history")} />
      <Card>
        <QueryState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={donations.length === 0}
          empty={
            <EmptyState
              icon={<HeartIcon className="h-8 w-8" />}
              title={t("no_donations_yet", "No donations yet")}
              description={t("no_donations_yet_msg", "When you donate, the details will show up here.")}
              action={
                <Link to="/dashboard/donations/give" className="btn-primary">
                  {t("give_donation", "Give a donation")}
                </Link>
              }
            />
          }
        >
          <DonationList donations={donations} showReference />
        </QueryState>
      </Card>
    </div>
  );
}
