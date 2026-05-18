import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = [];
  const maxButtons = 5;
  let start = Math.max(1, page - 2);
  let end = Math.min(pages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        className="btn-ghost p-2 disabled:opacity-30"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <FiChevronLeft />
      </button>
      {pageNumbers.map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`h-9 w-9 rounded-full text-sm font-medium transition ${
            n === page
              ? 'bg-brand-pink text-white shadow-soft'
              : 'hover:bg-brand-pink-soft dark:hover:bg-brand-black-soft'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        className="btn-ghost p-2 disabled:opacity-30"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
