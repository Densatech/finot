import { useTranslation } from "react-i18next";
import { ArrowTopRightOnSquareIcon, DocumentIcon, LinkIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { Material, MaterialType } from "@/types";

const TYPE_STYLES: Record<MaterialType, string> = {
  COURSE: "bg-primary/10 text-primary",
  SERVICE: "bg-accent/25 text-accent-foreground",
  GENERAL: "bg-muted text-muted-foreground",
};

function uploaderName(m: Material) {
  const u = m.uploaded_by_details;
  if (!u) return null;
  return [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;
}

interface MaterialListProps {
  materials: Material[];
  onDelete?: (material: Material) => void;
  canDelete?: (material: Material) => boolean;
}

export default function MaterialList({ materials, onDelete, canDelete }: MaterialListProps) {
  const { t } = useTranslation();
  const typeLabel: Record<MaterialType, string> = {
    COURSE: t("course", "Course"),
    SERVICE: t("service_group", "Service group"),
    GENERAL: t("general", "General"),
  };

  return (
    <ul className="divide-y divide-border">
      {materials.map((m) => {
        const href = m.file || m.url;
        const scope = m.course_title || m.service_group_name;
        return (
          <li key={m.id} className="flex items-start gap-3 py-4">
            <span className="rounded-xl bg-muted p-2.5 text-primary">
              {m.file ? <DocumentIcon className="h-5 w-5" aria-hidden="true" /> : <LinkIcon className="h-5 w-5" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{m.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_STYLES[m.material_type]}`}>
                  {typeLabel[m.material_type]}
                  {scope ? ` · ${scope}` : ""}
                </span>
              </div>
              {m.description && <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {uploaderName(m) && `${t("uploaded_by", "Uploaded by")} ${uploaderName(m)} · `}
                {new Date(m.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
                >
                  {m.file ? t("download", "Open") : t("view", "View")}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {onDelete && (!canDelete || canDelete(m)) && (
                <button
                  type="button"
                  onClick={() => onDelete(m)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`${t("delete", "Delete")} ${m.title}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
