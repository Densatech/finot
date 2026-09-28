import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarDaysIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useEvents } from "@/hooks/queries";
import { serviceApi } from "@/lib/api";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { qk } from "@/lib/queryClient";
import { can } from "@/lib/roles";
import { ROLES, type Event, type EventStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import QueryState from "@/components/ui/QueryState";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { EVENT_STATUS_STYLES, formatEventDate } from "@/features/events/eventUtils";
import { isoToLocalInput, localInputToIso } from "@/features/events/dateTime";

interface GroupEventsManagerProps {
  /** "group": a ServiceAdmin's own group. "global": EventManager/SuperAdmin manage every event. */
  eventType: "group" | "global";
  groupId?: number;
}

type Draft = {
  title: string;
  description: string;
  start: string;
  end: string;
  place_name: string;
  place_url: string;
  status: EventStatus;
  photo: File | null;
};

const EMPTY: Draft = { title: "", description: "", start: "", end: "", place_name: "", place_url: "", status: "UPCOMING", photo: null };

export default function GroupEventsManager({ eventType, groupId }: GroupEventsManagerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const { data: allEvents = [], isLoading, error, refetch } = useEvents();

  const isGlobalManager = can(user, ROLES.EVENT_MANAGER);
  const events =
    eventType === "group" ? allEvents.filter((e) => e.service_group === groupId) : allEvents;
  const sorted = [...events].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  const [editing, setEditing] = useState<Event | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const canEdit = (e: Event) => isGlobalManager || (e.service_group !== null && e.service_group === groupId);

  const startCreate = () => {
    setEditing(null);
    setDraft(EMPTY);
    setErrors({});
    setOpen(true);
  };

  const startEdit = (e: Event) => {
    setEditing(e);
    setDraft({
      title: e.title,
      description: e.description,
      start: isoToLocalInput(e.start_date),
      end: isoToLocalInput(e.end_date),
      place_name: e.place_name ?? "",
      place_url: e.place_url ?? "",
      status: e.status,
      photo: null,
    });
    setErrors({});
    setOpen(true);
  };

  const save = async (ev: FormEvent) => {
    ev.preventDefault();
    const next: Record<string, string> = {};
    const required = t("required_field", "This field is required.");
    if (!draft.title.trim()) next.title = required;
    if (!draft.description.trim()) next.description = required;
    if (!draft.start) next.start_date = required;
    if (!draft.end) next.end_date = required;
    if (draft.start && draft.end && new Date(draft.end) < new Date(draft.start)) {
      next.end_date = t("end_after_start", "End must be after the start.");
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const data = new FormData();
    data.append("title", draft.title.trim());
    data.append("description", draft.description.trim());
    data.append("start_date", localInputToIso(draft.start));
    data.append("end_date", localInputToIso(draft.end));
    data.append("place_name", draft.place_name.trim());
    data.append("place_url", draft.place_url.trim());
    data.append("status", draft.status);
    if (draft.photo) data.append("photo", draft.photo);
    if (eventType === "group" && groupId && !editing) data.append("service_group", String(groupId));

    setSaving(true);
    try {
      if (editing) await serviceApi.updateEvent(editing.id, data);
      else await serviceApi.createEvent(data);
      await queryClient.invalidateQueries({ queryKey: qk.events });
      toast.success(editing ? t("event_updated_success", "Event updated.") : t("event_created_success", "Event created."));
      setOpen(false);
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setErrors(fields);
      else toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (e: Event) => {
    const ok = await confirm({
      title: t("delete_event", "Delete event"),
      message: `“${e.title}”`,
      confirmText: t("delete", "Delete"),
      danger: true,
    });
    if (!ok) return;
    try {
      await serviceApi.deleteEvent(e.id);
      await queryClient.invalidateQueries({ queryKey: qk.events });
      toast.success(t("event_deleted_success", "Event deleted."));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {eventType === "group"
            ? t("group_event_info", "Events you create here are visible to your group's members.")
            : t("global_event_info", "Events without a group are visible to everyone.")}
        </p>
        <Button onClick={startCreate}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          {eventType === "group" ? t("new_group_event", "New group event") : t("new_global_event", "New event")}
        </Button>
      </div>

      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={sorted.length === 0}
        empty={<Card><EmptyState icon={<CalendarDaysIcon className="h-8 w-8" />} title={t("no_events_created", "No events yet")} description="" /></Card>}
      >
        <Card padding="none">
          <ul className="divide-y divide-border">
            {sorted.map((e) => (
              <li key={e.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{e.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${EVENT_STATUS_STYLES[e.status]}`}>
                      {t(`event_${e.status.toLowerCase()}`, e.status)}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {e.service_group_name ?? t("general", "General")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatEventDate(e.start_date)}</p>
                  {e.place_name && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {e.place_name}
                    </p>
                  )}
                </div>
                {canEdit(e) && (
                  <div className="flex gap-1">
                    <Button variant="ghost" onClick={() => startEdit(e)} aria-label={`${t("edit_event", "Edit")} ${e.title}`}>
                      <PencilIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" onClick={() => remove(e)} aria-label={`${t("delete_event", "Delete")} ${e.title}`}>
                      <TrashIcon className="h-4 w-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </QueryState>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t("edit_event", "Edit event") : t("new_event", "New event")} size="lg">
        <form id="event-form" onSubmit={save} className="space-y-4" noValidate>
          <TextField label={t("title", "Title")} required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} error={errors.title} />
          <TextAreaField label={t("description", "Description")} required rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} error={errors.description} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label={t("start_date_time", "Starts")} type="datetime-local" required value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} error={errors.start_date} />
            <TextField label={t("end_date_time", "Ends")} type="datetime-local" required value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} error={errors.end_date} />
            <TextField label={t("place_name_opt", "Place (optional)")} value={draft.place_name} onChange={(e) => setDraft({ ...draft, place_name: e.target.value })} error={errors.place_name} />
            <TextField label={t("maps_url_opt", "Map link (optional)")} type="url" value={draft.place_url} onChange={(e) => setDraft({ ...draft, place_url: e.target.value })} error={errors.place_url} />
            <SelectField label={t("status", "Status")} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as EventStatus })}>
              <option value="UPCOMING">{t("event_upcoming", "Upcoming")}</option>
              <option value="ONGOING">{t("event_ongoing", "Ongoing")}</option>
              <option value="COMPLETED">{t("event_completed", "Completed")}</option>
            </SelectField>
            <TextField
              label={t("event_image_opt", "Photo (optional)")}
              type="file"
              accept="image/*"
              onChange={(e) => setDraft({ ...draft, photo: e.target.files?.[0] ?? null })}
              error={errors.photo}
            />
          </div>
        </form>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("cancel", "Cancel")}
          </Button>
          <Button type="submit" form="event-form" loading={saving}>
            {editing ? t("update_event", "Save changes") : t("save_event", "Create event")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
