import { useQuery } from '@tanstack/react-query'

import productRepository from '../api/repositories/productRepository'
import { QUERY_KEYS } from '../utils/constants'


const useProductDetails = (id) =>
  useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, String(id)],
    queryFn: ({ signal }) => productRepository.getProductById(id, { signal }),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })

export default useProductDetails
