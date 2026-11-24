import axios from 'axios'


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const messageForStatus = (status) => {
  if (status === 404) return 'We could not find what you were looking for.'
  if (status === 429) return 'Too many requests. Please wait a moment and try again.'
  if (status >= 500) return 'The product service is temporarily unavailable.'
  return 'Something went wrong while loading products.'
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(
        Object.assign(error, { isCanceled: true, status: null })
      )
    }

    const status = error.response?.status ?? null
    const isNetworkError = !error.response

    return Promise.reject(
      Object.assign(error, {
        status,
        isNetworkError,
        isCanceled: false,
        message: isNetworkError
          ? 'Network error — please check your connection.'
          : error.response?.data?.message ?? messageForStatus(status),
      })
    )
  }
)

export default axiosInstance
