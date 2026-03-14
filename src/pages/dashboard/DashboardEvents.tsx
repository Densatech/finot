import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, SectionHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { useTranslation } from "react-i18next";
import { FiCalendar, FiMapPin, FiClock, FiMessageCircle } from "react-icons/fi";

type DashboardEvent = {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  place_name?: string;
  place_url?: string;
  photo?: string | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  service_group?: number;
  service_group_name?: string;
};

const DashboardEvents = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents();
        setEvents((data || []) as DashboardEvent[]);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchEvents();
  }, [user]);

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    const eventDate = event.start_date ? new Date(event.start_date) : null;
    if (filter === "upcoming") return eventDate && eventDate >= new Date();
    if (filter === "completed") return eventDate && eventDate < new Date();
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (<div key={i} className="skeleton h-32 rounded-2xl" />))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: "all", label: t("all_events") },
          { key: "upcoming", label: t("event_upcoming") },
          { key: "completed", label: t("event_completed") },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key as any)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${filter === tab.key ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <EmptyState icon={<FiCalendar className="h-10 w-10" />} title={t("no_events_found")} description={t("events_check_back")} />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const eventDate = event.start_date ? new Date(event.start_date) : null;
            const isPast = eventDate && eventDate < new Date();
            return (
              <Card key={event.id} hoverable className={`flex flex-col h-full overflow-hidden ${isPast ? "opacity-75" : ""}`}>
                {/* Event Image */}
                {event.photo && (
                  <img
                    src={event.photo}
                    alt={event.title}
                    className="w-full h-36 object-cover rounded-t-xl -mt-4 -mx-4 mb-4"
                    style={{ width: 'calc(100% + 2rem)' }}
                  />
                )}
                <div className="flex flex-col flex-1">
                  <div className="flex w-full justify-between items-start mb-1.5">
                    <h3 className="text-sm font-semibold text-[#253D7F] line-clamp-1">{event.title}</h3>
                    {isPast && <Badge variant="default" size="sm" className="ml-2 flex-shrink-0 bg-slate-100 text-slate-500 font-medium border-0 hover:bg-slate-200">{t("completed")}</Badge>}
                  </div>
                  <div className="mb-3">
                    {event.service_group_name ? (
                      <div className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {event.service_group_name} {t("service_group")}
                      </div>
                    ) : (
                      <div className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {t("general")}
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <div className="mb-4 flex gap-1.5">
                      <FiMessageCircle className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{event.description}</p>
                    </div>
                  )}

                  <div className="mt-auto flex gap-3 pt-2 items-end">
                    <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100 pb-0.5">
                      <span className="text-[9px] font-bold uppercase text-[#253D7F]">{eventDate ? eventDate.toLocaleDateString(undefined, { month: "short" }) : t("tbd")}</span>
                      <span className="text-sm font-bold leading-none text-[#253D7F] mt-0.5">{eventDate ? eventDate.getDate() : ""}</span>
                    </div>
                    
                    <div className="space-y-1.5 min-w-0 flex-1 pb-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FiClock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{eventDate ? eventDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : t("location_tbd")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FiMapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">
                          {event.place_url ? (
                            <a href={event.place_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#253D7F] transition-colors hover:underline">
                              {event.place_name || t("view_location")}
                            </a>
                          ) : (
                            event.place_name || t("location_tbd")
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardEvents;
