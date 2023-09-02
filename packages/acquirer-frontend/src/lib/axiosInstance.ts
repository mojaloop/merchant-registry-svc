import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

instance.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')

  if (config.url === '/users/login') return config

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default instance
