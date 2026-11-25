import { useEffect, useState } from 'react'

import Header from '../components/common/Header'
import FilterSidebar from '../components/product/FilterSidebar'
import Products from '../components/product/Products'
import useFilterDraft from '../hooks/useFilterDraft'
import useProductFilters from '../hooks/useProductFilters'
import useProducts from '../hooks/useProducts'


function ProductListing() {
  const { filters, updateFilters, setPage, toggleBrand, resetFilters, hasActiveFilters } =
    useProductFilters()

  const {
    products,
    total,
    totalPages,
    page: currentPage,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useProducts(filters)

  const { draft, updateDraft, clearDraft } = useFilterDraft(filters, updateFilters)

  const [isDrawerOpen, setDrawerOpen] = useState(false)

  // A deep link such as ?page=99 can land past the end of the result set.
  useEffect(() => {
    if (!isPending && !isError && filters.page > totalPages) setPage(1)
  }, [filters.page, totalPages, isPending, isError, setPage])

  const handleReset = () => {
    resetFilters()
    clearDraft()
    setDrawerOpen(false)
  }

  const sidebar = (
    <FilterSidebar
      filters={filters}
      draft={draft}
      onDraftChange={updateDraft}
      updateFilters={updateFilters}
      toggleBrand={toggleBrand}
      onReset={handleReset}
      hasActiveFilters={hasActiveFilters}
      onClose={() => setDrawerOpen(false)}
    />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        value={draft.q}
        onChange={(q) => updateDraft({ q })}
        onToggleFilters={() => setDrawerOpen(true)}
      />

      <main className="mx-auto max-w-[1440px] px-[5%] py-6">
        <div className="flex gap-6">

          {/* Filters — static column on desktop */}
          <aside className="hidden w-64 shrink-0 self-start rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
            {sidebar}
          </aside>

          {/* Product grid */}
          <section className="min-w-0 flex-1">
            <h1 className="sr-only">Products</h1>

            <Products
              products={products}
              total={total}
              totalPages={totalPages}
              page={currentPage}
              pageSize={filters.pageSize}
              isPending={isPending}
              isFetching={isFetching}
              isError={isError}
              error={error}
              onRetry={refetch}
              onPageChange={setPage}
              onResetFilters={hasActiveFilters ? handleReset : undefined}
            />
          </section>

        </div>
      </main>

      {/* Filters — slide-over drawer on mobile */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-xl">
            {sidebar}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductListing
