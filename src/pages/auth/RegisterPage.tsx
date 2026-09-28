import { useRef, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import AuthCard from "@/features/auth/components/AuthCard";
import PasswordInput from "@/features/auth/components/PasswordInput";
import { SelectField, TextField } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

type FormState = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  gender: "" | "M" | "F";
  password: string;
  confirm: string;
};

const EMPTY: FormState = { first_name: "", middle_name: "", last_name: "", email: "", gender: "", password: "", confirm: "" };

export default function RegisterPage() {
  const { t } = useTranslation();
  const { user, register } = useAuth();
  // Set once registration succeeds so the redirect below sends new members to onboarding.
  const justRegistered = useRef(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={justRegistered.current ? "/dashboard/profile/edit" : "/dashboard"} replace />;

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next: Record<string, string> = {};
    const required = t("required_field", "This field is required.");
    (["first_name", "middle_name", "last_name", "email", "gender", "password"] as const).forEach((k) => {
      if (!form[k].trim()) next[k] = required;
    });
    if (form.password && form.password.length < 8) next.password = t("weak_password_text", "Use at least 8 characters.");
    if (form.password && /^\d+$/.test(form.password)) next.password = t("password_numeric", "The password can't be only numbers.");
    if (form.confirm !== form.password) next.confirm = t("passwords_dont_match", "Passwords don't match.");
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    justRegistered.current = true;
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim(),
        last_name: form.last_name.trim(),
        gender: form.gender as "M" | "F",
      });
      toast.success(t("account_created", "Account created. Welcome to Finot!"));
    } catch (err) {
      justRegistered.current = false;
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        if (fieldErrors.non_field_errors) setFormError(fieldErrors.non_field_errors);
      } else {
        setFormError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t("join_finot", "Join Finot")}
      subtitle={t("create_account_to_start", "Create your account to get started")}
      footer={
        <>
          {t("already_have_account", "Already have an account?")}{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t("sign_in")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField label={t("first_name_label", "First name")} required autoComplete="given-name" value={form.first_name} onChange={set("first_name")} error={errors.first_name} />
          <TextField label={t("middle_name_label", "Middle name")} required autoComplete="additional-name" value={form.middle_name} onChange={set("middle_name")} error={errors.middle_name} />
          <TextField label={t("last_name_label", "Last name")} required autoComplete="family-name" value={form.last_name} onChange={set("last_name")} error={errors.last_name} />
        </div>
        <TextField label={t("email_address", "Email address")} type="email" inputMode="email" autoComplete="email" required value={form.email} onChange={set("email")} error={errors.email} />
        <SelectField label={t("gender_label", "Gender")} required value={form.gender} onChange={set("gender")} error={errors.gender}>
          <option value="">{t("select_gender", "Select gender")}</option>
          <option value="M">{t("male", "Male")}</option>
          <option value="F">{t("female", "Female")}</option>
        </SelectField>
        <PasswordInput
          label={t("password", "Password")}
          autoComplete="new-password"
          required
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint={t("password_hint", "At least 8 characters; avoid common or all-number passwords.")}
        />
        <PasswordInput label={t("confirm_password", "Confirm password")} autoComplete="new-password" required value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
        <Button type="submit" className="w-full" loading={submitting}>
          {submitting ? t("creating_account", "Creating account…") : t("create_account", "Create account")}
        </Button>
      </form>
    </AuthCard>
  );
}
