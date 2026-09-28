import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useMySelections, useSelectionWindow, useServiceGroups } from "@/hooks/queries";
import { serviceApi } from "@/lib/api";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { qk } from "@/lib/queryClient";
import { Card, SectionHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import { ErrorState } from "@/components/ui/QueryState";
import { SelectField, TextAreaField } from "@/components/ui/Field";
import { groupLabelKey } from "@/features/service/groupMeta";
import type { ServiceSelection } from "@/types";

type Choice = { service_group: string; skills: string; reason: string };
const EMPTY: Choice = { service_group: "", skills: "", reason: "" };

export default function PreferenceForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const groups = useServiceGroups();
  const selections = useMySelections();
  const windowQuery = useSelectionWindow();

  const [choices, setChoices] = useState<Choice[]>([EMPTY, EMPTY, EMPTY]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Prefill from existing selections (or a group chosen on its detail page) once loaded.
  useEffect(() => {
    if (initialized || selections.isLoading) return;
    const existing = [...(selections.data ?? [])].sort((a, b) => a.priority - b.priority);
    if (existing.length === 3) {
      setChoices(existing.map((s) => ({ service_group: String(s.service_group), skills: s.skills ?? "", reason: s.reason ?? "" })));
    } else {
      const preselect = (location.state as { preselect?: number } | null)?.preselect;
      if (preselect) setChoices([{ ...EMPTY, service_group: String(preselect) }, EMPTY, EMPTY]);
    }
    setInitialized(true);
  }, [initialized, selections.isLoading, selections.data, location.state]);

  if (groups.isLoading || selections.isLoading || windowQuery.isLoading) return <PageLoader />;
  if (groups.error || windowQuery.error) {
    return <ErrorState error={groups.error || windowQuery.error} onRetry={() => { groups.refetch(); windowQuery.refetch(); }} />;
  }

  const update = (index: number, patch: Partial<Choice>) =>
    setChoices((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const ids = choices.map((c) => c.service_group);
    if (ids.some((id) => !id)) {
      setError(t("missing_choices", "Choose a group for all three ranks."));
      return;
    }
    if (new Set(ids).size !== 3) {
      setError(t("all_choices_different", "Each choice must be a different group."));
      return;
    }
    setSubmitting(true);
    try {
      // One request: the backend replaces any previous choices atomically.
      const payload: ServiceSelection[] = choices.map((c, i) => ({
        service_group: Number(c.service_group),
        priority: (i + 1) as 1 | 2 | 3,
        skills: c.skills.trim(),
        reason: c.reason.trim(),
      }));
      await serviceApi.submitSelections(payload);
      await queryClient.invalidateQueries({ queryKey: qk.mySelections });
      toast.success(t("changes_saved", "Your choices were saved."));
      navigate("/dashboard/service");
    } catch (err) {
      const fields = getFieldErrors(err);
      setError(fields.selections ?? fields.non_field_errors ?? getErrorMessage(err));
      if (!Object.keys(fields).length) windowQuery.refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const open = windowQuery.data === true;
  const label = (name: string) => (groupLabelKey(name) ? t(groupLabelKey(name)!) : name);
  const ranks = [t("first_choice", "1st choice"), t("second_choice", "2nd choice"), t("third_choice", "3rd choice")];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/dashboard/service" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {t("back_to_services", "Back to service groups")}
      </Link>
      <SectionHeader
        title={t("select_preferences", "Choose your top 3 ministries")}
        description={t("rank_choices", "Rank three different groups. Administrators make the final placement.")}
      />

      {!open ? (
        <Card className="flex items-start gap-3">
          <LockClosedIcon className="h-6 w-6 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-semibold text-foreground">{t("selection_closed", "Selection is closed")}</p>
            <p className="text-sm text-muted-foreground">{t("selection_closed_msg", "The ministry selection window isn't open right now. Please check back later.")}</p>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {choices.map((choice, i) => (
            <Card key={i} className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold text-primary">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">{i + 1}</span>
                {ranks[i]}
              </h2>
              <SelectField label={t("select_group", "Service group")} required value={choice.service_group} onChange={(e) => update(i, { service_group: e.target.value })}>
                <option value="">{t("select_group", "Select a group")}</option>
                {groups.data?.map((g) => (
                  <option key={g.id} value={g.id} disabled={choices.some((c, j) => j !== i && c.service_group === String(g.id))}>
                    {label(g.name)}
                  </option>
                ))}
              </SelectField>
              <TextAreaField label={t("skills_talents", "Skills and talents")} rows={2} placeholder={t("eg_skills", "e.g. singing, design, teaching")} value={choice.skills} onChange={(e) => update(i, { skills: e.target.value })} />
              <TextAreaField label={t("reason_choices", "Why this group?")} rows={2} placeholder={t("tell_us_why", "Tell us why")} value={choice.reason} onChange={(e) => update(i, { reason: e.target.value })} />
            </Card>
          ))}
          <div className="flex justify-end">
            <Button type="submit" loading={submitting}>
              {selections.data?.length ? t("update_preferences", "Update choices") : t("submit_preferences", "Submit choices")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
