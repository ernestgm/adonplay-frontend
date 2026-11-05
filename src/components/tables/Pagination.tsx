"use client";
import { useT } from "@/i18n/I18nProvider";
type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
    const tTable = useT("common.table.pagination");

    const getPagesAroundCurrent = (currentPage: number, totalPages: number): number[] => {
        const delta = 1; // número de páginas antes y después del actual (1 antes, 1 después = total 3)
        const start = Math.max(currentPage - delta, 1);
        const end = Math.min(currentPage + delta, totalPages);

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    }

    const pagesAroundCurrent = getPagesAroundCurrent(currentPage, totalPages);

  return (
    <div className="flex items-center ">
      <button
          onClick={(e) => {
              e.preventDefault();
              onPageChange(currentPage - 1)
          }}
        disabled={currentPage === 1}
        className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-content-secondary hover:bg-surface-hover disabled:opacity-50 text-sm transition-colors"
      >
        {tTable("previous")}
      </button>
      <div className="flex items-center gap-2">
        {currentPage > 3 && <span className="px-2">...</span>}
        {pagesAroundCurrent.map((page) => (
          <button
            key={page}
            onClick={(e) => {
                e.preventDefault();
                onPageChange(page)
            }}
            className={`px-4 py-2 rounded ${
              currentPage === page
                ? "bg-brand-500 text-white"
                : "text-content-secondary"
            } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium transition-colors hover:bg-surface-hover hover:text-content-primary`}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
      </div>
      <button
        onClick={(e) => {
            e.preventDefault();
            onPageChange(currentPage + 1)
        }}
        disabled={currentPage === totalPages}
        className="ml-2.5 flex items-center justify-center rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-content-secondary text-sm hover:bg-surface-hover h-10 disabled:opacity-50 transition-colors"
      >
        {tTable("next")}
      </button>
    </div>
  );
};

export default Pagination;
