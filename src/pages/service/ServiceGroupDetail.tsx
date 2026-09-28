import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useSelectionWindow, useServiceGroup } from "@/hooks/queries";
import { Card } from "@/components/ui/Card";
import QueryState from "@/components/ui/QueryState";
import { groupImage, groupLabelKey } from "@/features/service/groupMeta";

export default function ServiceGroupDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: group, isLoading, error, refetch } = useServiceGroup(id);
  const { data: selectionOpen } = useSelectionWindow();

  return (
    <div className="space-y-5">
      <Link to="/dashboard/service" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {t("back_to_services", "Back to service groups")}
      </Link>
      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        {group && (
          <Card padding="none" className="overflow-hidden">
            <img src={groupImage(group.name)} alt="" className="h-56 w-full object-cover md:h-72" decoding="async" />
            <div className="space-y-3 p-6">
              <h1 className="text-2xl font-bold text-primary">
                {groupLabelKey(group.name) ? t(groupLabelKey(group.name)!) : group.name}
              </h1>
              <span className="block h-1 w-10 rounded-full bg-accent" aria-hidden="true" />
              {group.admin_name && (
                <p className="text-sm text-muted-foreground">
                  {t("admin", "Admin")}: <span className="font-medium text-foreground">{group.admin_name}</span>
                </p>
              )}
              <p className="whitespace-pre-line leading-relaxed text-foreground/85">
                {group.description || t("learn_more_group", "More details about this group are coming soon.")}
              </p>
              {selectionOpen && (
                <Link to="/dashboard/service/select" state={{ preselect: group.id }} className="btn-primary">
                  {t("select_this_group", "Choose this group")}
                </Link>
              )}
            </div>
          </Card>
        )}
      </QueryState>
    </div>
  );
}
