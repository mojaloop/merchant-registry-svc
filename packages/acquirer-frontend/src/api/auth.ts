import instance from '@/lib/axiosInstance'

export async function login(
  email: string,
  password: string,
  recaptchaToken: string | null
) {
  const response = await instance.post<{ token: string }>('/users/login', {
    email,
    password,
    recaptchaToken,
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

export async function forgotPassword(email: string) {
  const response = await instance.post('/users/forgot-password', {
    email,
  })
  return response.data
}
