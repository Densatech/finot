import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useMyDonations } from "@/hooks/queries";
import { Card, SectionHeader } from "@/components/ui/Card";
import QueryState from "@/components/ui/QueryState";
import DonationList from "@/features/donations/DonationList";
import { formatEtb, totalGiven } from "@/features/donations/fund";

const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export default function DonationProfile() {
  const { t } = useTranslation();
  const { data: donations = [], isLoading, error, refetch } = useMyDonations();

  // Only completed payments count as money given.
  const completed = donations.filter((d) => d.payment.status === "COMPLETED");
  const total = totalGiven(donations);
  const year = new Date().getFullYear();
  const monthly = Array(12).fill(0) as number[];
  completed.forEach((d) => {
    const date = new Date(d.donated_at);
    if (date.getFullYear() === year) monthly[date.getMonth()] += Number(d.payment.amount || 0);
  });
  const max = Math.max(...monthly, 1);

  return (
    <div className="space-y-6">
      <Link to="/dashboard/donations" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {t("back_to_donations", "Back to donations")}
      </Link>
      <SectionHeader title={t("my_donation_profile", "My giving profile")} />

      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={completed.length === 0}
        empty={
          <Card className="py-8 text-center">
            <p className="mb-4 text-muted-foreground">{t("no_donations_yet_msg", "No completed donations yet.")}</p>
            <Link to="/dashboard/donations/give" className="btn-primary">
              {t("make_first_donation", "Make your first donation")}
            </Link>
          </Card>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="text-center">
            <p className="text-sm text-muted-foreground">{t("total_given", "Total given")}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{formatEtb(total)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-muted-foreground">{t("number_of_gifts", "Number of gifts")}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{completed.length}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-muted-foreground">{t("average_gift", "Average gift")}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{formatEtb(total / completed.length)}</p>
          </Card>
        </div>

        <Card>
          <h2 className="section-title mb-3">
            {t("monthly_giving", "Monthly giving")} · {year}
          </h2>
          <div className="flex h-40 items-end gap-1.5" role="img" aria-label={t("monthly_giving", "Monthly giving")}>
            {monthly.map((value, i) => (
              <div key={MONTH_KEYS[i]} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height: `${(value / max) * 100}%`, minHeight: value ? 4 : 0 }}
                  title={`${t(MONTH_KEYS[i])}: ${formatEtb(value)}`}
                />
                <span className="text-[10px] text-muted-foreground">{t(MONTH_KEYS[i])}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="section-title mb-3">{t("recent_donations", "Recent donations")}</h2>
          <DonationList donations={completed.slice(0, 5)} />
        </Card>
      </QueryState>
    </div>
  );
}
