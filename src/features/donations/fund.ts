import type { FundCategory, PaymentStatus } from "@/types";

/** Backend fund codes (what we POST) → translation keys (what we show). */
export const FUND_LABEL_KEYS: Record<FundCategory, string> = {
  "Weekly Donation": "weekly_donation",
  "Building Fund": "building_fund",
  "Charity (Poor)": "charity_(poor)",
  "Special Events": "special_events",
  Other: "other",
};

export const MIN_DONATION_ETB = 1;

export function formatEtb(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return `${(Number.isFinite(value) ? value : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
}

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  COMPLETED: "bg-success/10 text-success",
  PENDING: "bg-warning/10 text-warning",
  FAILED: "bg-destructive/10 text-destructive",
};

/** Sum of completed payments only (pending/failed never count as given). */
export function totalGiven(donations: { payment: { amount: string; status: PaymentStatus } }[]) {
  return donations
    .filter((d) => d.payment.status === "COMPLETED")
    .reduce((sum, d) => sum + Number(d.payment.amount || 0), 0);
}
