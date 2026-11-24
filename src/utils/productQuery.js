import { PRODUCT_ENDPOINTS } from '../api/apiEndPoints'


const pickEndpoint = (searchTerm, category) => {
  if (searchTerm) return { url: PRODUCT_ENDPOINTS.search, params: { q: searchTerm } }
  if (category) return { url: PRODUCT_ENDPOINTS.byCategory(category), params: {} }
  return { url: PRODUCT_ENDPOINTS.list, params: {} }
}

export const buildProductQuery = ({
  q = '',
  category = '',
  brands = [],
  minPrice = null,
  maxPrice = null,
}) => {
  const searchTerm = q.trim()
  const { url, params } = pickEndpoint(searchTerm, category)

  const clientFilters = {
   
    category: searchTerm ? category : '',
    brands,
    minPrice,
    maxPrice,
  }

  const needsClientPass = Boolean(
    clientFilters.category || brands.length || minPrice !== null || maxPrice !== null
  )

  return { url, params, clientFilters, needsClientPass }
}

export const applyClientFilters = (products = [], { category, brands, minPrice, maxPrice }) => {
  const brandSet = new Set(brands)

  return products.filter((product) => {
    if (category && product.category !== category) return false
    if (brandSet.size && !brandSet.has(product.brand)) return false
    if (minPrice !== null && product.price < minPrice) return false
    if (maxPrice !== null && product.price > maxPrice) return false
    return true
  })
}


export const paginate = (items, page, pageSize) => {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}
