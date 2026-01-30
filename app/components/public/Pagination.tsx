import React from 'react';

type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PaginationProps = {
  pagination: PaginationData;
  onPageChange?: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
                                                 pagination,
                                                 onPageChange
                                               }) => {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  const handleChange = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange?.(p);
  };

  const renderPages = () => {
    const pages: (number | 'dots')[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 'dots', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, 'dots', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'dots', page - 1, page, page + 1, 'dots', totalPages);
      }
    }

    return pages.map((p, index) => {
      if (p === 'dots') {
        return (
          <li key={index} className="page-item disabled">
            <span className="page-link dots">…</span>
          </li>
        );
      }

      return (
        <li
          key={p}
          className={`page-item ${p === page ? 'active' : ''}`}
        >
          {p === page ? (
            <span className="page-link">{p}</span>
          ) : (
            <a
              className="page-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleChange(p);
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
            className="page-link"
            href="#"
            aria-label="Previous"
            onClick={(e) => {
              e.preventDefault();
              handleChange(page - 1);
            }}
          >
            &lsaquo;
          </a>
        </li>

        {renderPages()}

        {/* Next */}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <a
            className="page-link"
            href="#"
            aria-label="Next"
            onClick={(e) => {
              e.preventDefault();
              handleChange(page + 1);
            }}
          >
            &rsaquo;
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
