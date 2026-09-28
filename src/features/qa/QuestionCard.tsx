import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { LockClosedIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { Answer, Question } from "@/types";
import Button from "@/components/ui/Button";

const PREVIEW_LIMIT = 280;

function AnswerItem({ answer, canDelete, onDelete }: { answer: Answer; canDelete: boolean; onDelete: () => void }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const long = answer.answer_body.length > PREVIEW_LIMIT;
  const text = long && !expanded ? `${answer.answer_body.slice(0, PREVIEW_LIMIT)}…` : answer.answer_body;
  return (
    <li className="rounded-xl bg-muted/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{answer.display_name}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{new Date(answer.created_at).toLocaleDateString()}</span>
          {canDelete && (
            <button type="button" onClick={onDelete} className="text-muted-foreground hover:text-destructive" aria-label={t("delete_answer", "Delete answer")}>
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-foreground/85">{text}</p>
      {long && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-1 text-xs font-semibold text-primary hover:underline">
          {expanded ? t("show_less", "Show less") : t("read_more", "Read more")}
        </button>
      )}
    </li>
  );
}

interface QuestionCardProps {
  question: Question;
  /** Moderators can edit/delete anyone's content; owners their own. */
  isModerator: boolean;
  canAnswer: boolean;
  onAnswer?: (questionId: string, text: string) => Promise<boolean>;
  onEdit?: (question: Question, body: string) => Promise<boolean>;
  onDeleteQuestion?: (question: Question) => void;
  onDeleteAnswer?: (answer: Answer) => void;
}

export default function QuestionCard({
  question,
  isModerator,
  canAnswer,
  onAnswer,
  onEdit,
  onDeleteQuestion,
  onDeleteAnswer,
}: QuestionCardProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(question.question_body);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const canModify = isModerator || question.is_mine;

  const submitReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !onAnswer) return;
    setBusy(true);
    if (await onAnswer(question.id, reply.trim())) setReply("");
    setBusy(false);
  };

  const saveEdit = async () => {
    if (!onEdit || !draft.trim()) return;
    setBusy(true);
    if (await onEdit(question, draft.trim())) setEditing(false);
    setBusy(false);
  };

  return (
    <article className="card space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
            {t(`cat_${question.category.toLowerCase()}`, question.category)}
          </span>
          {question.visibility === "PRIVATE" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/25 px-2.5 py-0.5 font-semibold text-accent-foreground">
              <LockClosedIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {t("private", "Private")}
            </span>
          )}
          {!question.is_approved && question.visibility === "PUBLIC" && (
            <span className="rounded-full bg-warning/15 px-2.5 py-0.5 font-semibold text-warning">
              {t("awaiting_approval", "Awaiting approval")}
            </span>
          )}
          <span className="text-muted-foreground">
            {question.display_name} · {new Date(question.created_at).toLocaleDateString()}
          </span>
        </div>
        {canModify && !editing && (
          <div className="flex items-center gap-2">
            {question.is_mine && onEdit && (
              <button type="button" onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground" aria-label={t("edit_question", "Edit question")}>
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            {onDeleteQuestion && (
              <button type="button" onClick={() => onDeleteQuestion(question)} className="text-muted-foreground hover:text-destructive" aria-label={t("delete_question", "Delete question")}>
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </header>

      {editing ? (
        <div className="space-y-2">
          <textarea
            aria-label={t("edit_question", "Edit question")}
            className="input min-h-[100px]"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          {question.visibility === "PUBLIC" && question.is_approved && (
            <p className="text-xs text-muted-foreground">{t("edit_requires_approval", "Edited public questions are re-checked by a moderator.")}</p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" loading={busy} onClick={saveEdit}>
              {t("save", "Save")}
            </Button>
            <Button variant="ghost" onClick={() => { setEditing(false); setDraft(question.question_body); }}>
              {t("cancel", "Cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-line text-foreground">{question.question_body}</p>
      )}

      {question.answers.length > 0 && (
        <ul className="space-y-2">
          {question.answers.map((a) => (
            <AnswerItem
              key={a.id}
              answer={a}
              canDelete={!!onDeleteAnswer && (isModerator || a.is_mine)}
              onDelete={() => onDeleteAnswer?.(a)}
            />
          ))}
        </ul>
      )}

      {canAnswer && onAnswer && (
        <form onSubmit={submitReply} className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor={`reply-${question.id}`}>
            {t("write_answer", "Write an answer")}
          </label>
          <input
            id={`reply-${question.id}`}
            className="input"
            placeholder={t("write_answer", "Write an answer…")}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <Button type="submit" variant="secondary" loading={busy} disabled={!reply.trim()}>
            {t("reply", "Reply")}
          </Button>
        </form>
      )}
    </article>
  );
}
