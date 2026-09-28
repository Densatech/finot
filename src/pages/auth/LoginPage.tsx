import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import AuthCard from "@/features/auth/components/AuthCard";
import PasswordInput from "@/features/auth/components/PasswordInput";
import { TextField } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 401
          ? t("incorrect_credentials", "Incorrect email or password.")
          : getErrorMessage(err),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t("welcome_back_simple", "Welcome back")}
      subtitle={t("sign_in_to_account", "Sign in to your account")}
      footer={
        <>
          {t("no_account", "Don't have an account?")}{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            {t("sign_up")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <TextField
          label={t("email_address", "Email address")}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label={t("password", "Password")}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            {t("forgot_password_q", "Forgot password?")}
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={submitting} disabled={!email || !password}>
          {submitting ? t("signing_in", "Signing in…") : t("sign_in")}
        </Button>
      </form>
    </AuthCard>
  );
}
