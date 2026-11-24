import { PRODUCT_ENDPOINTS } from '../apiEndPoints'
import apiService from '../apiServices'


class ProductRepository {


  async getProducts({ url = PRODUCT_ENDPOINTS.list, params = {}, limit, skip, select, signal } = {}) {
    const response =  apiService.get({
      url,
      params: { ...params, limit, skip, select },
      signal,
    })
    return response
  }



  async getCategories({ signal } = {}) {
    const response =  apiService.get({ url: PRODUCT_ENDPOINTS.categories, signal })
    return response
  }




  async getProductById(id, { signal } = {}) {
    const response =  apiService.get({ url: PRODUCT_ENDPOINTS.byId(id), signal });
    return response;
  }




  async getBrands({ category = '', signal } = {}) {
    const data = await this.getProducts({
      url: category ? PRODUCT_ENDPOINTS.byCategory(category) : PRODUCT_ENDPOINTS.list,
      limit: 0,
      select: 'brand',
      signal,
    })

    const unique = new Set(
      (data?.products ?? [])
        .map((product) => product?.brand?.trim())
        .filter(Boolean)
    )

    const responseArray =  [...unique].sort((a, b) => a.localeCompare(b));
    return responseArray
  }
}



const productRepository = new ProductRepository()

export default productRepository
