import instance from '@/lib/axiosInstance'

export async function login(email: string, password: string) {
  const response = await instance.post<{ token: string }>('/users/login', {
    email,
    password,
  })
  return response.data.token
}

export async function logout() {
  const response = await instance.post<{ token: string }>('/users/logout')
  return response.data
}

export async function setPassword(password: string) {
  const response = await instance.put('/users/reset-password', {
    password,
  })
  return response.data
}
