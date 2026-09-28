import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value === null || value === undefined || value === "" ? "—" : value}</dd>
    </div>
  );
}

export default function DashboardProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!user) return null;
  const p = user.profile;
  const dorm = p?.dorm_block ? `${t("block", "Block")} ${p.dorm_block}${p.dorm_room ? ` · ${t("room", "Room")} ${p.dorm_room}` : ""}` : null;

  return (
    <div className="space-y-6">
      <header className="page-hero">
        <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row">
        <Avatar src={p?.profile_image} alt={user.full_name} size="xl" className="ring-4 ring-accent" />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{user.full_name}</h1>
          <p className="text-sm text-white/75">{user.email}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
              {p?.status === "GRADUATED" ? t("graduated", "Graduated") : t("active", "In campus")}
            </span>
            {user.roles
              .filter((r) => r !== "Student")
              .map((r) => (
                <span key={r} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  {r}
                </span>
              ))}
          </div>
        </div>
        <Link to="/dashboard/profile/edit" className="btn-primary">
          <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
          {t("edit_profile", "Edit profile")}
        </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="section-title mb-3">{t("personal_information", "Personal information")}</h2>
          <dl className="divide-y divide-border">
            <Row label={t("full_name", "Full name")} value={user.full_name} />
            <Row label={t("gender_label", "Gender")} value={user.gender === "M" ? t("male", "Male") : user.gender === "F" ? t("female", "Female") : null} />
            <Row label={t("assigned_group", "Service group")} value={user.membership?.service_group_name} />
          </dl>
        </Card>
        <Card>
          <h2 className="section-title mb-3">{t("campus_information", "Campus information")}</h2>
          <dl className="divide-y divide-border">
            <Row label={t("batch_year", "Batch year")} value={p?.batch_year} />
            <Row label={t("department_label", "Department")} value={p?.department} />
            <Row label={t("dorm_block_room", "Dorm")} value={dorm} />
            <Row label={t("section", "Section")} value={p?.section} />
          </dl>
        </Card>
        <Card>
          <h2 className="section-title mb-3">{t("contact_information", "Contact information")}</h2>
          <dl className="divide-y divide-border">
            <Row label={t("phone", "Phone")} value={p?.personal_phone} />
            <Row label={t("telegram", "Telegram")} value={p?.telegram_username} />
            <Row label={t("home_address", "Home address")} value={p?.home_address} />
          </dl>
        </Card>
        <Card>
          <h2 className="section-title mb-3">{t("emergency_contact", "Emergency contact")}</h2>
          <dl className="divide-y divide-border">
            <Row label={t("emergency_name", "Name")} value={p?.emergency_name} />
            <Row label={t("phone", "Phone")} value={p?.emergency_phone} />
            <Row label={t("relationship", "Relationship")} value={p?.emergency_relation} />
          </dl>
        </Card>
        <Card className="md:col-span-2">
          <h2 className="section-title mb-3">{t("spiritual_information", "Spiritual information")}</h2>
          <dl className="grid divide-y divide-border md:grid-cols-3 md:divide-y-0">
            <Row label={t("confession_father", "Confession father")} value={p?.confession_father} />
            <Row label={t("previous_church", "Previous church")} value={p?.previous_church} />
            <Row label={t("activities_serving", "Church service")} value={p?.activity_serving} />
          </dl>
        </Card>
      </div>
    </div>
  );
}
