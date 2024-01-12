import type { ServerUser } from '@/types/users'
import instance from '@/lib/axiosInstance'
import { type AddNewUserForm } from '@/lib/validations/addNewUser'

export async function getUsers() {
  const response = await instance.get<{ data: ServerUser[] }>('/users')
  return response.data.data
}

export async function createUser(user: AddNewUserForm) {
  const response = await instance.post('/users/add', user)
  return response.data
}

export async function getUserProfile() {
  const response = await instance.get<{ data: ServerUser }>('/users/profile')
  return response.data.data
}

export async function updateUserStatus(userId: string | number, newStatus: string) {
  const response = await instance.put(`/users/${userId}/status`, { status: newStatus })
  return response.data.data
}

