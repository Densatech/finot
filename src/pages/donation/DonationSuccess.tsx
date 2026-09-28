import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { CheckCircleIcon, ClockIcon, PrinterIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { donationApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { qk } from "@/lib/queryClient";
import { formatEtb } from "@/features/donations/fund";
import type { DonationReceipt } from "@/types";
import Spinner from "@/components/ui/Spinner";

type Phase = "checking" | "success" | "pending" | "failed" | "missing";

// The API answers 202 while Chapa still reports "pending" and 503 when the gateway is
// unreachable; both are retried a few times before telling the donor to check later.
const MAX_ATTEMPTS = 6;
const RETRY_MS = 5000;

export default function DonationSuccess() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const txRef = params.get("tx_ref") || params.get("trx_ref");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>(txRef ? "checking" : "missing");
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!txRef) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const verify = async (attempt: number) => {
      try {
        const res = await donationApi.verify(txRef);
        if (cancelled) return;
        setReceipt(res.data);
        if (res.status === 202 || res.data.payment_status === "PENDING") {
          if (attempt < MAX_ATTEMPTS) timer = setTimeout(() => verify(attempt + 1), RETRY_MS);
          else setPhase("pending");
          return;
        }
        setPhase("success");
        queryClient.invalidateQueries({ queryKey: qk.donations });
      } catch (err) {
        if (cancelled) return;
        if (isAxiosError(err) && err.response?.status === 503 && attempt < MAX_ATTEMPTS) {
          timer = setTimeout(() => verify(attempt + 1), RETRY_MS);
          return;
        }
        if (isAxiosError(err) && err.response?.status === 400 && err.response.data?.payment_status) {
          setReceipt(err.response.data as DonationReceipt);
        }
        setMessage(getErrorMessage(err));
        setPhase(isAxiosError(err) && err.response?.status === 503 ? "pending" : "failed");
      }
    };

    void verify(1);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [txRef, queryClient]);

  const backTo = user ? "/dashboard/donations" : "/";

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
      <div className="card w-full max-w-lg border-t-4 border-t-accent text-center print:border-0 print:shadow-none">
        {phase === "checking" && (
          <div className="space-y-3 py-6">
            <Spinner size="h-8 w-8" className="mx-auto text-primary" />
            <p className="font-medium text-foreground">{t("verifying_payment", "Confirming your payment…")}</p>
            <p className="text-sm text-muted-foreground">{t("verifying_payment_hint", "This can take a few seconds.")}</p>
          </div>
        )}

        {phase === "success" && receipt && (
          <div className="space-y-5">
            <CheckCircleIcon className="mx-auto h-14 w-14 text-success" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-bold text-primary">{t("thank_you", "Thank you!")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("donation_received", "Your donation was received.")}</p>
            </div>
            <dl className="divide-y divide-border rounded-xl border border-border text-left text-sm">
              {[
                [t("amount", "Amount"), formatEtb(receipt.amount)],
                [t("donor", "Donor"), receipt.donor_name],
                [t("date", "Date"), new Date(receipt.date).toLocaleString()],
                [t("transaction_ref", "Transaction ref"), receipt.tx_ref],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="break-all text-right font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center print:hidden">
              <button type="button" onClick={() => window.print()} className="btn-outline">
                <PrinterIcon className="h-5 w-5" aria-hidden="true" />
                {t("print_receipt", "Print receipt")}
              </button>
              <Link to={backTo} className="btn-secondary">
                {user ? t("back_to_donations", "Back to donations") : t("back_to_home", "Back to home")}
              </Link>
            </div>
          </div>
        )}

        {phase === "pending" && (
          <div className="space-y-4">
            <ClockIcon className="mx-auto h-14 w-14 text-warning" aria-hidden="true" />
            <h1 className="text-xl font-bold text-foreground">{t("payment_processing", "Payment still processing")}</h1>
            <p className="text-sm text-muted-foreground">
              {t(
                "payment_still_pending",
                "Chapa hasn't confirmed this payment yet. You'll get an email once it completes — no need to pay again.",
              )}
            </p>
            <Link to={backTo} className="btn-secondary">
              {t("continue", "Continue")}
            </Link>
          </div>
        )}

        {phase === "failed" && (
          <div className="space-y-4">
            <XCircleIcon className="mx-auto h-14 w-14 text-destructive" aria-hidden="true" />
            <h1 className="text-xl font-bold text-foreground">{t("payment_failed", "Payment not completed")}</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Link to={user ? "/dashboard/donations/give" : "/donate"} className="btn-primary">
              {t("try_again", "Try again")}
            </Link>
          </div>
        )}

        {phase === "missing" && (
          <div className="space-y-4">
            <XCircleIcon className="mx-auto h-14 w-14 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{t("missing_tx_ref", "No transaction reference was provided.")}</p>
            <Link to={backTo} className="btn-secondary">
              {t("continue", "Continue")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
