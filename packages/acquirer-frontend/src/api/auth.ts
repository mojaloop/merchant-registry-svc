import instance from '@/lib/axiosInstance'

export async function login(email: string, password: string) {
  const response = await instance.post<{ token: string }>('/users/login', {
    email,
    password,
  })

  return response.data.token
}
