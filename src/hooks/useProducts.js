import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import productRepository from '../api/repositories/productRepository'
import { PAGE_SIZE, PRODUCT_LIST_FIELDS, QUERY_KEYS } from '../utils/constants'
import { applyClientFilters, buildProductQuery, paginate } from '../utils/productQuery'
import { getTotalPages } from '../utils/pagination'


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
    
    page: safePage,
    totalPages: getTotalPages(total, pageSize),
    isEmpty: !query.isPending && !query.isError && total === 0,
  }
}

export default useProducts
