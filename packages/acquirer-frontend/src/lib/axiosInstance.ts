/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { type InternalAxiosRequestConfig } from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

instance.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')

  if (config.url === '/users/login') return config

  return {
    ...config,
    headers: { Authorization: `Bearer ${token}` },
  } as InternalAxiosRequestConfig<any>
})

export default instance
