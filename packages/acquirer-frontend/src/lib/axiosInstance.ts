import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (config.url === '/users/login') return config

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.url?.startsWith('/users/reset-password')) {
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default instance
