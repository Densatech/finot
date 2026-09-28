import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { authApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import AuthCard from "@/features/auth/components/AuthCard";
import { TextField } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError(t("enter_email_error", "Please enter your email address."));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t("reset_password", "Reset password")}
      subtitle={!sent && t("reset_password_desc", "Enter your email and we'll send you a reset link.")}
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          {t("back_to_login", "Back to sign in")}
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <EnvelopeIcon className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
          <p className="text-sm text-foreground">
            {t(
              "reset_link_sent_desc",
              "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.",
            )}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button variant="outline" className="w-full" loading={submitting} onClick={() => send()}>
            {t("resend_email_q", "Resend email")}
          </Button>
        </div>
      ) : (
        <form onSubmit={send} className="space-y-4" noValidate>
          <TextField
            label={t("email_address", "Email address")}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ?? undefined}
          />
          <Button type="submit" className="w-full" loading={submitting}>
            {submitting ? t("sending", "Sending…") : t("send_reset_link", "Send reset link")}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
