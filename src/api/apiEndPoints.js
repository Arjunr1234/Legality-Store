const PRODUCT_ENDPOINTS = {
  list: '/products',
  search: '/products/search',
  categories: '/products/categories',
  byCategory: (slug) => `/products/category/${encodeURIComponent(slug)}`,
  byId: (id) => `/products/${encodeURIComponent(id)}`,
}

export { PRODUCT_ENDPOINTS }
