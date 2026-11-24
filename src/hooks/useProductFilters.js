import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PAGE_SIZE } from '../utils/constants'

const toPrice = (value) => {
  const price = Number(value)
  return value && Number.isFinite(price) && price >= 0 ? price : null
}

const isBlank = (value) =>
  value === null || value === '' || (Array.isArray(value) && value.length === 0)


const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => ({
      q: searchParams.get('q') ?? '',
      category: searchParams.get('category') ?? '',
      brands: searchParams.get('brands')?.split(',').filter(Boolean) ?? [],
      minPrice: toPrice(searchParams.get('minPrice')),
      maxPrice: toPrice(searchParams.get('maxPrice')),
      page: Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1),
      pageSize: PAGE_SIZE,
    }),
    [searchParams]
  )

  const updateFilters = useCallback(
    (changes) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)

          Object.entries(changes).forEach(([key, value]) => {
            if (isBlank(value)) next.delete(key)
            else next.set(key, Array.isArray(value) ? value.join(',') : String(value))
          })

          // Page 4 of the old result set means nothing in the new one.
          if (!('page' in changes)) next.delete('page')

          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const setPage = useCallback(
    (page) => updateFilters({ page: page > 1 ? page : null }),
    [updateFilters]
  )

  const toggleBrand = useCallback(
    (brand) => {
      const { brands } = filters

      updateFilters({
        brands: brands.includes(brand)
          ? brands.filter((item) => item !== brand)
          : [...brands, brand],
      })
    },
    [filters, updateFilters]
  )

  const resetFilters = useCallback(
    () => setSearchParams(new URLSearchParams(), { replace: true }),
    [setSearchParams]
  )

  const { q, category, brands, minPrice, maxPrice } = filters

  return {
    filters,
    updateFilters,
    setPage,
    toggleBrand,
    resetFilters,
    hasActiveFilters: Boolean(
      q || category || brands.length || minPrice !== null || maxPrice !== null
    ),
  }
}

export default useProductFilters
