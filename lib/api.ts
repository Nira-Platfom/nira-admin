import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://nira-backend-w7p9.onrender.com',
})

api.interceptors.request.use((config) => {
  const secret = Cookies.get('nira_admin_key') || process.env.NEXT_PUBLIC_ADMIN_SECRET || ''
  config.headers['X-Admin-Secret'] = secret
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 403 && typeof window !== 'undefined') {
      Cookies.remove('nira_admin_key')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
