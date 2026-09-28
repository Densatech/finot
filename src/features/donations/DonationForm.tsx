import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { donationApi } from "@/lib/api";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { FUND_CATEGORIES, type FundCategory } from "@/types";
import { SelectField, TextField } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { FUND_LABEL_KEYS, MIN_DONATION_ETB } from "./fund";

const QUICK_AMOUNTS = [50, 100, 200, 500];

/**
 * Starts a Chapa checkout. Guests must give a name and email; signed-in members are
 * identified by their account on the backend.
 */
export default function DonationForm({ guest }: { guest: boolean }) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [fund, setFund] = useState<FundCategory | "">("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    const required = t("field_required", "This field is required.");
    if (guest) {
      if (!firstName.trim()) next.first_name = required;
      if (!lastName.trim()) next.last_name = required;
      if (!email.trim()) next.email = required;
    }
    if (!fund) next.fund_category = required;
    const value = Number(amount);
    if (!amount || !Number.isFinite(value) || value < MIN_DONATION_ETB) {
      next.amount = t("min_amount", "Enter an amount of at least {{min}} ETB.", { min: MIN_DONATION_ETB });
    }
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      const { checkout_url } = await donationApi.initiate({
        amount: Math.round(Number(amount) * 100) / 100,
        fund_category: fund as FundCategory,
        ...(guest ? { first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim() } : {}),
      });
      window.location.assign(checkout_url);
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length && !fields.non_field_errors) setErrors(fields);
      else setFormError(fields.non_field_errors ?? getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}
      {guest && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label={t("first_name_label", "First name")} required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.first_name} />
            <TextField label={t("last_name_label", "Last name")} required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.last_name} />
          </div>
          <TextField
            label={t("email", "Email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            hint={t("receipt_email_hint", "Your receipt is sent here.")}
          />
        </>
      )}
      <SelectField label={t("purpose", "Purpose")} required value={fund} onChange={(e) => setFund(e.target.value as FundCategory)} error={errors.fund_category}>
        <option value="">{t("select_purpose", "Select a purpose")}</option>
        {FUND_CATEGORIES.map((code) => (
          <option key={code} value={code}>
            {t(FUND_LABEL_KEYS[code], code)}
          </option>
        ))}
      </SelectField>
      <div>
        <TextField
          label={t("amount_etb", "Amount (ETB)")}
          type="number"
          inputMode="decimal"
          min={MIN_DONATION_ETB}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(String(value))}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                Number(amount) === value ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {value} ETB
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full" loading={submitting}>
        {submitting ? t("redirecting_to_chapa", "Redirecting to Chapa…") : t("donate_with_chapa", "Donate with Chapa")}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <LockClosedIcon className="h-4 w-4" aria-hidden="true" />
        {t("chapa_redirect", "You'll complete payment securely on Chapa.")}
      </p>
    </form>
  );
}
