import axiosInstance from './axiosInstance'


class ApiService {
  constructor(client = axiosInstance) {
    this.client = client
  }

 
  async get({ url, params = {}, signal } = {}) {
    const response = await this.client.get(url, { params, signal })
    return response.data
  }


  
}

const apiService = new ApiService()

export default apiService
export { ApiService }
