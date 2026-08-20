import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/tossa/kit";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize = 12,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = totalCount ? Math.min(page * pageSize, totalCount) : page * pageSize;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className={cn("mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-6", className)}>
      {totalCount !== undefined ? (
        <p className="text-[0.875rem] font-medium text-subtle">
          Showing <span className="font-bold text-heading">{startItem}–{endItem}</span> of{" "}
          <span className="font-bold text-heading">{totalCount}</span> results
        </p>
      ) : (
        <p className="text-[0.875rem] font-medium text-subtle">
          Page <span className="font-bold text-heading">{page}</span> of{" "}
          <span className="font-bold text-heading">{totalPages}</span>
        </p>
      )}

      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        <Button
          size="sm"
          variant="ghostOutline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="gap-1 text-[0.8125rem]"
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="px-2 text-subtle text-[0.875rem]">
                  …
                </span>
              );
            }
            const isCurrent = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "grid size-9 place-items-center rounded-xl text-[0.875rem] font-bold transition-all",
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-body hover:bg-surface-hover hover:text-heading"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        <Button
          size="sm"
          variant="ghostOutline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="gap-1 text-[0.8125rem]"
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
