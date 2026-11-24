import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

import useBrands from '../../hooks/useBrands'
import useCategories from '../../hooks/useCategories'

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

const Section = ({ title, children }) => (
  <section>
    <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
    {children}
  </section>
)

const OptionList = ({ children }) => (
  <div className="max-h-56 space-y-1 overflow-y-auto pr-1">{children}</div>
)

const Option = ({ type, name, label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-gray-700 hover:bg-gray-50">
    <input
      type={type}
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 accent-blue-600"
    />
    <span className="truncate" title={label}>
      {label}
    </span>
  </label>
)

const Loading = ({ rows }) => (
  <div className="space-y-2" aria-hidden="true">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
    ))}
  </div>
)

const LoadFailed = ({ label, onRetry }) => (
  <p className="text-xs text-red-600">
    Could not load {label}.
    <button type="button" onClick={onRetry} className="ml-1 font-medium underline">
      Retry
    </button>
  </p>
)


function FilterSidebar({
  filters,
  draft,
  onDraftChange,
  updateFilters,
  toggleBrand,
  onReset,
  hasActiveFilters,
  onClose,
}) {
  const { category, brands, minPrice, maxPrice } = filters
  const [brandSearch, setBrandSearch] = useState('')

  const categories = useCategories()
  const brandOptions = useBrands(category)

  const term = brandSearch.trim().toLowerCase()
  const visibleBrands = (brandOptions.data ?? []).filter((brand) =>
    brand.toLowerCase().includes(term)
  )

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto bg-white p-5">

      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <SlidersHorizontal size={18} />
          Filters
        </h2>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Clear all
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="rounded p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <Section title="Categories">
        {categories.isPending && <Loading rows={6} />}

        {categories.isError && (
          <LoadFailed label="categories" onRetry={() => categories.refetch()} />
        )}

        {categories.isSuccess && (
          <OptionList>
            <Option
              type="radio"
              name="category"
              label="All categories"
              checked={category === ''}
              onChange={() => updateFilters({ category: null })}
            />

            {categories.data.map(({ slug, name }) => (
              <Option
                key={slug}
                type="radio"
                name="category"
                label={name}
                checked={category === slug}
                onChange={() => updateFilters({ category: slug })}
              />
            ))}
          </OptionList>
        )}
      </Section>

      <Section title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="Min"
            aria-label="Minimum price"
            value={draft.minPrice}
            onChange={(event) => onDraftChange({ minPrice: event.target.value })}
            className={INPUT_CLASS}
          />

          <span className="text-gray-400">to</span>

          <input
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="Max"
            aria-label="Maximum price"
            value={draft.maxPrice}
            onChange={(event) => onDraftChange({ maxPrice: event.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        {minPrice !== null && maxPrice !== null && minPrice > maxPrice && (
          <p className="mt-2 text-xs text-amber-600">
            Minimum price is higher than the maximum.
          </p>
        )}
      </Section>

      <Section title="Brands">
        {brandOptions.isPending && <Loading rows={5} />}

        {brandOptions.isError && (
          <LoadFailed label="brands" onRetry={() => brandOptions.refetch()} />
        )}

        {brandOptions.isSuccess && (
          <>
            {brandOptions.data.length > 8 && (
              <input
                type="text"
                placeholder="Find a brand"
                aria-label="Filter the brand list"
                value={brandSearch}
                onChange={(event) => setBrandSearch(event.target.value)}
                className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            )}

            {visibleBrands.length === 0 ? (
              <p className="text-xs text-gray-500">
                {brandOptions.data.length === 0
                  ? 'No brands listed for this category.'
                  : 'No brands match that search.'}
              </p>
            ) : (
              <OptionList>
                {visibleBrands.map((brand) => (
                  <Option
                    key={brand}
                    type="checkbox"
                    label={brand}
                    checked={brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                ))}
              </OptionList>
            )}
          </>
        )}
      </Section>

    </div>
  )
}

export default FilterSidebar
