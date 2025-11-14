import React from "react";

const MAX_VISIBLE_PAGES = 5;

const clampPage = (page, totalPages) => {
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
};

const buildPageList = (currentPage, totalPages) => {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(MAX_VISIBLE_PAGES / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = MAX_VISIBLE_PAGES;
  } else if (end > totalPages) {
    end = totalPages;
    start = totalPages - MAX_VISIBLE_PAGES + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export default function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = clampPage(currentPage, totalPages);

  if (totalPages <= 1) return null;

  const pages = buildPageList(safeCurrentPage, totalPages);

  const handlePageChange = (page) => {
    const next = clampPage(page, totalPages);
    if (next !== safeCurrentPage) {
      onPageChange?.(next);
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-medium">
      <button
        type="button"
        onClick={() => handlePageChange(safeCurrentPage - 1)}
        className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
        disabled={safeCurrentPage === 1}
      >
        Prev
      </button>

      {pages.map((page) => {
        const isActive = page === safeCurrentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page)}
            className={`rounded-full px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-400/40 ${
              isActive
                ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                : "border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => handlePageChange(safeCurrentPage + 1)}
        className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
        disabled={safeCurrentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
