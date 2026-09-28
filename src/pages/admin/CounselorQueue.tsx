import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChatBubbleLeftRightIcon, UserIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { qaApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { qk } from "@/lib/queryClient";
import type { Question } from "@/types";
import { Card, SectionHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import QueryState from "@/components/ui/QueryState";
import { TextAreaField } from "@/components/ui/Field";

type Tab = "unanswered" | "answered";

export default function CounselorQueue() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // One request: the backend returns every private question with its answers, unanswered first.
  const { data = [], isLoading, error, refetch, isFetching } = useQuery({ queryKey: qk.counselorQueue, queryFn: qaApi.counselorQueue });
  const [tab, setTab] = useState<Tab>("unanswered");
  const [selected, setSelected] = useState<Question | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const unanswered = data.filter((q) => q.answers.length === 0);
  const answered = data.filter((q) => q.answers.length > 0);
  const list = tab === "unanswered" ? unanswered : answered;

  const send = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await qaApi.answer({ question: selected.id, display_name: user?.first_name || t("counselor", "Counselor"), answer_body: reply.trim() });
      await queryClient.invalidateQueries({ queryKey: qk.counselorQueue });
      toast.success(t("answer_submitted_successfully", "Answer sent. The student has been notified."));
      setSelected(null);
      setReply("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("counselor_dashboard", "Counselor queue")}
        description={t("counselor_dashboard_description")}
        action={
          <Button variant="outline" loading={isFetching && !isLoading} onClick={() => refetch()}>
            {t("refresh", "Refresh")}
          </Button>
        }
      />
      <div role="tablist" className="tabs">
        {(
          [
            ["unanswered", `${t("unanswered", "Unanswered")} (${unanswered.length})`],
            ["answered", `${t("answered", "Answered")} (${answered.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className="tab"
          >
            {label}
          </button>
        ))}
      </div>

      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={list.length === 0}
        empty={
          <Card>
            <EmptyState
              icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
              title={tab === "unanswered" ? t("no_unanswered_questions", "All questions answered") : t("no_answered_questions", "Nothing answered yet")}
              description=""
            />
          </Card>
        }
      >
        <ul className="space-y-4">
          {list.map((q) => (
            <li key={q.id}>
              <Card className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">{t(`cat_${q.category.toLowerCase()}`, q.category)}</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {q.asker_name ?? q.display_name}
                  </span>
                  <span className="text-muted-foreground">{new Date(q.created_at).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-line text-foreground">{q.question_body}</p>
                {q.answers.map((a) => (
                  <div key={a.id} className="rounded-xl bg-muted/60 p-3 text-sm">
                    <p className="font-semibold text-foreground">{a.display_name}</p>
                    <p className="mt-1 whitespace-pre-line text-foreground/85">{a.answer_body}</p>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button variant={q.answers.length ? "outline" : "secondary"} onClick={() => { setSelected(q); setReply(""); }}>
                    {q.answers.length ? t("add_follow_up", "Add a follow-up") : t("answer_question", "Answer")}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </QueryState>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={t("answer_question", "Answer question")} size="lg">
        {selected && (
          <div className="space-y-4">
            <p className="whitespace-pre-line rounded-xl bg-muted p-3 text-sm text-foreground">{selected.question_body}</p>
            <TextAreaField
              label={t("your_answer", "Your answer")}
              rows={6}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              hint={t("answer_will_be_sent_to_student", "Only the student who asked will see this.")}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>
                {t("cancel", "Cancel")}
              </Button>
              <Button onClick={send} loading={sending} disabled={!reply.trim()}>
                {t("submit_answer", "Send answer")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
