import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import productRepository from '../api/repositories/productRepository'
import { PAGE_SIZE, PRODUCT_LIST_FIELDS, QUERY_KEYS } from '../utils/constants'
import { applyClientFilters, buildProductQuery, paginate } from '../utils/productQuery'
import { getTotalPages } from '../utils/pagination'

/**
 * Fetches the product list for the current filter combination.
 *
 * Pagination is server-side (`limit`/`skip`) whenever DummyJSON can express
 * the whole filter on its own. As soon as a price or brand filter is applied —
 * neither of which the API supports — the hook fetches the full scope once and
 * filters + paginates in memory, so the result count and page links stay
 * correct. See `utils/productQuery.js` for the full rationale.
 *
 * @param {object} filters Output of `useProductFilters`.
 */
const useProducts = (filters = {}) => {
  const { page = 1, pageSize = PAGE_SIZE } = filters

  const plan = useMemo(() => buildProductQuery(filters), [filters])
  const isServerPaginated = !plan.needsClientPass

  const query = useQuery({
    queryKey: [
      QUERY_KEYS.PRODUCTS,
      {
        url: plan.url,
        params: plan.params,
        scope: isServerPaginated ? 'page' : 'all',
        ...(isServerPaginated && { page, pageSize }),
      },
    ],

    queryFn: ({ signal }) =>
      productRepository.getProducts({
        url: plan.url,
        params: plan.params,
        limit: isServerPaginated ? pageSize : 0,
        skip: isServerPaginated ? (page - 1) * pageSize : 0,
        select: PRODUCT_LIST_FIELDS,
        signal,
      }),

    // Keeps the previous page visible while the next one loads — no flicker.
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const { products, total, safePage } = useMemo(() => {
    const raw = query.data?.products ?? []

    if (isServerPaginated) {
      const serverTotal = query.data?.total ?? 0
      return {
        products: raw,
        total: serverTotal,
        safePage: Math.min(page, getTotalPages(serverTotal, pageSize)),
      }
    }

    const filtered = applyClientFilters(raw, plan.clientFilters)
    // Clamp before slicing: a deep link such as ?page=9 against 5 results must
    // still show those 5, not an empty grid under "Showing 97 of 5 products".
    const clamped = Math.min(page, getTotalPages(filtered.length, pageSize))

    return {
      products: paginate(filtered, clamped, pageSize),
      total: filtered.length,
      safePage: clamped,
    }
  }, [query.data, isServerPaginated, plan.clientFilters, page, pageSize])

  return {
    ...query,
    products,
    total,
    /** The page actually rendered — never past the end of the result set. */
    page: safePage,
    totalPages: getTotalPages(total, pageSize),
    isEmpty: !query.isPending && !query.isError && total === 0,
  }
}

export default useProducts
