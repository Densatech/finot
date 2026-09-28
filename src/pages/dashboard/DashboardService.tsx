import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BriefcaseIcon, CheckBadgeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useMySelections, useSelectionWindow, useServiceGroups } from "@/hooks/queries";
import { Card, SectionHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import QueryState from "@/components/ui/QueryState";
import { groupImage, groupLabelKey } from "@/features/service/groupMeta";

export default function DashboardService() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const groups = useServiceGroups();
  const selections = useMySelections();
  const windowQuery = useSelectionWindow();
  const selectionOpen = windowQuery.data === true;
  const priorityByGroup = new Map((selections.data ?? []).map((s) => [s.service_group, s.priority]));
  const membership = user?.membership;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("service_groups", "Service groups")}
        description={t("ministry_opportunities")}
        action={
          selectionOpen ? (
            <Link to="/dashboard/service/select" className="btn-primary">
              {selections.data?.length ? t("update_preferences", "Update preferences") : t("select_preferences", "Choose your top 3")}
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-center gap-4">
          <CheckBadgeIcon className="h-8 w-8 flex-shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm text-muted-foreground">{t("assigned_group", "Your service group")}</p>
            <p className="font-semibold text-foreground">
              {membership ? membership.service_group_name : t("not_assigned", "Not assigned yet")}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <LockClosedIcon className={`h-8 w-8 flex-shrink-0 ${selectionOpen ? "text-success" : "text-muted-foreground"}`} aria-hidden="true" />
          <div>
            <p className="text-sm text-muted-foreground">{t("selection_window", "Ministry selection")}</p>
            <p className="font-semibold text-foreground">
              {windowQuery.isLoading
                ? "…"
                : selectionOpen
                  ? t("selection_open", "Open — rank your top 3 choices")
                  : t("selection_closed", "Closed")}
            </p>
          </div>
        </Card>
      </div>

      {!!selections.data?.length && (
        <Card>
          <h2 className="section-title mb-3">{t("my_selected_groups", "My choices")}</h2>
          <ol className="space-y-2">
            {[...selections.data]
              .sort((a, b) => a.priority - b.priority)
              .map((s) => (
                <li key={s.id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{s.priority}</span>
                  <span className="font-medium text-foreground">
                    {s.service_group_name && (groupLabelKey(s.service_group_name) ? t(groupLabelKey(s.service_group_name)!) : s.service_group_name)}
                  </span>
                </li>
              ))}
          </ol>
        </Card>
      )}

      <QueryState
        isLoading={groups.isLoading}
        error={groups.error}
        onRetry={groups.refetch}
        isEmpty={!groups.data?.length}
        empty={<Card><EmptyState icon={<BriefcaseIcon className="h-8 w-8" />} title={t("no_service_groups", "No service groups yet")} description="" /></Card>}
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.data?.map((group) => {
            const key = groupLabelKey(group.name);
            const priority = priorityByGroup.get(group.id);
            return (
              <li key={group.id}>
                <Link to={`/dashboard/service/${group.id}`} className="block h-full">
                  <Card padding="none" hoverable className="flex h-full flex-col overflow-hidden">
                    <img src={groupImage(group.name)} alt="" className="h-36 w-full object-cover" loading="lazy" decoding="async" />
                    <div className="flex flex-1 flex-col gap-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-semibold text-primary">{key ? t(key) : group.name}</h2>
                        {priority && (
                          <span className="whitespace-nowrap rounded-full bg-accent/30 px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                            {t("priority", "Choice")} {priority}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {group.description || t("no_description_available", "No description yet.")}
                      </p>
                      {group.admin_name && (
                        <p className="mt-auto pt-1 text-xs text-muted-foreground">
                          {t("admin", "Admin")}: {group.admin_name}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </QueryState>
    </div>
  );
}
