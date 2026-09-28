import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/ui/Card";
import GroupEventsManager from "./components/GroupEventsManager";

export default function EventManagement() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("manage_global_events", "Event management")}
        description={t("manage_global_events_description")}
      />
      <GroupEventsManager eventType="global" />
    </div>
  );
}
