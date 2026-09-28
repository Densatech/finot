import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderIcon } from "@heroicons/react/24/outline";
import { useMaterials } from "@/hooks/queries";
import { Card, SectionHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar from "@/components/ui/FilterBar";
import QueryState from "@/components/ui/QueryState";
import MaterialList from "@/features/materials/MaterialList";
import type { MaterialType } from "@/types";

export default function ResourcesList() {
  const { t } = useTranslation();
  const [type, setType] = useState<"ALL" | MaterialType>("ALL");
  const { data = [], isLoading, error, refetch } = useMaterials(type === "ALL" ? {} : { type });

  return (
    <div className="space-y-6">
      <SectionHeader title={t("resources", "Resources")} description={t("resources_description_auto")} />
      <FilterBar
        value={type}
        onChange={(v) => setType(v as "ALL" | MaterialType)}
        options={[
          { value: "ALL", label: t("all_materials", "All") },
          { value: "COURSE", label: t("course", "Course") },
          { value: "SERVICE", label: t("service_group", "Service group") },
          { value: "GENERAL", label: t("general", "General") },
        ]}
      />
      <Card>
        <QueryState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={data.length === 0}
          empty={<EmptyState icon={<FolderIcon className="h-8 w-8" />} title={t("no_resources_found", "No resources yet")} description={t("resources_will_appear_here", "Materials shared with you will appear here.")} />}
        >
          <MaterialList materials={data} />
        </QueryState>
      </Card>
    </div>
  );
}
