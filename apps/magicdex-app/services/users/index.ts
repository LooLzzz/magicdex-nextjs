import { UpdateUserOptions } from '@/api/(types)'
import axios from 'axios'


export async function updateUser(data: UpdateUserOptions) {
  return await axios.post('/api/me', data)
}

export async function deleteUser() {
  return await axios.delete('/api/me')
}
