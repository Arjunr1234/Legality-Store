import { ChevronLeft, ChevronRight } from 'lucide-react'

import { buildPageItems } from '../../utils/pagination'

const baseButton =
  'inline-flex h-9 min-w-9 cursor-pointer items-center justify-center gap-1 rounded-lg border px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40'

function Pagination({ currentPage, totalPages, onPageChange, disabled = false }) {
  if (totalPages <= 1) return null

  const items = buildPageItems(currentPage, totalPages)

  const goTo = (page) => {
    const next = Math.min(Math.max(page, 1), totalPages)
    if (next !== currentPage) onPageChange(next)
  }

  return (
    <nav
      aria-label="Product pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={disabled || currentPage <= 1}
        className={`${baseButton} border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {items.map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            onClick={() => goTo(item)}
            disabled={disabled}
            aria-current={item === currentPage ? 'page' : undefined}
            className={`${baseButton} ${
              item === currentPage
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="px-1 text-sm text-gray-400" aria-hidden="true">
            …
          </span>
        )
      )}

      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages}
        className={`${baseButton} border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

export default Pagination
