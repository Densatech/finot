import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BanknotesIcon, ChartBarIcon, HeartIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMyDonations } from "@/hooks/queries";
import { Card, SectionHeader, StatsCard } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import QueryState from "@/components/ui/QueryState";
import DonationList from "@/features/donations/DonationList";
import { formatEtb, totalGiven } from "@/features/donations/fund";

export default function DashboardDonations() {
  const { t } = useTranslation();
  const { data: donations = [], isLoading, error, refetch } = useMyDonations();
  const completed = donations.filter((d) => d.payment.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("tab_donations", "Donations")}
        description={t("contribution_history_giving")}
        action={
          <>
            <Link to="/dashboard/donations/history" className="btn-outline">
              {t("full_history", "Full history")}
            </Link>
            <Link to="/dashboard/donations/give" className="btn-primary">
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              {t("make_donation", "Make a donation")}
            </Link>
          </>
        }
      />

      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loading={<div className="skeleton h-40" />}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title={t("total_given", "Total given")} value={formatEtb(totalGiven(donations))} icon={<BanknotesIcon className="h-6 w-6" />} />
          <StatsCard title={t("status_completed", "Completed")} value={completed.length} icon={<HeartIcon className="h-6 w-6" />} />
          <StatsCard title={t("total_donations", "All attempts")} value={donations.length} icon={<ChartBarIcon className="h-6 w-6" />} />
        </div>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">{t("recent_donations", "Recent donations")}</h2>
            <Link to="/dashboard/donations/profile" className="text-sm font-medium text-primary hover:underline">
              {t("donation_profile", "Giving profile")}
            </Link>
          </div>
          {donations.length === 0 ? (
            <EmptyState
              icon={<HeartIcon className="h-8 w-8" />}
              title={t("no_donations_yet", "No donations yet")}
              description={t("no_donations_msg", "Your donations will appear here.")}
              action={
                <Link to="/dashboard/donations/give" className="btn-primary">
                  {t("make_first_donation", "Make your first donation")}
                </Link>
              }
            />
          ) : (
            <DonationList donations={donations.slice(0, 5)} />
          )}
        </Card>
      </QueryState>
    </div>
  );
}
