import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const btn =
    "inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
      <button type="button" className={btn} onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        Prev
      </button>
      <span className="text-sm text-muted-foreground" aria-current="page">
        {page} / {totalPages}
      </span>
      <button type="button" className={btn} onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
