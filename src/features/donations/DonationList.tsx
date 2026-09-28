import { useTranslation } from "react-i18next";
import type { Donation } from "@/types";
import { FUND_LABEL_KEYS, PAYMENT_STATUS_STYLES, formatEtb } from "./fund";

/** Donation rows with the real payment status and transaction reference. */
export default function DonationList({ donations, showReference = false }: { donations: Donation[]; showReference?: boolean }) {
  const { t } = useTranslation();
  return (
    <ul className="divide-y divide-border">
      {donations.map((d) => (
        <li key={d.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-foreground">{t(FUND_LABEL_KEYS[d.fund_category] ?? "other", d.fund_category)}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(d.donated_at).toLocaleDateString()}
              {showReference && d.payment.transaction_reference && (
                <span className="ml-2 break-all font-mono text-xs">{d.payment.transaction_reference}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">{formatEtb(d.payment.amount)}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_STYLES[d.payment.status]}`}>
              {t(`status_${d.payment.status.toLowerCase()}`, d.payment.status)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
