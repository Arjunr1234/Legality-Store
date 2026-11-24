import { useQuery } from '@tanstack/react-query'

import productRepository from '../api/repositories/productRepository'
import { QUERY_KEYS } from '../utils/constants'


const useCategories = () =>
  useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: ({ signal }) => productRepository.getCategories({ signal }),
    staleTime: Infinity,
    gcTime: Infinity,
    select: (categories) => categories.map(({ slug, name }) => ({ slug, name })),
  })

export default useCategories
