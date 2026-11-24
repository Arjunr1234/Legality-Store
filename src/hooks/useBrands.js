import { useQuery } from '@tanstack/react-query'

import productRepository from '../api/repositories/productRepository'
import { QUERY_KEYS } from '../utils/constants'


const useBrands = (category = '') =>
  useQuery({
    queryKey: [QUERY_KEYS.BRANDS, category],
    queryFn: ({ signal }) => productRepository.getBrands({ category, signal }),
    staleTime: 1 * 60 * 1000,
  })

export default useBrands
