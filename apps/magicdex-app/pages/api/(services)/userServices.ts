import { supabaseNextAuthClient } from '@/api/(services)/supabase'
import bcrypt from 'bcrypt'
import { User } from 'next-auth'
import { HttpError } from '../(exceptions)'
import { UpdateUserOptions, UserCredentials, getUserOptions } from '../(types)'


export async function getUserByCredentials(creds: UserCredentials, options: getUserOptions = {}): Promise<User> {
  const { email, password } = creds
  const { withPassword = false } = options

  const { data: user, error } = (
    await supabaseNextAuthClient
      .from('users')
      .select('id, name, email, password, image, created_at')
      .eq('email', email)
      .limit(1)
      .single()
  )

  if (error || !user?.password)
    return null
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!withPassword)
    delete user.password

  return isPasswordValid ? user : null
}

export async function getUserById(id: string, options: getUserOptions = {}): Promise<User> {
  const { withPassword = false } = options

  const { data: user, error } = (
    await supabaseNextAuthClient
      .from('users')
      .select('id, name, email, password, image, created_at')
      .eq('id', id)
      .limit(1)
      .single()
  )

  if (error || !user?.password)
    return null

  if (!withPassword)
    delete user.password
  return user
}

export async function updateUserById(id: string, options: UpdateUserOptions) {
  const { newName, currentPassword, newPassword, newAvatarUrl } = options
  const user = await getUserById(id, { withPassword: true }) as User & { password: string }

  if (!user)
    throw new HttpError('User not found', 404)

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
  if (!isPasswordValid)
    throw new HttpError('Invalid password', 401)

  const encryptedPassword = newPassword && await bcrypt.hash(newPassword, 10)

  const newValues = Object.fromEntries(
    Object
      .entries({ name: newName, password: encryptedPassword, image: newAvatarUrl })
      .filter(([key, value]) => value !== undefined)
  )

  if (Object.keys(newValues).length === 0)
    return

  if (newValues.password && await bcrypt.compare(newValues.password, user.password)) {
    throw new HttpError('New password must be different from the old one', 400)
  }

  const { error } = (
    await supabaseNextAuthClient
      .from('users')
      .update(newValues)
      .eq('id', id)
  )

  if (error)
    throw new HttpError(error.message) // HTTP 500
}

export async function deleteUserById(id: string) {
  const { error } = (
    await supabaseNextAuthClient
      .from('users')
      .delete()
      .eq('id', id)
  )

  if (error)
    throw new HttpError(error.message) // HTTP 500
}
