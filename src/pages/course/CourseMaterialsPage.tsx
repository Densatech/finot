import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useSemesterCourse } from "@/hooks/queries";
import QueryState from "@/components/ui/QueryState";
import MaterialsManager from "@/pages/admin/components/MaterialsManager";

/** Materials attach to the curriculum (Course), so every semester offering shares them. */
export default function CourseMaterialsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: course, isLoading, error, refetch } = useSemesterCourse(id);

  return (
    <div className="space-y-5">
      <Link to="/dashboard/courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {t("back_to_courses", "Back to courses")}
      </Link>
      <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
        {course && (
          <MaterialsManager
            materialType="COURSE"
            courseId={course.course_details.id}
            title={course.course_details.title}
            subtitle={t("course_materials_description")}
          />
        )}
      </QueryState>
    </div>
  );
}
