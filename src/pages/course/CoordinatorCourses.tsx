import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AcademicCapIcon, ClipboardDocumentListIcon, FolderIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSemesterCourses } from "@/hooks/queries";
import { Card, SectionHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar from "@/components/ui/FilterBar";
import QueryState from "@/components/ui/QueryState";
import type { UserSummary } from "@/types";

const personName = (u: UserSummary) => [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;

/** Semester courses the signed-in coordinator is assigned to (SuperAdmins see all). */
export default function CoordinatorCourses() {
  const { t } = useTranslation();
  const [batch, setBatch] = useState<number | undefined>(undefined);
  const { data = [], isLoading, error, refetch } = useSemesterCourses(batch);

  return (
    <div className="space-y-6">
      <SectionHeader title={t("course_management", "My courses")} description={t("coordinator_courses_description")} />
      <FilterBar
        label={t("filter_by_batch", "Batch")}
        value={batch ? String(batch) : "all"}
        onChange={(v) => setBatch(v === "all" ? undefined : Number(v))}
        options={[
          { value: "all", label: t("all_batches", "All batches") },
          ...[1, 2, 3, 4, 5].map((b) => ({ value: String(b), label: `${t("batch", "Batch")} ${b}` })),
        ]}
      />
      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={data.length === 0}
        empty={
          <Card>
            <EmptyState
              icon={<AcademicCapIcon className="h-8 w-8" />}
              title={t("no_courses_assigned", "No courses assigned")}
              description={t("no_courses_assigned_hint", "Ask a super admin to add you as a coordinator of a semester course.")}
            />
          </Card>
        }
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {data.map((sc) => (
            <li key={sc.id}>
              <Card className="flex h-full flex-col gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-primary">{sc.course_details.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("batch", "Batch")} {sc.batch_year} · {sc.academic_year} · {t("semester", "Semester")} {sc.semester}
                  </p>
                  {sc.coordinators_details.length > 0 && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <UserGroupIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("coordinators", "Coordinators")}: {sc.coordinators_details.map(personName).join(", ")}
                    </p>
                  )}
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Link to={`/dashboard/courses/${sc.id}/attendance`} className="btn-secondary">
                    <ClipboardDocumentListIcon className="h-4 w-4" aria-hidden="true" />
                    {t("take_attendance", "Sessions & attendance")}
                  </Link>
                  <Link to={`/dashboard/courses/${sc.id}/materials`} className="btn-outline">
                    <FolderIcon className="h-4 w-4" aria-hidden="true" />
                    {t("materials", "Materials")}
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}
