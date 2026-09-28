import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeftIcon, CameraIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { profileApi } from "@/lib/api";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { qk } from "@/lib/queryClient";
import { Card, SectionHeader } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import type { StudentProfile } from "@/types";

// Fields a student may edit (identity and status are managed by the fellowship).
const TEXT_FIELDS = [
  "department",
  "telegram_username",
  "personal_phone",
  "emergency_name",
  "emergency_phone",
  "emergency_relation",
  "home_address",
  "previous_church",
  "activity_serving",
  "confession_father",
] as const;
const NUMBER_FIELDS = ["batch_year", "dorm_block", "dorm_room", "section"] as const;
type FormKey = (typeof TEXT_FIELDS)[number] | (typeof NUMBER_FIELDS)[number];
type FormState = Record<FormKey, string>;

function toForm(p: StudentProfile | null): FormState {
  const out = {} as FormState;
  [...TEXT_FIELDS, ...NUMBER_FIELDS].forEach((k) => {
    const v = p?.[k];
    out[k] = v === null || v === undefined ? "" : String(v);
  });
  return out;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function EditProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = user?.profile ?? null;

  const [form, setForm] = useState<FormState>(() => toForm(profile));
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const set = (key: FormKey) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickImage = (file: File | undefined) => {
    if (!file) return;
    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setErrors((e) => ({ ...e, profile_image: t("image_type_error", "Use a JPG, PNG or WEBP image.") }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((e) => ({ ...e, profile_image: t("image_size_error", "The image must be 5MB or smaller.") }));
      return;
    }
    setErrors(({ profile_image: _drop, ...rest }) => rest);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    // Send only changed fields; an emptied field is sent as "" / null so it really clears.
    const initial = toForm(profile);
    const data = new FormData();
    (Object.keys(form) as FormKey[]).forEach((k) => {
      if (form[k] !== initial[k]) data.append(k, form[k].trim());
    });
    if (image) data.append("profile_image", image);

    if ([...data.keys()].length === 0) {
      setSaving(false);
      navigate("/dashboard/profile");
      return;
    }
    try {
      await profileApi.update(data);
      await queryClient.invalidateQueries({ queryKey: qk.me });
      toast.success(t("profile_update_success", "Profile updated."));
      navigate("/dashboard/profile");
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) {
        setErrors(fields);
        toast.error(t("fix_errors", "Please fix the highlighted fields."));
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  const batchOptions = [
    { label: t("freshman", "1st year"), value: "1" },
    { label: t("2nd_year", "2nd year"), value: "2" },
    { label: t("3rd_year", "3rd year"), value: "3" },
    { label: t("4th_year", "4th year"), value: "4" },
    { label: t("5th_gc", "5th year / GC"), value: "5" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/dashboard/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {t("back_to_profile", "Back to profile")}
      </Link>
      <SectionHeader title={t("edit_profile", "Edit profile")} description={t("edit_profile_desc", "Keep your details current so the fellowship can reach you.")} />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Card>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar src={preview ?? profile?.profile_image} alt={user.full_name} size="xl" />
            <div className="text-center sm:text-left">
              <p className="font-semibold text-foreground">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
              <Button variant="outline" className="mt-2" onClick={() => fileInput.current?.click()}>
                <CameraIcon className="h-4 w-4" aria-hidden="true" />
                {t("change_photo", "Change photo")}
              </Button>
              {errors.profile_image && <p className="mt-1 text-xs text-destructive">{errors.profile_image}</p>}
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
            {t("identity_locked", "Name, email and gender can only be changed by a fellowship administrator.")}
          </p>
        </Card>

        <Card>
          <h2 className="section-title mb-3">{t("campus_information", "Campus information")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label={t("batch_year", "Batch year")} value={form.batch_year} onChange={set("batch_year")} error={errors.batch_year}>
              <option value="">{t("select", "Select")}</option>
              {batchOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
            <TextField label={t("department", "Department")} value={form.department} onChange={set("department")} error={errors.department} />
            <TextField label={t("dorm_block", "Dorm block")} type="number" min={1} inputMode="numeric" value={form.dorm_block} onChange={set("dorm_block")} error={errors.dorm_block} />
            <TextField label={t("dorm_room", "Dorm room")} type="number" min={1} inputMode="numeric" value={form.dorm_room} onChange={set("dorm_room")} error={errors.dorm_room} />
            <TextField label={t("section", "Section")} type="number" min={1} inputMode="numeric" value={form.section} onChange={set("section")} error={errors.section} />
          </div>
        </Card>

        <Card>
          <h2 className="section-title mb-3">{t("contact_information", "Contact information")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label={t("phone", "Phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="09XXXXXXXX" value={form.personal_phone} onChange={set("personal_phone")} error={errors.personal_phone} />
            <TextField label={t("telegram", "Telegram")} placeholder={t("telegram_placeholder", "@username")} value={form.telegram_username} onChange={set("telegram_username")} error={errors.telegram_username} />
            <TextField label={t("home_address", "Home address")} value={form.home_address} onChange={set("home_address")} error={errors.home_address} className="sm:col-span-2" />
          </div>
        </Card>

        <Card>
          <h2 className="section-title mb-3">{t("emergency_contact", "Emergency contact")}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label={t("emergency_name", "Name")} value={form.emergency_name} onChange={set("emergency_name")} error={errors.emergency_name} />
            <TextField label={t("phone", "Phone")} type="tel" inputMode="tel" placeholder="09XXXXXXXX" value={form.emergency_phone} onChange={set("emergency_phone")} error={errors.emergency_phone} />
            <TextField label={t("relationship", "Relationship")} value={form.emergency_relation} onChange={set("emergency_relation")} error={errors.emergency_relation} />
          </div>
        </Card>

        <Card>
          <h2 className="section-title mb-3">{t("spiritual_information", "Spiritual information")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label={t("confession_father", "Confession father")} value={form.confession_father} onChange={set("confession_father")} error={errors.confession_father} />
            <TextField label={t("previous_church", "Previous church")} value={form.previous_church} onChange={set("previous_church")} error={errors.previous_church} />
            <TextField label={t("activities_serving", "Current church service")} value={form.activity_serving} onChange={set("activity_serving")} error={errors.activity_serving} />
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/dashboard/profile" className="btn-outline">
            {t("cancel", "Cancel")}
          </Link>
          <Button type="submit" loading={saving}>
            {saving ? t("saving", "Saving…") : t("save_changes", "Save changes")}
          </Button>
        </div>
      </form>
    </div>
  );
}
