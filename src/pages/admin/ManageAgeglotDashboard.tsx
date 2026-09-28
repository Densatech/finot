import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDaysIcon, FolderIcon, UserGroupIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useManagedGroup } from "@/hooks/queries";
import { Card, SectionHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import QueryState from "@/components/ui/QueryState";
import GroupEventsManager from "./components/GroupEventsManager";
import GroupAttendanceManager from "./components/GroupAttendanceManager";
import MaterialsManager from "./components/MaterialsManager";

type Tab = "events" | "attendance" | "materials";

export default function ManageAgeglotDashboard() {
  const { t } = useTranslation();
  const { data: group, isLoading, error, refetch } = useManagedGroup();
  const [tab, setTab] = useState<Tab>("events");

  const tabs: { id: Tab; label: string; icon: typeof CalendarDaysIcon }[] = [
    { id: "events", label: t("events", "Events"), icon: CalendarDaysIcon },
    { id: "attendance", label: t("attendance", "Attendance"), icon: UsersIcon },
    { id: "materials", label: t("materials", "Materials"), icon: FolderIcon },
  ];

  return (
    <QueryState
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={!group}
      empty={
        <Card>
          <EmptyState
            icon={<UserGroupIcon className="h-8 w-8" />}
            title={t("no_group_assigned", "No group assigned")}
            description={t("no_group_assigned_msg", "Ask a super admin to make you the admin of a service group.")}
          />
        </Card>
      }
    >
      {group && (
        <div className="space-y-6">
          <SectionHeader title={t("manage_group", { name: group.name, defaultValue: `Manage ${group.name}` })} description={group.description ?? undefined} />
          <div role="tablist" className="tabs">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                role="tab"
                type="button"
                aria-selected={tab === tb.id}
                onClick={() => setTab(tb.id)}
                className="tab inline-flex items-center gap-2"
              >
                <tb.icon className="h-4 w-4" aria-hidden="true" />
                {tb.label}
              </button>
            ))}
          </div>
          {tab === "events" && <GroupEventsManager eventType="group" groupId={group.id} />}
          {tab === "attendance" && <GroupAttendanceManager groupId={group.id} />}
          {tab === "materials" && (
            <MaterialsManager
              materialType="SERVICE"
              serviceGroupId={group.id}
              title={t("group_materials", "Group materials")}
              subtitle={t("group_materials_description")}
            />
          )}
        </div>
      )}
    </QueryState>
  );
}
