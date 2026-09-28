import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import AuthCard from "@/features/auth/components/AuthCard";
import PasswordInput from "@/features/auth/components/PasswordInput";
import Button from "@/components/ui/Button";

export default function ResetPasswordConfirmPage() {
  const { t } = useTranslation();
  const { uid = "", token = "" } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const next: Record<string, string> = {};
    if (password.length < 8) next.new_password = t("weak_password_text", "Use at least 8 characters.");
    if (confirm !== password) next.confirm = t("passwords_dont_match", "Passwords don't match.");
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await authApi.confirmPasswordReset(uid, token, password);
      toast.success(t("password_reset_success", "Password changed. You can sign in now."));
      navigate("/login", { replace: true });
    } catch (err) {
      const fields = getFieldErrors(err);
      if (fields.token || fields.uid) {
        setFormError(t("reset_link_invalid", "This reset link is invalid or has expired. Request a new one."));
      } else if (Object.keys(fields).length) {
        setErrors(fields);
      } else {
        setFormError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t("set_new_password", "Choose a new password")}
      footer={
        <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
          {t("request_new_link", "Request a new link")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <PasswordInput
          label={t("new_password", "New password")}
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.new_password}
          hint={t("password_hint", "At least 8 characters; avoid common or all-number passwords.")}
        />
        <PasswordInput
          label={t("confirm_password", "Confirm password")}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm || errors.re_new_password}
        />
        <Button type="submit" className="w-full" loading={submitting}>
          {t("reset_password", "Reset password")}
        </Button>
      </form>
    </AuthCard>
  );
}
