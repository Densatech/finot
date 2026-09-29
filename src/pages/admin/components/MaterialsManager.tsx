import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FolderIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMaterials } from "@/hooks/queries";
import { materialApi } from "@/lib/api";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import type { Material, MaterialType } from "@/types";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import QueryState from "@/components/ui/QueryState";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { TextAreaField, TextField } from "@/components/ui/Field";
import MaterialList from "@/features/materials/MaterialList";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4";

interface MaterialsManagerProps {
  materialType: MaterialType;
  /** Curriculum (Course) id — required for COURSE materials */
  courseId?: string;
  /** Required for SERVICE materials */
  serviceGroupId?: number;
  title: string;
  subtitle?: string;
}

export default function MaterialsManager({ materialType, courseId, serviceGroupId, title, subtitle }: MaterialsManagerProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const params = {
    type: materialType,
    ...(materialType === "COURSE" && courseId ? { course: courseId } : {}),
    ...(materialType === "SERVICE" && serviceGroupId ? { service_group: serviceGroupId } : {}),
  };
  const { data = [], isLoading, error, refetch } = useMaterials(params);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"file" | "link">("file");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setFile(null);
    setUrl("");
    setErrors({});
    setMode("file");
  };

  const upload = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.title = t("title_required", "Title is required.");
    if (mode === "file" && !file) next.file = t("file_required", "Choose a file.");
    if (mode === "file" && file && file.size > MAX_FILE_BYTES) next.file = t("file_too_large", "Files must be 50MB or smaller.");
    if (mode === "link" && !url.trim()) next.url = t("link_required", "Enter a link.");
    setErrors(next);
    if (Object.keys(next).length) return;

    const data = new FormData();
    data.append("title", name.trim());
    data.append("description", description.trim());
    data.append("material_type", materialType);
    if (materialType === "COURSE" && courseId) data.append("course", courseId);
    if (materialType === "SERVICE" && serviceGroupId) data.append("service_group", String(serviceGroupId));
    if (mode === "file" && file) data.append("file", file);
    if (mode === "link") data.append("url", url.trim());

    setSaving(true);
    try {
      await materialApi.create(data);
      await queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success(t("material_uploaded_success", "Material uploaded."));
      setOpen(false);
      reset();
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setErrors(fields);
      else toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m: Material) => {
    const ok = await confirm({ title: t("delete", "Delete"), message: t("confirm_delete_material", "Delete this material?"), confirmText: t("delete", "Delete"), danger: true });
    if (!ok) return;
    try {
      await materialApi.remove(m.id);
      await queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success(t("material_deleted_success", "Material deleted."));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="section-title mb-3">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          {t("upload_material", "Add material")}
        </Button>
      </div>

      <Card>
        <QueryState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={data.length === 0}
          empty={<EmptyState icon={<FolderIcon className="h-8 w-8" />} title={t("no_materials_yet", "No materials yet")} description={t("upload_first_material", "Upload the first one.")} />}
        >
          <MaterialList materials={data} onDelete={remove} />
        </QueryState>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={t("upload_new_material", "Add material")}>
        <form id="material-form" onSubmit={upload} className="space-y-4" noValidate>
          <div role="radiogroup" aria-label={t("upload_type", "Type")} className="grid grid-cols-2 gap-2">
            {(["file", "link"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium ${mode === m ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:bg-muted"}`}
              >
                {m === "file" ? t("upload_file", "Upload a file") : t("external_link", "External link")}
              </button>
            ))}
          </div>
          <TextField label={t("title", "Title")} required value={name} onChange={(e) => setName(e.target.value)} error={errors.title} />
          <TextAreaField label={t("description", "Description")} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} />
          {mode === "file" ? (
            <TextField
              key="file"
              label={t("file", "File")}
              type="file"
              accept={ACCEPT}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              error={errors.file}
              hint={t("supported_files", "PDF, Office, text, images or MP4 — up to 50MB.")}
            />
          ) : (
            <TextField key="link" label={t("link_url", "Link")} type="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} error={errors.url} />
          )}
          {errors.non_field_errors && <p className="text-sm text-destructive">{errors.non_field_errors}</p>}
        </form>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("cancel", "Cancel")}
          </Button>
          <Button type="submit" form="material-form" loading={saving}>
            {saving ? t("uploading", "Uploading…") : t("upload", "Upload")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
