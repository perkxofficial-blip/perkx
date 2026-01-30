'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PaginationProps = {
  pagination: PaginationData;
  pageParam?: string; // default: "page"
};

export default function Pagination({
                                     pagination,
                                     pageParam = 'page'
                                   }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { page, totalPages } = pagination;

  const changePage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set(pageParam, String(p));

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const renderPages = () => {
    const pages: (number | 'dots')[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 'dots', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, 'dots', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'dots', page - 1, page, page + 1, 'dots', totalPages);
      }
    }

    return pages.map((p, i) => {
      if (p === 'dots') {
        return (
          <li key={`dots-${i}`} className="page-item disabled">
            <span className="page-link dots">…</span>
          </li>
        );
      }

      const isActive = p === page;

      return (
        <li key={p} className={`page-item ${isActive ? 'active' : ''}`}>
          {isActive ? (
            <span className="page-link">{p}</span>
          ) : (
            <a
              href="#"
              className="page-link"
              onClick={(e) => {
                e.preventDefault();
                changePage(p);
              }}
            >
              {p}
            </a>
          )}
        </li>
      );
    });
  };

  return (
    <nav className="d-flex justify-content-center">
      <ul className="pagination pagination-dark align-items-center">
        {/* Previous */}
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <a
            href="#"
            className="page-link"
            aria-label="Previous"
            onClick={(e) => {
              e.preventDefault();
              changePage(page - 1);
            }}
          >
            &lsaquo;
          </a>
        </li>

        {renderPages()}

        {/* Next */}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <a
            href="#"
            className="page-link"
            aria-label="Next"
            onClick={(e) => {
              e.preventDefault();
              changePage(page + 1);
            }}
          >
            &rsaquo;
          </a>
        </li>
      </ul>
    </nav>
  );
}
