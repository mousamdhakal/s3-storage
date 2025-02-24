import axios from 'axios'
import { useUserStore } from '../store/user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Access the logout function from the store
      const logout = useUserStore.getState().logout
      logout()
    }
    return Promise.reject(error)
  }
)

export default api