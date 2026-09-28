import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { qaApi } from "@/lib/api";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { QA_CATEGORIES, type QACategory } from "@/types";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/Card";
import PublicHero from "@/components/navigation/PublicHero";

type Visibility = "PUBLIC" | "PRIVATE";

export default function AskQuestion() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const backRoute = isDashboard ? "/dashboard/questions" : "/anonymous/questions";

  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState<QACategory | "">("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const required = t("required_field", "This field is required.");
    if (!category) next.category = required;
    if (!body.trim()) next.question_body = required;
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await qaApi.ask({
        display_name: nickname.trim() || t("anonymous", "Anonymous"),
        category: category as QACategory,
        question_body: body.trim(),
        visibility,
      });
      await queryClient.invalidateQueries({ queryKey: ["qa"] });
      toast.success(
        visibility === "PUBLIC"
          ? t("question_posted_text", "Question submitted. It will appear after a moderator approves it.")
          : t("private_question_posted_text", "Your private question was sent to a counselor."),
      );
      navigate(visibility === "PRIVATE" ? "/dashboard/questions?tab=private" : backRoute);
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setErrors(fields);
      else toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const options: { id: Visibility; label: string; description: string }[] = [
    { id: "PUBLIC", label: t("public", "Public"), description: t("public_q_desc", "Shared with the community after moderation.") },
    { id: "PRIVATE", label: t("private", "Private"), description: t("private_q_desc", "Only a counselor can read it. Requires signing in.") },
  ];

  return (
    <div className={isDashboard ? "" : "bg-background"}>
      {!isDashboard && <PublicHero title={t("ask_question", "Ask a question")} subtitle={t("identity_anonymous", "Your identity is never shown publicly.")} />}
      <div className={`mx-auto max-w-xl space-y-5 ${isDashboard ? "" : "px-4 py-10"}`}>
        <Link to={backRoute} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          {t("back_to_questions", "Back to questions")}
        </Link>
        {isDashboard && (
          <SectionHeader title={t("ask_question", "Ask a question")} description={t("identity_anonymous", "Your identity is never shown publicly.")} />
        )}
        <div className="card shadow-card">

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-foreground">{t("question_type", "Question type")}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`cursor-pointer rounded-xl border p-3 text-sm ${
                      visibility === opt.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.id}
                      checked={visibility === opt.id}
                      onChange={() => setVisibility(opt.id)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      {opt.id === "PRIVATE" && <LockClosedIcon className="h-4 w-4" aria-hidden="true" />}
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{opt.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {visibility === "PRIVATE" && !user ? (
              <div className="rounded-xl border border-accent/60 bg-accent/15 p-4 text-sm text-foreground">
                {t("private_requires_login", "Private questions go straight to a counselor, so you need to sign in first.")}{" "}
                <Link to="/login" state={{ from: "/dashboard/questions/ask" }} className="font-semibold text-primary hover:underline">
                  {t("sign_in")}
                </Link>
              </div>
            ) : (
              <>
                <TextField
                  label={t("nickname_optional", "Nickname (optional)")}
                  value={nickname}
                  maxLength={100}
                  onChange={(e) => setNickname(e.target.value)}
                  error={errors.display_name}
                  hint={t("nickname_hint", "Leave empty to post as Anonymous.")}
                />
                <SelectField
                  label={t("category", "Category")}
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QACategory)}
                  error={errors.category}
                >
                  <option value="">{t("choose_category", "Choose a category")}</option>
                  {QA_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`cat_${c.toLowerCase()}`, c)}
                    </option>
                  ))}
                </SelectField>
                <TextAreaField
                  label={t("your_question", "Your question")}
                  required
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  error={errors.question_body}
                />
                <Button type="submit" className="w-full" loading={submitting}>
                  {t("submit_question", "Submit question")}
                </Button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
