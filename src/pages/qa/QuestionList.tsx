import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChatBubbleLeftRightIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useMyContributions, usePrivateInbox, useQuestions } from "@/hooks/queries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { qaApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { can } from "@/lib/roles";
import { QA_CATEGORIES, ROLES, type Answer, type Question } from "@/types";
import QuestionCard from "@/features/qa/QuestionCard";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Pagination from "@/components/ui/Pagination";
import QueryState from "@/components/ui/QueryState";
import EmptyState from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/Card";
import PublicHero from "@/components/navigation/PublicHero";

const PAGE_SIZE = 20;
type Tab = "public" | "private" | "mine";

export default function QuestionList({ isDashboard = false }: { isDashboard?: boolean }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();

  const requested = params.get("tab") as Tab | null;
  const tab: Tab = user && (requested === "private" || requested === "mine") ? requested : "public";
  const setTab = (next: Tab) => {
    const p = new URLSearchParams(params);
    if (next === "public") p.delete("tab");
    else p.set("tab", next);
    setParams(p, { replace: true });
  };

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());

  const publicQuery = useQuestions(page, debouncedSearch, category);
  const inbox = usePrivateInbox(tab === "private");
  const mine = useMyContributions(tab === "mine");

  const isModerator = can(user, ROLES.QA_MODERATOR);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["qa"] });

  const answer = async (questionId: string, text: string) => {
    try {
      await qaApi.answer({ question: questionId, display_name: user?.first_name || t("anonymous", "Anonymous"), answer_body: text });
      toast.success(t("answer_pending_approval", "Answer submitted. It appears after a moderator approves it."));
      await refresh();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  const edit = async (q: Question, body: string) => {
    try {
      await qaApi.updateQuestion(q.id, { question_body: body });
      toast.success(
        q.visibility === "PUBLIC" && !isModerator
          ? t("question_updated_moderation", "Saved. The question will reappear after approval.")
          : t("question_updated", "Question updated."),
      );
      await refresh();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  const removeQuestion = async (q: Question) => {
    if (!(await confirm({ title: t("delete_question", "Delete question"), message: t("delete_question_confirm", "Delete this question?"), confirmText: t("delete", "Delete"), danger: true }))) return;
    try {
      await qaApi.deleteQuestion(q.id);
      toast.success(t("question_deleted", "Question deleted."));
      await refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const removeAnswer = async (a: Answer) => {
    if (!(await confirm({ title: t("delete_answer", "Delete answer"), message: t("delete_answer_confirm", "Delete this answer?"), confirmText: t("delete", "Delete"), danger: true }))) return;
    try {
      await qaApi.deleteAnswer(a.id);
      toast.success(t("answer_deleted", "Answer deleted."));
      await refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "public", label: t("community", "Community") },
    ...(user
      ? [
          { id: "private" as Tab, label: t("my_private_questions", "My private questions") },
          { id: "mine" as Tab, label: t("my_contributions", "My contributions") },
        ]
      : []),
  ];

  const categoryOptions = [
    { value: "all", label: t("all", "All") },
    ...QA_CATEGORIES.map((c) => ({ value: c, label: t(`cat_${c.toLowerCase()}`, c) })),
  ];

  const askRoute = isDashboard ? "/dashboard/questions/ask" : "/anonymous/ask";
  const cardProps = {
    isModerator,
    onEdit: edit,
    onDeleteQuestion: removeQuestion,
    onDeleteAnswer: removeAnswer,
  };

  const askButton = (
    <Link to={askRoute} className="btn-primary">
      <PlusCircleIcon className="h-5 w-5" aria-hidden="true" />
      {t("ask_question", "Ask a question")}
    </Link>
  );

  const content = (
    <div className="space-y-5">
      {isDashboard && (
        <SectionHeader
          title={t("anonymous_qa", "Anonymous Q&A")}
          description={t("qa_subtitle", "Ask freely — your identity stays private.")}
          action={askButton}
        />
      )}

      {tabs.length > 1 && (
        <div role="tablist" className="tabs">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              role="tab"
              type="button"
              aria-selected={tab === tb.id}
              onClick={() => setTab(tb.id)}
              className="tab"
            >
              {tb.label}
            </button>
          ))}
        </div>
      )}

      {tab === "public" && (
        <>
          <div className="space-y-3">
            <SearchBar
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder={t("search_questions", "Search questions…")}
            />
            <FilterBar options={categoryOptions} value={category} onChange={(v) => { setCategory(v); setPage(1); }} label={t("category", "Category")} />
          </div>
          <QueryState
            isLoading={publicQuery.isLoading}
            error={publicQuery.error}
            onRetry={publicQuery.refetch}
            isEmpty={!publicQuery.data?.results.length}
            empty={<EmptyState icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />} title={t("no_questions", "No questions yet")} description={t("be_first_to_ask", "Be the first to ask.")} />}
          >
            <div className={`space-y-4 ${publicQuery.isFetching ? "opacity-70" : ""}`}>
              {publicQuery.data?.results.map((q) => (
                <QuestionCard key={q.id} question={q} canAnswer={!!user} onAnswer={answer} {...cardProps} />
              ))}
            </div>
            <Pagination page={page} totalPages={Math.ceil((publicQuery.data?.count ?? 0) / PAGE_SIZE)} onPageChange={setPage} />
          </QueryState>
          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="font-semibold text-primary hover:underline">
                {t("sign_in")}
              </Link>{" "}
              {t("sign_in_to_answer", "to answer questions.")}
            </p>
          )}
        </>
      )}

      {tab === "private" && (
        <QueryState
          isLoading={inbox.isLoading}
          error={inbox.error}
          onRetry={inbox.refetch}
          isEmpty={!inbox.data?.length}
          empty={<EmptyState title={t("no_private_questions", "No private questions")} description={t("private_q_desc", "Only a counselor can read them.")} />}
        >
          <div className="space-y-4">
            {inbox.data?.map((q) => (
              <QuestionCard key={q.id} question={q} canAnswer={false} {...cardProps} />
            ))}
          </div>
        </QueryState>
      )}

      {tab === "mine" && (
        <QueryState isLoading={mine.isLoading} error={mine.error} onRetry={mine.refetch}>
          <section className="space-y-3">
            <h2 className="section-title mb-3">{t("my_questions", "My questions")}</h2>
            {mine.data?.questions.length ? (
              mine.data.questions.map((q) => <QuestionCard key={q.id} question={q} canAnswer={false} {...cardProps} />)
            ) : (
              <p className="text-sm text-muted-foreground">{t("no_questions", "No questions yet")}</p>
            )}
          </section>
          <section className="space-y-3 pt-4">
            <h2 className="section-title mb-3">{t("my_answers", "My answers")}</h2>
            {mine.data?.answers.length ? (
              <ul className="space-y-2">
                {mine.data.answers.map((a) => (
                  <li key={a.id} className="card flex items-start justify-between gap-3 p-4">
                    <p className="whitespace-pre-line text-sm text-foreground">{a.answer_body}</p>
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        a.is_approved ? "bg-success/10 text-success" : "bg-warning/15 text-warning"
                      }`}
                    >
                      {a.is_approved ? t("approved", "Approved") : t("awaiting_approval", "Awaiting approval")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("no_answers_yet", "No answers yet")}</p>
            )}
          </section>
        </QueryState>
      )}
    </div>
  );

  if (isDashboard) return content;
  return (
    <div className="bg-background">
      <PublicHero title={t("anonymous_qa", "Anonymous Q&A")} subtitle={t("qa_subtitle", "Ask freely — your identity stays private.")}>
        {askButton}
      </PublicHero>
      <div className="mx-auto max-w-4xl px-4 py-10">{content}</div>
    </div>
  );
}
