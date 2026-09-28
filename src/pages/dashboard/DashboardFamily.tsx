import { useTranslation } from "react-i18next";
import { PhoneIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useMyFamily } from "@/hooks/queries";
import { Card, SectionHeader } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import QueryState from "@/components/ui/QueryState";
import type { FamilyContact } from "@/types";

function Parent({ title, person }: { title: string; person: FamilyContact | null }) {
  const { t } = useTranslation();
  return (
    <Card className="flex items-center gap-4">
      <Avatar alt={person?.name ?? "?"} size="lg" />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-semibold text-foreground">{person?.name ?? t("tbd", "Not assigned yet")}</p>
        {person?.phone && (
          <a href={`tel:${person.phone}`} className="mt-0.5 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            {person.phone}
          </a>
        )}
      </div>
    </Card>
  );
}

export default function DashboardFamily() {
  const { t } = useTranslation();
  const { data: family, isLoading, error, refetch } = useMyFamily();

  return (
    <div className="space-y-6">
      <SectionHeader title={t("my_family", "My family")} description={t("spiritual_family_mentors")} />
      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={!family}
        empty={
          <Card>
            <EmptyState
              icon={<UserGroupIcon className="h-8 w-8" />}
              title={t("no_family_assigned", "No family yet")}
              description={t("no_family_yet", "You'll see your spiritual family here once the fellowship assigns you.")}
            />
          </Card>
        }
      >
        {family && (
          <>
            <Card>
              <h2 className="section-title mb-1">{family.name}</h2>
              {family.religious_father && (
                <p className="text-sm text-muted-foreground">
                  {t("religious_father", "Religious father")}: <span className="font-medium text-foreground">{family.religious_father}</span>
                </p>
              )}
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Parent title={t("spiritual_father", "Spiritual father")} person={family.father} />
              <Parent title={t("spiritual_mother", "Spiritual mother")} person={family.mother} />
            </div>
            <Card>
              <h2 className="section-title mb-3">
                {t("siblings_count", "Siblings")} ({family.siblings.length})
              </h2>
              {family.siblings.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("no_siblings", "No other members yet.")}</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {family.siblings.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <Avatar alt={s.name} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{s.name}</p>
                        <a href={`mailto:${s.email}`} className="block truncate text-xs text-primary hover:underline">
                          {s.email}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </QueryState>
    </div>
  );
}
