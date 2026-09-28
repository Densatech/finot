import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CheckIcon, ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { qaApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { qk } from "@/lib/queryClient";
import { Card, SectionHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import QueryState from "@/components/ui/QueryState";
import { useConfirm } from "@/components/ui/ConfirmDialog";

type Tab = "questions" | "answers";

export default function ModeratorQueue() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("questions");
  const [busyId, setBusyId] = useState<string | number | null>(null);

  const questions = useQuery({ queryKey: qk.questionModeration, queryFn: qaApi.questionModerationQueue });
  const answers = useQuery({ queryKey: qk.answerModeration, queryFn: qaApi.answerModerationQueue });

  const act = async (id: string | number, action: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: ["qa"] });
      toast.success(success);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (kind: "question" | "answer", id: string | number) => {
    const ok = await confirm({
      title: t("reject", "Reject"),
      message: kind === "question" ? t("confirm_reject_question", "Delete this question?") : t("confirm_reject_answer", "Delete this answer?"),
      confirmText: t("reject", "Reject"),
      danger: true,
    });
    if (!ok) return;
    await act(
      id,
      () => (kind === "question" ? qaApi.deleteQuestion(String(id)) : qaApi.deleteAnswer(Number(id))),
      kind === "question" ? t("question_rejected", "Question removed.") : t("answer_rejected", "Answer removed."),
    );
  };

  const counts = { questions: questions.data?.length ?? 0, answers: answers.data?.length ?? 0 };

  return (
    <div className="space-y-6">
      <SectionHeader title={t("moderation_queue", "Moderation queue")} description={t("moderation_queue_description")} />
      <div role="tablist" className="tabs">
        {(
          [
            ["questions", `${t("pending_questions", "Questions")} (${counts.questions})`],
            ["answers", `${t("pending_answers", "Answers")} (${counts.answers})`],
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

      {tab === "questions" ? (
        <QueryState
          isLoading={questions.isLoading}
          error={questions.error}
          onRetry={questions.refetch}
          isEmpty={!counts.questions}
          empty={<Card><EmptyState icon={<ShieldCheckIcon className="h-8 w-8" />} title={t("no_pending_questions", "Nothing to review")} description="" /></Card>}
        >
          <ul className="space-y-4">
            {questions.data?.map((q) => (
              <li key={q.id}>
                <Card className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">{t(`cat_${q.category.toLowerCase()}`, q.category)}</span>
                    <span className="text-muted-foreground">
                      {q.display_name} · {new Date(q.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-foreground">{q.question_body}</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" disabled={busyId === q.id} onClick={() => reject("question", q.id)}>
                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                      {t("reject", "Reject")}
                    </Button>
                    <Button variant="secondary" loading={busyId === q.id} onClick={() => act(q.id, () => qaApi.approveQuestion(q.id), t("question_approved", "Question approved."))}>
                      <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      {t("approve", "Approve")}
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </QueryState>
      ) : (
        <QueryState
          isLoading={answers.isLoading}
          error={answers.error}
          onRetry={answers.refetch}
          isEmpty={!counts.answers}
          empty={<Card><EmptyState icon={<ShieldCheckIcon className="h-8 w-8" />} title={t("no_pending_answers", "No answers to review")} description="" /></Card>}
        >
          <ul className="space-y-4">
            {answers.data?.map((a) => (
              <li key={a.id}>
                <Card className="space-y-3">
                  <div className="rounded-xl bg-muted p-3 text-sm">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">{t("question", "Question")}</p>
                    <p className="mt-1 whitespace-pre-line text-foreground">{a.question_body}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {a.display_name} · {new Date(a.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-foreground">{a.answer_body}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" disabled={busyId === a.id} onClick={() => reject("answer", a.id)}>
                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                      {t("reject", "Reject")}
                    </Button>
                    <Button variant="secondary" loading={busyId === a.id} onClick={() => act(a.id, () => qaApi.approveAnswer(a.id), t("answer_approved", "Answer approved."))}>
                      <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      {t("approve", "Approve")}
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </QueryState>
      )}
    </div>
  );
}
