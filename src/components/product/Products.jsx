import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import Pagination from '../common/Pagination'

const GRID_CLASSES =
  'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'


function Products({
  products,
  total,
  totalPages,
  page,
  pageSize,
  isPending,
  isFetching,
  isError,
  error,
  onRetry,
  onPageChange,
  onResetFilters,
}) {
  if (isPending) {
    return (
      <div className={GRID_CLASSES} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: pageSize }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={onRetry}
        title="We could not load the products"
      />
    )
  }

  if (total === 0) {
    return <EmptyState onReset={onResetFilters} />
  }

  const firstOnPage = (page - 1) * pageSize + 1
  const lastOnPage = Math.min(page * pageSize, total)

  return (
    <div>
      {/* Result summary */}
      <div
        className="mb-4 flex items-center justify-between gap-3"
        aria-live="polite"
      >
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{firstOnPage}</span>
          {lastOnPage > firstOnPage && (
            <>
              –<span className="font-medium text-gray-900">{lastOnPage}</span>
            </>
          )}{' '}
          of <span className="font-medium text-gray-900">{total}</span>{' '}
          {total === 1 ? 'product' : 'products'}
        </p>

        {isFetching && (
          <span className="text-xs text-gray-400">Updating…</span>
        )}
      </div>

      {/* Grid — dimmed while a new page loads, so the layout never jumps */}
      <div
        className={`${GRID_CLASSES} transition-opacity ${
          isFetching ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        disabled={isFetching}
      />
    </div>
  )
}

export default Products
